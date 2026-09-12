"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { isLang, setGlobalLang, type Lang } from "@/lib/i18n";

const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => <EditorLoading />,
});

function EditorLoading() {
  return (
    <main
      aria-busy="true"
      style={{ minHeight: "100vh", height: "100dvh", display: "grid", placeItems: "center", background: "#fffbfe" }}
    >
      <Logo size={48} color="#6750a4" />
    </main>
  );
}

function initialLanguage(): Lang {
  try {
    const ui = JSON.parse(localStorage.getItem("m3e:ui") ?? "null");
    if (isLang(ui?.lang)) return ui.lang;
  } catch {}
  const language = (navigator.language ?? "").toLowerCase();
  return language.startsWith("zh") ? "zh" : language.startsWith("ko") ? "ko" : language.startsWith("ja") ? "ja" : "en";
}

export default function Page() {
  const [lang, setLang] = useState<Lang | null>(null);
  useEffect(() => {
    const initialLang = initialLanguage();
    document.documentElement.lang = initialLang;
    setGlobalLang(initialLang);
    setLang(initialLang);
  }, []);
  return lang ? <Editor initialLang={lang} /> : <EditorLoading />;
}
