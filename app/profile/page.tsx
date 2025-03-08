import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import ProfileClient from "./ProfileClient";
import AuthPage from "../auth/page";

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

export default async function ProfilePage() {
	const token = cookies().get("token")?.value;

	if (!token) {
		return <AuthPage />;
	}

	const user = await getUser(token);

	if (!user) {
		return <AuthPage />;
	}

	return <ProfileClient user={user} />;
}
