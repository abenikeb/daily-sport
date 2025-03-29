"use server";

import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface LoginResult {
	success?: boolean;
	error?: string;
	redirectUrl?: any;
}

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

		// Set up subscription details
		const currentDate = new Date();
		const subscriptionEnd = new Date(currentDate);
		subscriptionEnd.setDate(currentDate.getDate() + 3); // 3 days free trial

		// const user = await prisma.user.create({
		// 	data: {
		// 		name,
		// 		phone,
		// 		password: hashedPassword,
		// 	} as any,
		// });

		// Create the user
		const user = await prisma.user.create({
			data: {
				phone,
				password: hashedPassword,
				name: name || `User-${phone.substring(phone.length - 4)}`,
				role: "USER",
				subscriptionStatus: "ACTIVE",
				subscriptionStart: currentDate,
				subscriptionEnd: subscriptionEnd,
			},
		});

		// return NextResponse.json({
		// 	message: "User registered successfully",
		// 	user: {
		// 		id: user.id,
		// 		phone: user.phone,
		// 		name: user.name,
		// 		role: user.role,
		// 		subscriptionStatus: user.subscriptionStatus,
		// 	},
		// });

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
			secure: false,
			maxAge: 60 * 60 * 24, // 1 day
		});

		return { success: "User account created successfully" };
	} catch (error) {
		console.error("Signup error:", error);
		return { error: "An error occurred during signup" };
	}
}

export async function loginUser(formData: FormData): Promise<LoginResult> {
	const mobile = formData.get("mobile") as string;
	const password = formData.get("password") as string;

	console.log({
		mobile,
		password,
	});

	if (!mobile || !password) {
		return { error: "Phone and password are required" };
	}

	try {
		// const user = await prisma.user.findUnique({ where: { phone: mobile } });
		// console.log({
		// 	user,
		// });
		 // Find user and include subscription information
		const user = await prisma.user.findUnique({
		where: { phone: mobile },
		select: {
			id: true,
			phone: true,
			password: true,
			role: true,
			subscriptionStatus: true,
			subscriptionEnd: true,
		},
		})

		console.log({
		  message:"LoginUser",
		  user,
		})


		if (!user) {
			// return { error: "Invalid credentials" };
			return {
				success: false,
				error: "Invalid credentials",
			};
		}

		const passwordMatch = await bcrypt.compare(password, user.password);
		console.log({
			passwordMatch,
		});
		if (!passwordMatch) {
			return {
				success: false,
				error: "Invalid credentials",
			};
		}

		 // Check subscription status
		if (user.subscriptionStatus !== "ACTIVE") {
			return {
				success: false,
				error: "Your subscription is not active. Please renew your subscription to continue.",
			}
		}

		// Check if subscription has expired
		// if (user.subscriptionEnd && new Date(user.subscriptionEnd) < new Date()) {
		// // Update user subscription status to INACTIVE
		// await prisma.user.update({
		// 	where: { id: user.id },
		// 	data: {
		// 	subscriptionStatus: "INACTIVE",
		// 	},
		// })

		// return {
		// 	success: false,
		// 	error: "Your subscription has expired. Please renew your subscription to continue.",
		// }
		// }

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
			secure: false,
			maxAge: 60 * 60 * 24, // 1 day
		});

		return {
			success: true,
			redirectUrl: "/",
		};

		// return { success: "Logged in successfully" };
	} catch (error) {
		console.error("Login error:", error);
		return {
			success: false,
			error: "An error occurred during login",
		};
		// return { error: "An error occurred during login" };
	}
}
