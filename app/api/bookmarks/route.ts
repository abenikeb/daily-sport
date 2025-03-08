import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Check if an article is bookmarked by a user
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
		const bookmark = await prisma.bookmark.findUnique({
			where: {
				userId_articleId: {
					userId,
					articleId,
				},
			},
		});

		return NextResponse.json({ isBookmarked: !!bookmark });
	} catch (error) {
		console.error("Error checking bookmark status:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

// Toggle bookmark status for an article
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

		// Check if the user has already bookmarked this article
		const existingBookmark = await prisma.bookmark.findUnique({
			where: {
				userId_articleId: {
					userId,
					articleId,
				},
			},
		});

		if (existingBookmark) {
			// If already bookmarked, remove it
			await prisma.bookmark.delete({
				where: {
					userId_articleId: {
						userId,
						articleId,
					},
				},
			});

			return NextResponse.json({
				isBookmarked: false,
				message: "Article removed from bookmarks",
			});
		} else {
			// If not bookmarked, add it
			await prisma.bookmark.create({
				data: {
					userId,
					articleId,
				},
			});

			return NextResponse.json({
				isBookmarked: true,
				message: "Article added to bookmarks",
			});
		}
	} catch (error) {
		console.error("Error toggling bookmark status:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
