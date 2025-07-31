const GetAllDocumentsAPI = async () => {
     const base = import.meta.env.VITE_API_BASE_URL;
    const url = `${base}api/document`;
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

export default GetAllDocumentsAPI;