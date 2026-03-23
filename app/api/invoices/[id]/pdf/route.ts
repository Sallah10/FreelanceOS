import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  // In production, you'd generate a PDF using react-pdf
  // For now, return a placeholder response
  return NextResponse.json(
    { message: "PDF generation coming soon" },
    { status: 501 },
  );
}
