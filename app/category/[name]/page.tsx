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
import { LoginRequiredDialog } from "@components/login-required-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const subcategories = [
	{ name: "football", icon: "/assets/icons/football.svg" },
	{ name: "basketball", icon: "/assets/icons/basketball.svg" },
	{ name: "tennis", icon: "/assets/icons/tennis.svg" },
	{ name: "athletics", icon: "/assets/icons/athletics.svg" },
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

export default function CategoryPage({ params }: { params: { name: string } }) {
	const { t, language } = useLanguage();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [selectedArticleUrl, setSelectedArticleUrl] = useState("");
	const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
	const [articles, setArticles] = useState<Article[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const observer = useRef<IntersectionObserver | null>(null);
	const [loginDialogOpen, setLoginDialogOpen] = useState(false);

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
					`/api/articles?page=${page}&category=${params.name}${
						searchQuery ? `&search=${searchQuery}` : ""
					}`
				);
				// const res = await fetch(
				// 	`/api/articles?page=${page}&category=${params.name}&search=${searchQuery}`
				// );

				if (!res.ok) {
					throw new Error("Failed to fetch articles");
				}
				const data = await res.json();

				// Fetch view counts for articles
				await fetchArticleViewCounts(data.articles);

				// if (page === 1) {
				// 	setArticles(data.articles);
				// } else {
				// 	setArticles((prevArticles) => [...prevArticles, ...data.articles]);
				// }

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
	}, [page, params.name, searchQuery]);

	// Add this function after the fetchArticles function in the useEffect
	async function fetchArticleViewCounts(articlesData: Article[]) {
		try {
			const viewCountPromises = articlesData.map(async (article) => {
				const response = await fetch(
					`/api/articles/view?articleId=${article.id}`,
					{
						method: "GET",
					}
				);

				console.log({
					response,
				});

				if (response.ok) {
					const data = await response.json();
					return {
						...article,
						viewCount: data.viewCount || 0,
						uniqueViewCount: data.uniqueViewCount || 0,
					};
				}
				return article;
			});

			const articlesWithViewCounts = await Promise.all(viewCountPromises);

			if (page === 1) {
				setArticles(articlesWithViewCounts);

				// Update featured articles with view counts
				if (articlesWithViewCounts.length > 0) {
					// Sort articles by viewCount in descending order
					const sortedArticles = [...articlesWithViewCounts].sort(
						(a: Article, b: Article) => {
							// Ensure viewCount exists and is a number for comparison
							const viewCountA =
								typeof a.viewCount === "number" ? a.viewCount : -Infinity;
							const viewCountB =
								typeof b.viewCount === "number" ? b.viewCount : -Infinity;
							return viewCountB - viewCountA;
						}
					);

					// Take the first article from the sorted list (highest viewCount)
					const highestViewCountArticle = sortedArticles[0];

					// Set featured articles to an array containing only the highest view count article
					if (highestViewCountArticle) {
						setFeaturedArticles([highestViewCountArticle]);
					} else {
						setFeaturedArticles([]);
					}
				} else {
					setFeaturedArticles([]);
				}
			} else {
				setArticles((prev) => [...prev, ...articlesWithViewCounts]);
			}
		} catch (error) {
			console.error("Error fetching view counts:", error);
		}
	}

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
			// Show login dialog
			setSelectedArticleUrl(articleUrl);
			setLoginDialogOpen(true);
		} else {
			// User is authenticated or auth is still loading, proceed to article
			router.push(articleUrl);
		}
	};

	return (
		<div className="w-full bg-gray-50 min-h-screen flex flex-col pb-10">
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
										src={subcategory.icon || "/placeholder.svg"}
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

				{/* Login Required Dialog */}
				<LoginRequiredDialog
					isOpen={loginDialogOpen}
					onClose={() => setLoginDialogOpen(false)}
					articleUrl={selectedArticleUrl}
				/>
			</div>
		</div>
	);
}
