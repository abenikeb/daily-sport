"use client";

import { useRouter } from "next/navigation";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { LockKeyhole } from "lucide-react";

interface LoginRequiredDialogProps {
	isOpen: boolean;
	onClose: () => void;
	articleUrl: string;
}

export function LoginRequiredDialog({
	isOpen,
	onClose,
	articleUrl,
}: LoginRequiredDialogProps) {
	const { t } = useLanguage();
	const router = useRouter();

	const handleLogin = () => {
		// Navigate to login page with redirect parameter
		router.push(`/profile?redirect=${encodeURIComponent(articleUrl)}`);
		onClose();
	};

	const handleContinue = () => {
		// Just close the dialog and stay on the home page
		// No redirection to article page for unauthenticated users
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader className="flex flex-col items-center text-center">
					<div className="bg-primary/10 p-3 rounded-full mb-4">
						<LockKeyhole className="h-8 w-8 text-primary" />
					</div>
					<DialogTitle className="text-xl font-bold">
						{t("loginRequired")}
					</DialogTitle>
					<DialogDescription className="mt-2">
						{t("loginRequiredDescription")}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
					<Button
						variant="outline"
						onClick={handleContinue}
						className="sm:flex-1">
						{t("cancel")}
					</Button>
					<Button onClick={handleLogin} className="sm:flex-1">
						{t("login")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
