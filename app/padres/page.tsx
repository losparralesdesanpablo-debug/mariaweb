import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import PadresDashboard from "./PadresDashboard";
import type { Nino, ResumenProgreso } from "@/lib/types";

export default async function PadresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/padres/login");

  const { data: ninos } = await supabase
    .from("ninos")
    .select("*")
    .eq("adulto_id", user.id)
    .order("creado_en");

  // Progreso de todos los niños del adulto
  const { data: progreso } = await supabase
    .from("resumen_progreso")
    .select("*");

  // Últimas miniaturas (máx 30)
  const { data: miniaturas } = await supabase
    .from("intentos")
    .select(
      "id, trazo_miniatura, creado_en, actividad_id, completado, sesiones!inner(nino_id)"
    )
    .not("trazo_miniatura", "is", null)
    .order("creado_en", { ascending: false })
    .limit(30);

  return (
    <PadresDashboard
      user={user}
      ninos={(ninos as Nino[]) ?? []}
      progreso={(progreso as ResumenProgreso[]) ?? []}
      miniaturas={miniaturas ?? []}
    />
  );
}
