import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

async function getUser(token: string) {
	const secret = new TextEncoder().encode(process.env.JWT_SECRET);
	try {
		const { payload } = await jwtVerify(token, secret);
		return payload;
	} catch (error) {
		return null;
	}
}

export default async function WriterPage() {
	const token = cookies().get("token")?.value;

	if (!token) {
		redirect("/writer/auth");
	}

	const user = await getUser(token);

	if (!user || user.role !== "WRITER") {
		redirect("/writer/auth");
	}

	redirect("/writer/dashboard");
}
