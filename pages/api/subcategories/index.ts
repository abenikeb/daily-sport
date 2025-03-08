import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		const { categoryId } = req.query;

		if (!categoryId) {
			return res.status(400).json({ message: "Category ID is required" });
		}

		try {
			const subcategories = await prisma.subcategory.findMany({
				where: { categoryId: categoryId as string },
			});
			res.status(200).json(subcategories);
		} catch (error) {
			res.status(500).json({ message: "Error fetching subcategories" });
		}
	} else {
		res.setHeader("Allow", ["GET"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
