import type { ReactNode } from "react";

/**
 * Ilustraciones propias de A Posto: escenas al aire libre con personas de distintos orígenes,
 * cada una sobre una parte de la app (bienvenida, trámites, asistente, citas, privacidad).
 * Todo es SVG dibujado aquí: pesa poco, funciona sin conexión y se ve nítido en cualquier pantalla.
 * Las animaciones son suaves y se apagan si el teléfono pide «reducir movimiento».
 */

const INK = "#2b2622";
type Pt = [number, number];
type Hair = "hijab" | "beard" | "bun" | "afro" | "straight" | "ponytail" | "short";
type Outfit = "pants" | "dress" | "long";

type PersonProps = {
  x: number;
  y: number;
  s?: number;
  skin: string;
  shirt: string;
  pants?: string;
  hair: Hair;
  hairColor: string;
  iris?: string;
  outfit?: Outfit;
  /** Mano izquierda / derecha: "down", "wave" o un punto (coordenadas de la persona). */
  armL?: "down" | "wave" | Pt;
  armR?: "down" | "wave" | Pt;
  walk?: boolean;
  delay?: number;
  /** Lo que sostiene (se dibuja entre el cuerpo y las manos). */
  children?: ReactNode;
};

const HC = -122; // centro de la cabeza

function HairBack({ hair, c }: { hair: Hair; c: string }) {
  switch (hair) {
    case "hijab":
      return <path d="M-32 -112 Q-37 -161 0 -161 Q37 -161 32 -112 Q34 -86 0 -82 Q-34 -86 -32 -112 Z" fill={c} />;
    case "afro":
      return <circle cx={0} cy={-130} r={39} fill={c} />;
    case "bun":
      return <circle cx={0} cy={-154} r={12} fill={c} />;
    case "straight":
      return <path d="M-29 -100 Q-35 -153 0 -152 Q35 -153 29 -100 Z" fill={c} />;
    case "ponytail":
      return <path d="M16 -142 Q46 -134 38 -96 Q34 -84 28 -92 Q32 -112 18 -124 Z" fill={c} />;
    default:
      return null;
  }
}

function HairFront({ hair, c }: { hair: Hair; c: string }) {
  switch (hair) {
    case "beard":
      return (
        <>
          <path d="M-27 -126 Q-28 -154 0 -154 Q28 -154 27 -126 Q19 -142 0 -141 Q-15 -142 -27 -126 Z" fill={c} />
          <path d="M-25 -118 Q-23 -92 0 -92 Q23 -92 25 -118 Q16 -104 0 -104 Q-16 -104 -25 -118 Z" fill={c} />
        </>
      );
    case "bun":
      return <path d="M-27 -122 Q-29 -151 0 -151 Q29 -151 27 -122 Q21 -139 4 -140 Q-17 -140 -27 -122 Z" fill={c} />;
    case "afro":
      return (
        <>
          <path d="M-26 -128 Q-19 -149 0 -147 Q19 -149 26 -128 Q13 -138 0 -137 Q-13 -138 -26 -128 Z" fill={c} />
          <circle cx={-26} cy={-108} r={3.2} fill="#E9B44C" />
          <circle cx={26} cy={-108} r={3.2} fill="#E9B44C" />
        </>
      );
    case "straight":
      return <path d="M-27 -124 Q-28 -151 0 -151 Q28 -151 27 -124 Q13 -139 -2 -133 Q-15 -139 -27 -124 Z" fill={c} />;
    case "ponytail":
      return (
        <>
          <path d="M-27 -122 Q-29 -151 0 -151 Q29 -151 27 -122 Q16 -140 -6 -138 Q-20 -136 -27 -122 Z" fill={c} />
          <path d="M-25 -136 Q0 -156 25 -136" fill="none" stroke="#E07A5F" strokeWidth={4} strokeLinecap="round" />
        </>
      );
    case "short":
      return <path d="M-26 -126 Q-27 -152 0 -152 Q27 -152 26 -126 Q20 -140 6 -142 Q-6 -136 -26 -126 Z" fill={c} />;
    default:
      return null;
  }
}

