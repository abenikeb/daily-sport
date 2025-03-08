import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

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

export default async function AdminDashboard() {
	const token = cookies().get("token")?.value;

	console.log({ token });

	if (!token) {
		redirect("/admin/auth");
	}

	const user = await getUser(token);

	if (!user || user.role !== "ADMIN") {
		redirect("/admin/auth");
	}

	const categories = await prisma.category.findMany({
		include: {
			subcategories: true,
		},
	});

	return <AdminDashboardClient user={user} initialCategories={categories} />;
}
