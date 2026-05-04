import { NextResponse } from "next/server";
import { PLANS } from "@/config/plans";
import { verifyAdmin } from "@/lib/admin-api-helpers";

export async function GET() {
  const adminCheck = await verifyAdmin();
  if ('error' in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  return NextResponse.json(Object.values(PLANS));
}