function Arm({ side, to, skin, shirt }: { side: -1 | 1; to: "down" | "wave" | Pt; skin: string; shirt: string }) {
  const sx = 20 * side;
  const sy = -88;
  const wave = to === "wave";
  const [ex, ey]: Pt = to === "down" ? [30 * side, -50] : wave ? [40 * side, -150] : to;
  const cx = sx + (ex - sx) * 0.15 + 8 * side;
  const cy = sy + (ey - sy) * 0.75;
  const arm = (
    <>
      <path d={`M${sx} ${sy} Q${cx} ${cy} ${ex} ${ey}`} fill="none" stroke={shirt} strokeWidth={10} strokeLinecap="round" />
      <circle cx={ex} cy={ey} r={6.5} fill={skin} />
    </>
  );
  return wave ? <g className="ppl-wave">{arm}</g> : arm;
}

export function Person({ x, y, s = 1, skin, shirt, pants = "#4a5a78", hair, hairColor, iris = "#5a3b28", outfit = "pants", armL = "down", armR = "down", walk, delay = 0, children }: PersonProps) {
  const faceR = hair === "hijab" ? 22 : 26;
  const legColor = outfit === "pants" ? pants : skin;
  const mouth = hair === "beard" ? "#f6d9c9" : INK;
  const brow = hair === "hijab" ? "#3a2a20" : hairColor === "#e9e2d8" || hairColor === "#c9c1b8" ? "#8a7f75" : hairColor;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={walk ? "ppl-walk" : undefined} style={{ animationDelay: `${delay}s` }}>
        {/* piernas y zapatos */}
        <g className={walk ? "ppl-leg-a" : undefined}>
          <rect x={-15} y={-44} width={12} height={40} rx={5} fill={legColor} />
          <ellipse cx={-10} cy={-4} rx={9} ry={5} fill="#3a2f2a" />
        </g>
        <g className={walk ? "ppl-leg-b" : undefined}>
          <rect x={3} y={-44} width={12} height={40} rx={5} fill={legColor} />
          <ellipse cx={10} cy={-4} rx={9} ry={5} fill="#3a2f2a" />
        </g>
        {/* cuerpo */}
        <rect x={-7} y={-102} width={14} height={12} rx={4} fill={skin} />
        {outfit === "pants" ? (
          <path d="M-24 -38 L-24 -80 Q-24 -97 0 -97 Q24 -97 24 -80 L24 -38 Z" fill={shirt} />
        ) : (
          <path d={`M-23 -80 Q-23 -97 0 -97 Q23 -97 23 -80 L${outfit === "long" ? 30 : 29} ${outfit === "long" ? -10 : -32} L${outfit === "long" ? -30 : -29} ${outfit === "long" ? -10 : -32} Z`} fill={shirt} />
        )}
        <path d="M-8 -97 Q0 -88 8 -97" fill="none" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
        {children}
        <Arm side={-1} to={armL} skin={skin} shirt={shirt} />
        <Arm side={1} to={armR} skin={skin} shirt={shirt} />
        {/* cabeza */}
        <g className="ppl-head" style={{ animationDelay: `${delay}s` }}>
          <HairBack hair={hair} c={hairColor} />
          <circle cx={0} cy={HC + (hair === "hijab" ? 2 : 0)} r={faceR} fill={skin} />
          <HairFront hair={hair} c={hairColor} />
          <path d="M-15 -131 Q-10 -135 -4 -132 M4 -132 Q10 -135 15 -131" fill="none" stroke={brow} strokeWidth={2.4} strokeLinecap="round" />
          <g className="ppl-blink" style={{ animationDelay: `${delay * 2 + 1}s` }}>
            {[-9, 9].map((ex) => (
              <g key={ex}>
                <ellipse cx={ex} cy={-120} rx={6} ry={7} fill="#ffffff" />
                <circle cx={ex + 0.8} cy={-119} r={3.8} fill={iris} />
                <circle cx={ex + 0.8} cy={-119} r={1.9} fill={INK} />
                <circle cx={ex + 2} cy={-121} r={1.1} fill="#ffffff" />
              </g>
            ))}
          </g>
          {hair === "bun" && (
            <g fill="none" stroke="#6b4f3a" strokeWidth={1.8}>
              <circle cx={-9} cy={-120} r={8.5} />
              <circle cx={9} cy={-120} r={8.5} />
              <path d="M-0.5 -120 h1" />
            </g>
          )}
          <circle cx={-16} cy={-109} r={4.2} fill="#e8796b" opacity={0.28} />
          <circle cx={16} cy={-109} r={4.2} fill="#e8796b" opacity={0.28} />
          <path d="M-8 -109 Q0 -100 8 -109" fill="none" stroke={mouth} strokeWidth={2.4} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

/* ---------- Fondo: cielo, sol, nubes, colinas y césped ---------- */

function Cloud({ x, y, s = 1, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  return (
    <g className="ppl-cloud" style={{ animationDelay: `${delay}s` }}>
      <g transform={`translate(${x} ${y}) scale(${s})`} fill="#ffffff">
        <ellipse cx={0} cy={0} rx={22} ry={12} />
        <circle cx={-12} cy={-6} r={11} />
        <circle cx={8} cy={-10} r={14} />
      </g>
    </g>
  );
}

function Backdrop({
  id,
  sun = [300, 46],
  clouds = [
    [70, 42],
    [190, 30],
  ],
}: {
  id: string;
  sun?: Pt;
  clouds?: Pt[];
}) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe7f3" />
          <stop offset="1" stopColor="#eef8f6" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width={360} height={240} rx={26} />
        </clipPath>
      </defs>
      <rect width={360} height={240} fill={`url(#${id}-sky)`} />
      <g transform={`translate(${sun[0]} ${sun[1]})`}>
        <g className="ppl-sun">
          {Array.from({ length: 10 }, (_, n) => (
            <rect key={n} x={-2} y={-34} width={4} height={9} rx={2} fill="#f6d36b" transform={`rotate(${n * 36})`} />
          ))}
        </g>
        <circle r={21} fill="#f9dc6e" />
        <circle r={16} fill="#fbe78f" />
      </g>
      <Cloud x={clouds[0][0]} y={clouds[0][1]} s={1} />
      <Cloud x={clouds[1][0]} y={clouds[1][1]} s={0.75} delay={-9} />
      <ellipse cx={70} cy={214} rx={140} ry={44} fill="#b9d3a8" />
      <ellipse cx={300} cy={218} rx={150} ry={46} fill="#a9c897" />
      <rect y={206} width={360} height={34} fill="#93b97f" />
      {[24, 132, 214, 338].map((fx, n) => (
        <g key={fx} transform={`translate(${fx} ${222 + (n % 2) * 6})`}>
          <path d="M0 0 v-8" stroke="#6f9a5c" strokeWidth={2} />
          <circle cy={-10} r={3.4} fill={n % 2 ? "#f2a7a0" : "#fff3b0"} />
        </g>
      ))}
    </>
  );
}

