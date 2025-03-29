import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { uploadImage } from "../../../lib/cloudinary";
import fs from "fs/promises";

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		// Fix: Create a new instance of formidable.IncomingForm
		const form = formidable({
			keepExtensions: true,
			maxFileSize: 10 * 1024 * 1024, // 10MB limit
		});

		return new Promise((resolve, reject) => {
			form.parse(req, async (err, fields, files) => {
				if (err) {
					console.error("Error parsing form data:", err);
					res.status(500).json({ message: "Error parsing form data" });
					return resolve(true);
				}

				try {
					// Get the uploaded file
					const file = Array.isArray(files.file) ? files.file[0] : files.file;

					if (!file) {
						res.status(400).json({ message: "No file uploaded" });
						return resolve(true);
					}

					// Read the file into a buffer
					const fileBuffer = await fs.readFile(file.filepath);

					// Upload to Cloudinary
					const result = await uploadImage(fileBuffer);

					// Clean up the temp file
					await fs.unlink(file.filepath);

					// Return the Cloudinary URL
					res.status(200).json({
						url: result.secure_url,
						publicId: result.public_id,
					});

					return resolve(true);
				} catch (error) {
					console.error("Error uploading to Cloudinary:", error);
					res.status(500).json({ message: "Error uploading image" });
					return resolve(true);
				}
			});
		});
	} catch (error) {
		console.error("Server error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
}
