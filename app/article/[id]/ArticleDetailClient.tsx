"use client";

import { DialogTrigger } from "@/components/ui/dialog";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoginModal } from "@/components/LoginModal";
import Link from "next/link";
import Image from "next/image";
import {
	ArrowLeft,
	Share2,
	Bookmark,
	Heart,
	Calendar,
	Clock,
	Eye,
	ChevronRight,
	ChevronLeft,
	Facebook,
	Twitter,
	Linkedin,
	Copy,
	X,
	Printer,
	Mail,
	User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

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
	subcategory?: {
		id: string;
		name: string;
	};
	author: {
		id: string;
		name: string;
		profilePicture?: string;
	};
	viewCount: number;
	uniqueViewCount?: number;
	tags: Array<{ id: string; name: string }>;
	likeCount?: number;
	commentCount?: number;
	isLiked?: boolean;
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
}: ArticleDetailClientProps | any) {
	const { t, language } = useLanguage();
	const router = useRouter();
	const { toast } = useToast();
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [localIsAuthenticated, setLocalIsAuthenticated] =
		useState(isAuthenticated);
	const [isFavorite, setIsFavorite] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
	const [showShareDialog, setShowShareDialog] = useState(false);
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const [viewCount, setViewCount] = useState(article.viewCount || 0);
	const [uniqueViewCount, setUniqueViewCount] = useState(
		article.uniqueViewCount || 0
	);
	const [likeCount, setLikeCount] = useState(article.likeCount || 0);
	const [commentCount, setCommentCount] = useState(article.commentCount || 0);
	const [isLiked, setIsLiked] = useState(article.isLiked || false);
	const [readingProgress, setReadingProgress] = useState(0);
	const articleRef = useRef<HTMLDivElement>(null);
	const [showTableOfContents, setShowTableOfContents] = useState(false);
	const [activeSection, setActiveSection] = useState("");
	const [fontSizeLevel, setFontSizeLevel] = useState(1); // 0: small, 1: medium, 2: large
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [galleryImages, setGalleryImages] = useState<string[]>([]);

	// Move this function up, before generateTableOfContents is defined
	const getLocalizedContent = (content: LocalizedContent) => {
		try {
			if (typeof content === "string") {
				const parsedContent = JSON.parse(content);
				return (
					parsedContent[language as keyof typeof parsedContent] ||
					parsedContent.en ||
					""
				);
			}
			return content[language as keyof LocalizedContent] || content.en || "";
		} catch (error) {
			console.error("Invalid content format:", error);
			return "";
		}
	};

	// Generate table of contents from article content
	const generateTableOfContents = useCallback(() => {
		const content = getLocalizedContent(article.content);
		const paragraphs = content
			.split("\n\n")
			.filter((section: any) => section.trim().length > 0);

		// Create a more meaningful table of contents
		return [
			{ id: "article-headline", title: t("headline") },
			{ id: "article-summary", title: t("summary") },
			{ id: "article-details", title: t("details") },
			{ id: "article-conclusion", title: t("conclusion") },
		];
	}, [article.content, t]);

	const [tableOfContents] = useState(generateTableOfContents);

	useEffect(() => {
		// Set up gallery images
		const images = [];
		if (article.featuredImage) {
			images.push(article.featuredImage);
		}

		// Add placeholder images if needed
		while (images.length < 3) {
			images.push(
				`/placeholder.svg?height=600&width=800&text=Image+${images.length + 1}`
			);
		}

		setGalleryImages(images);
	}, [article.featuredImage]);

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

	const fetchRelatedArticles = useCallback(async () => {
		try {
			setIsLoading(true);
			// Fetch related articles based on the current article's category
			const categoryId = article.category?.id || "all";
			const response = await fetch(
				`/api/articles?page=1&category=${categoryId}`
			);
			const data = await response.json();

			// Filter out the current article and limit to 4 articles
			const filtered = data.articles
				.filter((a: Article) => a.id !== articleId)
				.slice(0, 4);

			setRelatedArticles(filtered);
		} catch (error) {
			console.error("Error fetching related articles:", error);
		} finally {
			setIsLoading(false);
		}
	}, [articleId, article.category?.id]);

	useEffect(() => {
		if (localIsAuthenticated) {
			checkIfFavorite();
			checkIfBookmarked();
		}
		fetchRelatedArticles();
	}, [
		localIsAuthenticated,
		checkIfFavorite,
		checkIfBookmarked,
		fetchRelatedArticles,
	]);

	useEffect(() => {
		const incrementViewCount = async () => {
			try {
				// Only increment view count once when the component mounts
				const response = await fetch("/api/articles/view", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						articleId: articleId,
						userId: userId || undefined,
					}),
				});

				if (response.ok) {
					const data = await response.json();
					setViewCount(data.viewCount);
					setUniqueViewCount(data.uniqueViewCount);
				}
			} catch (error) {
				console.error("Error incrementing view count:", error);
			}
		};

		// Only run once when component mounts
		incrementViewCount();
		// Remove articleId and userId from dependencies to prevent multiple calls
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			if (!articleRef.current) return;

			const element = articleRef.current;
			const totalHeight = element.scrollHeight - element.clientHeight;
			const scrollPosition = element.scrollTop;

			const progress = (scrollPosition / totalHeight) * 100;
			setReadingProgress(progress);

			// Update active section based on scroll position
			const sections = document.querySelectorAll('[id^="article-"]');
			let currentSection = "";

			sections.forEach((section) => {
				const rect = section.getBoundingClientRect();
				if (rect.top <= 200) {
					currentSection = section.id;
				}
			});

			if (currentSection) {
				setActiveSection(currentSection);
			}
		};

		const articleElement = articleRef.current;
		if (articleElement) {
			articleElement.addEventListener("scroll", handleScroll);
		}

		return () => {
			if (articleElement) {
				articleElement.removeEventListener("scroll", handleScroll);
			}
		};
	}, []);

	const handleLoginSuccess = () => {
		setLocalIsAuthenticated(true);
		setShowLoginModal(false);
		checkIfFavorite();
		checkIfBookmarked();
	};

	const handleLoginModalClose = () => {
		setShowLoginModal(false);
		if (!localIsAuthenticated) {
			router.push("/");
		}
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
				toast({
					title: isFavorite ? t("removedFromFavorites") : t("addedToFavorites"),
					description: isFavorite
						? t("articleRemovedFromFavorites")
						: t("articleAddedToFavorites"),
					variant: isFavorite ? "destructive" : "default",
				});
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
				toast({
					title: isBookmarked
						? t("removedFromBookmarks")
						: t("addedToBookmarks"),
					description: isBookmarked
						? t("articleRemovedFromBookmarks")
						: t("articleAddedToBookmarks"),
					variant: isBookmarked ? "destructive" : "default",
				});
			} else {
				console.error("Failed to toggle bookmark");
			}
		} catch (error) {
			console.error("Error toggling bookmark:", error);
		}
	};

	const handleLikeToggle = async () => {
		if (!localIsAuthenticated) {
			setShowLoginModal(true);
			return;
		}

		try {
			const response = await fetch("/api/likes", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userId, articleId }),
			});

			if (response.ok) {
				const newIsLiked = !isLiked;
				setIsLiked(newIsLiked);
				setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

				toast({
					title: newIsLiked ? t("articleLiked") : t("articleUnliked"),
					description: newIsLiked
						? t("youLikedThisArticle")
						: t("youUnlikedThisArticle"),
					variant: "default",
				});
			} else {
				console.error("Failed to toggle like");
			}
		} catch (error) {
			console.error("Error toggling like:", error);
		}
	};

	const handleShare = (platform: string) => {
		const url = window.location.href;
		const title = getLocalizedContent(article.title);

		let shareUrl = "";

		switch (platform) {
			case "facebook":
				shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
					url
				)}`;
				break;
			case "twitter":
				shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
					url
				)}&text=${encodeURIComponent(title)}`;
				break;
			case "linkedin":
				shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
					url
				)}`;
				break;
			case "copy":
				navigator.clipboard.writeText(url);
				toast({
					title: t("linkCopied"),
					description: t("articleLinkCopied"),
				});
				setShowShareDialog(false);
				return;
			case "print":
				window.print();
				setShowShareDialog(false);
				return;
			case "email":
				shareUrl = `mailto:?subject=${encodeURIComponent(
					title
				)}&body=${encodeURIComponent(url)}`;
				break;
		}

		if (shareUrl) {
			window.open(shareUrl, "_blank");
		}

		setShowShareDialog(false);
	};

	const handleNextImage = () => {
		setActiveImageIndex((prev) =>
			prev === galleryImages.length - 1 ? 0 : prev + 1
		);
	};

	const handlePrevImage = () => {
		setActiveImageIndex((prev) =>
			prev === 0 ? galleryImages.length - 1 : prev - 1
		);
	};

	const handleFontSizeChange = (level: number) => {
		setFontSizeLevel(level);
	};

	const handleToggleDarkMode = () => {
		setIsDarkMode(!isDarkMode);
		document.documentElement.classList.toggle("dark");
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat(
			language === "en" ? "en-US" : language === "am" ? "am-ET" : "om-ET",
			{
				year: "numeric",
				month: "long",
				day: "numeric",
			}
		).format(date);
	};

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat(
			language === "en" ? "en-US" : language === "am" ? "am-ET" : "om-ET"
		).format(num);
	};

	// Estimate reading time based on content length
	const calculateReadingTime = (content: string) => {
		const wordsPerMinute = 200;
		const words = content.trim().split(/\s+/).length;
		const minutes = Math.ceil(words / wordsPerMinute);
		return minutes;
	};

	const readingTime = calculateReadingTime(
		getLocalizedContent(article.content)
	);

	const fontSizeClass =
		fontSizeLevel === 0
			? "text-sm"
			: fontSizeLevel === 2
			? "text-lg"
			: "text-base";

	// Split content into sections for better readability
	const formatContent = (content: string) => {
		const paragraphs = content.split("\n\n");
		return paragraphs;
	};

	const contentParagraphs = formatContent(getLocalizedContent(article.content));

	if (!localIsAuthenticated && !showLoginModal) {
		setShowLoginModal(true);
		return null;
	}

	return (
		<div
			className={`w-full mx-auto min-h-screen flex flex-col pb-12 ${
				isDarkMode ? "dark" : ""
			}`}>
			{/* Reading Progress Bar */}
			<div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
				<div
					className="h-full bg-primary transition-all duration-300 ease-out"
					style={{ width: `${readingProgress}%` }}
				/>
			</div>

			{/* Header */}
			<header className="sticky top-0 bg-background border-b border-border shadow-sm z-40 px-4 py-2">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<div className="flex items-center space-x-4">
						<Link href="/">
							<Button variant="ghost" size="icon" className="rounded-full">
								<ArrowLeft className="w-5 h-5" />
								<span className="sr-only">{t("back")}</span>
							</Button>
						</Link>
						<div className="hidden md:block">
							<h2 className="text-sm font-medium truncate max-w-md">
								{getLocalizedContent(article.title)}
							</h2>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="rounded-full"
										onClick={() =>
											setShowTableOfContents(!showTableOfContents)
										}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round">
											<line x1="3" y1="6" x2="21" y2="6"></line>
											<line x1="3" y1="12" x2="21" y2="12"></line>
											<line x1="3" y1="18" x2="21" y2="18"></line>
										</svg>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>{t("tableOfContents")}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="rounded-full"
										onClick={handleToggleDarkMode}>
										{isDarkMode ? (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round">
												<circle cx="12" cy="12" r="5"></circle>
												<line x1="12" y1="1" x2="12" y2="3"></line>
												<line x1="12" y1="21" x2="12" y2="23"></line>
												<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
												<line
													x1="18.36"
													y1="18.36"
													x2="19.78"
													y2="19.78"></line>
												<line x1="1" y1="12" x2="3" y2="12"></line>
												<line x1="21" y1="12" x2="23" y2="12"></line>
												<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
												<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
											</svg>
										) : (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round">
												<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
											</svg>
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>{isDarkMode ? t("lightMode") : t("darkMode")}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="rounded-full">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round">
										<circle cx="12" cy="12" r="1"></circle>
										<circle cx="19" cy="12" r="1"></circle>
										<circle cx="5" cy="12" r="1"></circle>
									</svg>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => handleFontSizeChange(0)}>
									<span className="text-sm mr-2">A</span> {t("smallText")}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleFontSizeChange(1)}>
									<span className="text-base mr-2">A</span> {t("mediumText")}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleFontSizeChange(2)}>
									<span className="text-lg mr-2">A</span> {t("largeText")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
							<DialogTrigger asChild>
								<Button variant="ghost" size="icon" className="rounded-full">
									<Share2 className="w-5 h-5" />
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>{t("shareArticle")}</DialogTitle>
									<DialogDescription>
										{t("shareArticleDescription")}
									</DialogDescription>
								</DialogHeader>
								<div className="grid grid-cols-4 gap-4 py-4">
									<Button
										variant="outline"
										className="flex flex-col items-center justify-center h-20"
										onClick={() => handleShare("facebook")}>
										<Facebook className="h-8 w-8 text-blue-600 mb-1" />
										<span className="text-xs">Facebook</span>
									</Button>
									<Button
										variant="outline"
										className="flex flex-col items-center justify-center h-20"
										onClick={() => handleShare("twitter")}>
										<Twitter className="h-8 w-8 text-blue-400 mb-1" />
										<span className="text-xs">Twitter</span>
									</Button>
									<Button
										variant="outline"
										className="flex flex-col items-center justify-center h-20"
										onClick={() => handleShare("linkedin")}>
										<Linkedin className="h-8 w-8 text-blue-700 mb-1" />
										<span className="text-xs">LinkedIn</span>
									</Button>
									<Button
										variant="outline"
										className="flex flex-col items-center justify-center h-20"
										onClick={() => handleShare("email")}>
										<Mail className="h-8 w-8 text-gray-600 mb-1" />
										<span className="text-xs">Email</span>
									</Button>
									<Button
										variant="outline"
										className="flex flex-col items-center justify-center h-20"
										onClick={() => handleShare("copy")}>
										<Copy className="h-8 w-8 text-gray-600 mb-1" />
										<span className="text-xs">{t("copyLink")}</span>
									</Button>
									<Button
										variant="outline"
										className="flex flex-col items-center justify-center h-20"
										onClick={() => handleShare("print")}>
										<Printer className="h-8 w-8 text-gray-600 mb-1" />
										<span className="text-xs">{t("print")}</span>
									</Button>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</header>

			<div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 py-6 gap-6">
				{/* Table of Contents Sidebar (Desktop) */}
				<AnimatePresence>
					{showTableOfContents && (
						<motion.aside
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.3 }}
							className="hidden md:block w-64 sticky top-20 self-start">
							<div className="bg-card rounded-lg shadow-sm border border-border p-4">
								<h3 className="font-bold text-lg mb-4">
									{t("tableOfContents")}
								</h3>
								<nav>
									<ul className="space-y-2">
										{tableOfContents.map((section) => (
											<li key={section.id}>
												<a
													href={`#${section.id}`}
													className={`block py-1 px-2 rounded-md transition-colors ${
														activeSection === section.id
															? "bg-primary/10 text-primary font-medium"
															: "hover:bg-muted"
													}`}>
													{section.title}
												</a>
											</li>
										))}
									</ul>
								</nav>

								<div className="mt-6 pt-4 border-t border-border">
									<h4 className="font-medium text-sm mb-2">
										{t("articleInfo")}
									</h4>
									<div className="space-y-2 text-sm text-muted-foreground">
										<div className="flex items-center">
											<Calendar className="w-4 h-4 mr-2" />
											<span>{formatDate(article.createdAt)}</span>
										</div>
										<div className="flex items-center">
											<Eye className="w-4 h-4 mr-2" />
											<span>
												{formatNumber(viewCount)} {t("views")}
											</span>
										</div>
										<div className="flex items-center">
											<Clock className="w-4 h-4 mr-2" />
											<span>
												{readingTime} {t("minRead")}
											</span>
										</div>
									</div>
								</div>
							</div>
						</motion.aside>
					)}
				</AnimatePresence>

				{/* Main Content */}
				<main className="flex-1">
					<article
						ref={articleRef}
						className={`bg-card rounded-lg shadow-sm border border-border overflow-hidden ${fontSizeClass}`}>
						{/* Image Gallery */}
						<div className="relative">
							<div className="relative h-64 md:h-96 overflow-hidden">
								<AnimatePresence mode="wait">
									<motion.div
										key={activeImageIndex}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.5 }}
										className="absolute inset-0">
										<Image
											src={
												galleryImages[activeImageIndex] || "/placeholder.svg"
											}
											alt={getLocalizedContent(article.title)}
											fill
											className="object-cover"
											unoptimized
										/>
									</motion.div>
								</AnimatePresence>

								{galleryImages.length > 1 && (
									<>
										<Button
											variant="ghost"
											size="icon"
											className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full hover:bg-black/50"
											onClick={handlePrevImage}>
											<ChevronLeft className="h-6 w-6" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full hover:bg-black/50"
											onClick={handleNextImage}>
											<ChevronRight className="h-6 w-6" />
										</Button>

										<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
											{galleryImages.map((_, index) => (
												<button
													key={index}
													className={`w-2 h-2 rounded-full ${
														index === activeImageIndex
															? "bg-white"
															: "bg-white/50"
													}`}
													onClick={() => setActiveImageIndex(index)}
												/>
											))}
										</div>
									</>
								)}
							</div>

							<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
								<Badge className="mb-2 bg-primary">
									{article.category?.name || t("uncategorized")}
								</Badge>
								<h1 className="text-2xl md:text-3xl font-bold text-white">
									{getLocalizedContent(article.title)}
								</h1>
							</div>
						</div>

						<div className="p-6">
							{/* Author and Date */}
							<div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
								<div className="flex items-center">
									<Avatar className="h-10 w-10 mr-3">
										<AvatarImage
											src={
												article.author?.profilePicture ||
												"/placeholder.svg?height=40&width=40"
											}
											alt={article.author?.name}
										/>
										<AvatarFallback>
											{article.author?.name?.charAt(0) || (
												<User className="h-6 w-6" />
											)}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium">{article.author?.name}</p>
										<p className="text-sm text-muted-foreground">
											{formatDate(article.createdAt)}
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<div className="flex items-center text-sm text-muted-foreground">
										<Eye className="w-4 h-4 mr-1" />
										<span>{formatNumber(viewCount)}</span>
									</div>
									<div className="flex items-center text-sm text-muted-foreground">
										<Clock className="w-4 h-4 mr-1" />
										<span>
											{readingTime} {t("minRead")}
										</span>
									</div>
								</div>
							</div>

							{/* Article Title (Beautiful Heading) */}
							<div id="article-headline" className="mb-8 text-center">
								<h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-4">
									{getLocalizedContent(article.title)}
								</h1>
								<div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
							</div>

							{/* Article Content */}
							<div className="article-content prose prose-lg dark:prose-invert max-w-3xl mx-auto">
								{/* Summary/Lead Paragraph */}
								{contentParagraphs.length > 0 && (
									<div id="article-summary" className="mb-8">
										<p className="text-xl font-medium leading-relaxed border-l-4 border-primary pl-4 italic">
											{contentParagraphs[0]}
										</p>
									</div>
								)}

								{/* Main Content */}
								<div id="article-details" className="space-y-6">
									{contentParagraphs.slice(1, -1).map((paragraph, index) => (
										<p key={index} className="leading-relaxed">
											{paragraph}
										</p>
									))}
								</div>

								{/* Conclusion */}
								{contentParagraphs.length > 1 && (
									<div
										id="article-conclusion"
										className="mt-8 pt-6 border-t border-border/30">
										<p className="font-medium">
											{contentParagraphs[contentParagraphs.length - 1]}
										</p>
									</div>
								)}
							</div>

							{/* Tags */}
							<div className="mt-8 pt-4 border-t border-border">
								<h3 className="font-medium mb-2">{t("tags")}</h3>
								<div className="flex flex-wrap gap-2">
									{article.tags && article.tags.length > 0 ? (
										article.tags.map((tag) => (
											<Badge
												key={tag.id}
												variant="outline"
												className="bg-muted/50">
												{tag.name}
											</Badge>
										))
									) : (
										<>
											<Badge variant="outline" className="bg-muted/50">
												{article.category?.name || "Sports"}
											</Badge>
											<Badge variant="outline" className="bg-muted/50">
												News
											</Badge>
										</>
									)}
								</div>
							</div>

							{/* Action Buttons */}
							<div className="mt-8 pt-4 border-t border-border flex justify-end items-center">
								<div className="flex items-center space-x-2">
									<Button
										variant="ghost"
										size="sm"
										className={`flex items-center space-x-1 ${
											isFavorite ? "text-red-500" : ""
										}`}
										onClick={handleFavoriteToggle}>
										<Heart
											className="w-5 h-5"
											fill={isFavorite ? "currentColor" : "none"}
										/>
										<span>{isFavorite ? t("favorited") : t("favorite")}</span>
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className={`flex items-center space-x-1 ${
											isBookmarked ? "text-blue-500" : ""
										}`}
										onClick={handleBookmarkToggle}>
										<Bookmark
											className="w-5 h-5"
											fill={isBookmarked ? "currentColor" : "none"}
										/>
										<span>
											{isBookmarked ? t("bookmarked") : t("bookmark")}
										</span>
									</Button>
								</div>
							</div>
						</div>
					</article>

					{/* Related Articles */}
					<div className="mt-8">
						<h2 className="text-2xl font-bold mb-4">{t("relatedArticles")}</h2>
						{isLoading ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{[1, 2, 3, 4].map((item) => (
									<Card key={item} className="overflow-hidden">
										<Skeleton className="h-48 w-full" />
										<CardContent className="p-4">
											<Skeleton className="h-6 w-3/4 mb-2" />
											<Skeleton className="h-4 w-full mb-1" />
											<Skeleton className="h-4 w-2/3" />
										</CardContent>
									</Card>
								))}
							</div>
						) : relatedArticles.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{relatedArticles.map((relatedArticle) => (
									<motion.div
										key={relatedArticle.id}
										whileHover={{ y: -5 }}
										transition={{ type: "spring", stiffness: 300 }}>
										<Link href={`/article/${relatedArticle.id}`}>
											<Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
												<div className="relative h-48">
													<Image
														src={
															relatedArticle.featuredImage ||
															"/placeholder.svg?height=200&width=400" ||
															"/placeholder.svg" ||
															"/placeholder.svg" ||
															"/placeholder.svg" ||
															"/placeholder.svg"
														}
														alt={getLocalizedContent(relatedArticle.title)}
														fill
														className="object-cover"
														unoptimized
													/>
												</div>
												<CardContent className="p-4 flex-grow">
													<Badge className="mb-2">
														{relatedArticle.category?.name ||
															t("uncategorized")}
													</Badge>
													<h3 className="font-bold text-lg mb-2 line-clamp-2">
														{getLocalizedContent(relatedArticle.title)}
													</h3>
													<p className="text-sm text-muted-foreground line-clamp-2">
														{getLocalizedContent(relatedArticle.content)}
													</p>
												</CardContent>
											</Card>
										</Link>
									</motion.div>
								))}
							</div>
						) : (
							<Card className="p-8 text-center">
								<p className="text-muted-foreground">
									{t("noRelatedArticles")}
								</p>
							</Card>
						)}
					</div>
				</main>
			</div>

			{/* Mobile Table of Contents */}
			<AnimatePresence>
				{showTableOfContents && (
					<motion.div
						initial={{ opacity: 0, y: 100 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 100 }}
						className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
						<div className="max-w-md mx-auto">
							<div className="flex justify-between items-center mb-2">
								<h3 className="font-bold">{t("tableOfContents")}</h3>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowTableOfContents(false)}>
									<X className="h-4 w-4" />
								</Button>
							</div>
							<nav>
								<ul className="space-y-2">
									{tableOfContents.map((section) => (
										<li key={section.id}>
											<a
												href={`#${section.id}`}
												className={`block py-2 px-3 rounded-md transition-colors ${
													activeSection === section.id
														? "bg-primary/10 text-primary font-medium"
														: "hover:bg-muted"
												}`}
												onClick={() => setShowTableOfContents(false)}>
												{section.title}
											</a>
										</li>
									))}
								</ul>
							</nav>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Floating Action Button (Mobile) */}
			<div className="md:hidden fixed bottom-4 right-4 z-30 flex flex-col space-y-2">
				<Button
					size="icon"
					className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
					onClick={() => setShowShareDialog(true)}>
					<Share2 className="h-5 w-5" />
				</Button>
			</div>

			<LoginModal
				isOpen={showLoginModal}
				onClose={handleLoginModalClose}
				onLoginSuccess={handleLoginSuccess}
			/>
		</div>
	);
}

