"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

const ProfileSchema = z.object({
  display_name: z.preprocess(emptyToNull, z.string().trim().min(2).max(40).nullable()),
  country_of_origin: z.preprocess(emptyToNull, z.string().trim().max(60).nullable()),
  city: z.preprocess(emptyToNull, z.string().trim().max(60).nullable()),
  permit_type: z.preprocess(
    emptyToNull,
    z.enum(["lavoro", "famiglia", "studio", "protezione", "lungo_periodo", "attesa_occupazione", "altro", "nessuno"]).nullable(),
  ),
  permit_expiry: z.preprocess(emptyToNull, z.iso.date().nullable()),
  has_children: z.preprocess((v) => v === "on", z.boolean()),
  preferred_language: z.enum(["es", "en", "it"]),
  consent_personalization: z.preprocess((v) => v === "on", z.boolean()),
  consent_analytics: z.preprocess((v) => v === "on", z.boolean()),
});

export type ActionState = { ok?: boolean; error?: string };

export async function updateProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = ProfileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "invalid" };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/entrar");

  const data = parsed.data;
  // Si retira el consentimiento, borramos los datos personales opcionales (minimización, art. 5 RGPD).
  const values = data.consent_personalization
    ? data
    : { ...data, country_of_origin: null, city: null, permit_type: null, permit_expiry: null, has_children: null };

  const { error } = await supabase
    .from("profiles")
    .update({ ...values, consent_updated_at: new Date().toISOString() })
    .eq("id", auth.user.id);
  if (error) return { error: "save_failed" };
  revalidatePath("/perfil");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function deleteAccount() {
  const supabase = await createClient();
  await supabase.rpc("delete_my_account");
  await supabase.auth.signOut();
  redirect("/");
}
