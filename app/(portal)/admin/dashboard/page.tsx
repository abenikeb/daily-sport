"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, ChevronDown, LogOut, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Article, ArticleStatus } from "@prisma/client";

export default function AdminDashboard() {
	const { t, language } = useLanguage();
	const { toast } = useToast();
	const [articles, setArticles] = useState<Article[]>([]);

	useEffect(() => {
		async function fetchArticles() {
			const res = await fetch("/api/admin/articles");
			const data = await res.json();
			setArticles(data);
		}
		fetchArticles();
	}, []);

	const handleReview = async (id: string, newStatus: ArticleStatus) => {
		const res = await fetch("/api/admin/articles", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id, status: newStatus }),
		});
		if (res.ok) {
			setArticles(
				articles.map((article: any) =>
					article.id === id ? { ...article, status: newStatus } : article
				)
			);
			if (newStatus === "APPROVED") {
				toast({
					title: t("articleApproved"),
					description: t("articleApprovedDescription"),
					duration: 5000,
				});
			} else if (newStatus === "REJECTED") {
				toast({
					title: t("articleRejected"),
					description: t("articleRejectedDescription"),
					duration: 5000,
				});
			}
		} else {
			toast({
				title: t("errorReviewingArticle"),
				description: t("errorReviewingArticleDescription"),
				variant: "destructive",
				duration: 5000,
			});
		}
	};

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Header */}
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
					<h1 className="text-2xl font-bold text-gray-900">
						{t("adminDashboard")}
					</h1>
					<div className="flex items-center space-x-4">
						<Button variant="ghost" size="icon">
							<Bell className="h-5 w-5" />
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="flex items-center space-x-2">
									<Avatar className="h-8 w-8">
										<AvatarImage
											src="/placeholder-avatar.jpg"
											alt="Admin's avatar"
										/>
										<AvatarFallback>AD</AvatarFallback>
									</Avatar>
									<span>Admin Name</span>
									<ChevronDown className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>{t("adminProfile")}</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>{t("editProfile")}</DropdownMenuItem>
								<DropdownMenuItem>{t("settings")}</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<LogOut className="mr-2 h-4 w-4" />
									<span>{t("logout")}</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Tabs defaultValue="pending" className="space-y-4">
					<TabsList>
						<TabsTrigger value="pending">{t("pendingReview")}</TabsTrigger>
						<TabsTrigger value="approved">{t("approved")}</TabsTrigger>
						<TabsTrigger value="rejected">{t("rejected")}</TabsTrigger>
					</TabsList>
					<TabsContent value="pending" className="space-y-4">
						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("title")}</TableHead>
										<TableHead>{t("author")}</TableHead>
										<TableHead>{t("submissionDate")}</TableHead>
										<TableHead>{t("actions")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{articles
										.filter((article) => article.status === "PENDING")
										.map((article: any) => (
											<TableRow key={article.id}>
												<TableCell className="font-medium">
													{typeof article.title === "string"
														? JSON.parse(article.title)[language] ||
														  JSON.parse(article.title).en
														: article.title[
																language as keyof typeof article.title
														  ] || article.title.en}
												</TableCell>
												<TableCell>{(article.author as any).name}</TableCell>
												<TableCell>
													{new Date(article.createdAt).toLocaleDateString()}
												</TableCell>
												<TableCell>
													<div className="flex space-x-2">
														<Button
															size="sm"
															onClick={() =>
																handleReview(article.id, "APPROVED")
															}>
															<Check className="mr-2 h-4 w-4" />
															{t("approve")}
														</Button>
														<Button
															size="sm"
															variant="destructive"
															onClick={() =>
																handleReview(article.id, "REJECTED")
															}>
															<X className="mr-2 h-4 w-4" />
															{t("reject")}
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</div>
					</TabsContent>
					<TabsContent value="approved" className="space-y-4">
						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("title")}</TableHead>
										<TableHead>{t("author")}</TableHead>
										<TableHead>{t("submissionDate")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{articles
										.filter((article) => article.status === "APPROVED")
										.map((article: any) => (
											<TableRow key={article.id}>
												<TableCell className="font-medium">
													{typeof article.title === "string"
														? JSON.parse(article.title)[language] ||
														  JSON.parse(article.title).en
														: article.title[
																language as keyof typeof article.title
														  ] || article.title.en}
												</TableCell>
												<TableCell>{(article.author as any).name}</TableCell>
												<TableCell>
													{new Date(article.createdAt).toLocaleDateString()}
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</div>
					</TabsContent>
					<TabsContent value="rejected" className="space-y-4">
						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("title")}</TableHead>
										<TableHead>{t("author")}</TableHead>
										<TableHead>{t("submissionDate")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{articles
										.filter((article) => article.status === "REJECTED")
										.map((article: any) => (
											<TableRow key={article.id}>
												<TableCell className="font-medium">
													{typeof article.title === "string"
														? JSON.parse(article.title)[language] ||
														  JSON.parse(article.title).en
														: article.title[
																language as keyof typeof article.title
														  ] || article.title.en}
												</TableCell>
												<TableCell>{(article.author as any).name}</TableCell>
												<TableCell>
													{new Date(article.createdAt).toLocaleDateString()}
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</div>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}