// "use client";

// import { DialogTrigger } from "@/components/ui/dialog";

// import { useState, useEffect, useCallback, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { LoginModal } from "@/components/LoginModal";
// import Link from "next/link";
// import Image from "next/image";
// import {
// 	ArrowLeft,
// 	Share2,
// 	ThumbsUp,
// 	MessageSquare,
// 	Bookmark,
// 	Heart,
// 	Calendar,
// 	Clock,
// 	Eye,
// 	ChevronRight,
// 	ChevronLeft,
// 	Facebook,
// 	Twitter,
// 	Linkedin,
// 	Copy,
// 	X,
// 	Printer,
// 	Mail,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import {
// 	Tooltip,
// 	TooltipContent,
// 	TooltipProvider,
// 	TooltipTrigger,
// } from "@/components/ui/tooltip";
// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuItem,
// 	DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogDescription,
// 	DialogHeader,
// 	DialogTitle,
// } from "@/components/ui/dialog";
// import { motion, AnimatePresence } from "framer-motion";
// import { useToast } from "@/hooks/use-toast";
// import { Skeleton } from "@/components/ui/skeleton";

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
// 	author: {
// 		name: string;
// 		avatar: string;
// 	};
// 	viewCount?: number;
// }

// interface ArticleDetailClientProps {
// 	article: Article;
// 	isAuthenticated: boolean;
// 	articleId: string;
// 	userId: string | null;
// }

