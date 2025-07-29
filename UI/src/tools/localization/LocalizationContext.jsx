import React, { createContext, useContext, useEffect, useState } from "react";

const LocalizationContext = createContext();

export const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // İlk render'da localStorage'dan dil bilgisini al
    return localStorage.getItem("lang") || "tr"; // varsayılan dil
  });
  const [dictionary, setDictionary] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Language değiştiğinde localStorage'a kaydet ve sözlük yükle
    if (language) {
      localStorage.setItem("lang", language);
      setIsLoading(true);
      
      fetch(`http://localhost:5155/api/sozluk/language/${language}`)
        .then((res) => res.json())
        .then((data) => {
          const dict = {};
          data.forEach(item => {
            dict[item.sozlukAnahtar] = item.sozlukDeger;
          });
          setDictionary(dict);
        })
        .catch((error) => {
          console.error("Dil yüklenirken hata:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [language]);

  const localizeThis = (key) => dictionary[key] || key;

  return (
    <LocalizationContext.Provider value={{ 
      localizeThis, 
      language, 
      setLanguage, 
      isLoading 
    }}>
      {children}
    </LocalizationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLocalization = () => useContext(LocalizationContext);