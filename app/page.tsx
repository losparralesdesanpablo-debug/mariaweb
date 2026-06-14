import { createClient } from "@/lib/supabase-server";
import ZonaNina from "@/components/ZonaNina";
import type { Actividad, ConfiguracionNino, Nino } from "@/lib/types";
import { CONFIG_DEFAULT } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  // Cargar actividades del catálogo (acceso público con anon key)
  const { data: actividades } = await supabase
    .from("actividades")
    .select("*")
    .eq("tipo", "trazo")
    .eq("activa", true)
    .order("nivel");

  // Si hay sesión de adulto, cargar configuración del primer niño
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let config: ConfiguracionNino = CONFIG_DEFAULT;
  let ninoId: string | null = null;
  let ninoNombre = "María";
  let ninoPin: string | null = null;

  if (user) {
    const { data: ninos } = await supabase
      .from("ninos")
      .select("id, nombre, configuracion, pin")
      .eq("adulto_id", user.id)
      .limit(1);

    if (ninos?.length) {
      const nino = ninos[0] as Pick<Nino, "id" | "nombre" | "configuracion" | "pin">;
      ninoId = nino.id;
      ninoNombre = nino.nombre;
      ninoPin = nino.pin ?? null;
      config = { ...CONFIG_DEFAULT, ...nino.configuracion };
    }
  }

  return (
    <ZonaNina
      actividades={(actividades as Actividad[]) ?? []}
      config={config}
      ninoId={ninoId}
      ninoNombre={ninoNombre}
      ninoPin={ninoPin}
    />
  );
}
