import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

		const user = await prisma.user.findUnique({
			where: { phone },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Subscriber not found" },
				{ status: 404 }
			);
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}

		const subscriberInfo = {
			id: user.id,
			phone: user.phone,
			name: user.name,
			role: user.role,
			subscriptionStatus: user.subscriptionStatus,
			subscriptionStart: user.subscriptionStart,
			subscriptionEnd: user.subscriptionEnd,
		};

		return NextResponse.json({ subscriber: subscriberInfo });
	} catch (error) {
		console.error("Error fetching subscriber:", error);
		return NextResponse.json(
			{ error: "Failed to fetch subscriber information" },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