function Scene({ id, label, className = "", children, sun, clouds }: { id: string; label: string; className?: string; children: ReactNode; sun?: Pt; clouds?: Pt[] }) {
  return (
    <svg viewBox="0 0 360 240" className={`ppl ${className}`} role="img" aria-label={label}>
      <g clipPath={`url(#${id}-clip)`}>
        <Backdrop id={id} sun={sun} clouds={clouds} />
        {children}
      </g>
    </svg>
  );
}

const HEART = "M0 3 C0 -1.5 -6.5 -1.5 -6.5 3.2 C-6.5 7 -2 9.5 0 12 C2 9.5 6.5 7 6.5 3.2 C6.5 -1.5 0 -1.5 0 3 Z";
function Heart({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="ppl-heart" style={{ animationDelay: `${delay}s` }} d={HEART} fill="#E07A5F" />
    </g>
  );
}

function Bubble({ x, y, text, delay, rtl, w: width }: { x: number; y: number; text: string; delay: number; rtl?: boolean; w?: number }) {
  const w = width ?? Math.max(46, text.length * 8.5 + 18);
  return (
    <g className="ppl-pop" style={{ animationDelay: `${delay}s` }}>
      <g transform={`translate(${x - w / 2} ${y})`}>
        <rect width={w} height={26} rx={13} fill="#ffffff" />
        <path d={`M${w / 2 - 5} 25 L${w / 2} 33 L${w / 2 + 5} 25 Z`} fill="#ffffff" />
        <text x={w / 2} y={17.5} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK} direction={rtl ? "rtl" : "ltr"} fontFamily="inherit">
          {text}
        </text>
      </g>
    </g>
  );
}

