"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const subcategories = [
	{ name: "football", icon: "/assets/icons/football.svg" },
	{ name: "basketball", icon: "/assets/icons/basketball.svg" },
	{ name: "tennis", icon: "/assets/icons/tennis.svg" },
	{ name: "athletics", icon: "/assets/icons/athletics.svg" },
];

const dummyArticles = [
	{ id: 1, title: "Latest Football News", image: "/assets/images/fb1.png" },
	{
		id: 2,
		title: "Basketball Championship Results",
		image: "/assets/images/fb1.png",
	},
	{ id: 3, title: "Tennis Star's Comeback", image: "/assets/images/fb1.png" },
];

export default function CategoryPage({ params }: { params: { name: string } }) {
	const { t } = useLanguage();
	const [searchQuery, setSearchQuery] = useState("");

	const filteredArticles = dummyArticles.filter((article) =>
		article.title.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="w-full bg-gray-50 min-h-screen flex flex-col">
			{/* Header */}
			<header className="sticky top-0 bg-white p-4 flex justify-between items-center border-b border-gray-200 shadow-sm z-10">
				<Link href="/">
					<Button variant="ghost" size="icon">
						<ArrowLeft className="w-6 h-6 text-gray-700" />
						<span className="sr-only">{t("back")}</span>
					</Button>
				</Link>
				<h1 className="text-xl font-bold capitalize text-gray-800">
					{t(params.name)}
				</h1>
				<Button variant="ghost" size="icon">
					<Search className="w-6 h-6 text-gray-700" />
					<span className="sr-only">{t("search")}</span>
				</Button>
			</header>

			{/* Search Bar */}
			<div className="p-4 bg-white shadow-sm">
				<Input
					type="text"
					placeholder={t("searchInCategory")}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full"
				/>
			</div>

			{/* Subcategories */}
			<div className="p-4">
				<h2 className="text-lg font-bold mb-4 text-gray-800">
					{t("subcategories")}
				</h2>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
					{subcategories.map((subcategory, index) => (
						<motion.div
							key={subcategory.name}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}>
							<Link href={`/category/${params.name}/${subcategory.name}`}>
								<div className="bg-white p-4 rounded-lg flex flex-col items-center justify-center aspect-square shadow-sm hover:shadow-md transition-all hover:scale-105">
									<Image
										src={subcategory.icon}
										alt={subcategory.name}
										width={48}
										height={48}
										className="mb-2"
									/>
									<span className="font-medium text-gray-800 text-center">
										{t(subcategory.name)}
									</span>
								</div>
							</Link>
						</motion.div>
					))}
				</div>
			</div>

			{/* Latest News in Category */}
			<div className="flex-grow p-4 space-y-4">
				<h3 className="font-bold text-lg text-gray-800">{t("latestNews")}</h3>
				{filteredArticles.length === 0 ? (
					<p className="text-center text-gray-500">{t("noArticlesFound")}</p>
				) : (
					filteredArticles.map((article, index) => (
						<motion.div
							key={article.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}>
							<Link href={`/article/${article.id}`}>
								<div className="bg-white p-4 rounded-lg flex space-x-4 shadow-sm hover:shadow-md transition-all hover:scale-102">
									<div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden">
										<Image
											src={article.image}
											alt={article.title}
											width={80}
											height={80}
											className="object-cover w-full h-full"
										/>
									</div>
									<div className="flex-grow">
										<h4 className="font-bold mb-1 text-gray-800">
											{article.title}
										</h4>
										<p className="text-sm text-gray-600">
											{t("shortDescription")}
										</p>
										<div className="flex items-center text-primary text-xs font-medium mt-2">
											{t("readMore")}
											<ChevronRight className="w-4 h-4 ml-1" />
										</div>
									</div>
								</div>
							</Link>
						</motion.div>
					))
				)}
			</div>

			{/* <BottomNavigation active="categories" /> */}
		</div>
	);
}

// "use client";

// import Link from "next/link";
// import { ArrowLeft, Search } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { BottomNavigation } from "@/components/BottomNavigation";
// import { useLanguage } from "@/contexts/LanguageContext";

// const subcategories = ["football", "basketball", "tennis", "f1"];

// export default function CategoryPage({ params }: { params: { name: string } }) {
// 	const { t } = useLanguage();

// 	return (
// 		<div className="w-full bg-gray-50 min-h-screen flex flex-col">
// 			{/* Header */}
// 			<header className="sticky top-0 bg-white p-4 flex justify-between items-center border-b border-gray-200 shadow-sm">
// 				<Link href="/">
// 					<Button variant="ghost" size="icon">
// 						<ArrowLeft className="w-6 h-6 text-gray-700" />
// 						<span className="sr-only">{t("back")}</span>
// 					</Button>
// 				</Link>
// 				<h1 className="text-xl font-bold capitalize text-gray-800">
// 					{t(params.name)}
// 				</h1>
// 				<Button variant="ghost" size="icon">
// 					<Search className="w-6 h-6 text-gray-700" />
// 					<span className="sr-only">{t("search")}</span>
// 				</Button>
// 			</header>

// 			{/* Subcategories */}
// 			<div className="p-4">
// 				<h2 className="text-lg font-bold mb-4 text-gray-800">
// 					{t("subcategories")}
// 				</h2>
// 				<div className="grid grid-cols-2 gap-4">
// 					{subcategories.map((subcategory) => (
// 						<Link
// 							key={subcategory}
// 							href={`/category/${params.name}/${subcategory}`}
// 							className="block">
// 							<div className="bg-white p-4 rounded-lg flex flex-col items-center justify-center aspect-square shadow-sm hover:shadow-md transition-shadow">
// 								<span className="font-medium text-gray-800">
// 									{t(subcategory)}
// 								</span>
// 							</div>
// 						</Link>
// 					))}
// 				</div>
// 			</div>

// 			{/* Latest News in Category */}
// 			<div className="flex-grow p-4 space-y-4">
// 				<h3 className="font-bold text-lg text-gray-800">{t("latestNews")}</h3>
// 				{[1, 2, 3].map((item) => (
// 					<Link key={item} href={`/article/${item}`} className="block">
// 						<div className="bg-white p-4 rounded-lg flex space-x-4 shadow-sm hover:shadow-md transition-shadow">
// 							<div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
// 							<div className="flex-grow">
// 								<h4 className="font-bold mb-1 text-gray-800">
// 									{t("latestNews")} {item}
// 								</h4>
// 								<p className="text-sm text-gray-600">{t("shortDescription")}</p>
// 							</div>
// 						</div>
// 					</Link>
// 				))}
// 			</div>

// 			<BottomNavigation active="categories" />
// 		</div>
// 	);
// }
