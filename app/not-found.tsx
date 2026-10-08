import Link from "next/link";
export default function NotFound() {
  return (
    <main className="center-page">
      <p className="mono">404 /</p>
      <h1>Esta página todavía no existe.</h1>
      <Link className="button" href="/">
        Volver al portfolio ↗
      </Link>
    </main>
  );
}