// export default function ArticleDetailClient({
// 	article,
// 	isAuthenticated,
// 	articleId,
// 	userId,
// }: ArticleDetailClientProps | any) {
// 	const { t, language } = useLanguage();
// 	const router = useRouter();
// 	const { toast } = useToast();
// 	const [showLoginModal, setShowLoginModal] = useState(false);
// 	const [localIsAuthenticated, setLocalIsAuthenticated] =
// 		useState(isAuthenticated);
// 	const [isFavorite, setIsFavorite] = useState(false);
// 	const [isBookmarked, setIsBookmarked] = useState(false);
// 	const [isLoading, setIsLoading] = useState(true);
// 	const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
// 	const [showShareDialog, setShowShareDialog] = useState(false);
// 	const [activeImageIndex, setActiveImageIndex] = useState(0);
// 	const [viewCount, setViewCount] = useState(article.viewCount || 0);
// 	const [likeCount, setLikeCount] = useState(
// 		Math.floor(Math.random() * 1000) + 500
// 	);
// 	const [commentCount, setCommentCount] = useState(
// 		Math.floor(Math.random() * 200) + 50
// 	);
// 	const [isLiked, setIsLiked] = useState(false);
// 	const [readingProgress, setReadingProgress] = useState(0);
// 	const articleRef = useRef<HTMLDivElement>(null);
// 	const [showTableOfContents, setShowTableOfContents] = useState(false);
// 	const [activeSection, setActiveSection] = useState("");
// 	const [fontSizeLevel, setFontSizeLevel] = useState(1); // 0: small, 1: medium, 2: large
// 	const [isDarkMode, setIsDarkMode] = useState(false);

