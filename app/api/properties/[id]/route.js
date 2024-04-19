import connectDB from "@/config/database";
import Property from "@/models/Property";
import { getSessionUser } from "@/utils/getSessionUser";
//GET /api/properties/:id
export const GET = async (request, { params }) => {
  try {
    await connectDB();
    const property = await Property.findById(params.id);
    if (!property) {
      return new Response("Property Not Found.", { status: 404 });
    }
    return new Response(JSON.stringify(property), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response("Something is wrong", { status: 500 });
  }
};
// DELETE /api/properties/:id
export const DELETE = async (request, { params }) => {
  try {
    const sessionUser = await getSessionUser();

    // Check for session

    if (!sessionUser || !sessionUser?.user?.id) {
      return new Response("User or user id is required!", { status: 401 });
    }
    const { userId } = sessionUser;
    await connectDB();

    const propertyId = params.id;
    const property = await Property.findById(propertyId);

    if (!property) {
      return new Response("Property Not Found.", { status: 404 });
    }

    if (property.owner.toString() !== userId) {
      return new Response("Unauthorized User", { status: 401 });
    }
    await property.deleteOne();
    return new Response("Property delete successfully", {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response("Something is wrong", { status: 500 });
  }
};

// PUT api/properties/:id
export const PUT = async (request, { params }) => {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      throw new Response("UserID is required.", { status: 401 });
    }
    const { userId } = sessionUser;
    const { id } = params;

    const formData = await request.formData();
    const amenities = formData.getAll("amenities");

    //Get property to update
    const existingProperty = await Property.findById(id);

    if (!existingProperty) {
      return new Response("Property is not found", { status: 404 });
    }

    // Verify owner
    if (existingProperty.owner.toString() !== userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const propertyData = {
      type: formData.get("type"),
      name: formData.get("name"),
      description: formData.get("description"),
      location: {
        street: formData.get("location.street"),
        district: formData.get("location.district"),
        city: formData.get("location.city"),
        zipcode: formData.get("location.zipcode"),
      },
      beds: formData.get("beds"),
      baths: formData.get("baths"),
      square_feet: formData.get("square_feet"),
      amenities,
      rates: {
        weekly: formData.get("rates.weekly"),
        monthly: formData.get("rates.monthly"),
        nightly: formData.get("rates.nightly"),
      },
      seller_info: {
        name: formData.get("seller_info.name"),
        email: formData.get("seller_info.email"),
        phone: formData.get("seller_info.phone"),
      },
      owner: userId,
    };

    // Update property in database
    const updatedProperty = await Property.findByIdAndUpdate(id, propertyData);
    return new Response(JSON.stringify(updatedProperty), { status: 200 });
  } catch (error) {
    return new Response(`Fail to add property: ${error}`, { status: 404 });
  }
};

const isValidPicture = (image) => {
  // Here you can implement your logic to check if the image is a valid picture
  // For simplicity, let's assume any non-empty file with certain extensions (like .jpg, .png, .jpeg) is considered valid
  const allowedExtensions = ["jpg", "jpeg", "png"];
  const extension = image.name.split(".").pop().toLowerCase();
  return image.name !== "" && allowedExtensions.includes(extension);
};
