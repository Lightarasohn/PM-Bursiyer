const GetAllRequiredDocumentsAPI = async () => {
    const query = "?q=required";
    const url = `http://localhost:5155/api/system-constant${query}`;
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

export default GetAllRequiredDocumentsAPI;