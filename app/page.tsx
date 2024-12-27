"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { SidebarDrawer } from "@/components/SidebarDrawer";
import { useLanguage } from "@/contexts/LanguageContext";

const mainCategories = [
	"all",
	"national",
	"international",
	"sportHistory",
	"ethiopianAthletics",
];

export default function HomePage() {
	const { t } = useLanguage();

	return (
		<div className="flex-grow flex flex-col bg-gray-50">
			{/* Header with Logo and Sidebar Toggle */}
			{/* <header className="bg-white p-4 flex justify-between items-center shadow-sm">
				<div className="flex items-center">
					<SidebarDrawer />
					<Image
						src="/assets/images/logo.png"
						alt="Daily Sport News Logo"
						width={40}
						height={40}
						className="rounded-full ml-2"
					/>
					<h1 className="ml-2 text-xl font-bold text-primary">Daily Sport</h1>
				</div>
				<Button variant="ghost" size="icon">
					<Search className="w-6 h-6 text-gray-500" />
					<span className="sr-only">{t("search")}</span>
				</Button>
			</header> */}

			{/* Featured Article */}
			<div className="bg-white p-4">
				<Link
					href="/article/1"
					className="block relative h-64 rounded-xl overflow-hidden shadow-lg">
					<Image
						src="/assets/images/fb1.png"
						alt="Featured Article"
						layout="fill"
						objectFit="cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
					<div className="absolute bottom-0 left-0 right-0 p-6">
						<div className="bg-primary text-white text-xs font-bold px-2 py-1 rounded mb-2 w-20">
							{t("featured")}
						</div>
						<h2 className="text-white text-2xl font-bold mb-2">
							{t("majorUpset")}
						</h2>
						<p className="text-white text-sm">{t("shortDescription")}</p>
					</div>
				</Link>
			</div>

			{/* Main Categories */}
			<div className="bg-white mt-4 pt-4 pb-2 px-4">
				<h3 className="font-bold text-lg text-gray-800 mb-3">
					{t("categories")}
				</h3>
				<div className="flex overflow-x-auto space-x-4 pb-2">
					{mainCategories.map((category) => (
						<Link
							key={category}
							href={`/category/${category}`}
							className="flex-shrink-0 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-colors">
							{t(category)}
						</Link>
					))}
				</div>
			</div>

			{/* Latest News */}
			<div className="flex-grow p-4 space-y-4 overflow-y-auto">
				<h3 className="font-bold text-xl text-gray-800 mb-4">
					{t("latestNews")}
				</h3>
				{[1, 2, 3].map((item) => (
					<Link key={item} href={`/article/${item}`} className="block">
						<div className="bg-white p-4 rounded-xl flex space-x-4 shadow-md hover:shadow-lg transition-shadow">
							<div className="relative w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden">
								<Image
									src={`/assets/images/fb${item + 1}.png`}
									alt={`News ${item}`}
									layout="fill"
									objectFit="cover"
								/>
							</div>
							<div className="flex-grow">
								<h4 className="font-bold mb-1 text-gray-800">
									{t("latestNews")} {item}
								</h4>
								<p className="text-sm text-gray-600 mb-2">
									{t("shortDescription")}
								</p>
								<div className="flex items-center text-primary text-xs font-medium">
									{t("readMore")}
									<ChevronRight className="w-4 h-4 ml-1" />
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>

			<BottomNavigation active="home" />
		</div>
	);
}
