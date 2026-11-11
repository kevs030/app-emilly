import { redirect } from "next/navigation";
import { getLang } from "@/lib/lang";
import { getUser, supabaseConfigured } from "@/lib/supabase/server";
import { NotConfigured } from "@/components/NotConfigured";
import { NewPostForm } from "./NewPostForm";

export default async function NewPostPage() {
  if (!supabaseConfigured()) return <NotConfigured />;
  if (!(await getUser())) redirect("/entrar");
  const lang = await getLang();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{lang === "en" ? "New question" : "Nueva pregunta"}</h1>
      <NewPostForm lang={lang} />
    </div>
  );
}
