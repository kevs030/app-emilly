/**
 * BORRADOR de política de privacidad. Debe revisarlo un abogado experto en protección
 * de datos (RGPD) antes del lanzamiento. Ver docs/02-analisis-legal.md.
 */
export default function PrivacyPage() {
  return (
    <article className="prose max-w-none space-y-3 text-sm">
      <h1 className="text-2xl font-bold">Privacidad (borrador)</h1>
      <p className="rounded bg-warn-bg p-2 text-warn-fg">Borrador pendiente de revisión legal antes del lanzamiento.</p>
      <h2 className="font-semibold">Qué datos tratamos</h2>
      <ul className="list-disc pl-5">
        <li>Correo o teléfono, para que puedas entrar con un código (base legal: contrato, art. 6.1.b RGPD).</li>
        <li>Tu nombre público y lo que publicas en el foro.</li>
        <li>
          Solo si das tu consentimiento (art. 6.1.a): país de origen, ciudad, tipo de permiso, fecha de vencimiento e hijos a cargo. Los usamos
          únicamente para avisos y respuestas personalizadas. Si retiras el consentimiento, se borran.
        </li>
        <li>Mensajes al asistente: se envían a nuestro proveedor de IA (Anthropic) para generar la respuesta. No los usamos para publicidad.</li>
      </ul>
      <h2 className="font-semibold">Lo que NO hacemos</h2>
      <ul className="list-disc pl-5">
        <li>No vendemos tus datos ni los compartimos con autoridades, salvo por obligación legal.</li>
        <li>No pedimos números de pasaporte, datos de salud, religión ni antecedentes penales.</li>
        <li>No recopilamos datos de tus redes sociales.</li>
      </ul>
      <h2 className="font-semibold">Tus derechos</h2>
      <p>
        Puedes ver, corregir y borrar tus datos desde &quot;Mi perfil&quot;. El botón &quot;Borrar mi cuenta&quot; elimina todo de forma
        permanente. También puedes reclamar ante el Garante per la protezione dei dati personali.
      </p>
    </article>
  );
}
