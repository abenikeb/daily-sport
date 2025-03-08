import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Check if an article is favorited by a user
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");
	const articleId = searchParams.get("articleId");

	if (!userId || !articleId) {
		return NextResponse.json(
			{ error: "Missing userId or articleId" },
			{ status: 400 }
		);
	}

	try {
		const favorite = await prisma.favoriteArticle.findUnique({
			where: {
				userId_articleId: {
					userId,
					articleId,
				},
			},
		});

		return NextResponse.json({ isFavorite: !!favorite });
	} catch (error) {
		console.error("Error checking favorite status:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

// Toggle favorite status for an article
export async function POST(request: Request) {
	try {
		const { userId, articleId } = await request.json();

		if (!userId || !articleId) {
			return NextResponse.json(
				{ error: "Missing userId or articleId" },
				{ status: 400 }
			);
		}

		// Check if the article exists
		const article = await prisma.article.findUnique({
			where: { id: articleId },
		});

		if (!article) {
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		}

		// Check if the user has already favorited this article
		const existingFavorite = await prisma.favoriteArticle.findUnique({
			where: {
				userId_articleId: {
					userId,
					articleId,
				},
			},
		});

		if (existingFavorite) {
			// If already favorited, remove it
			await prisma.favoriteArticle.delete({
				where: {
					userId_articleId: {
						userId,
						articleId,
					},
				},
			});

			return NextResponse.json({
				isFavorite: false,
				message: "Article removed from favorites",
			});
		} else {
			// If not favorited, add it
			await prisma.favoriteArticle.create({
				data: {
					userId,
					articleId,
				},
			});

			return NextResponse.json({
				isFavorite: true,
				message: "Article added to favorites",
			});
		}
	} catch (error) {
		console.error("Error toggling favorite status:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
