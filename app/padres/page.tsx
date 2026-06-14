import { createClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import PadresDashboard from "./PadresDashboard";
import type { Nino, ResumenProgreso } from "@/lib/types";

export default async function PadresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/padres/login");

  const { data: ninos } = await supabase
    .from("ninos")
    .select("*")
    .eq("adulto_id", user.id)
    .order("creado_en");

  const ninoIds = (ninos ?? []).map(n => n.id);

  let progreso: ResumenProgreso[] = [];
  if (ninoIds.length > 0) {
    const { data } = await supabase
      .from("resumen_progreso")
      .select("*")
      .in("nino_id", ninoIds);
    progreso = (data as ResumenProgreso[]) ?? [];
  }

  // Lista de administradores via Admin API (service role key)
  let admins: { id: string; email: string; created_at: string; last_sign_in_at: string | null }[] = [];
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    try {
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      const { data: usersData } = await adminClient.auth.admin.listUsers({ perPage: 100 });
      admins = (usersData?.users ?? [])
        .filter(u => u.id !== user.id) // excluir usuario actual (se muestra aparte como "Tú")
        .map(u => ({
          id: u.id,
          email: u.email ?? "",
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
        }));
    } catch {
      // Sin service key o error → lista vacía, no bloquea
    }
  }

  return (
    <PadresDashboard
      user={user}
      ninos={(ninos as Nino[]) ?? []}
      progreso={progreso}
      admins={admins}
    />
  );
}
