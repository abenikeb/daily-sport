import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	// Hash password
	const hashedPassword = await bcrypt.hash("password123", 10);

	// Create Users
	await prisma.user.create({
		data: {
			email: "writer@writer.com",
			password: hashedPassword,
			name: "John Doe",
			role: "WRITER",
		},
	});

	await prisma.user.create({
		data: {
			email: "admin@admin.com",
			password: hashedPassword,
			name: "Admin User",
			role: "ADMIN",
		},
	});

	// await prisma.user.create({
	// 	data: {
	// 		email: "abneikeb79@gmail.com",
	// 		phone: "251913228892",
	// 		password: hashedPassword,
	// 		name: "Abenezer Kebede",
	// 		role: "USER",
	// 	},
	// });

	// Create Categories
	const national = await prisma.category.create({
		data: {
			name: "National",
		},
	});

	const international = await prisma.category.create({
		data: {
			name: "International",
		},
	});

	// Create Subcategories
	const subcategories = [
		{ name: "Football", categoryId: national.id },
		{ name: "Basketball", categoryId: international.id },
		{ name: "Tennis", categoryId: international.id },
	];

	for (const sub of subcategories) {
		await prisma.subcategory.create({
			data: {
				name: sub.name,
				categoryId: sub.categoryId,
			},
		});
	}

	// Create Tags
	const tags = [
		"Olympics",
		"Gold Medal",
		"Long Distance Running",
		"CAF",
		"Ethiopian Football",
		"Championship",
		"NBA",
		"Youth Development",
		"Basketball Camp",
	];

	for (const tag of tags) {
		await prisma.tag.upsert({
			where: { name: tag },
			update: {},
			create: { name: tag },
		});
	}

	// Articles
	// const articles = [
	// 	{
	// 		title: {
	// 			en: "Ethiopia Wins Gold in 10,000m Race",
	// 			am: "ኢትዮጵያ በ10,000 ሜትር ሩጫ ወርቅ አገኘች",
	// 			om: "Itoophiyaan Moo'icha Warqee Fiigichaa Meetira 10,000 Argatte",
	// 		},
	// 		content: {
	// 			en: "Ethiopian athlete Selemon Barega has won the gold medal in the men's 10,000m race at the Tokyo Olympics, continuing the country's strong tradition in long-distance running.",
	// 			am: "የኢትዮጵያ አትሌት ሰለሞን ባረጋ በ도ክዮ ኦሎምፒክ በወንዶች 10,000 ሜትር ሩጫ የወርቅ ሜዳሊያ አገኘ፣ ይህም የሀገሪቱን የረጅም 거리ሩጫ ባህል ቀጥሏል።",
	// 			om: "Fiigduun Itoophiyaa Selemoon Baregaa Olimpikii Tookyoo keessatti fiigichaa dhiirota meetira 10,000 irratti warqee mo'achuun aadaa biyattiin gochaalee fagoo keessatti qaabdu itti fufee jira.",
	// 		},
	// 		categoryId: national.id,
	// 		subcategoryName: "Athletics",
	// 		tags: ["Olympics", "Gold Medal", "Long Distance Running"],
	// 		status: "APPROVED",
	// 	},
	// 	{
	// 		title: {
	// 			en: "Local Football Team Advances to Continental Championship",
	// 			am: "የሀገር ውስጥ የእግር ኳስ ቡድን ወደ አህጉራዊ ሻምፒዮና ዘለቀ",
	// 			om: "Gareen Kubbaa Miilaa Naannoo Injifannoo Kontinentaalii Gara Fuulduraatti Tarkaanfate",
	// 		},
	// 		content: {
	// 			en: "The Ethiopian Coffee Sport Club has secured a spot in the CAF Champions League after a thrilling victory in the national league finals.",
	// 			am: "የኢትዮጵያ ቡና ስፖርት ክለብ በሀገር አቀፍ ሊግ ፍጻሜ ላይ አስደናቂ ድል በማስመዝገብ በCAF 챔ፒዮንስ ሊግ ውስጥ ቦታ አገኘ።",
	// 			om: "Waldaan Ispoortii Buna Itoophiyaa erga injifannoo nama hawwatu mormii diigdama biyyaalessaa keessatti galmeessisuun booda bakka Liigii Injifattoota CAF keessatti mirkaneeeffateera.",
	// 		},
	// 		categoryId: national.id,
	// 		subcategoryName: "Football",
	// 		tags: ["CAF", "Ethiopian Football", "Championship"],
	// 		status: "PENDING",
	// 	},
	// 	{
	// 		title: {
	// 			en: "NBA Star Visits Ethiopia for Youth Basketball Camp",
	// 			am: "የNBA ኮከብ ለወጣቶች የቅርጫት ኳስ ካምፕ ወደ ኢትዮጵያ መጣ",
	// 			om: "Urjiin NBA Leenjii Kubbaa Harkaa Dargaggootaaf Itoophiyaa Dhufan",
	// 		},
	// 		content: {
	// 			en: "Former NBA All-Star player has arrived in Addis Ababa to conduct a week-long basketball camp for aspiring young players, aiming to promote the sport in Ethiopia.",
	// 			am: "ቀድሞ የNBA ኦል-ስታር ተጫዋች በኢትዮጵያ ቅርጫት ኳስን ለማስፋፋት አላማ ያነጣጠረ ለተስፈኞች ወጣት ተጫዋቾች የአንድ ሳምንት የቅርጫት ኳስ ካምፕ ለማካሄድ አዲስ አበባ ገብቷል።",
	// 			om: "Taphattoonni NBA All-Star duraa taphattootaaf dargaggoota abdii qabaniif torban guutuu leenjii kubbaa harkaa gaggeessuuf, akkasumas Itoophiyaa keessatti ispoortii kana babal'isuuf yaadaan Finfinnee ga'aniiru.",
	// 		},
	// 		categoryId: international.id,
	// 		subcategoryName: "Basketball",
	// 		tags: ["NBA", "Youth Development", "Basketball Camp"],
	// 		status: "APPROVED",
	// 	},
	// ];

	// for (const article of articles) {
	// 	const subcategory = await prisma.subcategory.findFirst({
	// 		where: {
	// 			name: article.subcategoryName,
	// 			categoryId: article.categoryId,
	// 		},
	// 	});

	// 	if (!subcategory) {
	// 		console.error(`Subcategory ${article.subcategoryName} not found`);
	// 		continue;
	// 	}

	// 	await prisma.article.create({
	// 		data: {
	// 			title: article.title,
	// 			content: article.content,
	// 			authorId: writer.id,
	// 			categoryId: article.categoryId,
	// 			subcategoryId: subcategory.id,
	// 			status: article.status,
	// 			tags: {
	// 				connectOrCreate: article.tags.map((tag) => ({
	// 					where: { name: tag },
	// 					create: { name: tag },
	// 				})),
	// 			},
	// 		},
	// 	});
	// }

	console.log("Seeding completed successfully!");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
