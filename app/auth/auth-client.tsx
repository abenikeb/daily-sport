"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoginForm } from "@/components/LoginForm";
import {
	LogIn,
	UserPlus,
	Phone,
	Globe,
	Shield,
	Clock,
	HelpCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AuthClient() {
	const router = useRouter();
	const { t, language, setLanguage } = useLanguage();
	const searchParams = useSearchParams();
	const redirectUrl = searchParams?.get("redirect");
	const [authMode, setAuthMode] = useState<"login" | "signup">("login");
	const [mounted, setMounted] = useState(false);

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				when: "beforeChildren",
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { type: "spring", stiffness: 300, damping: 24 },
		},
	};

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 flex flex-col">
			{/* Animated background elements */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
				<div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>
				<div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
			</div>

			{/* Header */}
			<header className="relative z-10 py-6 px-4 sm:px-6 lg:px-8">
				<div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
					<motion.div
						initial={{ x: -20, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="flex items-center">
						<div className="flex items-center">
							<div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md mr-4">
								<Image
									src="/placeholder.svg?height=60&width=60&text=Tocido"
									alt="Tocido PLC Logo"
									width={60}
									height={60}
									className="rounded-full object-contain"
								/>
							</div>
							<h1 className="text-3xl font-bold text-secondary dark:text-secondary-foreground">
								Tocido PLC
							</h1>
						</div>
					</motion.div>

					<motion.div
						initial={{ x: 20, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="flex items-center mt-4 md:mt-0">
						<div className="bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-full shadow-sm">
							<span className="text-primary dark:text-primary-foreground font-medium flex items-center">
								<Phone className="h-4 w-4 mr-2" />
								Customer Service: 0913229175
							</span>
						</div>
					</motion.div>
				</div>
			</header>

			<main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="w-full max-w-md">
					{/* Auth mode switcher */}
					<motion.div
						variants={itemVariants}
						className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
						<div className="grid grid-cols-2">
							<button
								onClick={() => setAuthMode("login")}
								className={`py-4 flex items-center justify-center font-medium transition-colors ${
									authMode === "login"
										? "bg-primary text-white"
										: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
								}`}>
								<LogIn className="mr-2 h-4 w-4" />
								{t("login")}
							</button>
							<button
								onClick={() => setAuthMode("signup")}
								className={`py-4 flex items-center justify-center font-medium transition-colors ${
									authMode === "signup"
										? "bg-primary text-white"
										: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
								}`}>
								<UserPlus className="mr-2 h-4 w-4" />
								{t("register")}
							</button>
						</div>
					</motion.div>

					{/* Auth form */}
					<motion.div
						variants={itemVariants}
						className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
						<AnimatePresence mode="wait">
							<motion.div
								key={authMode}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}>
								{authMode === "login" ? (
									<LoginForm redirectUrl={redirectUrl} />
								) : (
									<LoginForm redirectUrl={redirectUrl} />
									// <SignupForm onSuccess={() => setAuthMode("login")} />
								)}
							</motion.div>
						</AnimatePresence>
					</motion.div>

					{/* Subscription info */}
					<motion.div
						variants={itemVariants}
						className="mt-6 bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 shadow-md">
						<div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
							<p className="font-semibold">
								FIRST 3 DAYS FOR FREE, THEN 2 BIRR/DAY
							</p>
							<p>To unsubscribe, send STOP to 8436. For help call 0913229175</p>
							<p>በመጀመሪያ 3 ቀናት በነጻ፣ ከዚያም በቀን 2 ብር</p>
							<p>
								አገልግሎቱን ለማቋረጥ ወደ 8436 Stop ብለዉ ይላኩ:: ለተጨማሪ መረጃ በ 0913229175 ያግኙን
							</p>
							<Link
								href="/terms"
								className="text-secondary dark:text-secondary-foreground hover:underline font-medium">
								Terms & Conditions
							</Link>
						</div>
					</motion.div>

					{/* Features section */}
					<motion.div
						variants={itemVariants}
						className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
						{[
							{
								icon: <Globe className="h-5 w-5 text-blue-500" />,
								text: t("multiLanguage"),
							},
							{
								icon: <Shield className="h-5 w-5 text-green-500" />,
								text: t("secureAccess"),
							},
							{
								icon: <Clock className="h-5 w-5 text-purple-500" />,
								text: t("24/7Access"),
							},
							{
								icon: <HelpCircle className="h-5 w-5 text-orange-500" />,
								text: t("support"),
							},
						].map((feature, index) => (
							<motion.div
								key={index}
								whileHover={{ y: -5, scale: 1.03 }}
								className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md flex flex-col items-center justify-center text-center">
								{feature.icon}
								<span className="text-xs mt-1 text-gray-600 dark:text-gray-300">
									{feature.text}
								</span>
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			</main>

			{/* Footer */}
			<footer className="relative z-10 py-6 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
				<p>
					© {new Date().getFullYear()} Tocido PLC. {t("allRightsReserved")}
				</p>
			</footer>
		</div>
	);
}
