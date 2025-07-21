const BursiyerSilmeAPI = async (body) => {

    const url = `http://localhost:5155/api/term`;
    var requestOptions = {
        method: "POST",
        headers: {
            "accept": "*/*"
        },
        body: body
    }

    return await fetch(url, requestOptions)
    .then((result) => result.json())
    .then((data) => {return data})
    .catch((e) => {console.log(e); return undefined});
}

export default BursiyerSilmeAPI;