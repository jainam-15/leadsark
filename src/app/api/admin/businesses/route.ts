import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/admin-api-helpers";

export async function GET() {
  const adminCheck = await verifyAdmin();
  if ('error' in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    // Fetch businesses and their associated data using the admin client
    // We use a simpler query first to avoid complex join errors
    const { data: businesses, error } = await supabaseAdmin
      .from('businesses')
      .select(`
        *,
        subscriptions (id, plan, status, start_date, end_date),
        whatsapp_connections (status, connected_phone)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("[Admin API] Businesses fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch all profiles for these businesses manually to avoid join/cache issues
    const ownerIds = businesses.map(b => b.owner_id).filter(Boolean);
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .in('id', ownerIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const formatted = businesses.map(b => ({
      id: b.id,
      name: b.name,
      owner_id: b.owner_id,
      owner_name: profileMap.get(b.owner_id)?.full_name || 'N/A',
      owner_email: profileMap.get(b.owner_id)?.email || 'N/A',
      status: b.status,
      created_at: b.created_at,
      subscription: b.subscriptions?.[0],
      whatsapp: b.whatsapp_connections?.[0]
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("[Admin API] Critical error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
