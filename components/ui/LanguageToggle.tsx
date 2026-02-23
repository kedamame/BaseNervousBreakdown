"use client";

import { useT } from "@/lib/i18n";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useT();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "ja" : "en")}
      className={`px-2 py-1 rounded-md text-xs font-semibold border border-border bg-surface text-gray-400
        hover:border-purple-500 hover:text-purple-400 transition-colors ${className}`}
      aria-label="Switch language"
    >
      {locale === "en" ? "日本語" : "English"}
    </button>
  );
}
