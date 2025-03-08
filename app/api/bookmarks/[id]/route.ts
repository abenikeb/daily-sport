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
		const bookmarkedArticles = await prisma.bookmark.findMany({
			where: { userId: params.id },
			include: {
				article: {
					include: {
						category: true,
					},
				},
			},
		});

		const formattedBookmarks = bookmarkedArticles.map((bookmark) => ({
			id: bookmark.articleId,
			title: bookmark.article.title,
			category: bookmark.article.category?.name || "Uncategorized",
			featuredImage: bookmark.article.featuredImage,
			createdAt: bookmark.article.createdAt,
		}));

		return NextResponse.json(formattedBookmarks);
	} catch (error) {
		console.error("Error fetching bookmarked articles:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
