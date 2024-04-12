//ApiDomain
const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null;

//FETCH ALL PROPERTIES
async function fetchProperties() {
  try {
    // Handle the case where apiDomain is not available yet.
    if (apiDomain === null) {
      return [];
    }
    const response = await fetch(`${apiDomain}/properties`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Fail to fetch data.");
    }
    return response.json();
  } catch (error) {
    console.log(error);
    return [];
  }
}

//FETCH PROPERTY BY ID
async function fetchPropertyById(id) {
  try {
    // Handle the case where apiDomain is not available yet.
    if (!apiDomain) {
      return null;
    }
    const response = await fetch(`${apiDomain}/properties/${id}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    return response.json();
  } catch (error) {
    console.log(error);
    return null;
  }
}

export { fetchProperties, fetchPropertyById };
