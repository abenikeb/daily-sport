"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

const ARTICLES_PER_PAGE = 10;
const MAX_DESCRIPTION_LENGTH = 100;

export default function HomePage() {
	const { t, language } = useLanguage();
	const [articles, setArticles] = useState<Article[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const observer = useRef<IntersectionObserver | null>(null);

	const lastArticleElementRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (isLoading) return;
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasMore) {
					setPage((prevPage) => prevPage + 1);
				}
			});
			if (node) observer.current.observe(node);
		},
		[isLoading, hasMore]
	);

	useEffect(() => {
		async function fetchArticles() {
			try {
				setIsLoading(true);
				const res = await fetch(
					`/api/articles?page=${page}&category=${selectedCategory}`
				);

				if (!res.ok) {
					throw new Error("Failed to fetch articles");
				}
				const data = await res.json();
				setArticles((prevArticles) => [...prevArticles, ...data.articles]);
				setHasMore(data.hasMore);
				setError(null);
			} catch (err) {
				console.error("Error fetching articles:", err);
				setError("Failed to load articles. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		}
		fetchArticles();
	}, [page, selectedCategory]);

	const getLocalizedContent = (content: LocalizedContent) => {
		return content[language as keyof LocalizedContent] || content.en || "";
	};

	const truncateText = (text: string, maxLength: number) => {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + "...";
	};

	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category);
		setArticles([]);
		setPage(1);
		setHasMore(true);
	};

	return (
		<div className="flex-grow flex flex-col bg-gray-50 pb-16">
			<main className="flex-grow space-y-4 overflow-y-auto">
				{/* Featured Article */}
				<AnimatePresence>
					{isLoading && page === 1 ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="bg-white p-4">
							<Skeleton className="h-64 w-full rounded-xl" />
						</motion.div>
					) : articles.length > 0 ? (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="bg-white p-4">
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
										{truncateText(
											getLocalizedContent(articles[0].title),
											MAX_DESCRIPTION_LENGTH
										)}
									</h2>
									<p className="text-white text-sm">
										{truncateText(
											getLocalizedContent(articles[0].content),
											MAX_DESCRIPTION_LENGTH
										)}
									</p>
									<div className="flex items-center text-white text-sm mt-2">
										<Eye className="w-4 h-4 mr-1" />
										{articles[0].viewCount} {t("views")}
									</div>
								</div>
							</Link>
						</motion.div>
					) : null}
				</AnimatePresence>

				{/* Main Categories */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="bg-white pt-4 pb-2 px-4">
					<h3 className="font-bold text-lg text-gray-800 mb-3">
						{t("categories")}
					</h3>
					<div className="flex overflow-x-auto space-x-4 pb-2">
						{mainCategories.map((category) => (
							<motion.div
								key={category}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}>
								<button
									className={cn(
										"flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
										selectedCategory === category
											? "bg-primary text-white"
											: "bg-gray-100 text-gray-800 hover:bg-primary hover:text-white"
									)}
									onClick={() => handleCategoryChange(category)}>
									{t(category)}
								</button>
							</motion.div>
						))}
					</div>
				</motion.div>

				{/* Latest News */}
				<AnimatePresence>
					{isLoading && page === 1 ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="space-y-4 p-4">
							{Array.from({ length: 3 }).map((_, index) => (
								<Skeleton key={index} className="h-24 w-full rounded-xl" />
							))}
						</motion.div>
					) : articles.length > 0 ? (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
							className="space-y-4 p-4">
							<h3 className="font-bold text-xl text-gray-800">
								{t("latestNews")}
							</h3>
							{articles.map((article, index) => (
								<motion.div
									key={article.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: index * 0.1 }}
									ref={
										index === articles.length - 1 ? lastArticleElementRef : null
									}>
									<Link href={`/article/${article.id}`} className="block">
										<div className="bg-white p-4 rounded-xl flex space-x-4 shadow-md hover:shadow-lg transition-shadow">
											<div className="relative w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden">
												<Image
													src={
														article.featuredImage || "/assets/images/fb1.png"
													}
													alt={getLocalizedContent(article.title)}
													layout="fill"
													objectFit="cover"
												/>
											</div>
											<div className="flex-grow">
												<h4 className="font-bold mb-1 text-gray-800">
													{truncateText(
														getLocalizedContent(article.title),
														MAX_DESCRIPTION_LENGTH
													)}
												</h4>
												<p className="text-sm text-gray-600 mb-2">
													{truncateText(
														getLocalizedContent(article.content),
														MAX_DESCRIPTION_LENGTH
													)}
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
								</motion.div>
							))}
						</motion.div>
					) : null}
				</AnimatePresence>
				{isLoading && page > 1 && (
					<div className="text-center p-4">
						<Skeleton className="h-8 w-32 mx-auto" />
					</div>
				)}
				{error && <div className="text-center text-red-500 p-4">{error}</div>}
			</main>
		</div>
	);
}