/* ---------- Personajes de la app ---------- */

const AMINA = { skin: "#C68642", shirt: "#7E9C76", hair: "hijab" as const, hairColor: "#E9B44C", outfit: "long" as const, iris: "#4a2e1c" };
const KOFI = { skin: "#8D5524", shirt: "#C77B59", pants: "#3d4a63", hair: "beard" as const, hairColor: "#241a14", iris: "#3a2416" };
const ROSA = { skin: "#F1C27D", shirt: "#5B8DB8", hair: "bun" as const, hairColor: "#e9e2d8", outfit: "dress" as const, iris: "#4e7a5a" };
const NIA = { skin: "#5C3A21", shirt: "#E07A5F", pants: "#2f3b55", hair: "afro" as const, hairColor: "#20160f", iris: "#3a2416" };
const LI = { skin: "#FFDBAC", shirt: "#3D5A80", pants: "#c9a76b", hair: "straight" as const, hairColor: "#1c1c1c", iris: "#3a2a20" };
const SOFIA = { skin: "#EAC096", shirt: "#E9B44C", pants: "#4a5a78", hair: "ponytail" as const, hairColor: "#8a5a35", iris: "#3f6e8c" };

/** Bienvenida: cinco personas de la mano saludando en varios idiomas. */
export function PeopleTogether({ className, label }: { className?: string; label: string }) {
  const s = 0.82;
  const hand = 37; // mitad de la distancia entre personas, en unidades de la persona
  return (
    <Scene id="ppl-welcome" label={label} className={className}>
      <Heart x={30} y={150} delay={0} />
      <Heart x={334} y={140} delay={1.6} />
      <Person x={56} y={226} s={s} {...AMINA} armR={[hand, -56]} delay={0} />
      <Person x={306} y={226} s={s} {...LI} armL={[-hand, -56]} delay={0.9} />
      <Person x={117} y={226} s={s} {...KOFI} armL={[-hand, -56]} armR={[hand, -56]} delay={0.6} />
      <Person x={245} y={226} s={s} {...NIA} armR={[hand, -56]} delay={0.3} />
      <Person x={180} y={226} s={s} {...ROSA} armL={[-hand, -56]} armR="wave" delay={1.2} />
      <Bubble x={52} y={56} text="¡Hola!" delay={0.2} />
      <Bubble x={128} y={40} text="Ciao!" delay={0.9} />
      <Bubble x={250} y={44} text="مرحبا" delay={1.6} rtl />
      <Bubble x={318} y={78} text="Salut!" delay={2.3} />
    </Scene>
  );
}

