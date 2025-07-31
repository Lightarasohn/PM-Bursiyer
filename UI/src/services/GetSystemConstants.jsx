const GetSystemConstantsAPI = async (q) => {
    const query = `?q=${q}`;
    const base = import.meta.env.VITE_API_BASE_URL;
    const url = `${base}api/system-constant${query}`;
    var requestOptions = {
     
        method: "GET"
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

export default GetSystemConstantsAPI;