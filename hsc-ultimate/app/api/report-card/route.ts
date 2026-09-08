// ===================================================================
// Report Card PDF Download API
// GET /api/report-card -> লগইন করা ইউজারের সব পারফরম্যান্স ডেটা দিয়ে
// একটা PDF রিপোর্ট কার্ড বানিয়ে ডাউনলোড হিসেবে পাঠায়
// -------------------------------------------------------------------
// @react-pdf/renderer এর renderToBuffer() ব্যবহার করে server-side (Node
// runtime) এ PDF বাইনারি জেনারেট করা হয় — তাই এই রুট Edge runtime এ
// চালানো যাবে না (ডিফল্ট Node.js runtime ব্যবহার হচ্ছে)।
// ===================================================================
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { getReportCardData } from "@/lib/report-card";
import { ReportCardDocument } from "@/lib/report-card-pdf";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const data = await getReportCardData(session.user.id);
  if (!data) {
    return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
  }

  try {
    const pdfBuffer = await renderToBuffer(ReportCardDocument({ data }));

    // HTTP হেডারে শুধু ASCII থাকতে পারে, কিন্তু ইউজারের নাম বাংলায় হতে পারে।
    // তাই একটা সরল ASCII fallback filename + RFC 5987 filename* (UTF-8 এনকোডেড,
    // বাংলা নাম সহ) — আধুনিক ব্রাউজার filename* ব্যবহার করে সঠিক নাম দেখাবে।
    const asciiFileName = "HSC-Ultimate-Report-Card.pdf";
    const utf8FileName = `HSC-Ultimate-Report-Card-${data.user.name}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodeURIComponent(utf8FileName)}`,
      },
    });
  } catch (err) {
    console.error("Report Card PDF Generation Error:", err);
    return NextResponse.json(
      { error: "রিপোর্ট কার্ড তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
