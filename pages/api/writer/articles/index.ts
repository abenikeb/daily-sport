import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import formidable from "formidable";
import { uploadImage } from "../../../../lib/cloudinary";
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
	if (req.method === "GET") {
		const { authorId } = req.query;
		try {
			const articles = await prisma.article.findMany({
				where: {
					authorId: authorId as string,
					status: { not: "DISABLED" }, // Add this line to exclude DISABLED articles
				},
				include: {
					category: true,
					subcategory: true,
					tags: true,
				},
				orderBy: { createdAt: "desc" },
			});
			res.status(200).json(articles);
		} catch (error) {
			res.status(500).json({ message: "Error fetching articles" });
		}
	} else if (req.method === "POST") {
		// Use formidable to parse the form data
		const form = formidable({
			keepExtensions: true,
			maxFileSize: 10 * 1024 * 1024, // 10MB limit
		});

		form.parse(req, async (err, fields: any, files) => {
			if (err) {
				console.error("Error parsing form data:", err);
				return res.status(500).json({ error: "Error parsing form data" });
			}

			try {
				const title = JSON.parse(fields.title as string);
				const content = JSON.parse(fields.content as string);
				const authorId = Array.isArray(fields.authorId)
					? fields.authorId[0]
					: fields.authorId;
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
					.map((tag: any) => tag.trim())
					.filter((tag: any) => tag.length > 0);

				// Handle image - either from direct Cloudinary URL or from file upload
				let imageUrl = null;

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

					// Set the image URL
					imageUrl = cloudinaryResult.secure_url;
				}

				// Create the article with the image URL
				const newArticle = await prisma.article.create({
					data: {
						title: JSON.stringify(title),
						content: JSON.stringify(content),
						authorId: authorId as string,
						categoryId: categoryId as string,
						subcategoryId: subcategoryId || null,
						tags: {
							connectOrCreate: tagNames.map((tag: any) => ({
								where: { name: tag },
								create: { name: tag },
							})),
						},
						status: "PENDING",
						featuredImage: imageUrl,
					},
					include: {
						category: true,
						subcategory: true,
						tags: true,
					},
				});

				res.status(201).json(newArticle);
			} catch (error) {
				console.error("Error creating article:", error);
				res.status(500).json({ message: "Error creating article" });
			}
		});
	} else {
		res.setHeader("Allow", ["GET", "POST"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}

// // import { NextApiRequest, NextApiResponse } from "next";
// // import prisma from "../../../../lib/prisma";
// // import { IncomingForm } from "formidable";
// // import fs from "fs/promises";
// // import path from "path";

// import { NextApiRequest, NextApiResponse } from "next";
// import prisma from "../../../../lib/prisma";
// import { IncomingForm } from "formidable";
// import formidable from "formidable";
// import fs from "fs/promises";
// import path from "path";

// export const config = {
// 	api: {
// 		bodyParser: false,
// 	},
// };

// export default async function handler(
// 	req: NextApiRequest,
// 	res: NextApiResponse
// ) {
// 	if (req.method === "GET") {
// 		const { authorId } = req.query;
// 		try {
// 			const articles = await prisma.article.findMany({
// 				where: { authorId: authorId as string },
// 				include: {
// 					category: true,
// 					subcategory: true,
// 					tags: true,
// 				},
// 				orderBy: { createdAt: "desc" },
// 			});
// 			res.status(200).json(articles);
// 		} catch (error) {
// 			res.status(500).json({ message: "Error fetching articles" });
// 		}
// 	} else if (req.method === "POST") {
// 		const uploadDir = path.join(process.cwd(), "public", "uploads");
// 		await fs.mkdir(uploadDir, { recursive: true });

// 		const form = formidable({
// 			uploadDir,
// 			keepExtensions: true,
// 			maxFileSize: 5 * 1024 * 1024, // 5MB
// 		});

// 		form.parse(req, async (err: any, fields: any, files: any) => {
// 			if (err) {
// 				console.error("Error parsing form data:", err);
// 				return res.status(500).json({ error: "Error parsing form data" });
// 			}

// 			try {
// 				const title = JSON.parse(fields.title as string);
// 				const content = JSON.parse(fields.content as string);
// 				const authorId = Array.isArray(fields.authorId)
// 					? fields.authorId[0]
// 					: fields.authorId;
// 				const categoryId = Array.isArray(fields.categoryId)
// 					? fields.categoryId[0]
// 					: fields.categoryId;
// 				const subcategoryId = Array.isArray(fields.subcategoryId)
// 					? fields.subcategoryId[0]
// 					: fields.subcategoryId;
// 				const tags = fields.tags;

// 				let imagePath = null;
// 				if (files.featuredImage) {
// 					const file = Array.isArray(files.featuredImage)
// 						? files.featuredImage[0]
// 						: files.featuredImage;
// 					const newPath = path.join(uploadDir, file.newFilename);
// 					await fs.rename(file.filepath, newPath);
// 					imagePath = `/uploads/${file.newFilename}`;
// 				}

// 				// const { authorId, categoryId, subcategoryId, tags } = fields;

// 				// const tags = (fields.tags as string)
// 				// 	.split(",")
// 				// 	.map((tag) => tag.trim());

// 				const newArticle = await prisma.article.create({
// 					data: {
// 						title: JSON.stringify(title),
// 						content: JSON.stringify(content),
// 						authorId: authorId as string,
// 						categoryId: categoryId as string,
// 						subcategoryId: subcategoryId as string,
// 						// tags: tags as string,
// 						tags: {
// 							connectOrCreate: tags.map((tag: string) => ({
// 								where: { name: tag },
// 								create: { name: tag },
// 							})),
// 						},
// 						status: "PENDING",
// 						featuredImage: imagePath,
// 					},
// 				});

// 				res.status(201).json(newArticle);
// 			} catch (error) {
// 				console.error("Error creating article:", error);
// 				res.status(500).json({ message: "Error creating article" });
// 			}
// 		});
// 	} else {
// 		res.setHeader("Allow", ["GET", "POST"]);
// 		res.status(405).end(`Method ${req.method} Not Allowed`);
// 	}
// }
// // else if (req.method === "POST") {
// // 	const { title, content, authorId, categoryId, subcategoryId, tags } =
// // 		req.body;
// // 	try {
// // 		const newArticle = await prisma.article.create({
// // 			data: {
// // 				title: JSON.stringify(title),
// // 				content: JSON.stringify(content),
// // 				authorId,
// // 				categoryId,
// // 				subcategoryId,
// // 				tags: {
// // 					connectOrCreate: tags.map((tag: string) => ({
// // 						where: { name: tag },
// // 						create: { name: tag },
// // 					})),
// // 				},
// // 				status: "PENDING",
// // 			},
// // 		});
// // 		res.status(201).json(newArticle);
// // 	} catch (error) {
// // 		res.status(500).json({ message: "Error creating article" });
// // 	}

// // }
