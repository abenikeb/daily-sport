import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import ArticleDetailClient from "./ArticleDetailClient";

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
	// Fetch the article from your database or API
	// This is a placeholder implementation
	const article = await prisma.article.findUnique({ where: { id } });
	console.log({ article });
	return article;
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
		return <div>Article not found</div>;
	}

	return (
		<ArticleDetailClient
			article={article}
			isAuthenticated={!!user}
			articleId={params.id}
			userId={user?.id}
		/>
	);
}
