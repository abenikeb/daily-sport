"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	LogOut,
	BellOff,
	Eye,
	Newspaper,
	Calendar,
	Heart,
	BookOpen,
	Bell,
	User,
	Clock,
	RefreshCw,
	ChevronRight,
	Share2,
	Bookmark,
	BarChart3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

interface UserType {
	id: string;
	name: string;
	phone: string;
	viewCount?: number;
	subscriptionStatus:
		| "ACTIVE"
		| "UNSUBSCRIBE"
		| "PENDING"
		| "INACTIVE"
		| "RENEW";
	subscriptionStart: string;
	subscriptionEnd: string;
	lastBilledAt: string;
	subscribedAt: string;
	activateAt: string;
	refNo: string;
	contractNo: string;
}

interface LocalizedContent {
	en: string;
	am?: string;
	om?: string;
}

interface FavoriteArticle {
	id: string;
	title: LocalizedContent;
	category: string;
	featuredImage?: string;
}

interface ProfileClientProps {
	user: UserType;
}

export default function ProfileClient({ user }: ProfileClientProps | any) {
	const router = useRouter();
	const { toast } = useToast();
	const { t, language } = useLanguage();
	const [isSubscribed, setIsSubscribed] = useState(
		user.subscriptionStatus === "ACTIVE"
	);
	const [favoriteArticles, setFavoriteArticles] = useState<FavoriteArticle[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(false);
	const [showConfirmUnsubscribe, setShowConfirmUnsubscribe] = useState(false);
	const searchParams = useSearchParams();
	const redirectUrl = searchParams?.get("redirect");
	const [activeTab, setActiveTab] = useState("overview");

	// Provide a default value for viewCount if it doesn't exist
	const userViewCount = user.viewCount || 0;

	// If there's a redirect URL, navigate to it after profile loads
	useEffect(() => {
		if (redirectUrl) {
			router.push(redirectUrl);
		}
	}, [redirectUrl, router]);

	useEffect(() => {
		const fetchFavoriteArticles = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(`/api/favorites/${user.id}`);
				if (response.ok) {
					const data = await response.json();
					setFavoriteArticles(data);
				} else {
					throw new Error("Failed to fetch favorite articles");
				}
			} catch (error) {
				console.error("Error fetching favorite articles:", error);
				toast({
					title: t("error"),
					description: t("failedToLoadFavorites"),
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchFavoriteArticles();
	}, [user.id, toast, t]);

	const handleLogout = async () => {
		try {
			setIsLoading(true);
			await fetch("/api/auth/logout", {
				method: "POST",
			});
			router.push("/");
			router.refresh();
		} catch (error) {
			console.error("Logout error:", error);
			toast({
				title: t("error"),
				description: t("failedToLogout"),
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleUnsubscribe = async () => {
		try {
			setIsLoading(true);
			const response = await fetch("/api/user/subscription", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userId: user.id, action: "unsubscribe" }),
			});

			if (response.ok) {
				setIsSubscribed(false);
				toast({
					title: t("success"),
					description: t("unsubscribeSuccess"),
				});
				// Logout after unsubscribing
				await handleLogout();
			} else {
				throw new Error("Failed to unsubscribe");
			}
		} catch (error) {
			console.error("Unsubscribe error:", error);
			toast({
				title: t("error"),
				description: t("failedToUnsubscribe"),
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
			setShowConfirmUnsubscribe(false);
		}
	};

	const calculateRemainingDays = () => {
		const end = new Date(user.subscriptionEnd);
		const today = new Date();
		const diffTime = Math.abs(end.getTime() - today.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const totalSubscriptionDays = () => {
		const start = new Date(user.subscriptionStart);
		const end = new Date(user.subscriptionEnd);
		const diffTime = Math.abs(end.getTime() - start.getTime());
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	};

	const remainingDays = calculateRemainingDays();
	const totalDays = totalSubscriptionDays();
	const progress = ((totalDays - remainingDays) / totalDays) * 100;

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

	const getStatusColor = (status: string) => {
		switch (status) {
			case "ACTIVE":
				return "bg-green-100 text-green-800";
			case "UNSUBSCRIBE":
				return "bg-red-100 text-red-800";
			case "PENDING":
				return "bg-yellow-100 text-yellow-800";
			case "INACTIVE":
				return "bg-gray-100 text-gray-800";
			case "RENEW":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}>
					<Card className="w-full overflow-hidden shadow-xl mb-8">
						<CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
							<div className="flex flex-col md:flex-row items-center justify-between">
								<div className="flex flex-col md:flex-row items-center md:space-x-6 mb-4 md:mb-0">
									<motion.div
										whileHover={{ scale: 1.05 }}
										transition={{ type: "spring", stiffness: 300 }}>
										<Avatar className="h-28 w-28 border-4 border-white shadow-lg mb-4 md:mb-0">
											<AvatarImage
												src="/placeholder.svg?height=112&width=112"
												alt={user.name}
											/>
											<AvatarFallback className="text-3xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
												{user.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
									</motion.div>
									<div className="text-center md:text-left">
										<CardTitle className="text-3xl font-bold mb-2">
											{user.name}
										</CardTitle>
										<CardDescription className="text-xl text-gray-200 mb-2">
											{user.phone}
										</CardDescription>
										<Badge
											className={`${getStatusColor(
												user.subscriptionStatus
											)} px-3 py-1 text-sm font-medium`}>
											{t(user.subscriptionStatus.toLowerCase())}
										</Badge>
									</div>
								</div>
								<div className="flex space-x-4">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="secondary"
													className="bg-white/90 text-blue-900 hover:bg-white transition-colors">
													<Eye className="h-5 w-5" />
													<span className="ml-2">{userViewCount}</span>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>{t("totalViews")}</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="secondary"
													className="bg-white/90 text-blue-900 hover:bg-white transition-colors">
													<BookOpen className="h-5 w-5" />
													<span className="ml-2">
														{favoriteArticles.length}
													</span>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>{t("favoriteArticlesCount")}</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							</div>
						</CardHeader>
					</Card>

					<Tabs
						defaultValue="overview"
						className="w-full"
						onValueChange={setActiveTab}>
						<TabsList className="grid grid-cols-3 mb-8">
							<TabsTrigger value="overview" className="flex items-center gap-2">
								<User size={16} />
								<span className="hidden sm:inline">{t("overview")}</span>
							</TabsTrigger>
							<TabsTrigger
								value="subscription"
								className="flex items-center gap-2">
								<Calendar size={16} />
								<span className="hidden sm:inline">{t("subscription")}</span>
							</TabsTrigger>
							<TabsTrigger
								value="favorites"
								className="flex items-center gap-2">
								<Heart size={16} />
								<span className="hidden sm:inline">{t("favorites")}</span>
							</TabsTrigger>
						</TabsList>

						<AnimatePresence mode="wait">
							<motion.div
								key={activeTab}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}>
								<TabsContent value="overview" className="space-y-6">
									<Card className="shadow-lg">
										<CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
											<CardTitle className="flex items-center text-xl">
												<User className="mr-2 h-5 w-5" />
												{t("profileOverview")}
											</CardTitle>
										</CardHeader>
										<CardContent className="p-6">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<div className="space-y-4">
													<div>
														<h3 className="text-sm font-medium text-gray-500">
															{t("name")}
														</h3>
														<p className="text-lg font-medium">{user.name}</p>
													</div>
													<div>
														<h3 className="text-sm font-medium text-gray-500">
															{t("phone")}
														</h3>
														<p className="text-lg font-medium">{user.phone}</p>
													</div>
													<div>
														<h3 className="text-sm font-medium text-gray-500">
															{t("status")}
														</h3>
														<Badge
															className={`${getStatusColor(
																user.subscriptionStatus
															)} px-3 py-1`}>
															{t(user.subscriptionStatus.toLowerCase())}
														</Badge>
													</div>
												</div>
												<div className="space-y-4">
													<div>
														<h3 className="text-sm font-medium text-gray-500">
															{t("subscribedOn")}
														</h3>
														<p className="text-lg font-medium">
															{new Date(user.subscribedAt).toLocaleDateString()}
														</p>
													</div>
													<div>
														<h3 className="text-sm font-medium text-gray-500">
															{t("subscriptionEnd")}
														</h3>
														<p className="text-lg font-medium">
															{new Date(
																user.subscriptionEnd
															).toLocaleDateString()}
														</p>
													</div>
													<div>
														<h3 className="text-sm font-medium text-gray-500">
															{t("totalViews")}
														</h3>
														<p className="text-lg font-medium flex items-center">
															<Eye className="h-5 w-5 mr-2 text-blue-500" />
															{userViewCount}
														</p>
													</div>
												</div>
											</div>

											<div className="mt-8">
												<h3 className="text-lg font-medium mb-4">
													{t("subscriptionProgress")}
												</h3>
												<div className="flex justify-between mb-2">
													<span className="text-sm text-gray-600">
														{t("start")}:{" "}
														{new Date(
															user.subscriptionStart
														).toLocaleDateString()}
													</span>
													<span className="text-sm text-gray-600">
														{t("end")}:{" "}
														{new Date(
															user.subscriptionEnd
														).toLocaleDateString()}
													</span>
												</div>
												<Progress
													value={progress}
													className="w-full h-3 bg-gray-200"
												/>
												<p className="mt-3 text-center text-gray-700 font-medium">
													{remainingDays} {t("daysRemaining")} {t("outOf")}{" "}
													{totalDays} {t("days")}
												</p>
											</div>
										</CardContent>
										<CardFooter className="flex justify-center p-6 bg-gray-50">
											<Button
												variant="outline"
												className="border-blue-500 text-blue-500 hover:bg-blue-50"
												onClick={() => setActiveTab("subscription")}>
												<Calendar className="mr-2 h-4 w-4" />
												{t("viewSubscriptionDetails")}
											</Button>
											{/* <Button
												variant="outline"
												className="border-red-500 text-red-500 hover:bg-red-50"
												onClick={() => setShowConfirmUnsubscribe(true)}
												disabled={!isSubscribed || isLoading}>
												<BellOff className="mr-2 h-4 w-4" />
												{t("unsubscribe")}
											</Button> */}
										</CardFooter>
									</Card>

									<Card className="shadow-lg">
										<CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
											<CardTitle className="flex items-center text-xl">
												<BarChart3 className="mr-2 h-5 w-5" />
												{t("activitySummary")}
											</CardTitle>
										</CardHeader>
										<CardContent className="p-6">
											<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
												<Card className="bg-blue-50 border-blue-100">
													<CardContent className="p-4 flex flex-col items-center justify-center text-center">
														<Eye className="h-8 w-8 text-blue-500 mb-2" />
														<p className="text-2xl font-bold text-blue-700">
															{userViewCount}
														</p>
														<p className="text-sm text-blue-600">
															{t("totalViews")}
														</p>
													</CardContent>
												</Card>
												<Card className="bg-red-50 border-red-100">
													<CardContent className="p-4 flex flex-col items-center justify-center text-center">
														<Heart className="h-8 w-8 text-red-500 mb-2" />
														<p className="text-2xl font-bold text-red-700">
															{favoriteArticles.length}
														</p>
														<p className="text-sm text-red-600">
															{t("favoriteArticles")}
														</p>
													</CardContent>
												</Card>
												<Card className="bg-green-50 border-green-100">
													<CardContent className="p-4 flex flex-col items-center justify-center text-center">
														<Clock className="h-8 w-8 text-green-500 mb-2" />
														<p className="text-2xl font-bold text-green-700">
															{remainingDays}
														</p>
														<p className="text-sm text-green-600">
															{t("daysRemaining")}
														</p>
													</CardContent>
												</Card>
												<Card className="bg-purple-50 border-purple-100">
													<CardContent className="p-4 flex flex-col items-center justify-center text-center">
														<RefreshCw className="h-8 w-8 text-purple-500 mb-2" />
														<p className="text-2xl font-bold text-purple-700">
															{totalDays}
														</p>
														<p className="text-sm text-purple-600">
															{t("totalDays")}
														</p>
													</CardContent>
												</Card>
											</div>
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent value="subscription">
									<Card className="shadow-lg">
										<CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
											<CardTitle className="flex items-center text-xl">
												<Calendar className="mr-2 h-5 w-5" />
												{t("subscriptionDetails")}
											</CardTitle>
										</CardHeader>
										<CardContent className="p-6">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
												<div>
													<p className="text-sm text-gray-600">{t("status")}</p>
													<Badge
														className={`${getStatusColor(
															user.subscriptionStatus
														)} px-3 py-1 mt-1`}>
														{t(user.subscriptionStatus.toLowerCase())}
													</Badge>
												</div>
												<div>
													<p className="text-sm text-gray-600">
														{t("lastBilled")}
													</p>
													<p className="font-semibold text-lg">
														{new Date(user.lastBilledAt).toLocaleDateString()}
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600">
														{t("subscribedOn")}
													</p>
													<p className="font-semibold text-lg">
														{new Date(user.subscribedAt).toLocaleDateString()}
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600">
														{t("nextActivation")}
													</p>
													<p className="font-semibold text-lg">
														{user.activateAt
															? new Date(user.activateAt).toLocaleDateString()
															: t("notApplicable")}
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600">
														{t("referenceNo")}
													</p>
													<p className="font-semibold text-lg">
														{user.refNo || t("notApplicable")}
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600">
														{t("contractNo")}
													</p>
													<p className="font-semibold text-lg">
														{user.contractNo || t("notApplicable")}
													</p>
												</div>
											</div>

											<div className="mt-8">
												<h3 className="text-lg font-medium mb-4">
													{t("subscriptionProgress")}
												</h3>
												<div className="flex justify-between mb-2">
													<span className="text-gray-600">
														{t("start")}:{" "}
														{new Date(
															user.subscriptionStart
														).toLocaleDateString()}
													</span>
													<span className="text-gray-600">
														{t("end")}:{" "}
														{new Date(
															user.subscriptionEnd
														).toLocaleDateString()}
													</span>
												</div>
												<Progress
													value={progress}
													className="w-full h-3 bg-gray-200"
												/>
												<p className="mt-3 text-center text-gray-700 font-medium">
													{remainingDays} {t("daysRemaining")} {t("outOf")}{" "}
													{totalDays} {t("days")}
												</p>
											</div>

											<div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
												<h3 className="text-lg font-medium text-blue-800 mb-2 flex items-center">
													<Bell className="mr-2 h-5 w-5" />
													{t("subscriptionInfo")}
												</h3>
												<p className="text-blue-700">
													{t("subscriptionInfoText")}
												</p>
											</div>
										</CardContent>
										<CardFooter className="flex justify-between p-6 bg-gray-50">
											<Button
												variant="outline"
												className="border-blue-500 text-blue-500 hover:bg-blue-50"
												onClick={() => setActiveTab("overview")}>
												<User className="mr-2 h-4 w-4" />
												{t("backToOverview")}
											</Button>
											<Button
												variant="outline"
												className="border-red-500 text-red-500 hover:bg-red-50"
												onClick={() => setShowConfirmUnsubscribe(true)}
												disabled={!isSubscribed || isLoading}>
												<BellOff className="mr-2 h-4 w-4" />
												{t("unsubscribe")}
											</Button>
										</CardFooter>
									</Card>
								</TabsContent>

								<TabsContent value="favorites">
									<Card className="shadow-lg">
										<CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
											<CardTitle className="flex items-center text-xl">
												<Heart className="mr-2 h-5 w-5" />
												{t("favoriteArticles")}
											</CardTitle>
										</CardHeader>
										<CardContent className="p-6">
											{isLoading ? (
												<div className="flex justify-center items-center py-12">
													<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
												</div>
											) : favoriteArticles.length === 0 ? (
												<div className="text-center py-12">
													<Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
													<h3 className="text-xl font-medium text-gray-700 mb-2">
														{t("noFavoriteArticles")}
													</h3>
													<p className="text-gray-500 max-w-md mx-auto">
														{t("noFavoriteArticlesDescription")}
													</p>
													<Button
														variant="outline"
														className="mt-6"
														onClick={() => router.push("/")}>
														{t("browseArticles")}
													</Button>
												</div>
											) : (
												<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
													{favoriteArticles.map((article) => (
														<motion.div
															key={article.id}
															whileHover={{ y: -5 }}
															transition={{ type: "spring", stiffness: 300 }}>
															<Link href={`/article/${article.id}`}>
																<Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
																	<div className="relative h-40">
																		{article.featuredImage ? (
																			<img
																				src={
																					article.featuredImage ||
																					"/placeholder.svg"
																				}
																				alt={getLocalizedContent(article.title)}
																				className="w-full h-full object-cover"
																			/>
																		) : (
																			<div className="w-full h-full bg-gray-200 flex items-center justify-center">
																				<Newspaper className="h-12 w-12 text-gray-400" />
																			</div>
																		)}
																		<div className="absolute top-2 right-2">
																			<div className="bg-white rounded-full p-1.5 shadow-md">
																				<Heart className="h-5 w-5 text-red-500 fill-current" />
																			</div>
																		</div>
																	</div>
																	<CardContent className="p-4 flex-grow">
																		<Badge
																			className={`mb-2 ${getStatusColor(
																				article.category
																			)}`}>
																			{t(article.category.toLowerCase())}
																		</Badge>
																		<h3 className="font-semibold text-lg mb-2 line-clamp-2">
																			{getLocalizedContent(article.title)}
																		</h3>
																	</CardContent>
																	<CardFooter className="p-4 pt-0 flex justify-between items-center border-t">
																		<Button
																			variant="ghost"
																			size="sm"
																			className="text-blue-600 p-0 hover:bg-transparent hover:text-blue-800">
																			{t("readMore")}
																			<ChevronRight className="h-4 w-4 ml-1" />
																		</Button>
																		<Button
																			variant="ghost"
																			size="sm"
																			className="text-gray-500 p-0 hover:bg-transparent hover:text-gray-700">
																			<Share2 className="h-4 w-4" />
																		</Button>
																	</CardFooter>
																</Card>
															</Link>
														</motion.div>
													))}
												</div>
											)}
										</CardContent>
									</Card>
								</TabsContent>
							</motion.div>
						</AnimatePresence>
					</Tabs>

					<div className="flex justify-center mt-8">
						<Button
							onClick={handleLogout}
							variant="outline"
							className="border-blue-500 text-blue-500 hover:bg-blue-50"
							disabled={isLoading}>
							<LogOut className="mr-2 h-5 w-5" />
							{isLoading ? t("loading") : t("logout")}
						</Button>
					</div>
				</motion.div>
			</main>

			{/* Confirmation Dialog for Unsubscribe */}
			{showConfirmUnsubscribe && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							{t("confirmUnsubscribe")}
						</h3>
						<p className="text-gray-600 mb-6">{t("confirmUnsubscribeText")}</p>
						<div className="flex justify-end space-x-4">
							<Button
								variant="outline"
								onClick={() => setShowConfirmUnsubscribe(false)}
								disabled={isLoading}>
								{t("cancel")}
							</Button>
							<Button
								variant="destructive"
								onClick={handleUnsubscribe}
								disabled={isLoading}
								className="bg-red-600 hover:bg-red-700">
								{isLoading ? (
									<div className="flex items-center">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										{t("processing")}
									</div>
								) : (
									<>
										<BellOff className="mr-2 h-4 w-4" />
										{t("confirmUnsubscribe")}
									</>
								)}
							</Button>
						</div>
					</motion.div>
				</div>
			)}
		</div>
	);
}
