import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
	// Create categories
	const national = await prisma.category.create({
		data: { name: "National" },
	});
	const international = await prisma.category.create({
		data: { name: "International" },
	});

	// Create subcategories
	await prisma.subcategory.createMany({
		data: [
			{ name: "Football", categoryId: national.id },
			{ name: "Basketball", categoryId: national.id },
			{ name: "Tennis", categoryId: national.id },
			{ name: "Football", categoryId: international.id },
			{ name: "Basketball", categoryId: international.id },
			{ name: "Tennis", categoryId: international.id },
		],
	});

	// Create a sample user
	const user = await prisma.user.create({
		data: {
			email: "writer@example.com",
			password: "hashedpassword", // Remember to hash passwords in a real application
			name: "John Doe",
			role: "WRITER",
		},
	});

	// Create a sample article
	await prisma.article.create({
		data: {
			title: "Sample Article",
			content: JSON.stringify({
				en: "This is a sample article in English.",
				am: "ይህ በአማርኛ የተጻፈ የናሙና ጽሑፍ ነው።",
				om: "Kun barreeffama agarsiiftuu Afaan Oromootiin.",
			}),
			authorId: user.id,
			categoryId: national.id,
			subcategoryId: (
				await prisma.subcategory.findFirst({
					where: { name: "Football", categoryId: national.id },
				})
			)?.id,
			tags: {
				create: [{ name: "Sample" }, { name: "Test" }],
			},
			status: "APPROVED",
		},
	});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
