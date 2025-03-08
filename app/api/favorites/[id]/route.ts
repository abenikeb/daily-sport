import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	if (!params.id) {
		return NextResponse.json({ error: "Missing userId" }, { status: 400 });
	}

	try {
		const favoriteArticles = await prisma.favoriteArticle.findMany({
			where: { userId: params.id },
			include: {
				article: {
					include: {
						category: true,
					},
				},
			},
		});

		const formattedFavorites = favoriteArticles.map((favorite) => ({
			id: favorite.articleId,
			title: favorite.article.title,
			category: favorite.article.category?.name || "Uncategorized",
			featuredImage: favorite.article.featuredImage,
			createdAt: favorite.article.createdAt,
		}));

		return NextResponse.json(formattedFavorites);
	} catch (error) {
		console.error("Error fetching favorite articles:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
