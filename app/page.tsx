"use client";

import type React from "react";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
	ChevronRight,
	Eye,
	Calendar,
	Search,
	TrendingUp,
	ArrowRight,
	RefreshCw,
	X,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { NoArticlesFound } from "@/components/no-articles-found";
import { LoginRequiredDialog } from "@/components/login-required-dialog";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Category {
	id: string;
	name: string;
}

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
	category: {
		id: string;
		name: string;
	};
	viewCount: number;
}

const ARTICLES_PER_PAGE = 10;
const MAX_DESCRIPTION_LENGTH = 100;

export default function HomePage() {
	const { t, language } = useLanguage();
	const router = useRouter();
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [articles, setArticles] = useState<Article[]>([]);
	const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loginDialogOpen, setLoginDialogOpen] = useState(false);
	const [selectedArticleUrl, setSelectedArticleUrl] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [activeTab, setActiveTab] = useState("latest");
	const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const observer = useRef<IntersectionObserver | null>(null);

	// Fetch categories from the API
	useEffect(() => {
		async function fetchCategories() {
			try {
				setIsCategoriesLoading(true);
				const res = await fetch("/api/categories");

				if (!res.ok) {
					throw new Error("Failed to fetch categories");
				}

				const data = await res.json();
				setCategories(data.categories);
				setError(null);
			} catch (err) {
				console.error("Error fetching categories:", err);
				setError("Failed to load categories. Please try again later.");
			} finally {
				setIsCategoriesLoading(false);
			}
		}

		fetchCategories();
	}, []);

	// Auto-rotate featured articles
	useEffect(() => {
		if (featuredArticles.length > 1) {
			const interval = setInterval(() => {
				setCurrentFeaturedIndex((prev) =>
					prev === featuredArticles.length - 1 ? 0 : prev + 1
				);
			}, 5000);

			return () => clearInterval(interval);
		}
	}, [featuredArticles]);

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
					`/api/articles?page=${page}&category=${selectedCategory}${
						searchQuery ? `&search=${searchQuery}` : ""
					}`
				);

				if (!res.ok) {
					throw new Error("Failed to fetch articles");
				}
				const data = await res.json();

				if (page === 1) {
					// Replace articles when changing category or first load
					setArticles(data.articles);

					// Set featured articles (first 3 articles or fewer if less available)
					if (data.articles.length > 0) {
						setFeaturedArticles(
							data.articles.slice(0, Math.min(3, data.articles.length))
						);
					} else {
						setFeaturedArticles([]);
					}
				} else {
					// Append articles for pagination
					setArticles((prevArticles) => [...prevArticles, ...data.articles]);
				}

				setHasMore(data.hasMore);
				setError(null);
			} catch (err) {
				console.error("Error fetching articles:", err);
				setError("Failed to load articles. Please try again later.");
			} finally {
				setIsLoading(false);
				setIsRefreshing(false);
			}
		}
		fetchArticles();
	}, [page, selectedCategory, searchQuery]);

	const getLocalizedContent = (content: LocalizedContent) => {
		console.log({
			content,
			language,
			Converted: content[language],
		});
		return content[language as keyof LocalizedContent] || content["en"] || "";
	};

	const truncateText = (text: string, maxLength: number) => {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + "...";
	};

	const handleCategoryChange = (categoryId: string) => {
		setSelectedCategory(categoryId);
		setArticles([]);
		setFeaturedArticles([]);
		setPage(1);
		setHasMore(true);
		setActiveTab("latest");
	};

	const handleArticleClick = (articleId: string, event: React.MouseEvent) => {
		event.preventDefault();

		const articleUrl = `/article/${articleId}`;

		// Check if user is authenticated
		if (isAuthenticated === false) {
			// Show login dialog
			setSelectedArticleUrl(articleUrl);
			setLoginDialogOpen(true);
		} else {
			// User is authenticated or auth is still loading, proceed to article
			router.push(articleUrl);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSearching(true);
		setArticles([]);
		setFeaturedArticles([]);
		setPage(1);
		setHasMore(true);
	};

	const clearSearch = () => {
		setSearchQuery("");
		setIsSearching(false);
		setArticles([]);
		setFeaturedArticles([]);
		setPage(1);
		setHasMore(true);
	};

	const handleRefresh = () => {
		setIsRefreshing(true);
		setArticles([]);
		setFeaturedArticles([]);
		setPage(1);
		setHasMore(true);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat(
			language === "en" ? "en-US" : language === "am" ? "am-ET" : "om-ET",
			{
				year: "numeric",
				month: "short",
				day: "numeric",
			}
		).format(date);
	};

	// Get articles for the Latest News section
	const getLatestNewsArticles = () => {
		if (isSearching) {
			// When searching, show all articles
			return articles;
		}

		// For normal view, we have two options:
		if (activeTab === "latest") {
			// For latest tab, sort by date
			return [...articles].sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
		} else {
			// For popular tab, sort by view count
			return [...articles].sort((a, b) => b.viewCount - a.viewCount);
		}
	};

	const latestNewsArticles = getLatestNewsArticles();

	return (
		<div className="flex-grow flex flex-col bg-gray-50 min-h-screen">
			{/* Hero Section with Search */}
			<section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-4">
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col md:flex-row justify-between items-center mb-6">
						<div className="mb-6 md:mb-0">
							<h1 className="text-3xl md:text-4xl font-bold mb-2">
								{t("discoverSports")}
							</h1>
							<p className="text-blue-100 max-w-md">
								{t("exploreLatestSportsNews")}
							</p>
						</div>

						<form onSubmit={handleSearch} className="w-full md:w-auto">
							<div className="relative flex items-center">
								<Input
									type="search"
									placeholder={t("searchArticles")}
									className="w-full md:w-80 pl-10 pr-10 py-2 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
								<Search className="absolute left-3 h-4 w-4 text-white/70" />
								{searchQuery && (
									<button
										type="button"
										onClick={clearSearch}
										className="absolute right-12 h-4 w-4 text-white/70 hover:text-white">
										<X className="h-4 w-4" />
									</button>
								)}
								<Button
									type="submit"
									size="sm"
									className="absolute right-1 bg-white/20 hover:bg-white/30 text-white">
									{t("search")}
								</Button>
							</div>
						</form>
					</div>

					{/* Category Pills */}
					<div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<button
								className={cn(
									"px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
									selectedCategory === "all"
										? "bg-white text-blue-600"
										: "bg-white/20 text-white hover:bg-white/30"
								)}
								onClick={() => handleCategoryChange("all")}>
								{t("all")}
							</button>
						</motion.div>

						{isCategoriesLoading
							? Array.from({ length: 4 }).map((_, index) => (
									<Skeleton
										key={`category-skeleton-${index}`}
										className="flex-shrink-0 w-24 h-10 rounded-full bg-white/10"
									/>
							  ))
							: categories.map((category) => (
									<motion.div
										key={category.id}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}>
										<button
											className={cn(
												"px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
												selectedCategory === category.id
													? "bg-white text-blue-600"
													: "bg-white/20 text-white hover:bg-white/30"
											)}
											onClick={() => handleCategoryChange(category.id)}>
											{t(category.name.toLowerCase()) || category.name}
										</button>
									</motion.div>
							  ))}
					</div>
				</div>
			</section>

			<main className="flex-grow max-w-7xl mx-auto w-full px-4 pt-6 pb-20">
				{/* Featured Articles Carousel */}
				{!isSearching && featuredArticles.length > 0 && (
					<section className="mb-10">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-2xl font-bold text-gray-800 flex items-center">
								<TrendingUp className="mr-2 h-5 w-5 text-primary" />
								{t("featuredStories")}
							</h2>
							<Button
								variant="ghost"
								size="sm"
								className="text-primary hover:text-primary/80"
								onClick={handleRefresh}
								disabled={isRefreshing}>
								<RefreshCw
									className={`mr-2 h-4 w-4 ${
										isRefreshing ? "animate-spin" : ""
									}`}
								/>
								{t("refresh")}
							</Button>
						</div>

						{isLoading && page === 1 ? (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{Array.from({ length: 3 }).map((_, index) => (
									<Skeleton key={index} className="h-64 w-full rounded-xl" />
								))}
							</div>
						) : (
							<div className="relative">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{featuredArticles.map((article, index) => (
										<motion.div
											key={article.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.5, delay: index * 0.1 }}
											whileHover={{ y: -5 }}
											className="group">
											<a
												href={`/article/${article.id}`}
												className="block h-full"
												onClick={(e) => handleArticleClick(article.id, e)}>
												<div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col">
													<div className="relative h-40 overflow-hidden">
														<Image
															src={
																article.featuredImage ||
																"/assets/images/fb1.png"
															}
															alt={getLocalizedContent(article.title)}
															layout="fill"
															objectFit="cover"
															className="group-hover:scale-105 transition-transform duration-300"
														/>
														<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
														<Badge className="absolute top-3 left-3 bg-primary">
															{t(article.category.name.toLowerCase()) ||
																article.category.name}
														</Badge>
													</div>
													<div className="p-4 flex-grow flex flex-col">
														<h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
															{getLocalizedContent(article.title)}
														</h3>
														<p className="text-gray-600 text-sm mb-4 line-clamp-2">
															{/* {JSON.stringify(
																getLocalizedContent(
																	(article as any).content["en"]
																)
															)} */}

															{/* {JSON.stringify(article.content)} */}
															{truncateText(
																getLocalizedContent(
																	(article as any).content["en"]
																),
																MAX_DESCRIPTION_LENGTH
															)}
															{/* {truncateText(
																getLocalizedContent(article.content),
																MAX_DESCRIPTION_LENGTH
															)} */}
														</p>
														<div className="mt-auto flex justify-between items-center text-xs text-gray-500">
															<div className="flex items-center">
																<Calendar className="w-3 h-3 mr-1" />
																<span>{formatDate(article.createdAt)}</span>
															</div>
															<div className="flex items-center">
																<Eye className="w-3 h-3 mr-1" />
																<span>{article.viewCount}</span>
															</div>
														</div>
													</div>
												</div>
											</a>
										</motion.div>
									))}
								</div>
							</div>
						)}
					</section>
				)}

				{/* Main Content */}
				<section>
					<div className="flex justify-between items-center mb-6">
						<div>
							<h2 className="text-2xl font-bold text-gray-800">
								{isSearching ? t("searchResults") : t("latestNews")}
							</h2>
							{isSearching && (
								<p className="text-gray-500 mt-1">
									{t("searchingFor")}: "{searchQuery}"
								</p>
							)}
						</div>

						{!isSearching && (
							<Tabs
								value={activeTab}
								onValueChange={setActiveTab}
								className="w-auto">
								<TabsList>
									<TabsTrigger value="latest" className="text-xs sm:text-sm">
										{t("latest")}
									</TabsTrigger>
									<TabsTrigger value="popular" className="text-xs sm:text-sm">
										{t("popular")}
									</TabsTrigger>
								</TabsList>
							</Tabs>
						)}
					</div>

					<AnimatePresence mode="wait">
						{isLoading && page === 1 ? (
							<div className="space-y-6">
								{Array.from({ length: 5 }).map((_, index) => (
									<Skeleton key={index} className="h-32 w-full rounded-xl" />
								))}
							</div>
						) : latestNewsArticles.length > 0 ? (
							<motion.div
								key={activeTab + selectedCategory + searchQuery}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{latestNewsArticles.map((article, index) => (
										<motion.div
											key={article.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.4, delay: index * 0.05 }}
											whileHover={{ y: -5 }}
											ref={
												index === latestNewsArticles.length - 1
													? lastArticleElementRef
													: null
											}>
											<a
												href={`/article/${article.id}`}
												className="block h-full"
												onClick={(e) => handleArticleClick(article.id, e)}>
												<div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex">
													<div className="relative w-1/3 overflow-hidden">
														<Image
															src={
																article.featuredImage ||
																"/assets/images/fb1.png"
															}
															alt={getLocalizedContent(article.title)}
															layout="fill"
															objectFit="cover"
														/>
													</div>
													<div className="p-4 w-2/3">
														<div className="flex justify-between items-start mb-2">
															<Badge variant="outline" className="mb-2 text-xs">
																{t(article.category.name.toLowerCase()) ||
																	article.category.name}
															</Badge>
															<div className="flex items-center text-gray-400 text-xs">
																<Eye className="w-3 h-3 mr-1" />
																<span>{article.viewCount}</span>
															</div>
														</div>
														<h3 className="font-bold text-gray-800 mb-2 line-clamp-2 hover:text-primary transition-colors">
															{getLocalizedContent(article.title)}
														</h3>
														<p className="text-gray-600 text-sm mb-3 line-clamp-2">
															{truncateText(
																getLocalizedContent(
																	(article as any).content["en"]
																),
																MAX_DESCRIPTION_LENGTH
															)}
														</p>
														<div className="flex justify-between items-center mt-auto">
															<div className="text-xs text-gray-500 flex items-center">
																<Calendar className="w-3 h-3 mr-1" />
																<span>{formatDate(article.createdAt)}</span>
															</div>
															<div className="text-primary text-xs font-medium flex items-center">
																{t("readMore")}
																<ChevronRight className="w-4 h-4 ml-1" />
															</div>
														</div>
													</div>
												</div>
											</a>
										</motion.div>
									))}
								</div>
							</motion.div>
						) : !isLoading ? (
							<NoArticlesFound />
						) : null}
					</AnimatePresence>

					{isLoading && page > 1 && (
						<div className="flex justify-center my-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					)}

					{hasMore && !isLoading && articles.length > 0 && (
						<div className="flex justify-center mt-8">
							<Button
								onClick={() => setPage((prev) => prev + 1)}
								className="group">
								{t("loadMore")}
								<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
							</Button>
						</div>
					)}

					{error && (
						<div className="text-center text-red-500 p-4 my-8 bg-red-50 rounded-lg border border-red-100">
							{error}
						</div>
					)}
				</section>
			</main>

			{/* Login Required Dialog */}
			<LoginRequiredDialog
				isOpen={loginDialogOpen}
				onClose={() => setLoginDialogOpen(false)}
				articleUrl={selectedArticleUrl}
			/>
		</div>
	);
}

// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { ChevronRight, Eye } from "lucide-react";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { Skeleton } from "@/components/ui/skeleton";
// import { cn } from "@/lib/utils";
// import { motion, AnimatePresence } from "framer-motion";

// const mainCategories = [
// 	"all",
// 	"national",
// 	"international",
// 	"sportHistory",
// 	"ethiopianAthletics",
// ];

// interface LocalizedContent {
// 	en: string;
// 	am?: string;
// 	om?: string;
// }

// interface Article {
// 	id: string;
// 	title: LocalizedContent;
// 	content: LocalizedContent;
// 	featuredImage: string | null;
// 	createdAt: string;
// 	category: string;
// 	viewCount: number;
// }

// const ARTICLES_PER_PAGE = 10;
// const MAX_DESCRIPTION_LENGTH = 100;

// export default function HomePage() {
// 	const { t, language } = useLanguage();
// 	const [articles, setArticles] = useState<Article[]>([]);
// 	const [isLoading, setIsLoading] = useState(true);
// 	const [error, setError] = useState<string | null>(null);
// 	const [selectedCategory, setSelectedCategory] = useState("all");
// 	const [page, setPage] = useState(1);
// 	const [hasMore, setHasMore] = useState(true);
// 	const observer = useRef<IntersectionObserver | null>(null);

