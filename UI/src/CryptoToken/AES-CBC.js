
import CryptoJS from 'crypto-js';

const secretKey = CryptoJS.enc.Utf8.parse("HpDUIAUrGqASGkFSAVUGSF12U4JMZXAs"); // 16, 24 veya 32 byte olmalı

export const decryptToken = (encryptedBase64) => {
  try {
    const encryptedBytes = CryptoJS.enc.Base64.parse(encryptedBase64);

    const ivWords = CryptoJS.lib.WordArray.create(encryptedBytes.words.slice(0, 4));
    const ciphertextWords = CryptoJS.lib.WordArray.create(encryptedBytes.words.slice(4));

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertextWords },
      secretKey,
      {
        iv: ivWords,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Token çözülürken hata:", error);
    return null;
  }
};
