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
