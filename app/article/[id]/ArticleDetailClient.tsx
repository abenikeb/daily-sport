"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoginModal } from "@/components/LoginModal";
import Link from "next/link";
import Image from "next/image";
import {
	ArrowLeft,
	Share2,
	ThumbsUp,
	MessageSquare,
	Bookmark,
	Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
	author: {
		name: string;
		avatar: string;
	};
}

interface ArticleDetailClientProps {
	article: Article;
	isAuthenticated: boolean;
	articleId: string;
	userId: string | null;
}

export default function ArticleDetailClient({
	article,
	isAuthenticated,
	articleId,
	userId,
}: ArticleDetailClientProps) {
	const { t, language } = useLanguage();
	const router = useRouter();
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [localIsAuthenticated, setLocalIsAuthenticated] =
		useState(isAuthenticated);
	const [isFavorite, setIsFavorite] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState(false);

	const checkIfFavorite = useCallback(async () => {
		if (userId) {
			try {
				const response = await fetch(
					`/api/favorites?userId=${userId}&articleId=${articleId}`
				);
				const data = await response.json();
				setIsFavorite(data.isFavorite);
			} catch (error) {
				console.error("Error checking favorite status:", error);
			}
		}
	}, [userId, articleId]);

	const checkIfBookmarked = useCallback(async () => {
		if (userId) {
			try {
				const response = await fetch(
					`/api/bookmarks?userId=${userId}&articleId=${articleId}`
				);
				const data = await response.json();
				setIsBookmarked(data.isBookmarked);
			} catch (error) {
				console.error("Error checking bookmark status:", error);
			}
		}
	}, [userId, articleId]);

	useEffect(() => {
		if (localIsAuthenticated) {
			checkIfFavorite();
			checkIfBookmarked();
		}
	}, [localIsAuthenticated, checkIfFavorite, checkIfBookmarked]);

	useEffect(() => {
		const incrementViewCount = async () => {
			try {
				await fetch("/api/articles", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ articleId: articleId }),
				});
			} catch (error) {
				console.error("Error incrementing view count:", error);
			}
		};

		incrementViewCount();
	}, [articleId]);

	const getLocalizedContent = (content: LocalizedContent) => {
		try {
			const parsedContent = JSON.parse(content as any);
			return (
				parsedContent[language as keyof typeof parsedContent] ||
				parsedContent.en ||
				""
			);
		} catch (error) {
			console.error("Invalid content format:", error);
			return "";
		}
	};

	const handleLoginSuccess = () => {
		setLocalIsAuthenticated(true);
		setShowLoginModal(false);
		checkIfFavorite();
		checkIfBookmarked();
	};

	const handleLoginModalClose = () => {
		setShowLoginModal(false);
		// Remove the redirection to home page
		// router.push("/");
	};

	const handleFavoriteToggle = async () => {
		if (!localIsAuthenticated) {
			setShowLoginModal(true);
			return;
		}

		try {
			const response = await fetch("/api/favorites", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userId, articleId }),
			});

			if (response.ok) {
				setIsFavorite(!isFavorite);
			} else {
				console.error("Failed to toggle favorite");
			}
		} catch (error) {
			console.error("Error toggling favorite:", error);
		}
	};

	const handleBookmarkToggle = async () => {
		if (!localIsAuthenticated) {
			setShowLoginModal(true);
			return;
		}

		try {
			const response = await fetch("/api/bookmarks", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userId, articleId }),
			});

			if (response.ok) {
				setIsBookmarked(!isBookmarked);
			} else {
				console.error("Failed to toggle bookmark");
			}
		} catch (error) {
			console.error("Error toggling bookmark:", error);
		}
	};

	return (
		<div className="w-full mx-auto bg-gray-50 min-h-screen flex flex-col pb-12">
			{/* Header */}
			<header className="sticky top-0 bg-white p-4 flex justify-between items-center border-b border-gray-200 shadow-sm z-10">
				<Link href="/">
					<Button variant="ghost" size="icon">
						<ArrowLeft className="w-6 h-6 text-gray-700" />
						<span className="sr-only">{t("back")}</span>
					</Button>
				</Link>
				<Button variant="ghost" size="icon">
					<Share2 className="w-6 h-6 text-gray-700" />
					<span className="sr-only">{t("share")}</span>
				</Button>
			</header>

			{/* Article Content */}
			<article className="flex-grow p-4 md:p-6 max-w-4xl mx-auto w-full">
				<div className="bg-white rounded-lg shadow-md overflow-hidden">
					<div className="relative h-64 md:h-96">
						<Image
							src={article.featuredImage || "/assets/images/fb1.png"}
							alt={getLocalizedContent(article.title)}
							layout="fill"
							objectFit="cover"
						/>
					</div>
					<div className="p-6">
						<div className="flex justify-between items-start mb-4">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								{getLocalizedContent(article.title)}
							</h1>
							<div className="flex items-center space-x-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleFavoriteToggle}
									className={isFavorite ? "text-red-500" : "text-gray-500"}>
									<Heart
										className="w-5 h-5"
										fill={isFavorite ? "currentColor" : "none"}
									/>
									<span className="sr-only">
										{isFavorite ? t("unfavorite") : t("favorite")}
									</span>
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleBookmarkToggle}
									className={isBookmarked ? "text-blue-500" : "text-gray-500"}>
									<Bookmark
										className="w-5 h-5"
										fill={isBookmarked ? "currentColor" : "none"}
									/>
									<span className="sr-only">
										{isBookmarked ? t("unbookmark") : t("bookmark")}
									</span>
								</Button>
							</div>
						</div>

						<div className="flex items-center text-sm text-gray-500 mb-4">
							<Image
								src="/assets/images/file.png?height=32&width=32"
								alt={article.author?.name}
								width={32}
								height={32}
								className="rounded-full mr-2"
							/>
							<span>
								{article.author?.name} •{" "}
								{new Date(article.createdAt).toLocaleDateString()}
							</span>
						</div>

						<div className="prose max-w-none mt-6">
							{getLocalizedContent(article.content)}
						</div>
					</div>
				</div>

				{/* Related Articles */}
				<div className="mt-8">
					<h2 className="text-2xl font-bold mb-4 text-gray-800">
						{t("relatedArticles")}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[1, 2].map((item) => (
							<Card key={item}>
								<CardContent className="p-4">
									<Link href={`/article/${item}`}>
										<h3 className="font-bold mb-2 text-lg text-gray-800 hover:text-blue-600 transition-colors">
											{t("latestNews")} {item}
										</h3>
										<p className="text-sm text-gray-600">
											{t("shortDescription")}
										</p>
									</Link>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</article>

			<LoginModal
				isOpen={showLoginModal}
				onClose={handleLoginModalClose}
				onLoginSuccess={handleLoginSuccess}
			/>

			{/* Interaction Bar */}
			<div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center shadow-sm">
				<div className="flex items-center space-x-4">
					<Button
						variant="ghost"
						size="sm"
						className="flex items-center space-x-1">
						<ThumbsUp className="w-5 h-5 text-blue-500" />
						<span className="text-gray-700">2.5k</span>
						<span className="sr-only">{t("likes")}</span>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="flex items-center space-x-1">
						<MessageSquare className="w-5 h-5 text-green-500" />
						<span className="text-gray-700">128</span>
						<span className="sr-only">{t("comments")}</span>
					</Button>
				</div>
			</div>
		</div>
	);
}