// 	const lastArticleElementRef = useCallback(
// 		(node: HTMLDivElement | null) => {
// 			if (isLoading) return;
// 			if (observer.current) observer.current.disconnect();
// 			observer.current = new IntersectionObserver((entries) => {
// 				if (entries[0].isIntersecting && hasMore) {
// 					setPage((prevPage) => prevPage + 1);
// 				}
// 			});
// 			if (node) observer.current.observe(node);
// 		},
// 		[isLoading, hasMore]
// 	);

// 	useEffect(() => {
// 		async function fetchArticles() {
// 			try {
// 				setIsLoading(true);
// 				const res = await fetch(
// 					`/api/articles?page=${page}&category=${selectedCategory}`
// 				);

// 				if (!res.ok) {
// 					throw new Error("Failed to fetch articles");
// 				}
// 				const data = await res.json();
// 				setArticles((prevArticles) => [...prevArticles, ...data.articles]);
// 				setHasMore(data.hasMore);
// 				setError(null);
// 			} catch (err) {
// 				console.error("Error fetching articles:", err);
// 				setError("Failed to load articles. Please try again later.");
// 			} finally {
// 				setIsLoading(false);
// 			}
// 		}
// 		fetchArticles();
// 	}, [page, selectedCategory]);

// 	const getLocalizedContent = (content: LocalizedContent) => {
// 		return content[language as keyof LocalizedContent] || content.en || "";
// 	};

