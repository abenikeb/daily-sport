"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoginModal } from "@/components/LoginModal";

import Link from "next/link";
import {
	ArrowLeft,
	Share2,
	ThumbsUp,
	MessageSquare,
	Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

interface ArticleDetailClientProps {
	article: Article | any;
	isAuthenticated: boolean;
}

export default function ArticleDetailClient({
	article,
	isAuthenticated,
}: ArticleDetailClientProps) {
	const { t, language } = useLanguage();
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [localIsAuthenticated, setLocalIsAuthenticated] =
		useState(isAuthenticated);

	useEffect(() => {
		if (!localIsAuthenticated) {
			setShowLoginModal(true);
		}
	}, [localIsAuthenticated]);

	const getLocalizedContent = (content: string) => {
		try {
			// Parse the content JSON string into an object
			const parsedContent = JSON.parse(content);

			// Access the value for the current language or fallback to English (or an empty string)
			return (
				parsedContent[language as keyof typeof parsedContent] ||
				parsedContent.en ||
				""
			);
		} catch (error) {
			console.error("Invalid content format:", error);
			return ""; // Return an empty string if parsing fails
		}
	};

	// const getLocalizedContent = (content: LocalizedContent) => {
	// 	console.log({ content });
	// 	return content[language as keyof LocalizedContent] || content.en || "";
	// };

	const handleLoginSuccess = () => {
		setLocalIsAuthenticated(true);
		setShowLoginModal(false);
	};

	return (
		<div className="w-full mx-auto bg-white min-h-screen flex flex-col">
			{/* Header */}
			<header className="sticky top-0 bg-white p-4 flex justify-between items-center border-b border-gray-200 shadow-sm">
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
			<article className="flex-grow p-4 overflow-y-auto">
				<h1 className="text-2xl font-bold mb-2 text-gray-800">
					{getLocalizedContent(article.title)}
				</h1>

				<div className="flex items-center text-sm text-gray-500 mb-4">
					<img
						src="/assets/images/file.png?height=32&width=32"
						alt="Author"
						className="w-8 h-8 rounded-full mr-2"
					/>
					<span>Abebe Teka • 2 hours ago</span>
				</div>
				{article.featuredImage ? (
					<img
						src={article.featuredImage}
						alt={getLocalizedContent(article.title)}
						className="w-full h-64 object-cover rounded-lg mb-4"
					/>
				) : (
					<img
						src="/assets/images/fb1.png?height=200&width=375"
						alt="Article hero image"
						className="w-full h-48 object-cover rounded-lg mb-4"
					/>
				)}

				<p className="text-gray-600 mb-2">
					{t("category")}: {t(article.category)}
				</p>

				<p className="text-gray-600 mb-4">
					{new Date(article.createdAt).toLocaleDateString()}
				</p>

				<div className="prose max-w-none">
					{getLocalizedContent(article.content)}
				</div>
				{/* Related Articles */}
				<div className="mt-8">
					<h2 className="text-xl font-bold mb-4 text-gray-800">
						{t("relatedArticles")}
					</h2>
					{[1, 2].map((item) => (
						<Link key={item} href={`/article/${item}`} className="block mb-4">
							<div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
								<h3 className="font-bold mb-1 text-gray-800">
									{t("latestNews")} {item}
								</h3>
								<p className="text-sm text-gray-600">{t("shortDescription")}</p>
							</div>
						</Link>
					))}
				</div>
			</article>

			<LoginModal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
				onLoginSuccess={handleLoginSuccess}
			/>

			{/* Interaction Bar */}
			<div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center shadow-sm">
				<div className="flex items-center space-x-4">
					<Button
						variant="ghost"
						size="sm"
						className="flex items-center space-x-1">
						<ThumbsUp className="w-5 h-5 text-primary" />
						<span className="text-gray-700">2.5k</span>
						<span className="sr-only">{t("likes")}</span>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="flex items-center space-x-1">
						<MessageSquare className="w-5 h-5 text-primary" />
						<span className="text-gray-700">128</span>
						<span className="sr-only">{t("comments")}</span>
					</Button>
				</div>
				<Button variant="ghost" size="icon">
					<Bookmark className="w-5 h-5 text-primary" />
					<span className="sr-only">{t("save")}</span>
				</Button>
			</div>
		</div>
	);
}
