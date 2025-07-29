import { decryptToken } from "../../CryptoToken/AES-CBC";

const BursiyerListesiAPI = async () => {
    const url = "http://localhost:5155/api/scholar";
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