/** Trámites: alguien va a la oficina con su carpeta; la lista de pasos se va completando. */
export function SceneGuides({ className, label }: { className?: string; label: string }) {
  return (
    <Scene
      id="ppl-guides"
      label={label}
      className={className}
      sun={[190, 44]}
      clouds={[
        [62, 38],
        [300, 28],
      ]}
    >
      {/* oficina */}
      <g transform="translate(222 92)">
        <rect x={0} y={20} width={120} height={98} fill="#f3e3d3" />
        <path d="M-8 22 L60 -6 L128 22 Z" fill="#c77b59" />
        <rect x={-6} y={18} width={132} height={6} fill="#a65d3d" />
        {[14, 46, 78, 104].map((cx) => (
          <rect key={cx} x={cx - 4} y={30} width={8} height={70} fill="#fffaf3" />
        ))}
        <rect x={44} y={70} width={32} height={48} rx={4} fill="#6b4f3a" />
        <rect x={50} y={6} width={20} height={10} rx={2} fill="#fffaf3" />
        <g transform="translate(60 -6)">
          <path d="M0 0 v-26" stroke="#6b4f3a" strokeWidth={2} />
          <g className="ppl-flag">
            <rect x={0} y={-26} width={8} height={12} fill="#2f8f5b" />
            <rect x={8} y={-26} width={8} height={12} fill="#ffffff" />
            <rect x={16} y={-26} width={8} height={12} fill="#cf3b3b" />
          </g>
        </g>
      </g>
      {/* lista de pasos */}
      <g transform="translate(26 70)">
        <rect width={92} height={96} rx={12} fill="#ffffff" />
        {[0, 1, 2].map((n) => (
          <g key={n} transform={`translate(12 ${18 + n * 26})`}>
            <rect x={0} y={-9} width={18} height={18} rx={5} fill="#e6eee2" />
            <path className="ppl-tick" style={{ animationDelay: `${0.6 + n * 0.9}s` }} d="M4 0 l4 4 l7 -8" fill="none" stroke="#4d6647" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            <rect x={26} y={-4} width={44 - n * 6} height={8} rx={4} fill="#eadfce" />
          </g>
        ))}
      </g>
      <Person x={160} y={226} s={0.86} {...SOFIA} walk armL="down" armR={[30, -66]}>
        <g transform="translate(18 -84)">
          <rect width={30} height={38} rx={4} fill="#5B8DB8" />
          <rect x={6} y={8} width={18} height={4} rx={2} fill="#ffffff" opacity={0.7} />
        </g>
      </Person>
    </Scene>
  );
}

/** Asistente y cartas: alguien lee una carta en italiano; el teléfono responde en su idioma. */
export function SceneAssistant({ className, label }: { className?: string; label: string }) {
  return (
    <Scene id="ppl-assistant" label={label} className={className}>
      <Person x={104} y={226} s={0.9} {...KOFI} armL={[-14, -70]} armR={[22, -72]}>
        <g transform="translate(-26 -98)">
          <g className="ppl-letter">
            <rect width={52} height={40} rx={4} fill="#ffffff" stroke="#eadfce" />
            <rect x={7} y={8} width={26} height={4} rx={2} fill="#c9c1b8" />
            <rect x={7} y={16} width={38} height={4} rx={2} fill="#c9c1b8" />
            <rect x={7} y={24} width={32} height={4} rx={2} fill="#c9c1b8" />
            <text x={44} y={36} textAnchor="end" fontSize={9} fontWeight={800} fill="#a65d3d" fontFamily="inherit">
              IT
            </text>
          </g>
        </g>
      </Person>
      {/* flecha de traducción */}
      <path className="ppl-dash" d="M160 124 Q190 84 214 104" fill="none" stroke="#a65d3d" strokeWidth={3} strokeDasharray="6 6" strokeLinecap="round" />
      {/* teléfono con el chat */}
      <g transform="translate(218 52)">
        <rect width={98} height={168} rx={18} fill="#34312e" />
        <rect x={6} y={10} width={86} height={150} rx={13} fill="#f7f2ea" />
        <g className="ppl-pop" style={{ animationDelay: "0.4s" }}>
          <rect x={14} y={26} width={60} height={22} rx={10} fill="#a65d3d" />
          <rect x={22} y={35} width={40} height={4} rx={2} fill="#ffffff" />
        </g>
        <g className="ppl-pop" style={{ animationDelay: "1.4s" }}>
          <rect x={24} y={58} width={62} height={40} rx={10} fill="#ffffff" />
          <rect x={32} y={67} width={44} height={4} rx={2} fill="#c9c1b8" />
          <rect x={32} y={76} width={36} height={4} rx={2} fill="#c9c1b8" />
          <rect x={32} y={85} width={40} height={4} rx={2} fill="#c9c1b8" />
        </g>
        <g className="ppl-pop" style={{ animationDelay: "2.4s" }}>
          <circle cx={38} cy={118} r={4} fill="#c77b59" />
          <circle cx={50} cy={118} r={4} fill="#c77b59" opacity={0.7} />
          <circle cx={62} cy={118} r={4} fill="#c77b59" opacity={0.4} />
        </g>
      </g>
      <Bubble x={150} y={58} text="?" delay={0.2} w={34} />
    </Scene>
  );
}

