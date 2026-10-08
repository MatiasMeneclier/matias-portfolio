"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="center-page">
      <h1>No se pudo cargar el portfolio.</h1>
      <p>Intentá nuevamente en unos instantes.</p>
      <button className="button" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