// 	const galleryImages = [
// 		article.featuredImage || "/assets/images/fb1.png?height=600&width=800",
// 		"/assets/images/fb2.png?height=600&width=800&text=Image+2",
// 		"/assets/images/fb1.png?height=600&width=800&text=Image+3",
// 	];

// 	// Mock table of contents
// 	const tableOfContents = [
// 		{ id: "section-1", title: t("introduction") },
// 		{ id: "section-2", title: t("mainContent") },
// 		{ id: "section-3", title: t("conclusion") },
// 	];

// 	const checkIfFavorite = useCallback(async () => {
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
// 	}, [userId, articleId]);

// 	const checkIfBookmarked = useCallback(async () => {
// 		if (userId) {
// 			try {
// 				const response = await fetch(
// 					`/api/bookmarks?userId=${userId}&articleId=${articleId}`
// 				);
// 				const data = await response.json();
// 				setIsBookmarked(data.isBookmarked);
// 			} catch (error) {
// 				console.error("Error checking bookmark status:", error);
// 			}
// 		}
// 	}, [userId, articleId]);

// 	const fetchRelatedArticles = useCallback(async () => {
// 		try {
// 			setIsLoading(true);
// 			// In a real app, you would fetch related articles based on the current article
// 			// For now, we'll just fetch the first page of articles
// 			const response = await fetch(`/api/articles?page=1&category=all`);
// 			const data = await response.json();

