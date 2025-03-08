// "use client";

// import {
// 	Dialog,
// 	DialogContent,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogDescription,
// 	DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { AlertCircle } from "lucide-react";
// import { motion } from "framer-motion";
// import { useLanguage } from "@/contexts/LanguageContext";

// interface ErrorModalProps {
// 	isOpen: boolean;
// 	onClose: () => void;
// 	title?: string;
// 	description?: string;
// }

// export function ErrorModal({
// 	isOpen,
// 	onClose,
// 	title = "Login Failed",
// 	description = "Invalid mobile number or password. Please try again.",
// }: ErrorModalProps) {
// 	const { t } = useLanguage();

// 	return (
// 		<Dialog open={isOpen} onOpenChange={onClose}>
// 			<DialogContent className="sm:max-w-md">
// 				<DialogHeader>
// 					<motion.div
// 						initial={{ scale: 0.8, opacity: 0 }}
// 						animate={{ scale: 1, opacity: 1 }}
// 						transition={{ type: "spring", duration: 0.5 }}
// 						className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4">
// 						<AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
// 					</motion.div>
// 					<DialogTitle className="text-center text-xl">{title}</DialogTitle>
// 					<DialogDescription className="text-center">
// 						{description}
// 					</DialogDescription>
// 				</DialogHeader>
// 				<DialogFooter className="sm:justify-center mt-4">
// 					<Button onClick={onClose} className="w-full sm:w-auto">
// 						Try Again
// 					</Button>
// 				</DialogFooter>
// 			</DialogContent>
// 		</Dialog>
// 	);
// }

"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function ErrorModal({ isOpen, onClose }: ErrorModalProps) {
	const handleRegistration = () => {
		// Open SMS app with predefined message
		window.location.href = "sms:8436;?&body=Ok";
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md bg-white rounded-xl p-6">
				<DialogHeader className="flex flex-col items-center text-center">
					<div className="bg-red-100 p-3 rounded-full mb-4">
						<AlertCircle className="h-8 w-8 text-primary" />
					</div>
					<DialogTitle className="text-xl font-bold text-secondary">
						Login Failed
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 text-center">
					<p className="text-gray-700">
						ይህ ቁጥር አልተመዘገበም ወይም ፓስ ኮድ ተሳስተዋል ካልተመዘገቡ click Here ሚለውን በመንካት
						ይመዝገቡ!!
					</p>

					<div className="flex justify-center mt-6">
						<Button
							onClick={handleRegistration}
							className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
							Click Here/ይመዝገቡ
						</Button>
					</div>

					<p className="text-sm text-gray-500 mt-4">
						Or contact customer support at 0913229175
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
