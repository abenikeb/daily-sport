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

		if (!user) {
			return NextResponse.json(
				{ error: "Subscriber not found" },
				{ status: 404 }
			);
		}

		// Check if subscription has expired
		const now = new Date();
		const isExpired = user.subscriptionEnd && user.subscriptionEnd < now;

		// If subscription has expired but status is still ACTIVE, update to INACTIVE
		if (isExpired && user.subscriptionStatus === "ACTIVE") {
			const updatedUser = await prisma.user.update({
				where: { phone },
				data: {
					subscriptionStatus: "INACTIVE",
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
				message: "Subscription status: INACTIVE (expired)",
				subscriber: updatedUser,
				isExpired: true,
			});
		}

		return NextResponse.json({
			message: `Subscription status: ${user.subscriptionStatus}`,
			subscriber: user,
			isExpired: isExpired,
		});
	} catch (error) {
		console.error("Error checking subscription status:", error);
		return NextResponse.json(
			{ error: "Failed to check subscription status" },
			{ status: 500 }
		);
	}
}