// 			// Filter out the current article and limit to 4 articles
// 			const filtered = data.articles
// 				.filter((a: Article) => a.id !== articleId)
// 				.slice(0, 4);

// 			setRelatedArticles(filtered);
// 		} catch (error) {
// 			console.error("Error fetching related articles:", error);
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	}, [articleId]);

// 	useEffect(() => {
// 		if (localIsAuthenticated) {
// 			checkIfFavorite();
// 			checkIfBookmarked();
// 		}
// 		fetchRelatedArticles();
// 	}, [
// 		localIsAuthenticated,
// 		checkIfFavorite,
// 		checkIfBookmarked,
// 		fetchRelatedArticles,
// 	]);

// 	useEffect(() => {
// 		const incrementViewCount = async () => {
// 			try {
// 				const response = await fetch("/api/articles", {
// 					method: "POST",
// 					headers: {
// 						"Content-Type": "application/json",
// 					},
// 					body: JSON.stringify({ articleId: articleId }),
// 				});

// 				if (response.ok) {
// 					const data = await response.json();
// 					setViewCount(data.viewCount);
// 				}
// 			} catch (error) {
// 				console.error("Error incrementing view count:", error);
// 			}
// 		};

// 		incrementViewCount();
// 	}, [articleId]);

// 	useEffect(() => {
// 		const handleScroll = () => {
// 			if (!articleRef.current) return;

// 			const element = articleRef.current;
// 			const totalHeight = element.scrollHeight - element.clientHeight;
// 			const scrollPosition = element.scrollTop;

// 			const progress = (scrollPosition / totalHeight) * 100;
// 			setReadingProgress(progress);

// 			// Update active section based on scroll position
// 			const sections = document.querySelectorAll('[id^="section-"]');
// 			let currentSection = "";

// 			sections.forEach((section) => {
// 				const rect = section.getBoundingClientRect();
// 				if (rect.top <= 200) {
// 					currentSection = section.id;
// 				}
// 			});

// 			if (currentSection) {
// 				setActiveSection(currentSection);
// 			}
// 		};

// 		const articleElement = articleRef.current;
// 		if (articleElement) {
// 			articleElement.addEventListener("scroll", handleScroll);
// 		}

// 		return () => {
// 			if (articleElement) {
// 				articleElement.removeEventListener("scroll", handleScroll);
// 			}
// 		};
// 	}, []);

// 	const getLocalizedContent = (content: LocalizedContent) => {
// 		try {
// 			if (typeof content === "string") {
// 				const parsedContent = JSON.parse(content);
// 				return (
// 					parsedContent[language as keyof typeof parsedContent] ||
// 					parsedContent.en ||
// 					""
// 				);
// 			}
// 			return content[language as keyof LocalizedContent] || content.en || "";
// 		} catch (error) {
// 			console.error("Invalid content format:", error);
// 			return "";
// 		}
// 	};

// 	const handleLoginSuccess = () => {
// 		setLocalIsAuthenticated(true);
// 		setShowLoginModal(false);
// 		checkIfFavorite();
// 		checkIfBookmarked();
// 	};

// 	const handleLoginModalClose = () => {
// 		setShowLoginModal(false);
// 		if (!localIsAuthenticated) {
// 			router.push("/");
// 		}
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
// 				toast({
// 					title: isFavorite ? t("removedFromFavorites") : t("addedToFavorites"),
// 					description: isFavorite
// 						? t("articleRemovedFromFavorites")
// 						: t("articleAddedToFavorites"),
// 					variant: isFavorite ? "destructive" : "default",
// 				});
// 			} else {
// 				console.error("Failed to toggle favorite");
// 			}
// 		} catch (error) {
// 			console.error("Error toggling favorite:", error);
// 		}
// 	};

// 	const handleBookmarkToggle = async () => {
// 		if (!localIsAuthenticated) {
// 			setShowLoginModal(true);
// 			return;
// 		}

// 		try {
// 			const response = await fetch("/api/bookmarks", {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({ userId, articleId }),
// 			});

// 			if (response.ok) {
// 				setIsBookmarked(!isBookmarked);
// 				toast({
// 					title: isBookmarked
// 						? t("removedFromBookmarks")
// 						: t("addedToBookmarks"),
// 					description: isBookmarked
// 						? t("articleRemovedFromBookmarks")
// 						: t("articleAddedToBookmarks"),
// 					variant: isBookmarked ? "destructive" : "default",
// 				});
// 			} else {
// 				console.error("Failed to toggle bookmark");
// 			}
// 		} catch (error) {
// 			console.error("Error toggling bookmark:", error);
// 		}
// 	};

// 	const handleLikeToggle = () => {
// 		if (!localIsAuthenticated) {
// 			setShowLoginModal(true);
// 			return;
// 		}

// 		setIsLiked(!isLiked);
// 		setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
// 	};

// 	const handleShare = (platform: string) => {
// 		const url = window.location.href;
// 		const title = getLocalizedContent(article.title);

// 		let shareUrl = "";

// 		switch (platform) {
// 			case "facebook":
// 				shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
// 					url
// 				)}`;
// 				break;
// 			case "twitter":
// 				shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
// 					url
// 				)}&text=${encodeURIComponent(title)}`;
// 				break;
// 			case "linkedin":
// 				shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
// 					url
// 				)}`;
// 				break;
// 			case "copy":
// 				navigator.clipboard.writeText(url);
// 				toast({
// 					title: t("linkCopied"),
// 					description: t("articleLinkCopied"),
// 				});
// 				setShowShareDialog(false);
// 				return;
// 			case "print":
// 				window.print();
// 				setShowShareDialog(false);
// 				return;
// 			case "email":
// 				shareUrl = `mailto:?subject=${encodeURIComponent(
// 					title
// 				)}&body=${encodeURIComponent(url)}`;
// 				break;
// 		}

// 		if (shareUrl) {
// 			window.open(shareUrl, "_blank");
// 		}

// 		setShowShareDialog(false);
// 	};

// 	const handleNextImage = () => {
// 		setActiveImageIndex((prev) =>
// 			prev === galleryImages.length - 1 ? 0 : prev + 1
// 		);
// 	};

// 	const handlePrevImage = () => {
// 		setActiveImageIndex((prev) =>
// 			prev === 0 ? galleryImages.length - 1 : prev - 1
// 		);
// 	};

// 	const handleFontSizeChange = (level: number) => {
// 		setFontSizeLevel(level);
// 	};

// 	const handleToggleDarkMode = () => {
// 		setIsDarkMode(!isDarkMode);
// 		document.documentElement.classList.toggle("dark");
// 	};

// 	const formatDate = (dateString: string) => {
// 		const date = new Date(dateString);
// 		return new Intl.DateTimeFormat(
// 			language === "en" ? "en-US" : language === "am" ? "am-ET" : "om-ET",
// 			{
// 				year: "numeric",
// 				month: "long",
// 				day: "numeric",
// 			}
// 		).format(date);
// 	};

