import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	// const { searchParams } = new URL(request.url);
	// const userId = searchParams.get("userId");

	if (!params.id) {
		return NextResponse.json({ error: "Missing userId" }, { status: 400 });
	}

	try {
		const favoriteArticles = await prisma.favoriteArticle.findMany({
			where: { userId: params.id },
			include: { article: true },
		});

		const formattedFavorites = favoriteArticles.map((favorite) => ({
			id: favorite.articleId,
			title: favorite.article.title,
			// category: favorite.article?.category,
		}));

		console.log({ formattedFavorites });

		return NextResponse.json(formattedFavorites);
	} catch (error) {
		console.error("Error fetching favorite articles:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
