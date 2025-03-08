import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { phone, duration = 30 } = body; // Default to 30 days if not specified

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

		// Calculate new subscription end date based on current status
		const currentDate = new Date();
		let newSubscriptionEnd;

		// If subscription is still active, extend from current end date
		if (
			user.subscriptionStatus === "ACTIVE" &&
			user.subscriptionEnd &&
			user.subscriptionEnd > currentDate
		) {
			newSubscriptionEnd = new Date(user.subscriptionEnd);
			newSubscriptionEnd.setDate(newSubscriptionEnd.getDate() + duration);
		} else {
			// Otherwise start fresh from today
			newSubscriptionEnd = new Date(currentDate);
			newSubscriptionEnd.setDate(currentDate.getDate() + duration);
		}

		// Update the subscriber's subscription status
		const updatedSubscriber = await prisma.user.update({
			where: { phone },
			data: {
				subscriptionStatus: "ACTIVE",
				// Only update subscriptionStart if it's a new subscription or expired
				...(user.subscriptionStatus !== "ACTIVE" && {
					subscriptionStart: currentDate,
				}),
				subscriptionEnd: newSubscriptionEnd,
				lastBilledAt: currentDate.toISOString(),
				activateAt: currentDate,
			},
			select: {
				id: true,
				name: true,
				phone: true,
				subscriptionStatus: true,
				subscriptionStart: true,
				subscriptionEnd: true,
				lastBilledAt: true,
				subscribedAt: true,
				activateAt: true,
				refNo: true,
				contractNo: true,
			},
		});

		return NextResponse.json({
			message: "Subscription renewed successfully",
			subscriber: updatedSubscriber,
		});
	} catch (error) {
		console.error("Error renewing subscription:", error);
		return NextResponse.json(
			{ error: "Failed to renew subscription" },
			{ status: 500 }
		);
	}
}
