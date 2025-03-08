import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		try {
			const subscribers = await prisma.user.findMany({
				where: {
					role: "USER",
				},
				select: {
					id: true,
					phone: true,
					name: true,
					subscriptionStatus: true,
					subscriptionStart: true,
					subscriptionEnd: true,
				},
				orderBy: {
					subscriptionStart: "desc",
				},
			});

			res.status(200).json(subscribers);
		} catch (error) {
			console.error("Error fetching subscribers:", error);
			res.status(500).json({ message: "Error fetching subscribers" });
		}
	} else {
		res.setHeader("Allow", ["GET"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
