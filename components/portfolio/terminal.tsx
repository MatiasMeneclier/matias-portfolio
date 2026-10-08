"use client";
import { useEffect, useRef, useState } from "react";
import { useSite } from "./site-preferences";
import { X } from "lucide-react";
export default function Terminal({
  linkedin,
  onClose,
}: {
  linkedin: string;
  onClose: () => void;
}) {
  const { t } = useSite();
  const dialog = useRef<HTMLDialogElement>(null),
    [command, setCommand] = useState(""),
    [history, setHistory] = useState([t("terminalHelp")]);
  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  function execute() {
    const cmd = command.trim().toLowerCase();
    if (!cmd) return;
    setCommand("");
    if (cmd === "clear") {
      setHistory([]);
      return;
    }
    let response = t("unknown");
    if (cmd === "help")
      response =
        "about · experience · education · projects · skills · linkedin · contact · clear";
    else if (cmd === "linkedin") {
      window.open(linkedin, "_blank", "noopener,noreferrer");
      response = t("opening");
    } else if (
      [
        "about",
        "experience",
        "education",
        "projects",
        "skills",
        "contact",
      ].includes(cmd)
    ) {
      const section = document.getElementById(cmd);
      if (!section) {
        setHistory((old) => [...old.slice(-30), "> " + cmd, t("hidden")]);
        return;
      }
      window.history.replaceState(null, "", "#" + cmd);
      onClose();
      setTimeout(
        () =>
          document.getElementById(cmd)?.scrollIntoView({
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "instant"
              : "smooth",
          }),
        50,
      );
      response = "→ " + cmd;
    }
    setHistory((old) => [...old.slice(-30), "> " + cmd, response]);
  }
  return (
    <dialog
      ref={dialog}
      className="terminal-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="terminal-head">
        <span>matias-meneclier / terminal</span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label={t("closeTerminal")}
        >
          <X size={18} />
        </button>
      </div>
      <div className="terminal-log" role="log">
        {history.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          execute();
        }}
        className="terminal-input"
      >
        <span>❯</span>
        <input
          autoFocus
          aria-label={t("command")}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </dialog>
  );
}
