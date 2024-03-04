

const fetcher = {
    get: async(root, body) => {
        return makeRequest(root, body, "GET")
    },
    post: async(root, body) => {
        return makeRequest(root, body, "POST")
    },
}


const makeRequest = async (root, body, method) => {

    const url = `http://localhost:8080/api${root}`

    const options ={
        mode: "no-cors",
        method: method,
        credentials: "include",
        body: JSON.stringify(body),
    }

    options.headers = new Headers({
        "Content-Type": "application/json",
    })

    const response = await fetch(url, options)
    // .catch(() => {
    //     if(response.status == 401){
    //         console.log("Unhautorized")
    //     }
    // })

    return response
}

export default fetcher