/** Citas y oficinas: un calendario con el día marcado, la campana avisa y el mapa señala la oficina. */
export function SceneDates({ className, label }: { className?: string; label: string }) {
  return (
    <Scene id="ppl-dates" label={label} className={className} sun={[318, 40]}>
      <g transform="translate(150 64)">
        <rect width={118} height={112} rx={14} fill="#ffffff" />
        <rect width={118} height={28} rx={14} fill="#c77b59" />
        <rect y={14} width={118} height={14} fill="#c77b59" />
        {[24, 94].map((cx) => (
          <rect key={cx} x={cx - 3} y={-8} width={6} height={16} rx={3} fill="#6b4f3a" />
        ))}
        {Array.from({ length: 12 }, (_, n) => (
          <rect key={n} x={14 + (n % 4) * 25} y={40 + Math.floor(n / 4) * 24} width={15} height={12} rx={3} fill="#eadfce" />
        ))}
        <circle className="ppl-ring" cx={71.5} cy={70} r={14} fill="none" stroke="#a65d3d" strokeWidth={3} />
      </g>
      <g transform="translate(282 70)">
        <g className="ppl-bell">
          <path d="M-14 16 Q-14 -6 0 -8 Q14 -6 14 16 L18 20 L-18 20 Z" fill="#f2b84b" />
          <circle cy={-10} r={3} fill="#f2b84b" />
          <circle cy={24} r={4} fill="#c98f1e" />
        </g>
      </g>
      <g transform="translate(316 158)">
        <path className="ppl-pin" d="M0 0 C-14 -16 -14 -34 0 -36 C14 -34 14 -16 0 0 Z" fill="#E07A5F" />
        <circle className="ppl-pin" cy={-23} r={5} fill="#ffffff" />
      </g>
      <Person x={88} y={226} s={0.9} {...NIA} armL="down" armR={[52, -100]} delay={0.4} />
    </Scene>
  );
}

/** Privacidad: dos personas tranquilas con el escudo de sus datos. */
export function ScenePrivacy({ className, label }: { className?: string; label: string }) {
  return (
    <Scene id="ppl-privacy" label={label} className={className}>
      <g transform="translate(180 108)">
        <g className="ppl-shield">
          <path d="M0 -50 L40 -36 Q42 10 0 34 Q-42 10 -40 -36 Z" fill="#7E9C76" />
          <path d="M0 -40 L31 -29 Q32 6 0 24 Q-32 6 -31 -29 Z" fill="#a8c29f" />
          <path d="M-13 -6 l9 9 l18 -19" fill="none" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <Heart x={180} y={40} delay={0.5} />
      <Person x={92} y={226} s={0.88} {...LI} armL="down" armR="wave" delay={0.2} />
      <Person x={270} y={226} s={0.88} {...AMINA} armL={[-30, -70]} armR="down" delay={0.8} />
    </Scene>
  );
}
