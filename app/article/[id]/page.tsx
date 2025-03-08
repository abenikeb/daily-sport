import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import ArticleDetailClient from "./ArticleDetailClient";
import { notFound } from "next/navigation";

async function getUser(token: string) {
	const secret = new TextEncoder().encode(process.env.JWT_SECRET);
	try {
		const { payload } = await jwtVerify(token, secret);
		const user = await prisma.user.findUnique({
			where: { id: payload.userId as string },
		});
		return user;
	} catch (error) {
		return null;
	}
}

async function getArticle(id: string) {
	try {
		const article = await prisma.article.findUnique({
			where: { id },
			include: {
				author: {
					select: {
						name: true,
						profilePicture: true,
					},
				},
				category: true,
			},
		});

		if (!article) return null;

		// Format the article data
		return {
			...article,
			author: {
				name: article.author?.name || "Unknown Author",
				avatar:
					article.author?.profilePicture ||
					"/placeholder.svg?height=40&width=40",
			},
			category: article.category?.name || "Uncategorized",
		};
	} catch (error) {
		console.error("Error fetching article:", error);
		return null;
	}
}

async function getRelatedArticles(
	articleId: string,
	categoryId: string | null
) {
	try {
		// Find articles in the same category, excluding the current article
		const relatedArticles = await prisma.article.findMany({
			where: {
				id: { not: articleId },
				...(categoryId ? { categoryId } : {}),
				status: "APPROVED",
			},
			include: {
				category: true,
			},
			orderBy: { createdAt: "desc" },
			take: 4,
		});

		return relatedArticles;
	} catch (error) {
		console.error("Error fetching related articles:", error);
		return [];
	}
}

export default async function ArticleDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const token = cookies().get("token")?.value;
	const user = token ? await getUser(token) : null;
	const article = await getArticle(params.id);

	if (!article) {
		return notFound();
	}

	const relatedArticles = await getRelatedArticles(
		params.id,
		article.categoryId
	);

	return (
		<ArticleDetailClient
			article={article}
			relatedArticles={relatedArticles}
			isAuthenticated={!!user}
			articleId={params.id}
			userId={user?.id || null}
		/>
	);
}
