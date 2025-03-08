import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import { CloudCog } from "@node_modules/lucide-react/dist/lucide-react";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const phone = searchParams.get("phone");
		const password = searchParams.get("password");

		if (!phone || !password) {
			return NextResponse.json(
				{ error: "Phone number and password are required" },
				{ status: 400 }
			);
		}

		// Check if user exists
		let user = await prisma.user.findUnique({
			where: { phone },
		});

		// If user doesn't exist, create a new user (registration logic)
		if (!user) {
			// Hash the password before storing
			const hashedPassword = await bcrypt.hash(password, 10);

			// Create new user with subscription details
			const currentDate = new Date();
			const subscriptionEnd = new Date(currentDate);
			subscriptionEnd.setDate(currentDate.getDate() + 3); // 3 days free trial

			try {
				user = await prisma.user.create({
					data: {
						phone,
						password: hashedPassword,
						name: `User-${phone.substring(phone.length - 4)}`, // Default name using last 4 digits
						role: "USER",
						subscriptionStatus: "ACTIVE",
						subscriptionStart: currentDate,
						subscriptionEnd: subscriptionEnd,
					},
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

				// Return the newly created user info
				const newSubscriberInfo = {
					id: user.id,
					phone: user.phone,
					name: user.name,
					role: user.role,
					subscriptionStatus: user.subscriptionStatus,
					subscriptionStart: user.subscriptionStart,
					subscriptionEnd: user.subscriptionEnd,
					message: "New subscriber registered successfully",
				};

				console.log({
					newSubscriberInfo,
				});

				return NextResponse.json({
					subscriber: newSubscriberInfo,
					isNewUser: true,
				});
			} catch (error) {
				console.error("Error creating new user:", error);
				return NextResponse.json(
					{ error: "Failed to register new subscriber" },
					{ status: 500 }
				);
			}
		}

		// For existing users, validate password
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}

		// Return existing user info
		const subscriberInfo = {
			id: user.id,
			phone: user.phone,
			name: user.name,
			role: user.role,
			subscriptionStatus: user.subscriptionStatus,
			subscriptionStart: user.subscriptionStart,
			subscriptionEnd: user.subscriptionEnd,
		};

		return NextResponse.json({
			subscriber: subscriberInfo,
			isNewUser: false,
		});
	} catch (error) {
		console.error("Error processing subscriber request:", error);
		return NextResponse.json(
			{ error: "Failed to process subscriber information" },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}

// Add a POST method to handle form submissions if needed
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { phone, password } = body;

		if (!phone || !password) {
			return NextResponse.json(
				{ error: "Phone number and password are required" },
				{ status: 400 }
			);
		}

		// Same logic as GET but for POST requests
		let user = await prisma.user.findUnique({
			where: { phone },
		});

		if (!user) {
			const hashedPassword = await bcrypt.hash(password, 10);

			const currentDate = new Date();
			const subscriptionEnd = new Date(currentDate);
			subscriptionEnd.setDate(currentDate.getDate() + 3);

			user = await prisma.user.create({
				data: {
					phone,
					password: hashedPassword,
					name: `User-${phone.substring(phone.length - 4)}`,
					role: "USER",
					subscriptionStatus: "ACTIVE",
					subscriptionStart: currentDate,
					subscriptionEnd: subscriptionEnd,
				},
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

			return NextResponse.json({
				message: "Subscriber registered successfully",
				subscriber: {
					id: user.id,
					phone: user.phone,
					subscriptionStatus: user.subscriptionStatus,
				},
				isNewUser: true,
			});
		}

		// For existing users, just return success
		return NextResponse.json({
			message: "Subscriber already exists",
			subscriber: {
				id: user.id,
				phone: user.phone,
				subscriptionStatus: user.subscriptionStatus,
			},
			isNewUser: false,
		});
	} catch (error) {
		console.error("Error processing subscriber request:", error);
		return NextResponse.json(
			{ error: "Failed to process subscriber information" },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