// 	const formatNumber = (num: number) => {
// 		return new Intl.NumberFormat(
// 			language === "en" ? "en-US" : language === "am" ? "am-ET" : "om-ET"
// 		).format(num);
// 	};

// 	const fontSizeClass =
// 		fontSizeLevel === 0
// 			? "text-sm"
// 			: fontSizeLevel === 2
// 			? "text-lg"
// 			: "text-base";

// 	if (!localIsAuthenticated && !showLoginModal) {
// 		return null;
// 	}

// 	return (
// 		<div
// 			className={`w-full mx-auto min-h-screen flex flex-col pb-12 ${
// 				isDarkMode ? "dark" : ""
// 			}`}>
// 			{/* Reading Progress Bar */}
// 			<div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
// 				<div
// 					className="h-full bg-primary transition-all duration-300 ease-out"
// 					style={{ width: `${readingProgress}%` }}
// 				/>
// 			</div>

// 			{/* Header */}
// 			<header className="sticky top-0 bg-background border-b border-border shadow-sm z-40 px-4 py-2">
// 				<div className="max-w-7xl mx-auto flex justify-between items-center">
// 					<div className="flex items-center space-x-4">
// 						<Link href="/">
// 							<Button variant="ghost" size="icon" className="rounded-full">
// 								<ArrowLeft className="w-5 h-5" />
// 								<span className="sr-only">{t("back")}</span>
// 							</Button>
// 						</Link>
// 						<div className="hidden md:block">
// 							<h2 className="text-sm font-medium truncate max-w-md">
// 								{getLocalizedContent(article.title)}
// 							</h2>
// 						</div>
// 					</div>

// 					<div className="flex items-center space-x-2">
// 						<TooltipProvider>
// 							<Tooltip>
// 								<TooltipTrigger asChild>
// 									<Button
// 										variant="ghost"
// 										size="icon"
// 										className="rounded-full"
// 										onClick={() =>
// 											setShowTableOfContents(!showTableOfContents)
// 										}>
// 										<svg
// 											xmlns="http://www.w3.org/2000/svg"
// 											width="20"
// 											height="20"
// 											viewBox="0 0 24 24"
// 											fill="none"
// 											stroke="currentColor"
// 											strokeWidth="2"
// 											strokeLinecap="round"
// 											strokeLinejoin="round">
// 											<line x1="3" y1="6" x2="21" y2="6"></line>
// 											<line x1="3" y1="12" x2="21" y2="12"></line>
// 											<line x1="3" y1="18" x2="21" y2="18"></line>
// 										</svg>
// 									</Button>
// 								</TooltipTrigger>
// 								<TooltipContent>
// 									<p>{t("tableOfContents")}</p>
// 								</TooltipContent>
// 							</Tooltip>
// 						</TooltipProvider>

// 						<TooltipProvider>
// 							<Tooltip>
// 								<TooltipTrigger asChild>
// 									<Button
// 										variant="ghost"
// 										size="icon"
// 										className="rounded-full"
// 										onClick={handleToggleDarkMode}>
// 										{isDarkMode ? (
// 											<svg
// 												xmlns="http://www.w3.org/2000/svg"
// 												width="20"
// 												height="20"
// 												viewBox="0 0 24 24"
// 												fill="none"
// 												stroke="currentColor"
// 												strokeWidth="2"
// 												strokeLinecap="round"
// 												strokeLinejoin="round">
// 												<circle cx="12" cy="12" r="5"></circle>
// 												<line x1="12" y1="1" x2="12" y2="3"></line>
// 												<line x1="12" y1="21" x2="12" y2="23"></line>
// 												<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
// 												<line
// 													x1="18.36"
// 													y1="18.36"
// 													x2="19.78"
// 													y2="19.78"></line>
// 												<line x1="1" y1="12" x2="3" y2="12"></line>
// 												<line x1="21" y1="12" x2="23" y2="12"></line>
// 												<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
// 												<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
// 											</svg>
// 										) : (
// 											<svg
// 												xmlns="http://www.w3.org/2000/svg"
// 												width="20"
// 												height="20"
// 												viewBox="0 0 24 24"
// 												fill="none"
// 												stroke="currentColor"
// 												strokeWidth="2"
// 												strokeLinecap="round"
// 												strokeLinejoin="round">
// 												<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
// 											</svg>
// 										)}
// 									</Button>
// 								</TooltipTrigger>
// 								<TooltipContent>
// 									<p>{isDarkMode ? t("lightMode") : t("darkMode")}</p>
// 								</TooltipContent>
// 							</Tooltip>
// 						</TooltipProvider>

// 						<DropdownMenu>
// 							<DropdownMenuTrigger asChild>
// 								<Button variant="ghost" size="icon" className="rounded-full">
// 									<svg
// 										xmlns="http://www.w3.org/2000/svg"
// 										width="20"
// 										height="20"
// 										viewBox="0 0 24 24"
// 										fill="none"
// 										stroke="currentColor"
// 										strokeWidth="2"
// 										strokeLinecap="round"
// 										strokeLinejoin="round">
// 										<circle cx="12" cy="12" r="1"></circle>
// 										<circle cx="19" cy="12" r="1"></circle>
// 										<circle cx="5" cy="12" r="1"></circle>
// 									</svg>
// 								</Button>
// 							</DropdownMenuTrigger>
// 							<DropdownMenuContent align="end">
// 								<DropdownMenuItem onClick={() => handleFontSizeChange(0)}>
// 									<span className="text-sm mr-2">A</span> {t("smallText")}
// 								</DropdownMenuItem>
// 								<DropdownMenuItem onClick={() => handleFontSizeChange(1)}>
// 									<span className="text-base mr-2">A</span> {t("mediumText")}
// 								</DropdownMenuItem>
// 								<DropdownMenuItem onClick={() => handleFontSizeChange(2)}>
// 									<span className="text-lg mr-2">A</span> {t("largeText")}
// 								</DropdownMenuItem>
// 							</DropdownMenuContent>
// 						</DropdownMenu>

// 						<Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
// 							<DialogTrigger asChild>
// 								<Button variant="ghost" size="icon" className="rounded-full">
// 									<Share2 className="w-5 h-5" />
// 								</Button>
// 							</DialogTrigger>
// 							<DialogContent className="sm:max-w-md">
// 								<DialogHeader>
// 									<DialogTitle>{t("shareArticle")}</DialogTitle>
// 									<DialogDescription>
// 										{t("shareArticleDescription")}
// 									</DialogDescription>
// 								</DialogHeader>
// 								<div className="grid grid-cols-4 gap-4 py-4">
// 									<Button
// 										variant="outline"
// 										className="flex flex-col items-center justify-center h-20"
// 										onClick={() => handleShare("facebook")}>
// 										<Facebook className="h-8 w-8 text-blue-600 mb-1" />
// 										<span className="text-xs">Facebook</span>
// 									</Button>
// 									<Button
// 										variant="outline"
// 										className="flex flex-col items-center justify-center h-20"
// 										onClick={() => handleShare("twitter")}>
// 										<Twitter className="h-8 w-8 text-blue-400 mb-1" />
// 										<span className="text-xs">Twitter</span>
// 									</Button>
// 									<Button
// 										variant="outline"
// 										className="flex flex-col items-center justify-center h-20"
// 										onClick={() => handleShare("linkedin")}>
// 										<Linkedin className="h-8 w-8 text-blue-700 mb-1" />
// 										<span className="text-xs">LinkedIn</span>
// 									</Button>
// 									<Button
// 										variant="outline"
// 										className="flex flex-col items-center justify-center h-20"
// 										onClick={() => handleShare("email")}>
// 										<Mail className="h-8 w-8 text-gray-600 mb-1" />
// 										<span className="text-xs">Email</span>
// 									</Button>
// 									<Button
// 										variant="outline"
// 										className="flex flex-col items-center justify-center h-20"
// 										onClick={() => handleShare("copy")}>
// 										<Copy className="h-8 w-8 text-gray-600 mb-1" />
// 										<span className="text-xs">{t("copyLink")}</span>
// 									</Button>
// 									<Button
// 										variant="outline"
// 										className="flex flex-col items-center justify-center h-20"
// 										onClick={() => handleShare("print")}>
// 										<Printer className="h-8 w-8 text-gray-600 mb-1" />
// 										<span className="text-xs">{t("print")}</span>
// 									</Button>
// 								</div>
// 							</DialogContent>
// 						</Dialog>
// 					</div>
// 				</div>
// 			</header>

