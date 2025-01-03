"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface User {
	id: string;
	name: string;
	phone: string;
	viewCount: number;
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
	user: User;
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

	useEffect(() => {
		const fetchFavoriteArticles = async () => {
			try {
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
					title: "Error",
					description: "Failed to load favorite articles. Please try again.",
					variant: "destructive",
				});
			}
		};

		fetchFavoriteArticles();
	}, [user.id, toast]);

	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", { method: "POST" });
			router.push("/");
			window.location.reload();
		} catch (error) {
			console.error("Logout error:", error);
			toast({
				title: "Error",
				description: "Failed to logout. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleUnsubscribe = async () => {
		try {
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
					title: "Success",
					description: "You have been unsubscribed successfully.",
				});
				// Logout after unsubscribing
				await handleLogout();
			} else {
				throw new Error("Failed to unsubscribe");
			}
		} catch (error) {
			console.error("Unsubscribe error:", error);
			toast({
				title: "Error",
				description: "Failed to unsubscribe. Please try again.",
				variant: "destructive",
			});
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
			const parsedContent = JSON.parse(content as any);
			return (
				parsedContent[language as keyof typeof parsedContent] ||
				parsedContent.en ||
				""
			);
		} catch (error) {
			console.error("Invalid content format:", error);
			return "";
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
			<main className="w-[100%] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-16">
				<Card className="w-full overflow-hidden shadow-xl">
					<CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
						<div className="flex flex-col md:flex-row items-center justify-between">
							<div className="flex items-center space-x-6 mb-4 md:mb-0">
								<Avatar className="h-28 w-28 border-4 border-white shadow-lg">
									<AvatarImage
										src="/assets/icons/AvatarImage.svg"
										alt="User's avatar"
									/>
									<AvatarFallback className="text-3xl">
										{user.name.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div>
									<CardTitle className="text-3xl font-bold mb-2">
										{user.name}
									</CardTitle>
									<CardDescription className="text-xl text-gray-200">
										{user.phone}
									</CardDescription>
								</div>
							</div>
							<div className="flex space-x-4">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="secondary"
												className="bg-white text-blue-900 hover:bg-gray-100 transition-colors">
												<Eye className="h-5 w-5" />
												<span className="ml-2">{user.viewCount}</span>
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
												className="bg-white text-blue-900 hover:bg-gray-100 transition-colors">
												<BookOpen className="h-5 w-5" />
												<span className="ml-2">{favoriteArticles.length}</span>
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
					<CardContent className="p-2">
						<div className="flex justify-center items-center space-x-4 my-6 mx-auto">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											onClick={handleUnsubscribe}
											variant="outline"
											className="border-red-500 text-red-500 hover:bg-red-50"
											disabled={!isSubscribed}>
											<BellOff className="mr-2 h-5 w-5" />
											{t("unsubscribe")}
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>{t("unsubscribeTooltip")}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<Button
								onClick={handleLogout}
								variant="outline"
								className="border-blue-500 text-blue-500 hover:bg-blue-50">
								<LogOut className="mr-2 h-5 w-5" />
								{t("logout")}
							</Button>
						</div>
						<Card className="mb-8 bg-white shadow-md rounded-lg overflow-hidden w-full">
							<CardHeader className="bg-blue-600 text-white">
								<CardTitle className="flex items-center text-2xl">
									<Calendar className="mr-2 h-6 w-6" />
									{t("subscriptionDetails")}
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6">
								<div className="grid grid-cols-2 gap-6 mb-6">
									<div>
										<p className="text-sm text-gray-600">{t("status")}</p>
										<p className="font-semibold text-lg">
											{t(user.subscriptionStatus.toLowerCase())}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">{t("lastBilled")}</p>
										<p className="font-semibold text-lg">
											{new Date(user.lastBilledAt).toLocaleDateString()}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">{t("subscribedOn")}</p>
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
										<p className="text-sm text-gray-600">{t("referenceNo")}</p>
										<p className="font-semibold text-lg">
											{user.refNo || t("notApplicable")}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">{t("contractNo")}</p>
										<p className="font-semibold text-lg">
											{user.contractNo || t("notApplicable")}
										</p>
									</div>
								</div>
								<div className="flex justify-between mb-3">
									<span className="text-gray-600">
										{t("start")}:{" "}
										{new Date(user.subscriptionStart).toLocaleDateString()}
									</span>
									<span className="text-gray-600">
										{t("end")}:{" "}
										{new Date(user.subscriptionEnd).toLocaleDateString()}
									</span>
								</div>
								<Progress value={progress} className="w-full h-3 bg-gray-200" />
								<p className="mt-3 text-center text-gray-700 font-medium">
									{remainingDays} {t("daysRemaining")} {t("outOf")} {totalDays}{" "}
									{t("days")}
								</p>
							</CardContent>
						</Card>
						<Card className="bg-white shadow-md rounded-lg overflow-hidden">
							<CardHeader className="bg-red-600 text-white">
								<CardTitle className="flex items-center text-2xl">
									<Heart className="mr-2 h-6 w-6" />
									{t("favoriteArticles")}
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6">
								{favoriteArticles.length === 0 ? (
									<p className="text-center text-gray-500">
										{t("noFavoriteArticles")}
									</p>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
										{favoriteArticles.map((article) => (
											<Link href={`/article/${article.id}`} key={article.id}>
												<Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
													<div className="relative">
														{article.featuredImage ? (
															<img
																src={article.featuredImage}
																alt={getLocalizedContent(article.title)}
																className="w-full h-20 object-cover"
															/>
														) : (
															<div className="w-full h-20 bg-gray-200 flex items-center justify-center">
																<Newspaper className="h-12 w-12 text-gray-400" />
															</div>
														)}
														<div className="absolute top-2 right-2">
															<Heart className="h-6 w-6 text-red-500 fill-current" />
														</div>
													</div>
													<CardContent className="p-4">
														<h3 className="font-semibold text-lg mb-2 line-clamp-2">
															{getLocalizedContent(article.title)}
														</h3>
														<Badge className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
															{t(article.category)}
														</Badge>
													</CardContent>
												</Card>
											</Link>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { LogOut, BellOff, Eye, Newspaper, Calendar } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import {
// 	Tooltip,
// 	TooltipContent,
// 	TooltipProvider,
// 	TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";

// interface User {
// 	id: string;
// 	name: string;
// 	phone: string;
// 	viewCount: number;
// 	subscriptionStatus:
// 		| "ACTIVE"
// 		| "UNSUBSCRIBE"
// 		| "PENDING"
// 		| "INACTIVE"
// 		| "RENEW";
// 	subscriptionStart: string;
// 	subscriptionEnd: string;
// 	lastBilledAt: string;
// 	subscribedAt: string;
// 	activateAt: string;
// 	refNo: string;
// 	contractNo: string;
// }

// interface FavoriteArticle {
// 	id: string;
// 	title: string;
// 	category: string;
// }

// interface ProfileClientProps {
// 	user: User;
// }

// export default function ProfileClient({ user }: ProfileClientProps | any) {
// 	const router = useRouter();
// 	const { toast } = useToast();
// 	const [isSubscribed, setIsSubscribed] = useState(
// 		user.subscriptionStatus === "ACTIVE"
// 	);
// 	const [favoriteArticles, setFavoriteArticles] = useState<FavoriteArticle[]>(
// 		[]
// 	);

// 	useEffect(() => {
// 		const fetchFavoriteArticles = async () => {
// 			try {
// 				const response = await fetch(`/api/favorites/${user.id}`);
// 				if (response.ok) {
// 					const data = await response.json();
// 					setFavoriteArticles(data);
// 				} else {
// 					throw new Error("Failed to fetch favorite articles");
// 				}
// 			} catch (error) {
// 				console.error("Error fetching favorite articles:", error);
// 				toast({
// 					title: "Error",
// 					description: "Failed to load favorite articles. Please try again.",
// 					variant: "destructive",
// 				});
// 			}
// 		};

// 		fetchFavoriteArticles();
// 	}, [user.id, toast]);

// 	const handleLogout = async () => {
// 		try {
// 			await fetch("/api/auth/logout", { method: "POST" });
// 			router.push("/");
// 			window.location.reload();
// 		} catch (error) {
// 			console.error("Logout error:", error);
// 			toast({
// 				title: "Error",
// 				description: "Failed to logout. Please try again.",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	const handleUnsubscribe = async () => {
// 		try {
// 			const response = await fetch("/api/user/subscription", {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({ userId: user.id, action: "unsubscribe" }),
// 			});

// 			if (response.ok) {
// 				setIsSubscribed(false);
// 				toast({
// 					title: "Success",
// 					description: "You have been unsubscribed successfully.",
// 				});
// 				// Logout after unsubscribing
// 				await handleLogout();
// 			} else {
// 				throw new Error("Failed to unsubscribe");
// 			}
// 		} catch (error) {
// 			console.error("Unsubscribe error:", error);
// 			toast({
// 				title: "Error",
// 				description: "Failed to unsubscribe. Please try again.",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	const calculateRemainingDays = () => {
// 		const end = new Date(user.subscriptionEnd);
// 		const today = new Date();
// 		const diffTime = Math.abs(end.getTime() - today.getTime());
// 		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
// 		return diffDays;
// 	};

// 	const totalSubscriptionDays = () => {
// 		const start = new Date(user.subscriptionStart);
// 		const end = new Date(user.subscriptionEnd);
// 		const diffTime = Math.abs(end.getTime() - start.getTime());
// 		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
// 	};

// 	const remainingDays = calculateRemainingDays();
// 	const totalDays = totalSubscriptionDays();
// 	const progress = ((totalDays - remainingDays) / totalDays) * 100;

// 	return (
// 		<div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
// 			<main className="w-[100%] mx-auto px-4 sm:px-6 lg:px-6 py-6">
// 				<Card className="w-full overflow-hidden">
// 					<CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
// 						<div className="flex items-center justify-between">
// 							<div className="flex items-center space-x-4">
// 								<Avatar className="h-24 w-24 border-4 border-white">
// 									<AvatarImage
// 										src="/assets/icons/AvatarImage.svg"
// 										alt="User's avatar"
// 									/>
// 									<AvatarFallback className="text-2xl">
// 										{user.name.charAt(0)}
// 									</AvatarFallback>
// 								</Avatar>
// 								<div>
// 									<CardTitle className="text-2xl font-bold">
// 										{user.name}
// 									</CardTitle>
// 									<CardDescription className="text-lg text-gray-200">
// 										{user.phone}
// 									</CardDescription>
// 								</div>
// 							</div>
// 							<div className="space-x-2 flex flex-col space-y-2">
// 								<TooltipProvider>
// 									<Tooltip>
// 										<TooltipTrigger asChild>
// 											<Button
// 												onClick={handleUnsubscribe}
// 												variant="secondary"
// 												className="bg-white text-blue-600 hover:bg-gray-100"
// 												disabled={!isSubscribed}>
// 												<BellOff className="mr-2 h-4 w-4 mb-2" />
// 												Unsubscribe
// 											</Button>
// 										</TooltipTrigger>
// 										<TooltipContent>
// 											<p>Unsubscribe from our service</p>
// 										</TooltipContent>
// 									</Tooltip>
// 								</TooltipProvider>

// 								<Button
// 									onClick={handleLogout}
// 									variant="secondary"
// 									className="bg-white text-blue-600 hover:bg-gray-100">
// 									<LogOut className="mr-2 h-4 w-4" />
// 									Logout
// 								</Button>
// 							</div>
// 						</div>
// 					</CardHeader>
// 					<Card className="mt-6 bg-white shadow-lg rounded-lg overflow-hidden">
// 						<CardHeader className="bg-blue-500 text-white">
// 							<CardTitle className="flex items-center text-2xl">
// 								<Calendar className="mr-2 h-6 w-6" />
// 								Subscription Details
// 							</CardTitle>
// 						</CardHeader>
// 						<CardContent className="p-6">
// 							<div className="grid grid-cols-2 gap-4 mb-4">
// 								<div>
// 									<p className="text-sm text-gray-600">Status</p>
// 									<p className="font-semibold">{user.subscriptionStatus}</p>
// 								</div>
// 								<div>
// 									<p className="text-sm text-gray-600">Last Billed</p>
// 									<p className="font-semibold">
// 										{new Date(user.lastBilledAt).toLocaleDateString()}
// 									</p>
// 								</div>
// 								<div>
// 									<p className="text-sm text-gray-600">Subscribed On</p>
// 									<p className="font-semibold">
// 										{new Date(user.subscribedAt).toLocaleDateString()}
// 									</p>
// 								</div>
// 								<div>
// 									<p className="text-sm text-gray-600">Next Activation</p>
// 									<p className="font-semibold">
// 										{user.activateAt
// 											? new Date(user.activateAt).toLocaleDateString()
// 											: "N/A"}
// 									</p>
// 								</div>
// 								<div>
// 									<p className="text-sm text-gray-600">Reference No.</p>
// 									<p className="font-semibold">{user.refNo || "N/A"}</p>
// 								</div>
// 								<div>
// 									<p className="text-sm text-gray-600">Contract No.</p>
// 									<p className="font-semibold">{user.contractNo || "N/A"}</p>
// 								</div>
// 							</div>
// 							<div className="flex justify-between mb-2">
// 								<span className="text-gray-600">
// 									Start: {new Date(user.subscriptionStart).toLocaleDateString()}
// 								</span>
// 								<span className="text-gray-600">
// 									End: {new Date(user.subscriptionEnd).toLocaleDateString()}
// 								</span>
// 							</div>
// 							<Progress
// 								value={progress}
// 								className="w-full h-2 bg-gray-200"
// 								// indicatorClassName="bg-blue-500"
// 							/>
// 							<p className="mt-2 text-center text-gray-700">
// 								{remainingDays} days remaining out of {totalDays} days
// 							</p>
// 						</CardContent>
// 					</Card>
// 					<CardContent className="p-6">
// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
// 							<Card className="bg-white shadow-lg rounded-lg overflow-hidden">
// 								<CardHeader className="bg-red-500 text-white">
// 									<CardTitle className="flex items-center text-2xl">
// 										<Newspaper className="mr-2 h-6 w-6" />
// 										Favorite Articles
// 									</CardTitle>
// 								</CardHeader>
// 								<CardContent className="p-6">
// 									<div className="flex flex-wrap gap-2">
// 										{favoriteArticles.map((article) => (
// 											<Badge
// 												key={article.id}
// 												className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
// 												{article.title}
// 											</Badge>
// 										))}
// 									</div>
// 								</CardContent>
// 							</Card>
// 						</div>
// 					</CardContent>
// 				</Card>
// 			</main>
// 		</div>
// 	);
// }
