import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer (req.file.buffer)
 * @param {String} folder - Cloudinary folder name (e.g., 'avatars', 'posters')
 * @param {String} publicId - Optional custom filename
 * @returns {Promise<Object>} - Cloudinary response with URL
 */
export const uploadToCloudinary = async (
  fileBuffer,
  folder,
  publicId = null,
) => {
  return new Promise((resolve, reject) => {
    // Create upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder, // Organize in folders
        public_id: publicId, // Custom filename (optional)
        resource_type: "image", // Type of file
        transformation: [
          // Auto-optimization
          { quality: "auto" }, // Auto-adjust quality
          { fetch_format: "auto" }, // Auto-select format (webp if supported)
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    // Convert buffer to stream and pipe to Cloudinary
    const readableStream = Readable.from(fileBuffer);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID (extracted from URL)
 * @returns {Promise<Object>} - Cloudinary response
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String} - Public ID
 */
export const extractPublicId = (url) => {
  // URL format: https://res.cloudinary.com/cloud-name/image/upload/v123456/folder/filename.jpg
  // Extract: folder/filename

  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");

  if (uploadIndex === -1) return null;

  // Get everything after 'upload/v123456/'
  const publicIdWithExtension = parts.slice(uploadIndex + 2).join("/");

  // Remove file extension
  const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

  return publicId;
};
