import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { IncomingForm } from "formidable";
import fs from "fs/promises";
import path from "path";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		const { authorId } = req.query;
		try {
			const articles = await prisma.article.findMany({
				where: { authorId: authorId as string },
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
		const form = new IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				console.error("Error parsing form data:", err);
				res.status(500).json({ message: "Error parsing form data" });
				return;
			}

			try {
				const { title, content, authorId, categoryId, subcategoryId, tags } =
					fields;
				let featuredImagePath = null;

				if (files.featuredImage) {
					const file = Array.isArray(files.featuredImage)
						? files.featuredImage[0]
						: files.featuredImage;
					const fileName = `${Date.now()}-${file.originalFilename}`;
					const newPath = path.join(
						process.cwd(),
						"public",
						"uploads",
						fileName
					);
					await fs.copyFile(file.filepath, newPath);
					featuredImagePath = `/uploads/${fileName}`;
				}

				const newArticle = await prisma.article.create({
					data: {
						title: JSON.parse(title as any),
						content: JSON.parse(content as any),
						authorId: authorId as any,
						categoryId: categoryId as any,
						subcategoryId: subcategoryId as any,
						tags: {
							connectOrCreate: JSON.parse(tags as any).map((tag: any) => ({
								where: { name: tag },
								create: { name: tag },
							})),
						},
						status: "PENDING",
						featuredImage: featuredImagePath,
					},
				});
				res.status(201).json(newArticle);
			} catch (error) {
				console.error("Error creating article:", error);
				res.status(500).json({ message: "Error creating article" });
			}
		});

		// else if (req.method === "POST") {
		// 	const { title, content, authorId, categoryId, subcategoryId, tags } =
		// 		req.body;
		// 	try {
		// 		const newArticle = await prisma.article.create({
		// 			data: {
		// 				title: JSON.stringify(title),
		// 				content: JSON.stringify(content),
		// 				authorId,
		// 				categoryId,
		// 				subcategoryId,
		// 				tags: {
		// 					connectOrCreate: tags.map((tag: string) => ({
		// 						where: { name: tag },
		// 						create: { name: tag },
		// 					})),
		// 				},
		// 				status: "PENDING",
		// 			},
		// 		});
		// 		res.status(201).json(newArticle);
		// 	} catch (error) {
		// 		res.status(500).json({ message: "Error creating article" });
		// 	}
	} else {
		res.setHeader("Allow", ["GET", "POST"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
