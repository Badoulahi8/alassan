const url = "http://localhost:8080/api/"

export async function fetchDatas(endpoint) {
  try {
    const response = await fetch(url + endpoint, {
      credentials: "include"
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchWithBody(endpoint, body) {
  try {
    const response = await fetch(`${url+endpoint}`, {
      method: "POST",
      credentials: "include",
      headers:  { "Content-Type": "application/json" },
      credentials: "include",
      body: body
    });

    const data = await response.json();
    return data;
    // if (data.status == "Requested") {
    //   console.log("Successfully requested group");
    // } else {
    //   console.error("Failed to request join group");
    //   alert("You are a member of the group")
    // }
  } catch (error) {
    console.log(error);
  }
}