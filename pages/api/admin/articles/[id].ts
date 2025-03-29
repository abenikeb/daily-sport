import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import formidable from "formidable";
import fs from "fs/promises";
import { uploadImage } from "../../../../lib/cloudinary";

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { id } = req.query;

	if (!id || typeof id !== "string") {
		return res.status(400).json({ message: "Invalid article ID" });
	}

	// Handle GET request - fetch a single article
	if (req.method === "GET") {
		try {
			const article = await prisma.article.findUnique({
				where: { id },
				include: {
					author: { select: { id: true, name: true, email: true } },
					category: true,
					subcategory: true,
					tags: true,
				},
			});

			if (!article) {
				return res.status(404).json({ message: "Article not found" });
			}

			return res.status(200).json(article);
		} catch (error) {
			console.error("Error fetching article:", error);
			return res.status(500).json({ message: "Error fetching article" });
		}
	}

	// Handle PUT request - update an article
	else if (req.method === "PUT") {
		const form = formidable({
			keepExtensions: true,
			maxFileSize: 10 * 1024 * 1024, // 10MB limit
		});

		return new Promise((resolve, reject) => {
			form.parse(req, async (err, fields, files) => {
				if (err) {
					console.error("Error parsing form data:", err);
					res.status(500).json({ error: "Error parsing form data" });
					return resolve(true);
				}

				try {
					// Check if article exists
					const existingArticle = await prisma.article.findUnique({
						where: { id },
						include: { tags: true },
					});

					if (!existingArticle) {
						res.status(404).json({ message: "Article not found" });
						return resolve(true);
					}

					const title = JSON.parse(fields.title as any);
					const content = JSON.parse(fields.content as any);
					const categoryId = Array.isArray(fields.categoryId)
						? fields.categoryId[0]
						: fields.categoryId;
					const subcategoryId = Array.isArray(fields.subcategoryId)
						? fields.subcategoryId[0]
						: fields.subcategoryId;
					const tagsString = Array.isArray(fields.tags)
						? fields.tags[0]
						: fields.tags || "";

					// Process tags
					const tagNames = tagsString
						.split(",")
						.map((tag) => tag.trim())
						.filter((tag) => tag.length > 0);

					// Process image - either from direct Cloudinary URL or from file upload
					let imageUrl = existingArticle.featuredImage;

					// If a Cloudinary URL is directly provided, use it
					if (fields.featuredImageUrl) {
						imageUrl = Array.isArray(fields.featuredImageUrl)
							? fields.featuredImageUrl[0]
							: fields.featuredImageUrl;
					}
					// Otherwise, handle file upload to Cloudinary if a file is provided
					else if (files.featuredImage) {
						const file = Array.isArray(files.featuredImage)
							? files.featuredImage[0]
							: files.featuredImage;

						// Read the file into a buffer
						const fileBuffer = await fs.readFile(file.filepath);

						// Upload to Cloudinary
						const cloudinaryResult = await uploadImage(fileBuffer);

						// Clean up the temp file
						await fs.unlink(file.filepath);

						// Update the image URL
						imageUrl = cloudinaryResult.secure_url;
					}

					// Disconnect all existing tags
					await prisma.article.update({
						where: { id },
						data: {
							tags: {
								disconnect: existingArticle.tags.map((tag) => ({ id: tag.id })),
							},
						},
					});

					// Update the article with new data
					const updatedArticle = await prisma.article.update({
						where: { id },
						data: {
							title: JSON.stringify(title),
							content: JSON.stringify(content),
							categoryId,
							subcategoryId: subcategoryId || null,
							featuredImage: imageUrl,
							tags: {
								connectOrCreate: tagNames.map((tag) => ({
									where: { name: tag },
									create: { name: tag },
								})),
							},
						},
						include: {
							author: { select: { id: true, name: true, email: true } },
							category: true,
							subcategory: true,
							tags: true,
						},
					});

					res.status(200).json(updatedArticle);
					return resolve(true);
				} catch (error) {
					console.error("Error updating article:", error);
					res.status(500).json({ message: "Error updating article" });
					return resolve(true);
				}
			});
		});
	}

	// Handle DELETE request - now we'll soft delete by changing status to DISABLED
	else if (req.method === "DELETE") {
		try {
			// Check if article exists
			const article = await prisma.article.findUnique({
				where: { id },
			});

			if (!article) {
				return res.status(404).json({ message: "Article not found" });
			}

			// Update the article status to DISABLED (soft delete)
			const updatedArticle = await prisma.article.update({
				where: { id },
				data: { status: "DISABLED" },
			});

			return res.status(200).json({ message: "Article disabled successfully" });
		} catch (error) {
			console.error("Error disabling article:", error);
			return res.status(500).json({ message: "Error disabling article" });
		}
	}

	// Handle unsupported methods
	else {
		res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
