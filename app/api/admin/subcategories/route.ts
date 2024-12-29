import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
	try {
		const { name, categoryId } = await request.json();
		const subcategory = await prisma.subcategory.create({
			data: { name, categoryId },
		});
		return NextResponse.json(subcategory);
	} catch (error) {
		console.error("Error creating subcategory:", error);
		return NextResponse.json(
			{ error: "Failed to create subcategory" },
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
		const subcategories = await prisma.subcategory.findMany();
		return NextResponse.json(subcategories);
	} catch (error) {
		console.error("Error fetching subcategories:", error);
		return NextResponse.json(
			{ error: "Failed to fetch subcategories" },
			{ status: 500 }
		);
	}
}
