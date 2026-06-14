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

  const ninoIds = (ninos ?? []).map((n) => n.id);

  // Progreso: sólo si hay niños registrados
  let progreso: ResumenProgreso[] = [];
  if (ninoIds.length > 0) {
    const { data } = await supabase
      .from("resumen_progreso")
      .select("*")
      .in("nino_id", ninoIds);
    progreso = (data as ResumenProgreso[]) ?? [];
  }

  // Últimas miniaturas: join defensiva
  let miniaturas: {
    id: string;
    trazo_miniatura: string;
    creado_en: string;
    actividad_id: string;
    completado: boolean;
  }[] = [];
  if (ninoIds.length > 0) {
    const { data } = await supabase
      .from("intentos")
      .select("id, trazo_miniatura, creado_en, actividad_id, completado, sesiones!inner(nino_id)")
      .not("trazo_miniatura", "is", null)
      .in("sesiones.nino_id", ninoIds)
      .order("creado_en", { ascending: false })
      .limit(30);
    miniaturas = (data as typeof miniaturas) ?? [];
  }

  return (
    <PadresDashboard
      user={user}
      ninos={(ninos as Nino[]) ?? []}
      progreso={progreso}
      miniaturas={miniaturas}
    />
  );
}
