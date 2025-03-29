"use server";

import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function signupAdmin(formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!email || !password) {
		return { error: "Email and password are required" };
	}

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return { error: "User already exists" };
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: {
				name: "Admin",
				email,
				password: hashedPassword,
				role: "ADMIN",
			} as any,
		});

		const token = await new SignJWT({
			userId: user.id,
			email: user.email,
			role: user.role,
		})
			.setProtectedHeader({ alg: "HS256" })
			.setJti(nanoid())
			.setIssuedAt()
			.setExpirationTime("2h")
			.sign(new TextEncoder().encode(process.env.JWT_SECRET));

		cookies().set("token", token, {
			httpOnly: false,
			// secure: process.env.NODE_ENV === "production",
			secure: false,
		});

		return { success: "Admin account created successfully" };
	} catch (error) {
		console.error("Signup error:", error);
		return { error: "An error occurred during signup" };
	}
}

export async function loginAdmin(formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!email || !password) {
		return { error: "Email and password are required" };
	}

	try {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user || user.role !== "ADMIN") {
			return { error: "Invalid credentials" };
		}

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return { error: "Invalid credentials" };
		}

		const token = await new SignJWT({
			userId: user.id,
			email: user.email,
			role: user.role,
		})
			.setProtectedHeader({ alg: "HS256" })
			.setJti(nanoid())
			.setIssuedAt()
			.setExpirationTime("2h")
			.sign(new TextEncoder().encode(process.env.JWT_SECRET));

		cookies().set("token", token, {
			httpOnly: false,
			// 
			secure: false,
		});

		return { success: "Logged in successfully" };
	} catch (error) {
		console.error("Login error:", error);
		return { error: "An error occurred during login" };
	}
}
