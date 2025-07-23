const AddTermOfScholarDocumentsAPI = async (body) => {

    const url = `http://localhost:5155/api/term-scholar-document`;
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

export default AddTermOfScholarDocumentsAPI;