// 			<div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 py-6 gap-6">
// 				{/* Table of Contents Sidebar (Desktop) */}
// 				<AnimatePresence>
// 					{showTableOfContents && (
// 						<motion.aside
// 							initial={{ opacity: 0, x: -20 }}
// 							animate={{ opacity: 1, x: 0 }}
// 							exit={{ opacity: 0, x: -20 }}
// 							transition={{ duration: 0.3 }}
// 							className="hidden md:block w-64 sticky top-20 self-start">
// 							<div className="bg-card rounded-lg shadow-sm border border-border p-4">
// 								<h3 className="font-bold text-lg mb-4">
// 									{t("tableOfContents")}
// 								</h3>
// 								<nav>
// 									<ul className="space-y-2">
// 										{tableOfContents.map((section) => (
// 											<li key={section.id}>
// 												<a
// 													href={`#${section.id}`}
// 													className={`block py-1 px-2 rounded-md transition-colors ${
// 														activeSection === section.id
// 															? "bg-primary/10 text-primary font-medium"
// 															: "hover:bg-muted"
// 													}`}>
// 													{section.title}
// 												</a>
// 											</li>
// 										))}
// 									</ul>
// 								</nav>

// 								<div className="mt-6 pt-4 border-t border-border">
// 									<h4 className="font-medium text-sm mb-2">
// 										{t("articleInfo")}
// 									</h4>
// 									<div className="space-y-2 text-sm text-muted-foreground">
// 										<div className="flex items-center">
// 											<Calendar className="w-4 h-4 mr-2" />
// 											<span>{formatDate(article.createdAt)}</span>
// 										</div>
// 										<div className="flex items-center">
// 											<Eye className="w-4 h-4 mr-2" />
// 											<span>
// 												{formatNumber(viewCount)} {t("views")}
// 											</span>
// 										</div>
// 										<div className="flex items-center">
// 											<Clock className="w-4 h-4 mr-2" />
// 											<span>5 {t("minRead")}</span>
// 										</div>
// 									</div>
// 								</div>
// 							</div>
// 						</motion.aside>
// 					)}
// 				</AnimatePresence>

// 				{/* Main Content */}
// 				<main className="flex-1">
// 					<article
// 						ref={articleRef}
// 						className={`bg-card rounded-lg shadow-sm border border-border overflow-hidden ${fontSizeClass}`}>
// 						{/* Image Gallery */}
// 						<div className="relative">
// 							<div className="relative h-64 md:h-96 overflow-hidden">
// 								<AnimatePresence mode="wait">
// 									<motion.div
// 										key={activeImageIndex}
// 										initial={{ opacity: 0 }}
// 										animate={{ opacity: 1 }}
// 										exit={{ opacity: 0 }}
// 										transition={{ duration: 0.5 }}
// 										className="absolute inset-0">
// 										<Image
// 											src={
// 												galleryImages[activeImageIndex] || "/placeholder.svg"
// 											}
// 											alt={getLocalizedContent(article.title)}
// 											layout="fill"
// 											objectFit="cover"
// 										/>
// 									</motion.div>
// 								</AnimatePresence>

// 								{galleryImages.length > 1 && (
// 									<>
// 										<Button
// 											variant="ghost"
// 											size="icon"
// 											className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full hover:bg-black/50"
// 											onClick={handlePrevImage}>
// 											<ChevronLeft className="h-6 w-6" />
// 										</Button>
// 										<Button
// 											variant="ghost"
// 											size="icon"
// 											className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full hover:bg-black/50"
// 											onClick={handleNextImage}>
// 											<ChevronRight className="h-6 w-6" />
// 										</Button>

// 										<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
// 											{galleryImages.map((_, index) => (
// 												<button
// 													key={index}
// 													className={`w-2 h-2 rounded-full ${
// 														index === activeImageIndex
// 															? "bg-white"
// 															: "bg-white/50"
// 													}`}
// 													onClick={() => setActiveImageIndex(index)}
// 												/>
// 											))}
// 										</div>
// 									</>
// 								)}
// 							</div>

// 							<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
// 								<Badge className="mb-2 bg-primary">{article.category}</Badge>
// 								<h1 className="text-2xl md:text-3xl font-bold text-white">
// 									{getLocalizedContent(article.title)}
// 								</h1>
// 							</div>
// 						</div>

// 						<div className="p-6">
// 							{/* Author and Date */}
// 							<div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
// 								<div className="flex items-center">
// 									<Avatar className="h-10 w-10 mr-3">
// 										<AvatarImage
// 											src="/placeholder.svg?height=40&width=40"
// 											alt={article.author?.name}
// 										/>
// 										<AvatarFallback>
// 											{article.author?.name?.charAt(0) || "U"}
// 										</AvatarFallback>
// 									</Avatar>
// 									<div>
// 										<p className="font-medium">{article.author?.name}</p>
// 										<p className="text-sm text-muted-foreground">
// 											{formatDate(article.createdAt)}
// 										</p>
// 									</div>
// 								</div>
// 								<div className="flex items-center space-x-2">
// 									<div className="flex items-center text-sm text-muted-foreground">
// 										<Eye className="w-4 h-4 mr-1" />
// 										<span>{formatNumber(viewCount)}</span>
// 									</div>
// 									<div className="flex items-center text-sm text-muted-foreground">
// 										<Clock className="w-4 h-4 mr-1" />
// 										<span>5 {t("minRead")}</span>
// 									</div>
// 								</div>
// 							</div>

// 							{/* Article Content */}
// 							<div className="article-content max-w-3xl mx-auto">
// 								{/* Introduction */}
// 								<section id="section-1">
// 									<h2>{t("introduction")}</h2>
// 									<p>{getLocalizedContent(article.content)}</p>
// 								</section>

// 								{/* Main Content */}
// 								<section id="section-2" className="mt-8">
// 									<h2>{t("mainContent")}</h2>
// 									<p>
// 										Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
// 										do eiusmod tempor incididunt ut labore et dolore magna
// 										aliqua. Ut enim ad minim veniam, quis nostrud exercitation
// 										ullamco laboris nisi ut aliquip ex ea commodo consequat.
// 									</p>
// 									<p>
// 										Duis aute irure dolor in reprehenderit in voluptate velit
// 										esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
// 										occaecat cupidatat non proident, sunt in culpa qui officia
// 										deserunt mollit anim id est laborum.
// 									</p>
// 									<blockquote>
// 										<p>{t("importantQuote")}</p>
// 									</blockquote>
// 								</section>

