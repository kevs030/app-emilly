/**
 * Configuración pública de Supabase.
 * La URL y la clave "publishable" son PÚBLICAS por diseño (las ve cualquier navegador):
 * la seguridad la ponen las políticas RLS de la base de datos (supabase/migrations).
 * Las variables de entorno, si existen, tienen prioridad sobre estos valores.
 * NUNCA pongas aquí la clave "secret" / "service_role".
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://emuyxcrtkfqizavslwfj.supabase.co";

export const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_NnRGtuKByH88O_Vnf9M-Dw_muktlw8F";
