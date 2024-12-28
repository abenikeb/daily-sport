import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

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
		const { title, content, authorId, categoryId, subcategoryId, tags } =
			req.body;
		try {
			const newArticle = await prisma.article.create({
				data: {
					title: JSON.stringify(title),
					content: JSON.stringify(content),
					authorId,
					categoryId,
					subcategoryId,
					tags: {
						connectOrCreate: tags.map((tag: string) => ({
							where: { name: tag },
							create: { name: tag },
						})),
					},
					status: "PENDING",
				},
			});
			res.status(201).json(newArticle);
		} catch (error) {
			res.status(500).json({ message: "Error creating article" });
		}
	} else {
		res.setHeader("Allow", ["GET", "POST"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
