import { Camera, Trash2, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "~/auth/AuthProvider";
import { PROFILE_X } from "~/content/modules/motivation";
import { AVATAR_SIZE, cropBox, useAvatar } from "~/lib/avatar";
import { Modal, useT9 } from "~/ui/modules/ModuleBlocks";

const VIEW = 260; // tamaño del recorte en pantalla (px)

/** Círculo con la foto (o la inicial) para el inicio y el perfil. */
export function AvatarCircle({ size = 48, initial }: { size?: number; initial?: string }) {
  const { user } = useAuth();
  const [url] = useAvatar(user?.id);
  return (
    <span className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gold bg-gold-soft text-xl font-bold text-terracotta-hover" style={{ width: size, height: size }} aria-hidden>
      {url ? <img src={url} alt="" className="h-full w-full object-cover" data-testid="avatar-img" /> : initial ? initial.toUpperCase() : <UserRound size={size / 2} />}
    </span>
  );
}

/** Elegir foto → ver y encuadrar (arrastrar + zoom) → guardar. Todo en el teléfono. */
export function AvatarPicker({ initial }: { initial?: string }) {
  const { x } = useT9();
  const { user } = useAuth();
  const [url, setAvatar] = useAvatar(user?.id);
  const [src, setSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => () => void (src && URL.revokeObjectURL(src)), [src]);

  function pick(file: File | undefined) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError(x(PROFILE_X.badImage));
    const u = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      setSrc(u);
      setImg(im);
      setZoom(1);
      setOff({ x: 0, y: 0 });
    };
    im.onerror = () => {
      URL.revokeObjectURL(u);
      setError(x(PROFILE_X.badImage));
    };
    im.src = u;
  }
  function close() {
    setSrc(null);
    setImg(null);
    if (input.current) input.current.value = "";
  }
  const box = img ? cropBox(img.naturalWidth, img.naturalHeight, VIEW, zoom, off.x, off.y) : null;

  function save() {
    if (!img || !box) return;
    const k = AVATAR_SIZE / VIEW;
    const c = document.createElement("canvas");
    c.width = c.height = AVATAR_SIZE;
    const ctx = c.getContext("2d");
    if (!ctx) return setError(x(PROFILE_X.badImage));
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);
    ctx.drawImage(img, box.left * k, box.top * k, box.sw * k, box.sh * k);
    if (!setAvatar(c.toDataURL("image/jpeg", 0.85))) return setError(x(PROFILE_X.badImage));
    close();
  }

  return (
    <section className="card flex items-center gap-4" aria-label={x(PROFILE_X.photo)}>
      <AvatarCircle size={80} initial={initial} />
      <div className="min-w-0 flex-1 space-y-2">
        <h2 className="font-bold">{x(PROFILE_X.photo)}</h2>
        <p className="text-[13px] text-ink-soft">{x(PROFILE_X.photoHint)}</p>
        <div className="flex flex-wrap gap-2">
          <label className="btn btn-secondary !min-h-11 !w-auto cursor-pointer !px-4 !text-[15px]">
            <Camera size={18} aria-hidden /> {x(url ? PROFILE_X.changePhoto : PROFILE_X.choosePhoto)}
            <input ref={input} type="file" accept="image/*" className="sr-only" data-testid="avatar-input" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          {url && (
            <button type="button" className="btn btn-quiet !min-h-11 !w-auto !px-4 !text-[15px]" onClick={() => setAvatar(null)}>
              <Trash2 size={18} aria-hidden /> {x(PROFILE_X.removePhoto)}
            </button>
          )}
        </div>
        {error && <p className="alert alert-error text-[14px]">{error}</p>}
      </div>
      {src && img && box && (
        <Modal title={x(PROFILE_X.adjust)} onClose={close}>
          <p className="hint mb-3">{x(PROFILE_X.adjustHint)}</p>
          <div
            className="relative mx-auto touch-none select-none overflow-hidden rounded-full bg-beige"
            style={{ width: VIEW, height: VIEW, cursor: "grab" }}
            data-testid="avatar-crop"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { px: e.clientX, py: e.clientY, ox: box.dx, oy: box.dy };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (d) setOff({ x: d.ox + e.clientX - d.px, y: d.oy + e.clientY - d.py });
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          >
            <img src={src} alt="" draggable={false} className="pointer-events-none absolute max-w-none" style={{ left: box.left, top: box.top, width: box.sw, height: box.sh }} />
          </div>
          <label className="mt-4 block">
            <span className="field-label">{x(PROFILE_X.zoom)}</span>
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-[var(--terracotta)]" />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-secondary" onClick={close}>
              {x(PROFILE_X.cancel)}
            </button>
            <button type="button" className="btn" onClick={save}>
              {x(PROFILE_X.savePhoto)}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
