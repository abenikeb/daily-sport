"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface ErrorModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
}

export function ErrorModal({
	isOpen,
	onClose,
	title = "Login Failed",
	description = "Invalid mobile number or password. Please try again.",
}: ErrorModalProps) {
	const { t } = useLanguage();

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ type: "spring", duration: 0.5 }}
						className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4">
						<AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
					</motion.div>
					<DialogTitle className="text-center text-xl">{title}</DialogTitle>
					<DialogDescription className="text-center">
						{description}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="sm:justify-center mt-4">
					<Button onClick={onClose} className="w-full sm:w-auto">
						Try Again
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
