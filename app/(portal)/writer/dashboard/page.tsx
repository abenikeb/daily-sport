import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import WriterDashboardClient from "./WriterDashboardClient";

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

export default async function WriterDashboard() {
	const token = cookies().get("token")?.value;

	if (!token) {
		redirect("/writer/auth");
	}

	const user = await getUser(token);

	if (!user || user.role !== "WRITER") {
		redirect("/writer/auth");
	}

	const categories = await prisma.category.findMany();
	const articles = await prisma.article.findMany({
		where: { authorId: user.id },
		include: {
			category: true,
			subcategory: true,
		},
		orderBy: { createdAt: "desc" },
	});

	return (
		<WriterDashboardClient
			user={user}
			initialCategories={categories}
			initialArticles={articles}
		/>
	);
}
