import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

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

	const getLocalizedContent = (content: string | Record<string, string>) => {
		if (typeof content === "string") {
			try {
				const parsedContent = JSON.parse(content);
				return parsedContent[language] || parsedContent.en;
			} catch {
				return content;
			}
		}
		return content[language as keyof typeof content] || content.en;
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>{t("articleDetails")}</DialogTitle>
				</DialogHeader>
				{article && (
					<div className="mt-4 space-y-4">
						<h3 className="text-lg font-semibold">
							{getLocalizedContent(article.title)}
						</h3>
						<p className="text-sm text-gray-500">
							{t("submittedOn")}:{" "}
							{new Date(article.createdAt).toLocaleDateString()}
						</p>
						{article.featuredImage && (
							<Image
								src={article.featuredImage}
								alt={t("featuredImage")}
								width={300}
								height={200}
								className="object-cover rounded"
							/>
						)}
						<div className="prose max-w-none">
							{getLocalizedContent(article.content)}
						</div>
					</div>
				)}
				<DialogFooter>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