// "use client";

// import { useState, useEffect } from "react";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { LoginModal } from "@/components/LoginModal";

// import Link from "next/link";
// import {
// 	ArrowLeft,
// 	Share2,
// 	ThumbsUp,
// 	MessageSquare,
// 	Bookmark,
// 	Heart,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";

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
// }

// interface ArticleDetailClientProps {
// 	article: Article | any;
// 	isAuthenticated: boolean;
// 	articleId: string;
// 	userId: string | null | any;
// }

// export default function ArticleDetailClient({
// 	article,
// 	isAuthenticated,
// 	articleId,
// 	userId,
// }: ArticleDetailClientProps) {
// 	const { t, language } = useLanguage();
// 	const [showLoginModal, setShowLoginModal] = useState(false);
// 	const [localIsAuthenticated, setLocalIsAuthenticated] =
// 		useState(isAuthenticated);
// 	const [isFavorite, setIsFavorite] = useState(false);

// 	useEffect(() => {
// 		if (!localIsAuthenticated) {
// 			setShowLoginModal(true);
// 		} else {
// 			checkIfFavorite();
// 		}
// 	}, [localIsAuthenticated, articleId, userId]);

// 	const checkIfFavorite = async () => {
// 		if (userId) {
// 			try {
// 				const response = await fetch(
// 					`/api/favorites?userId=${userId}&articleId=${articleId}`
// 				);
// 				const data = await response.json();
// 				setIsFavorite(data.isFavorite);
// 			} catch (error) {
// 				console.error("Error checking favorite status:", error);
// 			}
// 		}
// 	};

// 	const getLocalizedContent = (content: string) => {
// 		try {
// 			const parsedContent = JSON.parse(content);
// 			return (
// 				parsedContent[language as keyof typeof parsedContent] ||
// 				parsedContent.en ||
// 				""
// 			);
// 		} catch (error) {
// 			console.error("Invalid content format:", error);
// 			return "";
// 		}
// 	};

// 	useEffect(() => {
// 		const incrementViewCount = async () => {
// 			try {
// 				await fetch("/api/articles", {
// 					method: "POST",
// 					headers: {
// 						"Content-Type": "application/json",
// 					},
// 					body: JSON.stringify({ articleId: articleId }),
// 				});
// 			} catch (error) {
// 				console.error("Error incrementing view count:", error);
// 			}
// 		};

// 		incrementViewCount();
// 	}, [articleId]);

// 	const handleLoginSuccess = () => {
// 		setLocalIsAuthenticated(true);
// 		setShowLoginModal(false);
// 	};

