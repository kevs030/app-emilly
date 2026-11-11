export function NotConfigured() {
  return (
    <div className="rounded-lg bg-warn-bg p-4 text-sm text-warn-fg">
      ⚙️ Las cuentas y el foro necesitan Supabase. Copia <code>.env.example</code> a <code>.env.local</code>, rellena las claves y ejecuta la migración
      de <code>supabase/migrations</code>. Instrucciones en el README.
    </div>
  );
}