// 	const truncateText = (text: string, maxLength: number) => {
// 		if (text.length <= maxLength) return text;
// 		return text.slice(0, maxLength) + "...";
// 	};

// 	const handleCategoryChange = (category: string) => {
// 		setSelectedCategory(category);
// 		setArticles([]);
// 		setPage(1);
// 		setHasMore(true);
// 	};

// 	return (
// 		<div className="flex-grow flex flex-col bg-gray-50 pb-16">
// 			<main className="flex-grow space-y-4 overflow-y-auto">
// 				{/* Featured Article */}
// 				<AnimatePresence>
// 					{isLoading && page === 1 ? (
// 						<motion.div
// 							initial={{ opacity: 0 }}
// 							animate={{ opacity: 1 }}
// 							exit={{ opacity: 0 }}
// 							className="bg-white p-4">
// 							<Skeleton className="h-64 w-full rounded-xl" />
// 						</motion.div>
// 					) : articles.length > 0 ? (
// 						<motion.div
// 							initial={{ opacity: 0, y: 20 }}
// 							animate={{ opacity: 1, y: 0 }}
// 							transition={{ duration: 0.5 }}
// 							className="bg-white p-4">
// 							<Link
// 								href={`/article/${articles[0].id}`}
// 								className="block relative h-64 rounded-xl overflow-hidden shadow-lg">
// 								<Image
// 									src={articles[0].featuredImage || "/assets/images/fb1.png"}
// 									alt="Featured Article"
// 									layout="fill"
// 									objectFit="cover"
// 								/>
// 								<div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
// 								<div className="absolute bottom-0 left-0 right-0 p-6">
// 									<div className="bg-primary text-white text-xs font-bold px-2 py-1 rounded mb-2 w-20">
// 										{t("featured")}
// 									</div>
// 									<h2 className="text-white text-2xl font-bold mb-2">
// 										{truncateText(
// 											getLocalizedContent(articles[0].title),
// 											MAX_DESCRIPTION_LENGTH
// 										)}
// 									</h2>
// 									<p className="text-white text-sm">
// 										{truncateText(
// 											getLocalizedContent(articles[0].content),
// 											MAX_DESCRIPTION_LENGTH
// 										)}
// 									</p>
// 									<div className="flex items-center text-white text-sm mt-2">
// 										<Eye className="w-4 h-4 mr-1" />
// 										{articles[0].viewCount} {t("views")}
// 									</div>
// 								</div>
// 							</Link>
// 						</motion.div>
// 					) : null}
// 				</AnimatePresence>

