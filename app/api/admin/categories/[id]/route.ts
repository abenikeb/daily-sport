import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		await prisma.category.delete({
			where: { id: params.id },
		});
		return NextResponse.json({ message: "Category deleted successfully" });
	} catch (error) {
		console.error("Error deleting category:", error);
		return NextResponse.json(
			{ error: "Failed to delete category" },
			{ status: 500 }
		);
	}
}
