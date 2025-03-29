import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param file The file buffer to upload
 * @param folder Optional folder path in Cloudinary
 * @returns The Cloudinary upload response
 */
export async function uploadImage(
	fileBuffer: Buffer,
	folder = "articles"
): Promise<any> {
	return new Promise((resolve, reject) => {
		const uploadOptions: any = {
			folder,
			resource_type: "auto",
			transformation: [
				{ width: 1200, crop: "limit" }, // Resize to max width of 1200px
				{ quality: "auto:good" }, // Automatic quality optimization
				{ fetch_format: "auto" }, // Automatic format selection based on browser
			],
		};

		cloudinary.uploader
			.upload_stream(uploadOptions, (error, result) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(result);
			})
			.end(fileBuffer);
	});
}

/**
 * Get optimized image URL with transformations
 * @param publicId Cloudinary public ID
 * @param width Desired width
 * @param height Desired height
 * @returns Optimized image URL
 */
export function getImageUrl(
	publicId: string,
	width = 800,
	height = 600
): string {
	return cloudinary.url(publicId, {
		width,
		height,
		crop: "fill",
		quality: "auto",
		fetch_format: "auto",
	});
}

/**
 * Delete an image from Cloudinary
 * @param publicId Cloudinary public ID
 * @returns Promise resolving to deletion result
 */
export async function deleteImage(publicId: string): Promise<any> {
	return cloudinary.uploader.destroy(publicId);
}
