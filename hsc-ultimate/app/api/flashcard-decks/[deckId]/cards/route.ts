// ===================================================================
// একটা Deck এ নতুন Flashcard তৈরি করার API
// POST /api/flashcard-decks/[deckId]/cards
// Body (BASIC): { front: string, back: string, cardType?: "BASIC" }
// Body (CLOZE): { clozeText: string, cardType: "CLOZE" }
// Body (IMAGE_OCCLUSION): { imageUrl: string, occlusionBoxes: OcclusionBox[], cardType: "IMAGE_OCCLUSION" }
// -------------------------------------------------------------------
// CLOZE কার্ডের জন্য "front" এ মাস্কড টেক্সট ("[...]" সহ) এবং "back" এ
// পূর্ণ টেক্সট (bracket ছাড়া, উত্তরসহ) সংরক্ষণ করা হয় — এভাবে বিদ্যমান
// review-runner/due-card ফ্লো (যেটা শুধু front/back স্ট্রিং আশা করে)
// কোনো পরিবর্তন ছাড়াই CLOZE/IMAGE_OCCLUSION কার্ডও দেখাতে পারে, শুধু
// cardType অনুযায়ী UI তে সামান্য ভিন্নভাবে রেন্ডার হয়।
// IMAGE_OCCLUSION এ front/back উভয়ই একটা সাধারণ প্লেসহোল্ডার টেক্সট
// রাখা হয় (backward-compat টেক্সট-ভিত্তিক ফ্লো এর জন্য), আসল ছবি+বক্স
// imageUrl/occlusionBoxes কলামে থাকে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { defaultSRSState } from "@/lib/spaced-repetition";
import { parseClozeText, MAX_CLOZE_BLANKS } from "@/lib/cloze";
import { validateOcclusionBoxes } from "@/lib/image-occlusion";
import { validateImageDataUrlSize } from "@/lib/image-validation";

type CardType = "BASIC" | "CLOZE" | "IMAGE_OCCLUSION";

// 🐛 বাগ ফিক্স (Missing Text Length Validation bug hunt সিরিজের
// ধারাবাহিকতা, broad-grep এ আবিষ্কৃত, লাইভ টেস্টে প্রমাণিত): BASIC
// flashcard এর `front`/`back` ফিল্ডে কোনো max-length limit ছিল না —
// established Task/Flashcard-Deck-name/Routine-Slot এর মতো একই
// storage-abuse ঝুঁকি (এখানে AI call না থাকলেও raw টেক্সট সরাসরি DB
// তে সেভ হয়)। লাইভ টেস্টে ২,০০,০০০ অক্ষরের `front` সরাসরি সেভ হয়ে
// যাওয়া প্রমাণিত (disposable টেস্ট ইউজার দিয়ে, established নতুন
// নিরাপত্তা নীতি মেনে)।
const MAX_FLASHCARD_TEXT_LENGTH = 3000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { deckId } = await params;
  const deck = await prisma.flashcardDeck.findUnique({ where: { id: deckId } });
  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "ডেক পাওয়া যায়নি" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { cardType } = body as { cardType?: CardType };

  let front: string;
  let back: string;
  let imageUrl: string | null = null;
  let occlusionBoxes: Prisma.InputJsonValue | undefined = undefined;

  const resolvedType: CardType =
    cardType === "CLOZE" ? "CLOZE" : cardType === "IMAGE_OCCLUSION" ? "IMAGE_OCCLUSION" : "BASIC";

  if (resolvedType === "CLOZE") {
    const { clozeText } = body as { clozeText?: string };
    if (!clozeText?.trim()) {
      return NextResponse.json({ error: "ফাঁকা-পূরণ টেক্সট দিতে হবে" }, { status: 400 });
    }
    if (clozeText.trim().length > MAX_FLASHCARD_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `টেক্সট সর্বোচ্চ ${MAX_FLASHCARD_TEXT_LENGTH} অক্ষরের হতে পারবে` },
        { status: 400 }
      );
    }

    const parsed = parseClozeText(clozeText.trim());
    if (!parsed.isValid) {
      return NextResponse.json(
        { error: 'অন্তত একটা বৈধ "{{উত্তর}}" ফাঁকা দিতে হবে' },
        { status: 400 }
      );
    }
    if (parsed.blankCount > MAX_CLOZE_BLANKS) {
      return NextResponse.json(
        { error: `একটা কার্ডে সর্বোচ্চ ${MAX_CLOZE_BLANKS}টা ফাঁকা রাখা যাবে` },
        { status: 400 }
      );
    }

    front = parsed.maskedText;
    back = parsed.fullText;
  } else if (resolvedType === "IMAGE_OCCLUSION") {
    const { imageUrl: rawImageUrl, occlusionBoxes: rawBoxes } = body as {
      imageUrl?: string;
      occlusionBoxes?: unknown;
    };

    if (!rawImageUrl?.trim()) {
      return NextResponse.json({ error: "ছবি আপলোড করতে হবে" }, { status: 400 });
    }

    // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ
    // আবিষ্কৃত, custom-question-sets/ai-chat/ocr-extract এর একই
    // ক্লাস): imageUrl এর কোনো ব্যাকএন্ড সাইজ ভ্যালিডেশন ছিল না,
    // শুধু frontend চেক ছিল যেটা bypass করা যায় — unbounded storage
    // abuse ঝুঁকি (এই endpoint AI কল না করলেও raw imageUrl সরাসরি
    // DB তে সেভ হয়)। ফিক্স: established সাইজ লিমিট এখানেও প্রয়োগ।
    const sizeCheck = validateImageDataUrlSize(rawImageUrl);
    if (!sizeCheck.valid) {
      return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
    }

    const validation = validateOcclusionBoxes(rawBoxes);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    imageUrl = rawImageUrl;
    occlusionBoxes = rawBoxes as Prisma.InputJsonValue;
    // front/back এ backward-compat প্লেসহোল্ডার (রিভিউ UI এ imageUrl থাকলে
    // এই টেক্সট আসলে দেখানো হয় না, শুধু fallback/accessibility জন্য)
    front = "ছবির ঢাকা অংশগুলো কী?";
    back = "ছবিতে দেখাও";
  } else {
    const { front: rawFront, back: rawBack } = body as { front?: string; back?: string };
    if (!rawFront?.trim() || !rawBack?.trim()) {
      return NextResponse.json(
        { error: "প্রশ্ন ও উত্তর দুটোই দিতে হবে" },
        { status: 400 }
      );
    }
    if (
      rawFront.trim().length > MAX_FLASHCARD_TEXT_LENGTH ||
      rawBack.trim().length > MAX_FLASHCARD_TEXT_LENGTH
    ) {
      return NextResponse.json(
        { error: `প্রশ্ন/উত্তর সর্বোচ্চ ${MAX_FLASHCARD_TEXT_LENGTH} অক্ষরের হতে পারবে` },
        { status: 400 }
      );
    }
    front = rawFront.trim();
    back = rawBack.trim();
  }

  const srs = defaultSRSState();

  const flashcard = await prisma.flashcard.create({
    data: {
      deckId,
      front,
      back,
      cardType: resolvedType,
      imageUrl,
      occlusionBoxes,
      easeFactor: srs.easeFactor,
      intervalDays: srs.intervalDays,
      repetitions: srs.repetitions,
      dueDate: new Date(), // নতুন কার্ড সাথে সাথেই due থাকে
    },
  });

  return NextResponse.json({ flashcard }, { status: 201 });
}
