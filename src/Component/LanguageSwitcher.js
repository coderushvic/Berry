import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe2, ChevronDown } from "lucide-react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: "en", label: "English" },
    { code: "zh", label: "中文 (Chinese)" },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Selector button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg 
                   border border-gray-300 shadow-sm hover:bg-gray-200 transition"
      >
        <Globe2 className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium capitalize">
          {i18n.language === "zh" ? "中文" : "English"}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 w-40 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
          {languages.map((lng) => (
            <button
              key={lng.code}
              onClick={() => changeLanguage(lng.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100
                ${i18n.language === lng.code ? "bg-gray-100 font-semibold" : ""}`}
            >
              {lng.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
