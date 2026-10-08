"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { browserClient } from "@/lib/supabase/client";
import { useSite } from "./site-preferences";
export const AdminContext = createContext(false);
export function useAdminSession() {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )
      return;
    const client = browserClient();
    let mounted = true;
    const check = () =>
      client.auth.getUser().then(({ data }) => {
        if (mounted) setAdmin(data.user?.app_metadata?.role === "admin");
      });
    void check();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => {
      setTimeout(() => void check(), 0);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  return admin;
}
export function EditShortcut({
  section,
}: {
  section: "profile" | "experience" | "projects" | "skills";
}) {
  const admin = useContext(AdminContext),
    { t } = useSite();
  if (!admin) return null;
  const labels = {
    profile: t("editProfile"),
    experience: t("editExperience"),
    projects: t("editProjects"),
    skills: t("editSkills"),
  };
  return (
    <Link
      className="edit-shortcut"
      href={"/admin/" + section}
      title={labels[section]}
    >
      <Pencil size={14} />
      <span>{labels[section]}</span>
    </Link>
  );
}
export function AdminMenu() {
  const admin = useContext(AdminContext),
    { t } = useSite();
  if (!admin) return null;
  return (
    <details className="admin-quick-menu">
      <summary>
        <Pencil size={15} />
        {t("edit")}
      </summary>
      <div>
        {(["profile", "experience", "projects", "skills"] as const).map((s) => (
          <EditShortcut key={s} section={s} />
        ))}
        <Link href="/admin/appearance">{t("appearance")}</Link>
        <button
          onClick={async () => {
            await browserClient().auth.signOut();
            location.reload();
          }}
        >
          {t("logout")}
        </button>
      </div>
    </details>
  );
}
