const RegisterAPI = async (body) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    console.log("Base URL:", baseURL); //baseURL is undefined
    const url = `${baseURL}api/account/register`;
    var requestOptions = {
        method: "POST",
        headers: {
            "accept": "*/*",
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(body)
    }

    try {
        const response = await fetch(url, requestOptions);
        
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.log("API returned error status:", response.status);
            return null;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

export default RegisterAPI;