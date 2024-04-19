import connectDB from "@/config/database";
import User from "@/models/User";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

export const POST = async (request) => {
  try {
    await connectDB();
    const { propertyId } = request.json();
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.userId) {
      return new Response("User ID is required", { status: 401 });
    }
    const { userId } = sessionUser;
    const user = await User.findOne({ _id: userId });
    // Check property has in user bookmark?
    let isBookmarked = user.bookmarks.includes(propertyId);
    // If property has already bookmarked
    return new Response(JSON.stringify({ isBookmarked }), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response("Something is wrong", { status: 500 });
  }
};
