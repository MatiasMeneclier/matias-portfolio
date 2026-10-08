"use client";
export default function CVPrintButton({ locale }: { locale: "es" | "en" }) {
  return (
    <button
      type="button"
      onClick={async () => {
        await document.fonts.ready;
        window.print();
      }}
    >
      {locale === "en" ? "Save as PDF / Print" : "Guardar PDF / Imprimir"}
    </button>
  );
}
