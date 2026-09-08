import { NextRequest, NextResponse } from "next/server";
import { queryVault, generateRandomVaultMock } from "@/lib/vault-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  if (mode === "random-mock") {
    const subject = searchParams.get("subject") || undefined;
    const questions = generateRandomVaultMock(subject);
    return NextResponse.json({ success: true, count: questions.length, questions });
  }

  const subject = searchParams.get("subject") || undefined;
  const board = searchParams.get("board") || undefined;
  const admissionExam = searchParams.get("admissionExam") || undefined;
  const difficulty = searchParams.get("difficulty") || undefined;
  const query = searchParams.get("q") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const result = queryVault({
    subject,
    board,
    admissionExam,
    difficulty,
    query,
    page,
    limit,
  });

  return NextResponse.json(result);
}