// 				{/* Main Categories */}
// 				<motion.div
// 					initial={{ opacity: 0, y: 20 }}
// 					animate={{ opacity: 1, y: 0 }}
// 					transition={{ duration: 0.5, delay: 0.2 }}
// 					className="bg-white pt-4 pb-2 px-4">
// 					<h3 className="font-bold text-lg text-gray-800 mb-3">
// 						{t("categories")}
// 					</h3>
// 					<div className="flex overflow-x-auto space-x-4 pb-2">
// 						{mainCategories.map((category) => (
// 							<motion.div
// 								key={category}
// 								whileHover={{ scale: 1.05 }}
// 								whileTap={{ scale: 0.95 }}>
// 								<button
// 									className={cn(
// 										"flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
// 										selectedCategory === category
// 											? "bg-primary text-white"
// 											: "bg-gray-100 text-gray-800 hover:bg-primary hover:text-white"
// 									)}
// 									onClick={() => handleCategoryChange(category)}>
// 									{t(category)}
// 								</button>
// 							</motion.div>
// 						))}
// 					</div>
// 				</motion.div>

// 				{/* Latest News */}
// 				<AnimatePresence>
// 					{isLoading && page === 1 ? (
// 						<motion.div
// 							initial={{ opacity: 0 }}
// 							animate={{ opacity: 1 }}
// 							exit={{ opacity: 0 }}
// 							className="space-y-4 p-4">
// 							{Array.from({ length: 3 }).map((_, index) => (
// 								<Skeleton key={index} className="h-24 w-full rounded-xl" />
// 							))}
// 						</motion.div>
// 					) : articles.length > 0 ? (
// 						<motion.div
// 							initial={{ opacity: 0, y: 20 }}
// 							animate={{ opacity: 1, y: 0 }}
// 							transition={{ duration: 0.5, delay: 0.4 }}
// 							className="space-y-4 p-4">
// 							<h3 className="font-bold text-xl text-gray-800">
// 								{t("latestNews")}
// 							</h3>
// 							{articles.map((article, index) => (
// 								<motion.div
// 									key={article.id}
// 									initial={{ opacity: 0, y: 20 }}
// 									animate={{ opacity: 1, y: 0 }}
// 									transition={{ duration: 0.5, delay: index * 0.1 }}
// 									ref={
// 										index === articles.length - 1 ? lastArticleElementRef : null
// 									}>
// 									<Link href={`/article/${article.id}`} className="block">
// 										<div className="bg-white p-4 rounded-xl flex space-x-4 shadow-md hover:shadow-lg transition-shadow">
// 											<div className="relative w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden">
// 												<Image
// 													src={
// 														article.featuredImage || "/assets/images/fb1.png"
// 													}
// 													alt={getLocalizedContent(article.title)}
// 													layout="fill"
// 													objectFit="cover"
// 												/>
// 											</div>
// 											<div className="flex-grow">
// 												<h4 className="font-bold mb-1 text-gray-800">
// 													{truncateText(
// 														getLocalizedContent(article.title),
// 														MAX_DESCRIPTION_LENGTH
// 													)}
// 												</h4>
// 												<p className="text-sm text-gray-600 mb-2">
// 													{truncateText(
// 														getLocalizedContent(article.content),
// 														MAX_DESCRIPTION_LENGTH
// 													)}
// 												</p>
// 												<div className="flex items-center justify-between">
// 													<div className="flex items-center text-primary text-xs font-medium">
// 														{t("readMore")}
// 														<ChevronRight className="w-4 h-4 ml-1" />
// 													</div>
// 													<div className="flex items-center text-gray-500 text-xs">
// 														<Eye className="w-4 h-4 mr-1" />
// 														{article.viewCount} {t("views")}
// 													</div>
// 												</div>
// 											</div>
// 										</div>
// 									</Link>
// 								</motion.div>
// 							))}
// 						</motion.div>
// 					) : null}
// 				</AnimatePresence>
// 				{isLoading && page > 1 && (
// 					<div className="text-center p-4">
// 						<Skeleton className="h-8 w-32 mx-auto" />
// 					</div>
// 				)}
// 				{error && <div className="text-center text-red-500 p-4">{error}</div>}
// 			</main>
// 		</div>
// 	);
// }
