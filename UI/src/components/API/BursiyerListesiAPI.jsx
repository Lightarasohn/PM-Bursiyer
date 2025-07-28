const BursiyerListesiAPI = async () => {
    const url = "http://localhost:5155/api/scholar";
    var requestOptions = {
        headers: {
            "accept": "*/*",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("userToken")}`
        },
        method: "GET"
    }

    return await fetch(url, requestOptions)
    .then((result) => result.json())
    .then((data) => {return data})
    .catch((e) => {console.log(e); return undefined});
}

export default BursiyerListesiAPI