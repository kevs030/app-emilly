import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getGuide } from "@/content/guides";
import type { Guide } from "@/content/types";
import { useAuth } from "~/auth/AuthProvider";
import { supabase } from "./supabase";

/**
 * Datos personales de la fase 2: trámites, pasos hechos, recordatorios, memoria e historial.
 * Todo sale de filas reales de la base de datos. Nada se calcula "a ojo" ni lo inventa la IA.
 */
export type Procedure = { id: number; guide_slug: string; status: "active" | "done"; started_at: string; updated_at: string; completed_at: string | null };
export type Item = { procedure_id: number; kind: "step" | "document"; idx: number; done_at: string };
export type Reminder = { id: number; procedure_id: number | null; title: string; due_date: string; done: boolean };
export type Fact = { id: number; key: string; value: string; source: "user" | "ai_suggestion"; confirmed: boolean; created_at: string };
export type Activity = { id: number; type: string; ref: string | null; created_at: string };
export type ActivityType = "guide_view" | "procedure_start" | "procedure_done" | "item_done" | "item_undone" | "document_open" | "reminder_add" | "reminder_done";

export type Progress = { guide: Guide; stepsDone: number; stepsTotal: number; docsDone: number; docsTotal: number; done: number; total: number; percent: number; nextStep: number | null };

type Ctx = {
  /** false = las tablas aún no existen en el servidor (falta ejecutar la migración 0003) */
  available: boolean;
  loading: boolean;
  procedures: Procedure[];
  items: Item[];
  reminders: Reminder[];
  facts: Fact[];
  activity: Activity[];
  procedureFor: (slug: string) => Procedure | undefined;
  progressOf: (p: Procedure) => Progress | null;
  isDone: (procedureId: number, kind: Item["kind"], idx: number) => boolean;
  start: (slug: string) => Promise<boolean>;
  toggleItem: (p: Procedure, kind: Item["kind"], idx: number) => Promise<void>;
  setStatus: (p: Procedure, status: Procedure["status"]) => Promise<void>;
  removeProcedure: (p: Procedure) => Promise<void>;
  addReminder: (title: string, dueDate: string, procedureId?: number) => Promise<boolean>;
  toggleReminder: (r: Reminder) => Promise<void>;
  removeReminder: (r: Reminder) => Promise<void>;
  setInterest: (slug: string, on: boolean) => Promise<void>;
  removeFact: (f: Fact) => Promise<void>;
  confirmFact: (f: Fact) => Promise<void>;
  log: (type: ActivityType, ref?: string) => void;
  clearActivity: () => Promise<void>;
  reload: () => Promise<void>;
};

const PersonalContext = createContext<Ctx | null>(null);

const MISSING = new Set(["PGRST205", "42P01"]);

