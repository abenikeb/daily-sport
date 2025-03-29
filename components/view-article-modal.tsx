"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { Calendar } from "lucide-react";

interface ViewArticleModalProps {
	article: any;
	isOpen: boolean;
	onClose: () => void;
}

export function ViewArticleModal({
	article,
	isOpen,
	onClose,
}: ViewArticleModalProps) {
	const { t, language } = useLanguage();

	if (!article) return null;

	// Helper function to get optimized Cloudinary URLs
	const getOptimizedImageUrl = (url: string, width = 800, height = 600) => {
		if (!url || !url.includes("cloudinary.com")) return url;

		// For Cloudinary URLs, we can add transformations
		return url.replace(
			"/upload/",
			`/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`
		);
	};

	const title =
		typeof article.title === "string"
			? JSON.parse(article.title)[language] || JSON.parse(article.title).en
			: article.title[language as keyof typeof article.title] ||
			  article.title.en;

	const content =
		typeof article.content === "string"
			? JSON.parse(article.content)[language] || JSON.parse(article.content).en
			: article.content[language as keyof typeof article.content] ||
			  article.content.en;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>{t("articleDetails")}</DialogTitle>
				</DialogHeader>
				<div className="mt-4 overflow-y-auto max-h-[70vh]">
					<h3 className="text-lg font-semibold mb-2">{title}</h3>
					<div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
						<Calendar className="h-4 w-4" />
						<span>{new Date(article.createdAt).toLocaleDateString()}</span>
					</div>
					{article.featuredImage && (
						<div className="relative w-full h-64 mb-4">
							<Image
								src={
									getOptimizedImageUrl(article.featuredImage, 800, 400) ||
									"/placeholder.svg"
								}
								alt={t("featuredImage")}
								fill
								className="object-cover rounded"
								sizes="(max-width: 768px) 100vw, 800px"
							/>
						</div>
					)}
					<div className="prose max-w-none">{content}</div>
				</div>
				<DialogFooter>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