// 	const handleFavoriteToggle = async () => {
// 		if (!localIsAuthenticated) {
// 			setShowLoginModal(true);
// 			return;
// 		}

// 		try {
// 			const response = await fetch("/api/favorites", {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({ userId, articleId }),
// 			});

// 			if (response.ok) {
// 				setIsFavorite(!isFavorite);
// 			} else {
// 				console.error("Failed to toggle favorite");
// 			}
// 		} catch (error) {
// 			console.error("Error toggling favorite:", error);
// 		}
// 	};

// 	return (
// 		<div className="w-full mx-auto bg-white min-h-screen flex flex-col pb-10">
// 			{/* Header */}
// 			<header className="sticky top-0 bg-white p-4 flex justify-between items-center border-b border-gray-200 shadow-sm">
// 				<Link href="/">
// 					<Button variant="ghost" size="icon">
// 						<ArrowLeft className="w-6 h-6 text-gray-700" />
// 						<span className="sr-only">{t("back")}</span>
// 					</Button>
// 				</Link>
// 				<Button variant="ghost" size="icon">
// 					<Share2 className="w-6 h-6 text-gray-700" />
// 					<span className="sr-only">{t("share")}</span>
// 				</Button>
// 			</header>
// 			{/* Article Content */}
// 			<article className="flex-grow p-4 overflow-y-auto">
// 				<h1 className="text-2xl font-bold mb-2 text-gray-800">
// 					{getLocalizedContent(article.title)}
// 				</h1>

// 				<div className="flex items-center text-sm text-gray-500 mb-4">
// 					<img
// 						src="/assets/images/file.png?height=32&width=32"
// 						alt="Author"
// 						className="w-8 h-8 rounded-full mr-2"
// 					/>
// 					<span>Abebe Teka • 2 hours ago</span>
// 				</div>
// 				{article.featuredImage ? (
// 					<img
// 						src={article.featuredImage}
// 						alt={getLocalizedContent(article.title)}
// 						className="w-full h-64 object-cover rounded-lg mb-4"
// 					/>
// 				) : (
// 					<img
// 						src="/assets/images/fb1.png?height=200&width=375"
// 						alt="Article hero image"
// 						className="w-full h-48 object-cover rounded-lg mb-4"
// 					/>
// 				)}

// 				<p className="text-gray-600 mb-2">
// 					{t("category")}: {t(article.category)}
// 				</p>

// 				<p className="text-gray-600 mb-4">
// 					{new Date(article.createdAt).toLocaleDateString()}
// 				</p>

// 				<div className="prose max-w-none">
// 					{getLocalizedContent(article.content)}
// 				</div>
// 				{/* Related Articles */}
// 				<div className="mt-8">
// 					<h2 className="text-xl font-bold mb-4 text-gray-800">
// 						{t("relatedArticles")}
// 					</h2>
// 					{[1, 2].map((item) => (
// 						<Link key={item} href={`/article/${item}`} className="block mb-4">
// 							<div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
// 								<h3 className="font-bold mb-1 text-gray-800">
// 									{t("latestNews")} {item}
// 								</h3>
// 								<p className="text-sm text-gray-600">{t("shortDescription")}</p>
// 							</div>
// 						</Link>
// 					))}
// 				</div>
// 			</article>
// 			<LoginModal
// 				isOpen={showLoginModal}
// 				onClose={() => setShowLoginModal(false)}
// 				onLoginSuccess={handleLoginSuccess}
// 			/>

// 			{/* Interaction Bar */}
// 			<div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center shadow-sm">
// 				<div className="flex items-center space-x-4">
// 					<Button
// 						variant="ghost"
// 						size="sm"
// 						className="flex items-center space-x-1">
// 						<ThumbsUp className="w-5 h-5 text-primary" />
// 						<span className="text-gray-700">2.5k</span>
// 						<span className="sr-only">{t("likes")}</span>
// 					</Button>
// 					<Button
// 						variant="ghost"
// 						size="sm"
// 						className="flex items-center space-x-1">
// 						<MessageSquare className="w-5 h-5 text-primary" />
// 						<span className="text-gray-700">128</span>
// 						<span className="sr-only">{t("comments")}</span>
// 					</Button>
// 				</div>
// 				<div className="flex items-center space-x-2">
// 					<Button
// 						variant="ghost"
// 						size="icon"
// 						onClick={handleFavoriteToggle}
// 						className={isFavorite ? "text-red-500" : "text-gray-500"}>
// 						<Heart
// 							className="w-5 h-5"
// 							fill={isFavorite ? "currentColor" : "none"}
// 						/>
// 						<span className="sr-only">
// 							{isFavorite ? t("unfavorite") : t("favorite")}
// 						</span>
// 					</Button>
// 					<Button variant="ghost" size="icon">
// 						<Bookmark className="w-5 h-5 text-primary" />
// 						<span className="sr-only">{t("save")}</span>
// 					</Button>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }
