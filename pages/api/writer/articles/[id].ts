import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";

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

	if (req.method === "PUT") {
		const uploadDir = path.join(process.cwd(), "public", "uploads");
		await fs.mkdir(uploadDir, { recursive: true });

		const form = formidable({
			uploadDir,
			keepExtensions: true,
			maxFileSize: 5 * 1024 * 1024, // 5MB
		});

		form.parse(req, async (err, fields: any, files) => {
			if (err) {
				console.error("Error parsing form data:", err);
				return res.status(500).json({ error: "Error parsing form data" });
			}

			try {
				const title = JSON.parse(fields.title as string);
				const content = JSON.parse(fields.content as string);

				// Handle potential array fields and ensure single string values
				const authorId = Array.isArray(fields.authorId)
					? fields.authorId[0]
					: fields.authorId;
				const categoryId = Array.isArray(fields.categoryId)
					? fields.categoryId[0]
					: fields.categoryId;
				const subcategoryId = Array.isArray(fields.subcategoryId)
					? fields.subcategoryId[0]
					: fields.subcategoryId;
				const tags = fields.tags;

				// Parse and process tags
				// const tags = (fields.tags as string)
				// 	.split(",")
				// 	.map((tag) => tag.trim());

				let imagePath = null;
				if (files.featuredImage) {
					const file = Array.isArray(files.featuredImage)
						? files.featuredImage[0]
						: files.featuredImage;
					const newPath = path.join(uploadDir, file.newFilename);
					await fs.rename(file.filepath, newPath);
					imagePath = `/uploads/${file.newFilename}`;
				}

				const updatedArticle = await prisma.article.update({
					where: { id: fields.id as string }, // Ensure `fields.id` is passed correctly
					data: {
						title: JSON.stringify(title),
						content: JSON.stringify(content),
						authorId: authorId as string,
						categoryId: categoryId as string,
						subcategoryId: subcategoryId as string,
						tags: {
							set: [], // Clear existing tags
							connectOrCreate: tags.map((tag: string) => ({
								where: { name: tag },
								create: { name: tag },
							})),
						},
						status: "PENDING",
						featuredImage: imagePath || undefined, // Update image if provided
					},
				});

				res.status(200).json(updatedArticle);
			} catch (error) {
				console.error("Error updating article:", error);
				res.status(500).json({ message: "Error updating article" });
			}
		});

		// form.parse(req, async (err, fields, files) => {
		// 	if (err) {
		// 		console.error("Error parsing form data:", err);
		// 		return res.status(500).json({ error: "Error parsing form data" });
		// 	}

		// 	try {
		// 		const title = JSON.parse(fields.title as string);
		// 		const content = JSON.parse(fields.content as string);
		// 		const { authorId, categoryId, subcategoryId } = fields;
		// 		const tags = (fields.tags as string)
		// 			.split(",")
		// 			.map((tag) => tag.trim());

		// 		let imagePath = null;
		// 		if (files.featuredImage) {
		// 			const file = Array.isArray(files.featuredImage)
		// 				? files.featuredImage[0]
		// 				: files.featuredImage;
		// 			const newPath = path.join(uploadDir, file.newFilename);
		// 			await fs.rename(file.filepath, newPath);
		// 			imagePath = `/uploads/${file.newFilename}`;
		// 		}

		// 		const updatedArticle = await prisma.article.update({
		// 			where: { id: id as string },
		// 			data: {
		// 				title: JSON.stringify(title),
		// 				content: JSON.stringify(content),
		// 				categoryId: categoryId as string,
		// 				subcategoryId: subcategoryId as string,
		// 				tags: {
		// 					set: [],
		// 					connectOrCreate: tags.map((tag: string) => ({
		// 						where: { name: tag },
		// 						create: { name: tag },
		// 					})),
		// 				},
		// 				status: "PENDING",
		// 				featuredImage: imagePath || undefined,
		// 			},
		// 		});

		// 		res.status(200).json(updatedArticle);
		// 	} catch (error) {
		// 		console.error("Error updating article:", error);
		// 		res.status(500).json({ message: "Error updating article" });
		// 	}
		// });
	} else if (req.method === "DELETE") {
		try {
			await prisma.article.delete({
				where: { id: id as string },
			});
			res.status(200).json({ message: "Article deleted successfully" });
		} catch (error) {
			console.error("Error deleting article:", error);
			res.status(500).json({ message: "Error deleting article" });
		}
	} else {
		res.setHeader("Allow", ["PUT", "DELETE"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}

// import { NextApiRequest, NextApiResponse } from "next";
// import prisma from "../../../../lib/prisma";
// import { IncomingForm } from "formidable";
// import fs from "fs/promises";
// import path from "path";

// export const config = {
// 	api: {
// 		bodyParser: false,
// 	},
// };

// async function saveFile(file: any): Promise<string> {
// 	const data = await fs.readFile(file.filepath);
// 	const filename = Date.now() + "-" + file.originalFilename;
// 	const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
// 	await fs.writeFile(uploadPath, data);
// 	await fs.unlink(file.filepath);
// 	return `/uploads/${filename}`;
// }

// export default async function handler(
// 	req: NextApiRequest,
// 	res: NextApiResponse
// ) {
// 	const { id } = req.query;

// 	if (req.method === "PUT") {
// 		const form = new IncomingForm();
// 		form.parse(req, async (err, fields, files) => {
// 			if (err) {
// 				res.status(500).json({ message: "Error parsing form data" });
// 				return;
// 			}

// 			const { title, content, categoryId, subcategoryId, tags }: any = fields;
// 			let imagePath = null;

// 			if (files.image) {
// 				imagePath = await saveFile(files.image[0]);
// 			}

// 			try {
// 				const updatedArticle = await prisma.article.update({
// 					where: { id: id as string },
// 					data: {
// 						title: title[0],
// 						content: content[0],
// 						categoryId: categoryId[0],
// 						subcategoryId: subcategoryId[0],
// 						tags: {
// 							set: [],
// 							connectOrCreate: JSON.parse(tags[0]).map((tag: string) => ({
// 								where: { name: tag },
// 								create: { name: tag },
// 							})),
// 						},
// 						featuredImage: imagePath || undefined,
// 					},
// 				});
// 				res.status(200).json(updatedArticle);
// 			} catch (error) {
// 				res.status(500).json({ message: "Error updating article" });
// 			}
// 		});
// 	} else {
// 		res.setHeader("Allow", ["PUT"]);
// 		res.status(405).end(`Method ${req.method} Not Allowed`);
// 	}
// }
