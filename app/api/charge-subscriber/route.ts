import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
		const currentDate = new Date();
		const subscriptionEnd = new Date(currentDate);
		subscriptionEnd.setDate(currentDate.getDate() + 30);

		// Update the subscriber's subscription status
		const updatedSubscriber = await prisma.user.update({
			where: { phone },
			data: {
				subscriptionStatus: "ACTIVE",
				subscriptionStart: currentDate,
				subscriptionEnd: subscriptionEnd,
				lastBilledAt: currentDate.toISOString(),
				activateAt: currentDate,
				// If this is a renewal, we don't want to overwrite the original subscribedAt date
				subscribedAt: user.subscribedAt || currentDate,
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
			message: "Subscriber charged successfully",
			subscriber: updatedSubscriber,
		});
	} catch (error) {
		console.error("Error charging subscriber:", error);
		return NextResponse.json(
			{ error: "Failed to charge subscriber" },
			{ status: 500 }
		);
	}
}

// Add POST method to handle form submissions
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { phone, refNo, contractNo } = body;

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
		const currentDate = new Date();
		const subscriptionEnd = new Date(currentDate);
		subscriptionEnd.setDate(currentDate.getDate() + 30);

		// Update the subscriber's subscription status with optional reference numbers
		const updatedSubscriber = await prisma.user.update({
			where: { phone },
			data: {
				subscriptionStatus: "ACTIVE",
				subscriptionStart: currentDate,
				subscriptionEnd: subscriptionEnd,
				lastBilledAt: currentDate.toISOString(),
				activateAt: currentDate,
				// Only update refNo and contractNo if provided
				...(refNo && { refNo }),
				...(contractNo && { contractNo }),
				// If this is a renewal, we don't want to overwrite the original subscribedAt date
				subscribedAt: user.subscribedAt || currentDate,
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
			message: "Subscriber charged successfully",
			subscriber: updatedSubscriber,
		});
	} catch (error) {
		console.error("Error charging subscriber:", error);
		return NextResponse.json(
			{ error: "Failed to charge subscriber" },
			{ status: 500 }
		);
	}
}
