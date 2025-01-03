import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

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
// export async function GET(request: Request) {
// 	const { searchParams } = new URL(request.url);
// 	const userId = searchParams.get("userId");
// 	const articleId = searchParams.get("articleId");

// 	if (!userId || !articleId) {
// 		return NextResponse.json(
// 			{ error: "Missing userId or articleId" },
// 			{ status: 400 }
// 		);
// 	}

// 	try {
// 		const favorite = await prisma.favoriteArticle.findUnique({
// 			where: {
// 				userId_articleId: {
// 					userId,
// 					articleId,
// 				},
// 			},
// 		});

// 		return NextResponse.json({ isFavorite: !!favorite });
// 	} catch (error) {
// 		console.error("Error checking favorite status:", error);
// 		return NextResponse.json(
// 			{ error: "Internal Server Error" },
// 			{ status: 500 }
// 		);
// 	}
// }

export async function POST(request: Request) {
	const { userId, articleId } = await request.json();

	if (!userId || !articleId) {
		return NextResponse.json(
			{ error: "Missing userId or articleId" },
			{ status: 400 }
		);
	}

	try {
		const existingFavorite = await prisma.favoriteArticle.findUnique({
			where: {
				userId_articleId: {
					userId,
					articleId,
				},
			},
		});

		if (existingFavorite) {
			await prisma.favoriteArticle.delete({
				where: {
					id: existingFavorite.id,
				},
			});
			return NextResponse.json({ message: "Favorite removed" });
		} else {
			await prisma.favoriteArticle.create({
				data: {
					userId,
					articleId,
				},
			});
			return NextResponse.json({ message: "Favorite added" });
		}
	} catch (error) {
		console.error("Error toggling favorite:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