// 								{/* Conclusion */}
// 								<section id="section-3" className="mt-8">
// 									<h2>{t("conclusion")}</h2>
// 									<p>
// 										In conclusion, this article has explored the key aspects of
// 										this topic. We've discussed the main points and provided
// 										insights into the subject matter. The implications of these
// 										findings are significant for future research and practical
// 										applications.
// 									</p>
// 								</section>
// 							</div>

// 							{/* Tags */}
// 							<div className="mt-8 pt-4 border-t border-border">
// 								<h3 className="font-medium mb-2">{t("tags")}</h3>
// 								<div className="flex flex-wrap gap-2">
// 									<Badge variant="outline" className="bg-muted/50">
// 										Sports
// 									</Badge>
// 									<Badge variant="outline" className="bg-muted/50">
// 										News
// 									</Badge>
// 									<Badge variant="outline" className="bg-muted/50">
// 										Ethiopia
// 									</Badge>
// 									<Badge variant="outline" className="bg-muted/50">
// 										{article.category}
// 									</Badge>
// 								</div>
// 							</div>

// 							{/* Action Buttons */}
// 							<div className="mt-8 pt-4 border-t border-border flex justify-between items-center">
// 								<div className="flex items-center space-x-4">
// 									<Button
// 										variant="ghost"
// 										size="sm"
// 										className={`flex items-center space-x-1 ${
// 											isLiked ? "text-red-500" : ""
// 										}`}
// 										onClick={handleLikeToggle}>
// 										<ThumbsUp
// 											className="w-5 h-5"
// 											fill={isLiked ? "currentColor" : "none"}
// 										/>
// 										<span>{formatNumber(likeCount)}</span>
// 									</Button>
// 									{/* <Button
// 										variant="ghost"
// 										size="sm"
// 										className="flex items-center space-x-1">
// 										<MessageSquare className="w-5 h-5" />
// 										<span>{formatNumber(commentCount)}</span>
// 									</Button> */}
// 								</div>
// 								<div className="flex items-center space-x-2">
// 									<Button
// 										variant="ghost"
// 										size="sm"
// 										className={`flex items-center space-x-1 ${
// 											isFavorite ? "text-red-500" : ""
// 										}`}
// 										onClick={handleFavoriteToggle}>
// 										<Heart
// 											className="w-5 h-5"
// 											fill={isFavorite ? "currentColor" : "none"}
// 										/>
// 										<span>{isFavorite ? t("favorited") : t("favorite")}</span>
// 									</Button>
// 									<Button
// 										variant="ghost"
// 										size="sm"
// 										className={`flex items-center space-x-1 ${
// 											isBookmarked ? "text-blue-500" : ""
// 										}`}
// 										onClick={handleBookmarkToggle}>
// 										<Bookmark
// 											className="w-5 h-5"
// 											fill={isBookmarked ? "currentColor" : "none"}
// 										/>
// 										<span>
// 											{isBookmarked ? t("bookmarked") : t("bookmark")}
// 										</span>
// 									</Button>
// 								</div>
// 							</div>
// 						</div>
// 					</article>

// 					{/* Related Articles */}
// 					<div className="mt-8">
// 						<h2 className="text-2xl font-bold mb-4">{t("relatedArticles")}</h2>
// 						{isLoading ? (
// 							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 								{[1, 2, 3, 4].map((item) => (
// 									<Card key={item} className="overflow-hidden">
// 										<Skeleton className="h-48 w-full" />
// 										<CardContent className="p-4">
// 											<Skeleton className="h-6 w-3/4 mb-2" />
// 											<Skeleton className="h-4 w-full mb-1" />
// 											<Skeleton className="h-4 w-2/3" />
// 										</CardContent>
// 									</Card>
// 								))}
// 							</div>
// 						) : relatedArticles.length > 0 ? (
// 							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 								{relatedArticles.map((relatedArticle) => (
// 									<motion.div
// 										key={relatedArticle.id}
// 										whileHover={{ y: -5 }}
// 										transition={{ type: "spring", stiffness: 300 }}>
// 										<Link href={`/article/${relatedArticle.id}`}>
// 											<Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
// 												<div className="relative h-48">
// 													<Image
// 														src={
// 															relatedArticle.featuredImage ||
// 															"/placeholder.svg?height=200&width=400"
// 														}
// 														alt={getLocalizedContent(relatedArticle.title)}
// 														layout="fill"
// 														objectFit="cover"
// 													/>
// 												</div>
// 												<CardContent className="p-4 flex-grow">
// 													<Badge className="mb-2">
// 														{relatedArticle.category}
// 													</Badge>
// 													<h3 className="font-bold text-lg mb-2 line-clamp-2">
// 														{getLocalizedContent(relatedArticle.title)}
// 													</h3>
// 													<p className="text-sm text-muted-foreground line-clamp-2">
// 														{getLocalizedContent(relatedArticle.content)}
// 													</p>
// 												</CardContent>
// 											</Card>
// 										</Link>
// 									</motion.div>
// 								))}
// 							</div>
// 						) : (
// 							<Card className="p-8 text-center">
// 								<p className="text-muted-foreground">
// 									{t("noRelatedArticles")}
// 								</p>
// 							</Card>
// 						)}
// 					</div>
// 				</main>
// 			</div>

// 			{/* Mobile Table of Contents */}
// 			<AnimatePresence>
// 				{showTableOfContents && (
// 					<motion.div
// 						initial={{ opacity: 0, y: 100 }}
// 						animate={{ opacity: 1, y: 0 }}
// 						exit={{ opacity: 0, y: 100 }}
// 						className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
// 						<div className="max-w-md mx-auto">
// 							<div className="flex justify-between items-center mb-2">
// 								<h3 className="font-bold">{t("tableOfContents")}</h3>
// 								<Button
// 									variant="ghost"
// 									size="sm"
// 									onClick={() => setShowTableOfContents(false)}>
// 									<X className="h-4 w-4" />
// 								</Button>
// 							</div>
// 							<nav>
// 								<ul className="space-y-2">
// 									{tableOfContents.map((section) => (
// 										<li key={section.id}>
// 											<a
// 												href={`#${section.id}`}
// 												className={`block py-2 px-3 rounded-md transition-colors ${
// 													activeSection === section.id
// 														? "bg-primary/10 text-primary font-medium"
// 														: "hover:bg-muted"
// 												}`}
// 												onClick={() => setShowTableOfContents(false)}>
// 												{section.title}
// 											</a>
// 										</li>
// 									))}
// 								</ul>
// 							</nav>
// 						</div>
// 					</motion.div>
// 				)}
// 			</AnimatePresence>

// 			{/* Floating Action Button (Mobile) */}
// 			<div className="md:hidden fixed bottom-4 right-4 z-30 flex flex-col space-y-2">
// 				<Button
// 					size="icon"
// 					className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
// 					onClick={() => setShowShareDialog(true)}>
// 					<Share2 className="h-5 w-5" />
// 				</Button>
// 			</div>

// 			<LoginModal
// 				isOpen={showLoginModal}
// 				onClose={handleLoginModalClose}
// 				onLoginSuccess={handleLoginSuccess}
// 			/>
// 		</div>
// 	);
// }
