"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { Language } from "@/i18n/translations";
import { cn } from "@/lib/utils";

const languages = [
  {
    code: "en" as Language,
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
  },
  {
    code: "fr" as Language,
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
  },
  { code: "ar" as Language, name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        aria-label="Select language"
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium hidden md:inline">
          {currentLanguage?.flag} {currentLanguage?.nativeName}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Select Language
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                  language === lang.code
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span>
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {lang.nativeName}
                    </div>
                  </span>
                </span>
                {language === lang.code && (
                  <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
