import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	const articles = await prisma.article.findMany();

	for (const article of articles) {
		let updatedTitle = article.title;
		let updatedContent = article.content;

		if (typeof article.title === "string") {
			try {
				JSON.parse(article.title);
			} catch {
				updatedTitle = JSON.stringify({ en: article.title });
			}
		}

		if (typeof article.content === "string") {
			try {
				JSON.parse(article.content);
			} catch {
				updatedContent = JSON.stringify({ en: article.content });
			}
		}

		await prisma.article.update({
			where: { id: article.id },
			data: {
				title: updatedTitle,
				content: updatedContent,
			},
		});
	}

	console.log("Migration completed successfully");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
