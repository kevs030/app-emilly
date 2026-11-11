import type { Bonus } from "./types";

export const bonuses: Bonus[] = [
  {
    slug: "assegno-unico",
    name: { es: "Assegno Unico (ayuda por hijos)", en: "Assegno Unico (child benefit)", it: "Assegno Unico e Universale" },
    amount: {
      es: "Pago mensual por cada hijo. El importe depende del ISEE (indicador de ingresos y patrimonio de la familia).",
      en: "Monthly payment per child. The amount depends on your ISEE (family income and wealth indicator).",
      it: "Importo mensile per figlio in base all'ISEE.",
    },
    who: {
      es: "Familias con hijos a cargo menores de 21 años (sin límite de edad si el hijo tiene discapacidad).",
      en: "Families with dependent children under 21 (no age limit for children with disabilities).",
      it: "Famiglie con figli a carico fino a 21 anni (senza limiti per figli disabili).",
    },
    requirements: [
      {
        es: "Permisos admitidos, entre otros: permiso UE de larga duración, permiso de investigación de más de 6 meses y permiso por espera de empleo, en las condiciones que reconoce el INPS.",
        en: "Accepted permits include: EU long-term residence permit, research permit over 6 months, and job-seeking permit, under the conditions recognised by INPS.",
        it: "Tra i permessi ammessi: lungo periodo UE, ricerca oltre 6 mesi, attesa occupazione secondo le condizioni INPS.",
      },
      { es: "ISEE vigente (si no lo tienes, recibes el importe mínimo)", en: "Valid ISEE (without it you get the minimum amount)", it: "ISEE in corso di validità (senza ISEE spetta il minimo)" },
    ],
    howToApply: {
      es: "Solicítalo en la web del INPS con SPID o CIE, o gratis a través de un Patronato.",
      en: "Apply on the INPS website using SPID or CIE, or for free through a Patronato.",
      it: "Domanda sul sito INPS con SPID/CIE o tramite Patronato.",
    },
    sources: [
      { title: "INPS: Assegno Unico y Universal", url: "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.assegno-unico-e-universale-per-i-figli-a-carico-55984.assegno-unico-e-universale-per-i-figli-a-carico.html", official: true },
    ],
    lastVerified: "2026-11-11",
  },
  {
    slug: "bonus-nuovi-nati",
    name: { es: "Bono por nacimiento (Bonus nuovi nati)", en: "New baby bonus (Bonus nuovi nati)", it: "Bonus nuovi nati" },
    amount: { es: "1.000 € de pago único", en: "€1,000 one-off payment", it: "1.000 € una tantum" },
    who: {
      es: "Familias con un hijo nacido o adoptado, con ISEE de hasta 40.000 € (el importe del Assegno Unico no cuenta en ese ISEE).",
      en: "Families with a newborn or adopted child, with ISEE up to €40,000 (the Assegno Unico is not counted in that ISEE).",
      it: "Famiglie con ISEE fino a 40.000 € (l'Assegno Unico non si conta).",
    },
    requirements: [
      {
        es: "La circular INPS n.º 45 del 10/04/2026 lo extendió a ciudadanos no comunitarios con cualquier permiso de al menos 1 año (por ejemplo, protección especial o tratamiento médico).",
        en: "INPS circular no. 45 of 10/04/2026 extended it to non-EU citizens with any permit valid for at least 1 year (e.g. special protection or medical treatment).",
        it: "La circolare INPS 45/2026 lo estende agli extra-UE con permesso di almeno un anno.",
      },
    ],
    howToApply: {
      es: "Solicitud al INPS online o a través de un Patronato.",
      en: "Apply to INPS online or through a Patronato.",
      it: "Domanda INPS online o tramite Patronato.",
    },
    sources: [
      { title: "ASGI: circular INPS 45/2026", url: "https://www.asgi.it/antidiscriminazione/bonus-nuovi-nati-2026-linps-pubblica-la-circolare-n-45-e-amplia-la-platea-dei-beneficiari-stranieri/", official: false },
      { title: "INPS", url: "https://www.inps.it/", official: true },
    ],
    lastVerified: "2026-11-11",
  },
  {
    slug: "bonus-asilo-nido",
    name: { es: "Bono guardería (Bonus asilo nido)", en: "Nursery bonus (Bonus asilo nido)", it: "Bonus asilo nido" },
    amount: {
      es: "Reembolso de la cuota de la guardería. El importe depende del ISEE.",
      en: "Reimbursement of nursery fees. The amount depends on ISEE.",
      it: "Rimborso rette in base all'ISEE.",
    },
    who: { es: "Familias con niños de hasta 3 años", en: "Families with children up to 3 years old", it: "Famiglie con bambini fino a 3 anni" },
    requirements: [{ es: "Recibos de pago de la guardería", en: "Nursery payment receipts", it: "Ricevute di pagamento" }],
    howToApply: { es: "Solicitud al INPS online o a través de un Patronato.", en: "Apply to INPS online or through a Patronato.", it: "Domanda INPS." },
    sources: [{ title: "Patronato ENASC: bono guardería 2026", url: "https://enasc.it/2026/03/28/bonus-asilo-nido-2026-domande-fino-a-3-anni-di-eta-del-bambino-a-istruzioni-inps/", official: false }],
    lastVerified: "2026-11-11",
  },
  {
    slug: "assegno-di-inclusione",
    name: { es: "Assegno di Inclusione (ADI)", en: "Inclusion Allowance (ADI)", it: "Assegno di Inclusione (ADI)" },
    amount: {
      es: "Ayuda mensual para familias con pocos ingresos.",
      en: "Monthly support for low-income households.",
      it: "Sostegno mensile per nuclei a basso reddito.",
    },
    who: {
      es: "Familias con menores, personas con discapacidad, mayores de 60 años o personas en situación de desventaja.",
      en: "Households with minors, people with disabilities, people over 60, or people in disadvantaged situations.",
      it: "Nuclei con minori, disabili, over 60 o persone svantaggiate.",
    },
    requirements: [
      { es: "ISEE bajo (una guía indica menos de 10.140 €; confírmalo en el INPS)", en: "Low ISEE (one guide says under €10,140; confirm with INPS)", it: "ISEE basso (verifica la soglia su INPS)" },
      { es: "Permiso de residencia válido y 5 años de residencia en Italia (los 2 últimos seguidos)", en: "Valid residence permit and 5 years of residence in Italy (the last 2 continuous)", it: "Permesso valido e 5 anni di residenza (ultimi 2 continuativi)" },
    ],
    howToApply: { es: "Solicitud al INPS, a un Patronato o a un CAF.", en: "Apply via INPS, a Patronato or a CAF.", it: "Domanda INPS, Patronato o CAF." },
    sources: [{ title: "INPS", url: "https://www.inps.it/", official: true }],
    lastVerified: "2026-11-11",
  },
];
