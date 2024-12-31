"use server";

import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function signupUser(formData: FormData) {
	const name = formData.get("name") as string;
	const phone = formData.get("phone") as string;
	const password = formData.get("password") as string;

	if (!name || !phone || !password) {
		return { error: "Name, phone, and password are required" };
	}

	try {
		const existingUser = await prisma.user.findUnique({ where: { phone } });
		if (existingUser) {
			return { error: "User with this phone number already exists" };
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: {
				name,
				phone,
				password: hashedPassword,
			} as any,
		});

		const token = await new SignJWT({
			userId: user.id,
			phone: user.phone,
			role: user.role,
		})
			.setProtectedHeader({ alg: "HS256" })
			.setJti(nanoid())
			.setIssuedAt()
			.setExpirationTime("2h")
			.sign(new TextEncoder().encode(process.env.JWT_SECRET));

		cookies().set("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
		});

		return { success: "User account created successfully" };
	} catch (error) {
		console.error("Signup error:", error);
		return { error: "An error occurred during signup" };
	}
}

export async function loginUser(formData: FormData) {
	const phone = formData.get("phone") as string;
	const password = formData.get("password") as string;

	if (!phone || !password) {
		return { error: "Phone and password are required" };
	}

	try {
		const user = await prisma.user.findUnique({ where: { phone } });
		if (!user) {
			return { error: "Invalid credentials" };
		}

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return { error: "Invalid credentials" };
		}

		const token = await new SignJWT({
			userId: user.id,
			phone: user.phone,
			role: user.role,
		})
			.setProtectedHeader({ alg: "HS256" })
			.setJti(nanoid())
			.setIssuedAt()
			.setExpirationTime("2h")
			.sign(new TextEncoder().encode(process.env.JWT_SECRET));

		cookies().set("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
		});

		return { success: "Logged in successfully" };
	} catch (error) {
		console.error("Login error:", error);
		return { error: "An error occurred during login" };
	}
}
