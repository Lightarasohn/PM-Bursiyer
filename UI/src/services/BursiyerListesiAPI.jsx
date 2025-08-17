import { decryptToken } from "../tools/cryptoToken/AES-CBC.js";

const BursiyerListesiAPI = async () => {
    const base = import.meta.env.VITE_API_BASE_URL;
    const url = `${base}api/scholar`;
    const encryptedToken  = localStorage.getItem("userToken");
    const decryptedToken = decryptToken(encryptedToken)
    console.log(decryptedToken)
    var requestOptions = {
        headers: {
            "accept": "*/*",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${decryptedToken}`
        },
        method: "GET"
    }

    return await fetch(url, requestOptions)
    .then((result) => result.json())
    .then((data) => {return data})
    .catch((e) => {console.log(e); return undefined});
}

export default BursiyerListesiAPI