const API_URL = "/api";


export async function getServices() {

    const response = await fetch(
        `${API_URL}/services/`
    );

    return await response.json();

}



export async function registerUser(data) {

    const response = await fetch(
        `${API_URL}/users/register`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        }
    );


    return await response.json();

}



export async function loginUser(data) {

    const response = await fetch(
        `${API_URL}/users/login`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        }
    );


    return await response.json();

}