"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, BellOff, Eye, Newspaper, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface FavoriteArticle {
	id: string;
	title: string;
	category: string;
}

interface ProfileClientProps {
	user: User;
}

export default function ProfileClient({ user }: ProfileClientProps) {
	const router = useRouter();
	const { toast } = useToast();
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

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
			<main className="w-[100%] mx-auto px-4 sm:px-6 lg:px-6 py-6">
				<Card className="w-full overflow-hidden">
					<CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<Avatar className="h-24 w-24 border-4 border-white">
									<AvatarImage
										src="/assets/icons/AvatarImage.svg"
										alt="User's avatar"
									/>
									<AvatarFallback className="text-2xl">
										{user.name.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div>
									<CardTitle className="text-2xl font-bold">
										{user.name}
									</CardTitle>
									<CardDescription className="text-lg text-gray-200">
										{user.phone}
									</CardDescription>
								</div>
							</div>
							<div className="space-x-2 flex flex-col space-y-2">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												onClick={handleUnsubscribe}
												variant="secondary"
												className="bg-white text-blue-600 hover:bg-gray-100"
												disabled={!isSubscribed}>
												<BellOff className="mr-2 h-4 w-4 mb-2" />
												Unsubscribe
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Unsubscribe from our service</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<Button
									onClick={handleLogout}
									variant="secondary"
									className="bg-white text-blue-600 hover:bg-gray-100">
									<LogOut className="mr-2 h-4 w-4" />
									Logout
								</Button>
							</div>
						</div>
					</CardHeader>
					<Card className="mt-6 bg-white shadow-lg rounded-lg overflow-hidden">
						<CardHeader className="bg-blue-500 text-white">
							<CardTitle className="flex items-center text-2xl">
								<Calendar className="mr-2 h-6 w-6" />
								Subscription Details
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6">
							<div className="grid grid-cols-2 gap-4 mb-4">
								<div>
									<p className="text-sm text-gray-600">Status</p>
									<p className="font-semibold">{user.subscriptionStatus}</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Last Billed</p>
									<p className="font-semibold">
										{new Date(user.lastBilledAt).toLocaleDateString()}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Subscribed On</p>
									<p className="font-semibold">
										{new Date(user.subscribedAt).toLocaleDateString()}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Next Activation</p>
									<p className="font-semibold">
										{user.activateAt
											? new Date(user.activateAt).toLocaleDateString()
											: "N/A"}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Reference No.</p>
									<p className="font-semibold">{user.refNo || "N/A"}</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Contract No.</p>
									<p className="font-semibold">{user.contractNo || "N/A"}</p>
								</div>
							</div>
							<div className="flex justify-between mb-2">
								<span className="text-gray-600">
									Start: {new Date(user.subscriptionStart).toLocaleDateString()}
								</span>
								<span className="text-gray-600">
									End: {new Date(user.subscriptionEnd).toLocaleDateString()}
								</span>
							</div>
							<Progress
								value={progress}
								className="w-full h-2 bg-gray-200"
								// indicatorClassName="bg-blue-500"
							/>
							<p className="mt-2 text-center text-gray-700">
								{remainingDays} days remaining out of {totalDays} days
							</p>
						</CardContent>
					</Card>
					<CardContent className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
							<Card className="bg-white shadow-lg rounded-lg overflow-hidden">
								<CardHeader className="bg-red-500 text-white">
									<CardTitle className="flex items-center text-2xl">
										<Newspaper className="mr-2 h-6 w-6" />
										Favorite Articles
									</CardTitle>
								</CardHeader>
								<CardContent className="p-6">
									<div className="flex flex-wrap gap-2">
										{favoriteArticles.map((article) => (
											<Badge
												key={article.id}
												className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
												{article.title}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
