import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		try {
			const articles = await prisma.article.findMany({
				include: {
					author: { select: { name: true } },
					category: true,
					subcategory: true,
				},
				orderBy: { createdAt: "desc" },
			});
			res.status(200).json(articles);
		} catch (error) {
			res.status(500).json({ message: "Error fetching articles" });
		}
	} else if (req.method === "PUT") {
		const { id, status } = req.body;
		try {
			const updatedArticle = await prisma.article.update({
				where: { id },
				data: { status },
				include: {
					author: { select: { name: true } },
					category: true,
					subcategory: true,
				},
			});
			res.status(200).json(updatedArticle);
		} catch (error) {
			res.status(500).json({ message: "Error updating article status" });
		}
	} else {
		res.setHeader("Allow", ["GET", "PUT"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
