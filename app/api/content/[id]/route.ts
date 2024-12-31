import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const session = await getServerSession(authOptions);
	if (!session || session.user.role !== "WRITER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await req.formData();
		const title = JSON.parse(formData.get("title") as string);
		const content = JSON.parse(formData.get("content") as string);
		const categoryId = formData.get("categoryId") as string;
		const subcategoryId = formData.get("subcategoryId") as string | null;
		const tags = JSON.parse(formData.get("tags") as string);
		const image = formData.get("image") as File | null;

		const existingArticle = await prisma.article.findUnique({
			where: { id: params.id },
			include: { tags: true },
		});

		if (!existingArticle) {
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		}

		if (existingArticle.authorId !== session.user.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		let featuredImage = existingArticle.featuredImage;
		if (image) {
			// Delete old image if it exists
			if (existingArticle.featuredImage) {
				const oldImagePath = path.join(
					process.cwd(),
					"public",
					existingArticle.featuredImage
				);
				await unlink(oldImagePath);
			}

			// Save new image
			const bytes = await image.arrayBuffer();
			const buffer = Buffer.from(bytes);
			const filename = `${Date.now()}-${image.name}`;
			const filepath = path.join(process.cwd(), "public", "uploads", filename);
			await writeFile(filepath, buffer);
			featuredImage = `/uploads/${filename}`;
		}

		const updatedArticle = await prisma.article.update({
			where: { id: params.id },
			data: {
				title: JSON.stringify(title),
				content: content,
				categoryId,
				subcategoryId,
				featuredImage,
				tags: {
					set: [],
					connectOrCreate: tags.map((tag: string) => ({
						where: { name: tag },
						create: { name: tag },
					})),
				},
			},
			include: {
				category: true,
				subcategory: true,
				tags: true,
			},
		});

		return NextResponse.json(updatedArticle);
	} catch (error) {
		console.error("Error updating article:", error);
		return NextResponse.json(
			{ error: "Failed to update article" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const session = await getServerSession(authOptions);
	if (!session || session.user.role !== "WRITER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const article = await prisma.article.findUnique({
			where: { id: params.id },
		});

		if (!article) {
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		}

		if (article.authorId !== session.user.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Delete image if it exists
		if (article.featuredImage) {
			const imagePath = path.join(
				process.cwd(),
				"public",
				article.featuredImage
			);
			await unlink(imagePath);
		}

		await prisma.article.delete({
			where: { id: params.id },
		});

		return NextResponse.json({ message: "Article deleted successfully" });
	} catch (error) {
		console.error("Error deleting article:", error);
		return NextResponse.json(
			{ error: "Failed to delete article" },
			{ status: 500 }
		);
	}
}
