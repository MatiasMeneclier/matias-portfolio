"use client";
import { useSite } from "./site-preferences";
export default function PrintButton() {
  const { t } = useSite();
  return (
    <button className="button no-print" onClick={() => window.print()}>
      {t("print")} ↓
    </button>
  );
}
