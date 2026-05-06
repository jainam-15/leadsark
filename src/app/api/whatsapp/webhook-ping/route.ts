import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    message: "LeadsArk Webhook Ping REACHABLE"
  });
}
