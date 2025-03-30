import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { sendArticleApprovedNotification } from "@lib/notifications";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		try {
			const articles = await prisma.article.findMany({
				include: {
					author: { select: { id: true, name: true, email: true } },
					category: true,
					subcategory: true,
					tags: true,
				},
				orderBy: { createdAt: "desc" },
			});
			res.status(200).json(articles);
		} catch (error) {
			console.error("Error fetching articles:", error);
			res.status(500).json({ message: "Error fetching articles" });
		}
	} else if (req.method === "PUT") {
		const { id, status } = req.body;
		try {
			const updatedArticle = await prisma.article.update({
				where: { id },
				data: { status },
				include: {
					author: { select: { id: true, name: true, email: true } },
					category: true,
					subcategory: true,
					tags: true,
				},
			});

			// If the article is approved, send a notification
			if (status === "APPROVED") {
				try {
					// Parse the content if it's a string
					const parsedContent =
						typeof updatedArticle.content === "string"
							? JSON.parse(updatedArticle.content)
							: updatedArticle.content;

					// Get the Amharic content, fallback to English if Amharic is not available
					const amharicContent = parsedContent.am || parsedContent.en;

					// Get the image URL
					const imageUrl = updatedArticle.featuredImage || "";

					// Send the notification using the utility function
					await sendArticleApprovedNotification(amharicContent, imageUrl);

					res.status(200).json(updatedArticle);

					console.log("Notification sent for approved article");
				} catch (notificationError) {
					console.error("Error sending notification:", notificationError);
					// We don't throw this error as we don't want it to affect the article update
				}
			}

			res.status(200).json(updatedArticle);
		} catch (error) {
			console.error("Error updating article status:", error);
			res.status(500).json({ message: "Error updating article status" });
		}
	} else {
		res.setHeader("Allow", ["GET", "PUT"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
