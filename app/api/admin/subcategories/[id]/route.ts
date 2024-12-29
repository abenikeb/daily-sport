import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		await prisma.subcategory.delete({
			where: { id: params.id },
		});
		return NextResponse.json({ message: "Subcategory deleted successfully" });
	} catch (error) {
		console.error("Error deleting subcategory:", error);
		return NextResponse.json(
			{ error: "Failed to delete subcategory" },
			{ status: 500 }
		);
	}
}
