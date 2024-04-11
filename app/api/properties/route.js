import cloudinary from "@/config/cloudinary";
import connectDB from "@/config/database";
import Property from "@/models/Property";
import { getSessionUser } from "@/utils/getSessionUser";

//GET /api/properties
export const GET = async (request) => {
  try {
    await connectDB();
    const properties = await Property.find({});
    return new Response(JSON.stringify(properties), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response("Something is wrong", { status: 500 });
  }
};

//POST
export const POST = async (request) => {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      throw new Response("UserID is required.", { status: 401 });
    }
    const { userId } = sessionUser;

    const formData = await request.formData();
    const amenities = formData.getAll("amenities");
    const images = formData
      .getAll("images")
      .filter((image) => image.name !== "");
    const validatedImages = [];
    for (const image of images) {
      if (image.size > 5 * 1024 * 1024) {
        // Image size exceeds 5MB
        throw new Error("Image size exceeds 5MB");
      }

      // Check if it's a real picture (you can implement more robust checks here)
      const isValidImage = isValidPicture(image);
      if (!isValidImage) {
        throw new Error("Invalid image format");
      }

      validatedImages.push(image);
    }
    const propertyData = {
      type: formData.get("type"),
      name: formData.get("name"),
      description: formData.get("description"),
      location: {
        street: formData.get("location.street"),
        city: formData.get("location.city"),
        state: formData.get("location.state"),
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
      // validatedImages,
    };

    const imageUploadPromises = [];
    for (const image of validatedImages) {
      const imageBuffer = await image.arrayBuffer();
      const imageArray = Array.from(new Uint8Array(imageBuffer));
      const imageData = Buffer.from(imageArray);
      const imageBase64 = imageData.toString("base64");

      const result = await cloudinary.uploader.upload(
        `data:image/png;base64,${imageBase64}`,
        {
          folder: "propertypulse",
        }
      );
      imageUploadPromises.push(result.secure_url);
      const uploadImages = await Promise.all(imageUploadPromises);
      propertyData.images = uploadImages;
    }
    const newProperty = new Property(propertyData);
    await newProperty.save();

    return Response.redirect(
      `${process.env.NEXT_PUBLIC_DOMAIN}/properties/${newProperty._id}`
    );
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
