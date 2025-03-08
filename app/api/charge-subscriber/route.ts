import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const phone = searchParams.get("phone");

		if (!phone) {
			return NextResponse.json(
				{ error: "Phone number is required" },
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

		// Calculate new subscription end date (30 days from now)
		const subscriptionEnd = new Date();
		subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

		// Update the subscriber's subscription status
		const updatedSubscriber = await prisma.user.update({
			where: { phone },
			data: {
				subscriptionStatus: "ACTIVE",
				subscriptionStart: new Date(),
				subscriptionEnd,
				lastBilledAt: new Date().toISOString(),
			},
			select: {
				id: true,
				name: true,
				phone: true,
				subscriptionStatus: true,
				subscriptionStart: true,
				subscriptionEnd: true,
			},
		});

		return NextResponse.json({
			message: "Subscriber charged successfully",
			subscriber: updatedSubscriber,
		});
	} catch (error) {
		console.error("Error charging subscriber:", error);
		return NextResponse.json(
			{ error: "Failed to charge subscriber" },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
