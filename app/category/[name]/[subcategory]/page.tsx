"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@hooks/useAuth";
import { useRouter } from "next/navigation";

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
	subcategory: string;
	viewCount: number;
}

const ARTICLES_PER_PAGE = 10;
const MAX_DESCRIPTION_LENGTH = 100;

export default function SubcategoryPage({
	params,
}: {
	params: { name: string; subcategory: string };
}) {
	const { t, language } = useLanguage();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [articles, setArticles] = useState<Article[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const observer = useRef<IntersectionObserver | null>(null);
	const { isAuthenticated, isLoading: authLoading } = useAuth();

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
					`/api/articles?page=${page}&category=${params.name}&subcategory=${params.subcategory}&search=${searchQuery}`
				);

				if (!res.ok) {
					throw new Error("Failed to fetch articles");
				}
				const data = await res.json();

				if (page === 1) {
					setArticles(data.articles);
				} else {
					setArticles((prevArticles) => [...prevArticles, ...data.articles]);
				}

				setHasMore(data.hasMore);
				setError(null);
			} catch (err) {
				console.error("Error fetching articles:", err);
				setError("Failed to load articles. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		}

		// Debounce search queries
		const timer = setTimeout(() => {
			setPage(1);
			fetchArticles();
		}, 300);

		return () => clearTimeout(timer);
	}, [page, params.name, params.subcategory, searchQuery]);

	const getLocalizedContent = (content: LocalizedContent) => {
		return content[language as keyof LocalizedContent] || content.en || "";
	};

	const truncateText = (text: string, maxLength: number) => {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + "...";
	};

	const handleArticleClick = (articleId: string, event: React.MouseEvent) => {
		event.preventDefault();

		const articleUrl = `/article/${articleId}`;

		// Check if user is authenticated
		if (isAuthenticated === false) {
			return null;
			// Show login dialog
			// setSelectedArticleUrl(articleUrl);
			// setLoginDialogOpen(true);
		} else {
			// User is authenticated or auth is still loading, proceed to article
			router.push(articleUrl);
		}
	};

	return (
		<div className="w-full bg-gray-50 min-h-screen flex flex-col">
			{/* Header */}
			<header className="sticky top-0 bg-white p-4 flex justify-between items-center border-b border-gray-200 shadow-sm z-10">
				<Link href={`/category/${params.name}`}>
					<Button variant="ghost" size="icon">
						<ArrowLeft className="w-6 h-6 text-gray-700" />
						<span className="sr-only">{t("back")}</span>
					</Button>
				</Link>
				<h1 className="text-xl font-bold capitalize text-gray-800">
					{t(params.subcategory)}
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
					placeholder={t("search")}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full"
				/>
			</div>

			{/* Latest News in Subcategory */}
			<div className="flex-grow p-4 space-y-4">
				<h3 className="font-bold text-lg text-gray-800">{t("latestNews")}</h3>

				<AnimatePresence>
					{isLoading && page === 1 ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="space-y-4">
							{Array.from({ length: 3 }).map((_, index) => (
								<Skeleton key={index} className="h-24 w-full rounded-xl" />
							))}
						</motion.div>
					) : articles.length > 0 ? (
						articles.map((article, index) => (
							<motion.div
								key={article.id}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								ref={
									index === articles.length - 1 ? lastArticleElementRef : null
								}>
								<Link
									href={`/article/${article.id}`}
									onClick={(e) => handleArticleClick(article.id, e)}>
									<div className="bg-white p-4 rounded-lg flex space-x-4 shadow-sm hover:shadow-md transition-all hover:scale-102">
										<div className="relative w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden">
											<Image
												src={article.featuredImage || "/assets/images/fb1.png"}
												alt={getLocalizedContent(article.title)}
												width={80}
												height={80}
												className="object-cover w-full h-full"
											/>
										</div>
										<div className="flex-grow">
											<h4 className="font-bold mb-1 text-gray-800">
												{truncateText(
													getLocalizedContent(article.title),
													MAX_DESCRIPTION_LENGTH
												)}
											</h4>
											<p className="text-sm text-gray-600">
												{truncateText(
													getLocalizedContent(article.content),
													MAX_DESCRIPTION_LENGTH
												)}
											</p>
											<div className="flex items-center justify-between mt-2">
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
						))
					) : (
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-center text-gray-500 py-8">
							{searchQuery ? t("noSearchResults") : t("noArticlesFound")}
						</motion.p>
					)}
				</AnimatePresence>

				{isLoading && page > 1 && (
					<div className="text-center p-4">
						<Skeleton className="h-8 w-32 mx-auto" />
					</div>
				)}

				{error && <div className="text-center text-red-500 p-4">{error}</div>}
			</div>

			<BottomNavigation />
		</div>
	);
}
