import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { id } = req.query;

	if (!id || typeof id !== "string") {
		return res.status(400).json({ message: "Invalid article ID" });
	}

	if (req.method !== "PUT") {
		res.setHeader("Allow", ["PUT"]);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

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
			include: {
				author: { select: { id: true, name: true, email: true } },
				category: true,
				subcategory: true,
				tags: true,
			},
		});

		return res.status(200).json(updatedArticle);
	} catch (error) {
		console.error("Error disabling article:", error);
		return res.status(500).json({ message: "Error disabling article" });
	}
}
