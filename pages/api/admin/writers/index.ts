import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { hash } from "bcryptjs";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// GET - Fetch all writers
	if (req.method === "GET") {
		try {
			const writers = await prisma.user.findMany({
				where: { role: "WRITER" },
				include: {
					_count: {
						select: { articles: true },
					},
				},
				orderBy: { createdAt: "desc" },
			});

			// Transform the response to include article count
			const formattedWriters = writers.map((writer) => ({
				...writer,
				articles: writer._count.articles,
				_count: undefined,
			}));

			return res.status(200).json(formattedWriters);
		} catch (error) {
			console.error("Error fetching writers:", error);
			return res.status(500).json({ message: "Error fetching writers" });
		}
	}

	// POST - Create a new writer
	else if (req.method === "POST") {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		try {
			// Check if email already exists
			const existingUser = await prisma.user.findUnique({
				where: { email },
			});

			if (existingUser) {
				return res.status(400).json({ message: "Email already in use" });
			}

			// Hash the password
			const hashedPassword = await hash(password, 10);

			// Create the writer
			const newWriter = await prisma.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
					role: "WRITER",
					// active: true,
				},
			});

			// Don't return the password
			const { password: _, ...writerWithoutPassword } = newWriter;

			return res.status(201).json(writerWithoutPassword);
		} catch (error) {
			console.error("Error creating writer:", error);
			return res.status(500).json({ message: "Error creating writer" });
		}
	}

	// Handle unsupported methods
	else {
		res.setHeader("Allow", ["GET", "POST"]);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