export function PersonalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);

  const reload = useCallback(async () => {
    if (!userId) return;
    const [p, i, r, f, a] = await Promise.all([
      supabase.from("procedures").select("id, guide_slug, status, started_at, updated_at, completed_at").order("updated_at", { ascending: false }),
      supabase.from("procedure_items").select("procedure_id, kind, idx, done_at"),
      supabase.from("reminders").select("id, procedure_id, title, due_date, done").order("due_date"),
      supabase.from("user_facts").select("id, key, value, source, confirmed, created_at").order("created_at"),
      supabase.from("activity").select("id, type, ref, created_at").order("id", { ascending: false }).limit(30),
    ]);
    if (p.error && MISSING.has(p.error.code)) {
      setAvailable(false);
      setLoading(false);
      return;
    }
    setAvailable(true);
    setProcedures((p.data ?? []) as Procedure[]);
    setItems((i.data ?? []) as Item[]);
    setReminders((r.data ?? []) as Reminder[]);
    setFacts((f.data ?? []) as Fact[]);
    setActivity((a.data ?? []) as Activity[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de los datos personales
    reload();
  }, [reload]);

  const value = useMemo<Ctx>(() => {
    const log = (type: ActivityType, ref?: string) => {
      if (!available || !userId) return;
      void supabase.from("activity").insert({ type, ref: ref?.slice(0, 80) ?? null }).then(() => undefined);
    };
    const isDone: Ctx["isDone"] = (pid, kind, idx) => items.some((x) => x.procedure_id === pid && x.kind === kind && x.idx === idx);
    const progressOf: Ctx["progressOf"] = (p) => {
      const guide = getGuide(p.guide_slug);
      if (!guide) return null;
      const mine = items.filter((x) => x.procedure_id === p.id);
      const stepsTotal = guide.steps.length;
      const docsTotal = guide.documents.length;
      // Solo cuentan los índices que existen hoy en la guía.
      const stepsDone = mine.filter((x) => x.kind === "step" && x.idx < stepsTotal).length;
      const docsDone = mine.filter((x) => x.kind === "document" && x.idx < docsTotal).length;
      const total = stepsTotal + docsTotal;
      const done = stepsDone + docsDone;
      let nextStep: number | null = null;
      for (let n = 0; n < stepsTotal; n++) {
        if (!mine.some((x) => x.kind === "step" && x.idx === n)) {
          nextStep = n;
          break;
        }
      }
      return { guide, stepsDone, stepsTotal, docsDone, docsTotal, done, total, percent: total ? Math.round((done / total) * 100) : 0, nextStep };
    };
    return {
      available,
      loading,
      procedures,
      items,
      reminders,
      facts,
      activity,
      procedureFor: (slug) => procedures.find((p) => p.guide_slug === slug),
      progressOf,
      isDone,
      start: async (slug) => {
        const { error } = await supabase.from("procedures").insert({ guide_slug: slug });
        if (error) return false;
        log("procedure_start", slug);
        await reload();
        return true;
      },
      toggleItem: async (p, kind, idx) => {
        const done = isDone(p.id, kind, idx);
        // Respuesta inmediata en pantalla; si el servidor falla, la recarga lo corrige.
        setItems((cur) => (done ? cur.filter((x) => !(x.procedure_id === p.id && x.kind === kind && x.idx === idx)) : [...cur, { procedure_id: p.id, kind, idx, done_at: new Date().toISOString() }]));
        const res = done
          ? await supabase.from("procedure_items").delete().eq("procedure_id", p.id).eq("kind", kind).eq("idx", idx)
          : await supabase.from("procedure_items").insert({ procedure_id: p.id, kind, idx });
        if (!res.error) log(done ? "item_undone" : "item_done", p.guide_slug);
        await reload();
      },
      setStatus: async (p, status) => {
        const { error } = await supabase.from("procedures").update({ status }).eq("id", p.id);
        if (!error && status === "done") log("procedure_done", p.guide_slug);
        await reload();
      },
      removeProcedure: async (p) => {
        await supabase.from("procedures").delete().eq("id", p.id);
        await reload();
      },
      addReminder: async (title, dueDate, procedureId) => {
        const { error } = await supabase.from("reminders").insert({ title: title.trim(), due_date: dueDate, procedure_id: procedureId ?? null });
        if (error) return false;
        log("reminder_add");
        await reload();
        return true;
      },
      toggleReminder: async (r) => {
        await supabase.from("reminders").update({ done: !r.done }).eq("id", r.id);
        if (!r.done) log("reminder_done");
        await reload();
      },
      removeReminder: async (r) => {
        await supabase.from("reminders").delete().eq("id", r.id);
        await reload();
      },
      setInterest: async (slug, on) => {
        if (on) await supabase.from("user_facts").insert({ key: "interest", value: slug });
        else await supabase.from("user_facts").delete().eq("key", "interest").eq("value", slug);
        await reload();
      },
      removeFact: async (f) => {
        await supabase.from("user_facts").delete().eq("id", f.id);
        await reload();
      },
      confirmFact: async (f) => {
        await supabase.from("user_facts").update({ confirmed: true }).eq("id", f.id);
        await reload();
      },
      log,
      clearActivity: async () => {
        if (userId) await supabase.from("activity").delete().eq("user_id", userId);
        await reload();
      },
      reload,
    };
  }, [available, loading, procedures, items, reminders, facts, activity, userId, reload]);

  return <PersonalContext.Provider value={value}>{children}</PersonalContext.Provider>;
}

export function usePersonal(): Ctx {
  const ctx = useContext(PersonalContext);
  if (!ctx) throw new Error("usePersonal fuera de PersonalProvider");
  return ctx;
}