// 	// Create categories with localized names
// 	const national = await prisma.category.create({
// 		data: {
// 			name: JSON.stringify({
// 				en: "National",
// 				am: "ሀገራዊ",
// 				om: "Biyya Keessaa",
// 			}),
// 		},
// 	});
// 	const international = await prisma.category.create({
// 		data: {
// 			name: JSON.stringify({
// 				en: "International",
// 				am: "ዓለም አቀፍ",
// 				om: "Addunyaa",
// 			}),
// 		},
// 	});

// 	// Create subcategories with localized names
// 	const subcategories = [
// 		{ nameEn: "Football", nameAm: "እግር ኳስ", nameOm: "Kubbaa Miilaa" },
// 		{ nameEn: "Basketball", nameAm: "ቅርጫት ኳስ", nameOm: "Kubbaa Harkaa" },
// 		{ nameEn: "Tennis", nameAm: "ቴኒስ", nameOm: "Tenisii" },
// 	];

// 	for (const category of [national, international]) {
// 		for (const sub of subcategories) {
// 			await prisma.subcategory.create({
// 				data: {
// 					name: JSON.stringify({
// 						en: sub.nameEn,
// 						am: sub.nameAm,
// 						om: sub.nameOm,
// 					}),
// 					categoryId: category.id,
// 				},
// 			});
// 		}
// 	}

// 	// Create sample users
// 	const writer = await prisma.user.create({
// 		data: {
// 			email: "writer@example.com",
// 			password: "hashedpassword", // Remember to hash passwords in a real application
// 			name: "John Doe",
// 			role: "WRITER",
// 		} as any,
// 	});

// 	const admin = await prisma.user.create({
// 		data: {
// 			email: "admin@example.com",
// 			password: "hashedpassword", // Remember to hash passwords in a real application
// 			name: "Admin User",
// 			role: "ADMIN",
// 		} as any,
// 	});

