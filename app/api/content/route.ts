import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
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

		let featuredImage = null;
		if (image) {
			const bytes = await image.arrayBuffer();
			const buffer = Buffer.from(bytes);
			const filename = `${Date.now()}-${image.name}`;
			const filepath = path.join(process.cwd(), "public", "uploads", filename);
			await writeFile(filepath, buffer);
			featuredImage = `/uploads/${filename}`;
		}

		const newArticle = await prisma.article.create({
			data: {
				title: JSON.stringify(title),
				content: content,
				authorId: session.user.id,
				categoryId,
				subcategoryId,
				tags: {
					connectOrCreate: tags.map((tag: string) => ({
						where: { name: tag },
						create: { name: tag },
					})),
				},
				status: "PENDING",
				featuredImage,
			},
		});

		return NextResponse.json(newArticle);
	} catch (error) {
		console.error("Error creating article:", error);
		return NextResponse.json(
			{ error: "Failed to create article" },
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session || session.user.role !== "WRITER") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const authorId = req.nextUrl.searchParams.get("authorId");
	if (!authorId) {
		return NextResponse.json(
			{ error: "Author ID is required" },
			{ status: 400 }
		);
	}

	try {
		const articles = await prisma.article.findMany({
			where: { authorId },
			include: {
				category: true,
				subcategory: true,
				tags: true,
			},
			orderBy: { createdAt: "desc" },
		});
		return NextResponse.json(articles);
	} catch (error) {
		console.error("Error fetching articles:", error);
		return NextResponse.json(
			{ error: "Failed to fetch articles" },
			{ status: 500 }
		);
	}
}
