const BursiyerSilmeAPI = async (id) => {

    const url = `http://localhost:5155/api/scholar/${id}`;
    var requestOptions = {
        method: "DELETE",
        headers: {
            "accept": "*/*"
        }
    }

    return await fetch(url, requestOptions)
    .then((result) => result.json())
    .then((data) => {return data})
    .catch((e) => {console.log(e); return undefined});
}

export default BursiyerSilmeAPI;