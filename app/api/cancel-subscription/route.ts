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

		// Update the subscriber's subscription status
		const updatedSubscriber = await prisma.user.update({
			where: { phone },
			data: {
				subscriptionStatus: "UNSUBSCRIBE",
				// Keep the subscription dates for record purposes
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
			message: "Subscription cancelled successfully",
			subscriber: updatedSubscriber,
		});
	} catch (error) {
		console.error("Error cancelling subscription:", error);
		return NextResponse.json(
			{ error: "Failed to cancel subscription" },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
