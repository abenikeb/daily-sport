import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
	try {
		const articles = await prisma.article.findMany({
			where: { status: "APPROVED" },
			include: {
				author: { select: { name: true } },
				category: true,
				subcategory: true,
				tags: true,
			},
			orderBy: { createdAt: "desc" },
			take: 10, // Limit to 10 articles for performance
		});

		const localizedArticles = articles.map((article) => {
			let parsedTitle, parsedContent;

			try {
				parsedTitle = JSON.parse(article.title as string);
			} catch (error) {
				console.error(`Error parsing title for article ${article.id}:`, error);
				parsedTitle = { en: article.title as string };
			}

			try {
				parsedContent = JSON.parse(article.content as string);
			} catch (error) {
				console.error(
					`Error parsing content for article ${article.id}:`,
					error
				);
				parsedContent = { en: article.content as string };
			}

			return {
				...article,
				title: parsedTitle,
				content: parsedContent,
			};
		});

		return NextResponse.json(localizedArticles);
	} catch (error) {
		console.error("Error fetching articles:", error);
		return NextResponse.json(
			{ message: "Error fetching articles" },
			{ status: 500 }
		);
	}
}
