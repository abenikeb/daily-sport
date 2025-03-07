import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const ARTICLES_PER_PAGE = 2;

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get("page") || "1", 2);
		const category = searchParams.get("category") || "all";

		const skip = (page - 1) * ARTICLES_PER_PAGE;

		const whereClause: Prisma.ArticleWhereInput = {
			status: "APPROVED" as any,
			...(category !== "all" ? { category: { name: category } } : {}),
		};

		const [articles, totalCount] = await Promise.all([
			prisma.article.findMany({
				where: whereClause,
				include: {
					author: { select: { name: true } },
					category: true,
					subcategory: true,
					tags: true,
				},
				orderBy: { createdAt: "desc" },
				take: ARTICLES_PER_PAGE,
				skip: skip,
			}),
			prisma.article.count({ where: whereClause }),
		]);

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
				viewCount: article.viewCount || 0,
			};
		});

		const hasMore = totalCount > skip + articles.length;

		return NextResponse.json({
			articles: localizedArticles,
			hasMore,
			totalCount,
		});
	} catch (error) {
		console.error("Error fetching articles:", error);
		return NextResponse.json(
			{ message: "Error fetching articles" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const { articleId } = await request.json();
		console.log({
			articleId,
		});

		const updatedArticle = await prisma.article.update({
			where: { id: articleId },
			data: {
				viewCount: {
					increment: 1,
				},
			},
		});

		return NextResponse.json({ viewCount: updatedArticle.viewCount });
	} catch (error) {
		console.error("Error updating view count:", error);
		return NextResponse.json(
			{ message: "Error updating view count" },
			{ status: 500 }
		);
	}
}

// export async function GET() {
// 	try {
// 		const articles = await prisma.article.findMany({
// 			where: { status: "APPROVED" },
// 			include: {
// 				author: { select: { name: true } },
// 				category: true,
// 				subcategory: true,
// 				tags: true,
// 			},
// 			orderBy: { createdAt: "desc" },
// 			take: 10, // Limit to 10 articles for performance
// 		});

// 		const localizedArticles = articles.map((article) => {
// 			let parsedTitle, parsedContent;

// 			try {
// 				parsedTitle = JSON.parse(article.title as string);
// 			} catch (error) {
// 				console.error(`Error parsing title for article ${article.id}:`, error);
// 				parsedTitle = { en: article.title as string };
// 			}

// 			try {
// 				parsedContent = JSON.parse(article.content as string);
// 			} catch (error) {
// 				console.error(
// 					`Error parsing content for article ${article.id}:`,
// 					error
// 				);
// 				parsedContent = { en: article.content as string };
// 			}

// 			return {
// 				...article,
// 				title: parsedTitle,
// 				content: parsedContent,
// 				viewCount: article.viewCount || 0,
// 			};
// 		});

// 		return NextResponse.json(localizedArticles);
// 	} catch (error) {
// 		console.error("Error fetching articles:", error);
// 		return NextResponse.json(
// 			{ message: "Error fetching articles" },
// 			{ status: 500 }
// 		);
// 	}
// }

// Add a new route to increment the view count
// export async function POST(request: Request) {
// 	try {
// 		const { articleId } = await request.json();
// 		console.log({
// 			articleId,
// 		});

// 		const updatedArticle = await prisma.article.update({
// 			where: { id: articleId },
// 			data: {
// 				viewCount: {
// 					increment: 1,
// 				},
// 			},
// 		});

// 		return NextResponse.json({ viewCount: updatedArticle.viewCount });
// 	} catch (error) {
// 		console.error("Error updating view count:", error);
// 		return NextResponse.json(
// 			{ message: "Error updating view count" },
// 			{ status: 500 }
// 		);
// 	}
// }

// import { NextResponse } from "next/server";
// import prisma from "../../../lib/prisma";

// export async function GET() {
// 	try {
// 		const articles = await prisma.article.findMany({
// 			where: { status: "APPROVED" },
// 			include: {
// 				author: { select: { name: true } },
// 				category: true,
// 				subcategory: true,
// 				tags: true,
// 				viewCount: true,
// 			},
// 			orderBy: { createdAt: "desc" },
// 			take: 10, // Limit to 10 articles for performance
// 		});

// 		const localizedArticles = articles.map((article) => {
// 			let parsedTitle, parsedContent;

// 			try {
// 				parsedTitle = JSON.parse(article.title as string);
// 			} catch (error) {
// 				console.error(`Error parsing title for article ${article.id}:`, error);
// 				parsedTitle = { en: article.title as string };
// 			}

// 			try {
// 				parsedContent = JSON.parse(article.content as string);
// 			} catch (error) {
// 				console.error(
// 					`Error parsing content for article ${article.id}:`,
// 					error
// 				);
// 				parsedContent = { en: article.content as string };
// 			}

// 			return {
// 				...article,
// 				title: parsedTitle,
// 				content: parsedContent,
// 			};
// 		});

// 		return NextResponse.json(localizedArticles);
// 	} catch (error) {
// 		console.error("Error fetching articles:", error);
// 		return NextResponse.json(
// 			{ message: "Error fetching articles" },
// 			{ status: 500 }
// 		);
// 	}
// }
