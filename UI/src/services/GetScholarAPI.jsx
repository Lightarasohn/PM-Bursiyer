const GetScholarAPI = async (id) => {
    const base = import.meta.env.VITE_API_BASE_URL;
    const url = `${base}api/scholar/${id}`;
    var requestOptions = {
     
        method: "GET"
    }

    return await fetch(url, requestOptions)
    .then((result) => result.json())
    .then((data) => {return data})
    .catch((e) => {console.log(e); return undefined});
}

export default GetScholarAPI