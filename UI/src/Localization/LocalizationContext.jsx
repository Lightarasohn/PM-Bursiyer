import React, { createContext, useContext, useEffect, useState } from "react";

// 1. Context tanımı
const LocalizationContext = createContext();

// 2. Provider
export const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = useState("tr");
  const [dictionary, setDictionary] = useState({});

  useEffect(() => {
  const savedLang = localStorage.getItem("lang") || "tr";
  setLanguage(savedLang);
}, []);

    useEffect(() => {
  localStorage.setItem("lang", language);
  fetch(`/api/sozluk/${language}`)
    .then((res) => res.json())
    .then((data) => setDictionary(data));
}, [language]);

  const t = (key) => dictionary[key] || key;

  return (
    <LocalizationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);
