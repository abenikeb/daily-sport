import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
	try {
		// Get the articleId from the URL query parameters
		const { searchParams } = new URL(request.url);
		const articleId = searchParams.get("articleId");

		if (!articleId) {
			return NextResponse.json(
				{ message: "Article ID is required" },
				{ status: 400 }
			);
		}

		// Get the article to check its view count
		const article = await prisma.article.findUnique({
			where: { id: articleId },
		});

		if (!article) {
			return NextResponse.json(
				{ message: "Article not found" },
				{ status: 404 }
			);
		}

		// Get the count of unique views
		const uniqueViewCount = await prisma.articleView.count({
			where: { articleId },
		});

		return NextResponse.json({
			viewCount: article.viewCount || 0,
			uniqueViewCount,
		});
	} catch (error) {
		console.error("Error fetching view count:", error);
		return NextResponse.json(
			{ message: "Error fetching view count" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { articleId, userId } = await request.json();

		if (!articleId) {
			return NextResponse.json(
				{ message: "Article ID is required" },
				{ status: 400 }
			);
		}

		// First, check if we need to increment the view count
		let shouldIncrementViewCount = true;
		let uniqueViewCount = 0;

		if (userId) {
			// Check if this user has already viewed this article
			const existingView = await prisma.articleView.findUnique({
				where: {
					userId_articleId: {
						userId,
						articleId,
					},
				},
			});

			// If user has already viewed, don't increment the general view count
			if (existingView) {
				shouldIncrementViewCount = false;
			} else {
				// Create a new view record for this user
				await prisma.articleView.create({
					data: {
						userId,
						articleId,
					},
				});
			}
		}

		// Only increment view count if needed
		let updatedArticle;
		if (shouldIncrementViewCount) {
			updatedArticle = await prisma.article.update({
				where: { id: articleId },
				data: {
					viewCount: {
						increment: 1,
					},
				},
			});
		} else {
			// Just fetch the current article without incrementing
			updatedArticle = await prisma.article.findUnique({
				where: { id: articleId },
			});
		}

		// Get the count of unique views
		uniqueViewCount = await prisma.articleView.count({
			where: { articleId },
		});

		return NextResponse.json({
			viewCount: updatedArticle?.viewCount || 0,
			uniqueViewCount,
		});
	} catch (error) {
		console.error("Error updating view count:", error);
		return NextResponse.json(
			{ message: "Error updating view count" },
			{ status: 500 }
		);
	}
}
