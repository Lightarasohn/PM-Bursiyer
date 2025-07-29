const GetScholarAPI = async (id) => {
    const url = `http://localhost:5155/api/scholar/${id}`;
    var requestOptions = {
     
        method: "GET"
    }

    return await fetch(url, requestOptions)
    .then((result) => result.json())
    .then((data) => {return data})
    .catch((e) => {console.log(e); return undefined});
}

export default GetScholarAPI