"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function NoArticlesFound() {
	const { t } = useLanguage();
	const router = useRouter();

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-md">
			<div className="bg-gray-100 p-6 rounded-full mb-4">
				<SearchX className="h-12 w-12 text-gray-400" />
			</div>

			<h3 className="text-xl font-bold text-gray-800 mb-2">
				{t("noArticlesFoundTitle")}
			</h3>

			<p className="text-gray-600 text-center max-w-md mb-6">
				{t("noArticlesFoundDescription")}
			</p>

			{/* Animated progress bar */}
			<div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5 overflow-hidden">
				<motion.div
					className="bg-primary h-full"
					initial={{ width: "0%" }}
					animate={{ width: "100%" }}
					transition={{
						duration: 2,
						repeat: Number.POSITIVE_INFINITY,
						repeatType: "reverse",
						ease: "easeInOut",
					}}
				/>
			</div>
			<Button
				variant="outline"
				className="mt-6"
				onClick={() => router.push("/")}>
				{t("browseArticles")}
			</Button>
		</motion.div>
	);
}