// 	// Create sample articles
// 	const articles = [
// 		{
// 			title: {
// 				en: "Ethiopia Wins Gold in 10,000m Race",
// 				am: "ኢትዮጵያ በ10,000 ሜትር ሩጫ ወርቅ አገኘች",
// 				om: "Itoophiyaan Moo'icha Warqee Fiigichaa Meetira 10,000 Argatte",
// 			},
// 			content: {
// 				en: "Ethiopian athlete Selemon Barega has won the gold medal in the men's 10,000m race at the Tokyo Olympics, continuing the country's strong tradition in long-distance running.",
// 				am: "የኢትዮጵያ አትሌት ሰለሞን ባረጋ በ도ክዮ ኦሎምፒክ በወንዶች 10,000 ሜትር ሩጫ የወርቅ ሜዳሊያ አገኘ፣ ይህም የሀገሪቱን የረጅም 거리ሩጫ ባህል ቀጥሏል።",
// 				om: "Fiigduun Itoophiyaa Selemoon Baregaa Olimpikii Tookyoo keessatti fiigichaa dhiirota meetira 10,000 irratti warqee mo'achuun aadaa biyattiin gochaalee fagoo keessatti qaabdu itti fufee jira.",
// 			},
// 			categoryId: national.id,
// 			subcategoryName: "Athletics",
// 			tags: ["Olympics", "Gold Medal", "Long Distance Running"],
// 			status: "APPROVED",
// 		},
// 		{
// 			title: {
// 				en: "Local Football Team Advances to Continental Championship",
// 				am: "የሀገር ውስጥ የእግር ኳስ ቡድን ወደ አህጉራዊ ሻምፒዮና ዘለቀ",
// 				om: "Gareen Kubbaa Miilaa Naannoo Injifannoo Kontinentaalii Gara Fuulduraatti Tarkaanfate",
// 			},
// 			content: {
// 				en: "The Ethiopian Coffee Sport Club has secured a spot in the CAF Champions League after a thrilling victory in the national league finals.",
// 				am: "የኢትዮጵያ ቡና ስፖርት ክለብ በሀገር አቀፍ ሊግ ፍጻሜ ላይ አስደናቂ ድል በማስመዝገብ በCAF 챔ፒዮንስ ሊግ ውስጥ ቦታ አገኘ።",
// 				om: "Waldaan Ispoortii Buna Itoophiyaa erga injifannoo nama hawwatu mormii diigdama biyyaalessaa keessatti galmeessisuun booda bakka Liigii Injifattoota CAF keessatti mirkaneeeffateera.",
// 			},
// 			categoryId: national.id,
// 			subcategoryName: "Football",
// 			tags: ["CAF", "Ethiopian Football", "Championship"],
// 			status: "PENDING",
// 		},
// 		{
// 			title: {
// 				en: "NBA Star Visits Ethiopia for Youth Basketball Camp",
// 				am: "የNBA ኮከብ ለወጣቶች የቅርጫት ኳስ ካምፕ ወደ ኢትዮጵያ መጣ",
// 				om: "Urjiin NBA Leenjii Kubbaa Harkaa Dargaggootaaf Itoophiyaa Dhufan",
// 			},
// 			content: {
// 				en: "Former NBA All-Star player has arrived in Addis Ababa to conduct a week-long basketball camp for aspiring young players, aiming to promote the sport in Ethiopia.",
// 				am: "ቀድሞ የNBA ኦል-ስታር ተጫዋች በኢትዮጵያ ቅርጫት ኳስን ለማስፋፋት አላማ ያነጣጠረ ለተስፈኞች ወጣት ተጫዋቾች የአንድ ሳምንት የቅርጫት ኳስ ካምፕ ለማካሄድ አዲስ አበባ ገብቷል።",
// 				om: "Taphattoonni NBA All-Star duraa taphattootaaf dargaggoota abdii qabaniif torban guutuu leenjii kubbaa harkaa gaggeessuuf, akkasumas Itoophiyaa keessatti ispoortii kana babal'isuuf yaadaan Finfinnee ga'aniiru.",
// 			},
// 			categoryId: international.id,
// 			subcategoryName: "Basketball",
// 			tags: ["NBA", "Youth Development", "Basketball Camp"],
// 			status: "APPROVED",
// 		},
// 	];

// 	for (const article of articles) {
// 		const subcategory = await prisma.subcategory.findFirst({
// 			where: {
// 				name: {
// 					contains: article.subcategoryName,
// 				},
// 				categoryId: article.categoryId,
// 			},
// 		});

// 		if (!subcategory) {
// 			console.error(`Subcategory ${article.subcategoryName} not found`);
// 			continue;
// 		}

// 		await prisma.article.create({
// 			data: {
// 				title: JSON.stringify(article.title),
// 				content: JSON.stringify(article.content),
// 				authorId: writer.id,
// 				categoryId: article.categoryId,
// 				subcategoryId: subcategory.id,
// 				tags: {
// 					create: article.tags.map((tag) => ({ name: tag })),
// 				},
// 				status: article.status,
// 			} as any,
// 		});
// 	}
// }

// main()
// 	.catch((e) => {
// 		console.error(e);
// 		process.exit(1);
// 	})
// 	.finally(async () => {
// 		await prisma.$disconnect();
// 	});
