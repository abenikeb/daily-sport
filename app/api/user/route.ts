import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");

	if (!userId) {
		return NextResponse.json({ error: "Missing userId" }, { status: 400 });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
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
				// viewCount: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error("Error fetching user data:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	const { userId, action } = await request.json();

	if (!userId || !action) {
		return NextResponse.json(
			{ error: "Missing userId or action" },
			{ status: 400 }
		);
	}

	try {
		let updatedUser;

		if (action === "unsubscribe") {
			updatedUser = await prisma.user.update({
				where: { id: userId },
				data: { subscriptionStatus: "UNSUBSCRIBE" },
			});
		} else {
			return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error("Error updating user data:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
