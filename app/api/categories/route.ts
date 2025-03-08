import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
	try {
		// Fetch all categories from the database
		const categories = await prisma.category.findMany({
			orderBy: {
				name: "asc",
			},
		});

		return NextResponse.json({ categories });
	} catch (error) {
		console.error("Error fetching categories:", error);
		return NextResponse.json(
			{ message: "Error fetching categories" },
			{ status: 500 }
		);
	}
}
