import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { id } = req.query;

	if (!id || typeof id !== "string") {
		return res.status(400).json({ message: "Invalid writer ID" });
	}

	if (req.method !== "PUT") {
		res.setHeader("Allow", ["PUT"]);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	try {
		// Check if writer exists
		const writer = await prisma.user.findUnique({
			where: { id, role: "WRITER" },
		});

		if (!writer) {
			return res.status(404).json({ message: "Writer not found" });
		}

		// Update the writer's active status to false
		const updatedWriter = await prisma.user.update({
			where: { id },
			data: { active: false },
		} as any);

		// Don't return the password
		const { password: _, ...writerWithoutPassword } = updatedWriter;

		return res.status(200).json(writerWithoutPassword);
	} catch (error) {
		console.error("Error deactivating writer:", error);
		return res.status(500).json({ message: "Error deactivating writer" });
	}
}
