import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const phone = searchParams.get("stop");

		console.log({
			phone
		})

		if (!phone) {
			return NextResponse.json(
				{ error: "Phone number is required" },
				{ status: 400 }
			);
		}

		console.log({
			phone
		})

		const user = await prisma.user.findUnique({
			where: { phone },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Subscriber not found" },
				{ status: 404 }
			);
		}

			console.log({
			user
		})

		// Update the subscriber's subscription status to UNSUBSCRIBE
		// Keep the subscription dates for record purposes
		const updatedSubscriber = await prisma.user.update({
			where: { phone },
			data: {
				subscriptionStatus: "UNSUBSCRIBE",
				// We don't modify subscriptionStart or subscribedAt to keep the history
				// We set subscriptionEnd to now to indicate when the subscription ended
				subscriptionEnd: new Date(),
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

		console.log({
			updatedSubscriber
		})

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
	}
}

// Add POST method to handle form submissions
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { phone, reason } = body;

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

		// Create a notification about the cancellation if reason is provided
		if (reason) {
			await prisma.notification.create({
				data: {
					userId: user.id,
					type: "ARTICLE_REJECTED", // Using this type as a placeholder for subscription cancellation
					content: `Subscription cancelled. Reason: ${reason}`,
					isRead: false,
				},
			});
		}

		// Update the subscriber's subscription status
		const updatedSubscriber = await prisma.user.update({
			where: { phone },
			data: {
				subscriptionStatus: "UNSUBSCRIBE",
				// We don't modify subscriptionStart or subscribedAt to keep the history
				// We set subscriptionEnd to now to indicate when the subscription ended
				subscriptionEnd: new Date(),
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
			message: "Subscription cancelled successfully",
			subscriber: updatedSubscriber,
		});
	} catch (error) {
		console.error("Error cancelling subscription:", error);
		return NextResponse.json(
			{ error: "Failed to cancel subscription" },
			{ status: 500 }
		);
	}
}
