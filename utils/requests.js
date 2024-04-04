//ApiDomain
const apiDomain = process.env.NEXT_PUBLIC_API_DOMAI || null;

//GET ALL PROPERTIES
async function fetchProperties() {
  try {
    // Handle the case where apiDomain is not available yet.
    if (apiDomain === null) {
      return [];
    }
    const response = await fetch(`${apiDomain}/properties`);
    if (!response.ok) {
      throw new Error("Fail to fetch data.");
    }
    return response.json();
  } catch (error) {
    console.log(error);
    return [];
  }
}

export { fetchProperties };
