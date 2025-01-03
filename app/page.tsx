"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const mainCategories = [
	"all",
	"national",
	"international",
	"sportHistory",
	"ethiopianAthletics",
];

interface LocalizedContent {
	en: string;
	am?: string;
	om?: string;
}

interface Article {
	id: string;
	title: LocalizedContent;
	content: LocalizedContent;
	featuredImage: string | null;
	createdAt: string;
	category: string;
	viewCount: number;
}

export default function HomePage() {
	const { t, language } = useLanguage();
	const [articles, setArticles] = useState<Article[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedCategory, setSelectedCategory] = useState("all");

	useEffect(() => {
		async function fetchArticles() {
			try {
				setIsLoading(true);
				const res = await fetch("/api/articles");

				if (!res.ok) {
					throw new Error("Failed to fetch articles");
				}
				const data = await res.json();
				setArticles(data);
				setError(null);
			} catch (err) {
				console.error("Error fetching articles:", err);
				setError("Failed to load articles. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		}
		fetchArticles();
	}, []);

	const getLocalizedContent = (content: LocalizedContent) => {
		console.log({ content });
		return content[language as keyof LocalizedContent] || content.en || "";
	};

	const filteredArticles =
		selectedCategory === "all"
			? articles
			: articles.filter((article) => article.category === selectedCategory);

	return (
		<div className="flex-grow flex flex-col bg-gray-50">
			<main className="flex-grow space-y-4 overflow-y-auto">
				{/* Featured Article */}
				<div className="bg-white p-4">
					{isLoading ? (
						<Skeleton className="h-64 w-full rounded-xl" />
					) : articles.length > 0 ? (
						<Link
							href={`/article/${articles[0].id}`}
							className="block relative h-64 rounded-xl overflow-hidden shadow-lg">
							<Image
								src={articles[0].featuredImage || "/assets/images/fb1.png"}
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
									{getLocalizedContent(articles[0].title)}
								</h2>
								<p className="text-white text-sm">
									{getLocalizedContent(articles[0].content).slice(0, 100)}...
								</p>
								<div className="flex items-center text-white text-sm mt-2">
									<Eye className="w-4 h-4 mr-1" />
									{articles[0].viewCount} {t("views")}
								</div>
							</div>
						</Link>
					) : null}
				</div>

				{/* Main Categories */}
				<div className="bg-white pt-4 pb-2 px-4">
					<h3 className="font-bold text-lg text-gray-800 mb-3">
						{t("categories")}
					</h3>
					<div className="flex overflow-x-auto space-x-4 pb-2">
						{mainCategories.map((category) => (
							<Link
								key={category}
								href={`/category/${category}`}
								className={cn(
									"flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
									selectedCategory === category
										? "bg-primary text-white"
										: "bg-gray-100 text-gray-800 hover:bg-primary hover:text-white"
								)}>
								{t(category)}
							</Link>
						))}
					</div>
				</div>

				{/* Latest News */}
				<div className="space-y-4 p-4">
					<h3 className="font-bold text-xl text-gray-800">{t("latestNews")}</h3>
					{isLoading ? (
						Array.from({ length: 3 }).map((_, index) => (
							<div
								key={index}
								className="bg-white p-4 rounded-xl flex space-x-4 shadow-md">
								<Skeleton className="w-24 h-24 rounded-lg" />
								<div className="flex-grow space-y-2">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-1/2" />
								</div>
							</div>
						))
					) : error ? (
						<div className="text-center text-red-500">{error}</div>
					) : (
						filteredArticles.map((article) => (
							<Link
								key={article.id}
								href={`/article/${article.id}`}
								className="block">
								<div className="bg-white p-4 rounded-xl flex space-x-4 shadow-md hover:shadow-lg transition-shadow">
									<div className="relative w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden">
										<Image
											src={article.featuredImage || "/assets/images/fb1.png"}
											alt={getLocalizedContent(article.title)}
											layout="fill"
											objectFit="cover"
										/>
									</div>
									<div className="flex-grow">
										<h4 className="font-bold mb-1 text-gray-800">
											{getLocalizedContent(article.title)}
										</h4>
										<p className="text-sm text-gray-600 mb-2">
											{getLocalizedContent(article.content).slice(0, 50)}...
										</p>
										<div className="flex items-center justify-between">
											<div className="flex items-center text-primary text-xs font-medium">
												{t("readMore")}
												<ChevronRight className="w-4 h-4 ml-1" />
											</div>
											<div className="flex items-center text-gray-500 text-xs">
												<Eye className="w-4 h-4 mr-1" />
												{article.viewCount} {t("views")}
											</div>
										</div>
									</div>
								</div>
							</Link>
						))
					)}
				</div>
			</main>
		</div>
	);
}
