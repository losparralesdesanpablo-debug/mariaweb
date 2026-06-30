import { createClient } from "@/lib/supabase-server";
import ZonaNina from "@/components/ZonaNina";
import type { Actividad, ConfiguracionNino, Nino, VideoPremio, Palabra, PalabraProgreso } from "@/lib/types";
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
  let videos: VideoPremio[] = [];
  let palabras: Palabra[] = [];
  let palabrasProgreso: PalabraProgreso[] = [];

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

      // Vídeos premio activos del adulto
      const { data: vData } = await supabase
        .from("videos_premio")
        .select("*")
        .eq("adulto_id", user.id)
        .eq("activo", true)
        .order("orden");
      videos = (vData as VideoPremio[]) ?? [];

      // Palabras de lectura activas
      const { data: pData } = await supabase
        .from("palabras")
        .select("*")
        .eq("nino_id", ninoId)
        .eq("activa", true)
        .order("orden");
      palabras = (pData as Palabra[]) ?? [];

      // Progreso de lectura
      const { data: ppData } = await supabase
        .from("palabras_progreso")
        .select("*")
        .eq("nino_id", ninoId);
      palabrasProgreso = (ppData as PalabraProgreso[]) ?? [];
    }
  }

  return (
    <ZonaNina
      actividades={(actividades as Actividad[]) ?? []}
      config={config}
      ninoId={ninoId}
      ninoNombre={ninoNombre}
      ninoPin={ninoPin}
      videos={videos}
      palabras={palabras}
      palabrasProgreso={palabrasProgreso}
    />
  );
}
