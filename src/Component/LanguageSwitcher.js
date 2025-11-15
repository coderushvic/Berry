import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe2, ChevronDown } from "lucide-react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: "en", label: "English" },
    { code: "zh", label: "中文" },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpen(false);
  };

  return (
    <header className="w-full bg-white shadow-md px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Left side: Logo or site title */}
      <div className="flex items-center gap-3">
        <div className="text-xl font-bold text-gray-800">MyPlatform</div>
      </div>

      {/* Right side: Language selector */}
      <div className="relative inline-block text-left">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-100 transition font-medium"
        >
          <Globe2 className="w-5 h-5 text-gray-600" />
          <span className="capitalize">
            {i18n.language === "zh" ? "中文" : "English"}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </button>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-50 border-gray-200">
            {languages.map((lng) => {
              const isActive = i18n.language === lng.code;
              return (
                <button
                  key={lng.code}
                  onClick={() => changeLanguage(lng.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition ${
                    isActive
                      ? "bg-indigo-100 text-indigo-600 font-semibold border-l-4 border-indigo-600"
                      : "text-gray-800"
                  }`}
                >
                  {lng.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

export default LanguageSwitcher;
