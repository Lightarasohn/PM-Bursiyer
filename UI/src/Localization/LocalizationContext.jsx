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

  fetch(`http://localhost:5155/api/sozluk/language/${language}`)
    .then((res) => res.json())
    .then((data) => {
      // Veriyi dictionary objesine dönüştür
      const dict = {};
      data.forEach(item => {
        dict[item.sozlukAnahtar] = item.sozlukDeger;
      });
      setDictionary(dict);
    });
}, [language]);

  const localizeThis = (key) => dictionary[key] || key;

  return (
    <LocalizationContext.Provider value={{ localizeThis, language, setLanguage }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);
