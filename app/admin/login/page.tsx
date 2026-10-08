import Link from "next/link";
import LoginForm from "@/components/admin/login-form";
import "../studio.css";
export const metadata = {
  title: "Ingresar — MM Studio",
  robots: { index: false, follow: false },
};
export default function Login() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  const demo =
    process.env.NODE_ENV === "development" ||
    process.env.ENABLE_ADMIN_DEMO === "true";
  return (
    <main className="login-page">
      <div className="login-card">
        <Link href="/" className="brand">
          MM<span>/ Studio</span>
        </Link>
        <h1>Tu próximo capítulo.</h1>
        <p>Ingresá para administrar tu portfolio.</p>
        {!configured && (
          <div className="notice">
            Supabase todavía no está conectado. El acceso real se habilita al
            configurar el proyecto y tu cuenta administradora.
          </div>
        )}
        <LoginForm configured={configured} />
        {demo && (
          <Link className="demo-link" href="/admin/demo">
            Explorar demo del panel ↗
            <span>Solo en este navegador. No modifica el sitio público.</span>
          </Link>
        )}
        <Link href="/" className="text-link">
          ← Volver al portfolio
        </Link>
      </div>
    </main>
  );
}
