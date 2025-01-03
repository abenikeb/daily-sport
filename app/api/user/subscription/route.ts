import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "../../../../lib/prisma";

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

			// Delete the token cookie
			cookies().delete("token");

			return NextResponse.json({ success: true });
		} else {
			return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}
	} catch (error) {
		console.error("Error updating user data:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
