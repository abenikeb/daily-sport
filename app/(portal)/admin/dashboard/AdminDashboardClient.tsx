"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Bell,
	ChevronDown,
	LogOut,
	Plus,
	Trash,
	Check,
	X,
	Menu,
} from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Category {
	id: string;
	name: string;
	subcategories: Subcategory[];
}

interface Subcategory {
	id: string;
	name: string;
	categoryId: string;
}

interface User {
	id: string;
	name: string;
	email: string;
}

interface AdminDashboardProps {
	user: User | any;
	initialCategories: Category[];
}

export default function AdminDashboard({
	user,
	initialCategories,
}: AdminDashboardProps) {
	const { t, language } = useLanguage();
	const router = useRouter();
	const { toast } = useToast();
	const [categories, setCategories] = useState<Category[]>(initialCategories);
	const [newCategory, setNewCategory] = useState("");
	const [newSubcategory, setNewSubcategory] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [articles, setArticles] = useState<Article[]>([]);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		async function fetchArticles() {
			const res = await fetch("/api/admin/articles");
			const data = await res.json();
			setArticles(data);
		}
		fetchArticles();
	}, []);

	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", { method: "POST" });
			router.push("/admin/auth");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const handleAddCategory = async () => {
		if (!newCategory.trim()) return;

		try {
			const response = await fetch("/api/admin/categories", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: newCategory }),
			});

			if (!response.ok) throw new Error("Failed to add category");

			const addedCategory = await response.json();
			setCategories([...categories, { ...addedCategory, subcategories: [] }]);
			setNewCategory("");
			toast({ title: "Success", description: "Category added successfully" });
		} catch (error) {
			console.error("Add category error:", error);
			toast({
				title: "Error",
				description: "Failed to add category",
				variant: "destructive",
			});
		}
	};

	const handleAddSubcategory = async () => {
		if (!newSubcategory.trim() || !selectedCategory) return;

		try {
			const response = await fetch("/api/admin/subcategories", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: newSubcategory,
					categoryId: selectedCategory,
				}),
			});

			if (!response.ok) throw new Error("Failed to add subcategory");

			const addedSubcategory = await response.json();
			setCategories(
				categories.map((category) =>
					category.id === selectedCategory
						? {
								...category,
								subcategories: [...category.subcategories, addedSubcategory],
						  }
						: category
				)
			);
			setNewSubcategory("");
			toast({
				title: "Success",
				description: "Subcategory added successfully",
			});
		} catch (error) {
			console.error("Add subcategory error:", error);
			toast({
				title: "Error",
				description: "Failed to add subcategory",
				variant: "destructive",
			});
		}
	};

	const handleDeleteCategory = async (categoryId: string) => {
		try {
			const response = await fetch(`/api/admin/categories/${categoryId}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete category");

			setCategories(
				categories.filter((category) => category.id !== categoryId)
			);
			toast({ title: "Success", description: "Category deleted successfully" });
		} catch (error) {
			console.error("Delete category error:", error);
			toast({
				title: "Error",
				description: "Failed to delete category",
				variant: "destructive",
			});
		}
	};

	const handleDeleteSubcategory = async (
		subcategoryId: string,
		categoryId: string
	) => {
		try {
			const response = await fetch(
				`/api/admin/subcategories/${subcategoryId}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) throw new Error("Failed to delete subcategory");

			setCategories(
				categories.map((category) =>
					category.id === categoryId
						? {
								...category,
								subcategories: category.subcategories.filter(
									(sub) => sub.id !== subcategoryId
								),
						  }
						: category
				)
			);
			toast({
				title: "Success",
				description: "Subcategory deleted successfully",
			});
		} catch (error) {
			console.error("Delete subcategory error:", error);
			toast({
				title: "Error",
				description: "Failed to delete subcategory",
				variant: "destructive",
			});
		}
	};

	const handleReview = async (id: string, newStatus: ArticleStatus) => {
		const res = await fetch("/api/admin/articles", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id, status: newStatus }),
		});
		if (res.ok) {
			setArticles(
				articles.map((article) =>
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
			<header className="bg-white shadow-sm sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
					<div className="flex items-center">
						<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon" className="lg:hidden mr-2">
									<Menu className="h-6 w-6" />
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-[240px] sm:w-[300px]">
								<nav className="flex flex-col gap-4 mt-4">
									<Button
										variant="ghost"
										onClick={() => setIsMobileMenuOpen(false)}>
										{t("categorySettings")}
									</Button>
									<Button
										variant="ghost"
										onClick={() => setIsMobileMenuOpen(false)}>
										{t("pendingReview")}
									</Button>
									<Button
										variant="ghost"
										onClick={() => setIsMobileMenuOpen(false)}>
										{t("approved")}
									</Button>
									<Button
										variant="ghost"
										onClick={() => setIsMobileMenuOpen(false)}>
										{t("rejected")}
									</Button>
								</nav>
							</SheetContent>
						</Sheet>
						<h1 className="text-2xl font-bold text-gray-900">
							{t("adminDashboard")}
						</h1>
					</div>
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
										<AvatarFallback>AN</AvatarFallback>
									</Avatar>
									<span className="hidden sm:inline">{user.name}</span>
									<ChevronDown className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>{t("adminProfile")}</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>{t("editProfile")}</DropdownMenuItem>
								<DropdownMenuItem>{t("settings")}</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleLogout}>
									<LogOut className="mr-2 h-4 w-4" />
									<span>{t("logout")}</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Tabs defaultValue="categorySettings" className="space-y-4">
					<TabsList className="flex flex-wrap justify-start gap-2">
						<TabsTrigger value="categorySettings">
							{t("categorySettings")}
						</TabsTrigger>
						<TabsTrigger value="pending">{t("pendingReview")}</TabsTrigger>
						<TabsTrigger value="approved">{t("approved")}</TabsTrigger>
						<TabsTrigger value="rejected">{t("rejected")}</TabsTrigger>
					</TabsList>
					<TabsContent value="categorySettings" className="space-y-4">
						<div className="bg-white shadow-sm rounded-lg p-6">
							<h2 className="text-xl font-semibold mb-4">{t("addCategory")}</h2>
							<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
								<Input
									value={newCategory}
									onChange={(e) => setNewCategory(e.target.value)}
									placeholder={t("enterCategoryName")}
									className="flex-grow"
								/>
								<Button
									onClick={handleAddCategory}
									className="w-full sm:w-auto">
									<Plus className="mr-2 h-4 w-4" /> {t("add")}
								</Button>
							</div>
						</div>
						<div className="bg-white shadow-sm rounded-lg p-6">
							<h2 className="text-xl font-semibold mb-4">
								{t("addSubcategory")}
							</h2>
							<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
								<select
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									value={selectedCategory || ""}
									onChange={(e) => setSelectedCategory(e.target.value)}>
									<option value="">{t("selectCategory")}</option>
									{categories.map((category) => (
										<option key={category.id} value={category.id}>
											{category.name}
										</option>
									))}
								</select>
								<Input
									value={newSubcategory}
									onChange={(e) => setNewSubcategory(e.target.value)}
									placeholder={t("enterSubcategoryName")}
									className="flex-grow"
								/>
								<Button
									onClick={handleAddSubcategory}
									className="w-full sm:w-auto">
									<Plus className="mr-2 h-4 w-4" /> {t("add")}
								</Button>
							</div>
						</div>
						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("categoryName")}</TableHead>
										<TableHead>{t("subcategories")}</TableHead>
										<TableHead>{t("actions")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{categories.map((category) => (
										<TableRow key={category.id}>
											<TableCell>{category.name}</TableCell>
											<TableCell>
												{category.subcategories
													.map((sub) => sub.name)
													.join(", ")}
											</TableCell>
											<TableCell>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteCategory(category.id)}>
													<Trash className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</TabsContent>
					<TabsContent value="pending" className="space-y-4">
						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("title")}</TableHead>
										<TableHead>{t("author")}</TableHead>
										<TableHead className="hidden md:table-cell">
											{t("submissionDate")}
										</TableHead>
										<TableHead>{t("actions")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{articles.filter((article) => article.status === "PENDING")
										.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4} className="text-center py-4">
												{t("noPendingReviews")}
											</TableCell>
										</TableRow>
									) : (
										articles
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
													<TableCell className="hidden md:table-cell">
														{new Date(article.createdAt).toLocaleDateString()}
													</TableCell>
													<TableCell>
														<div className="flex flex-col sm:flex-row gap-2">
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
											))
									)}
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
										<TableHead className="hidden md:table-cell">
											{t("submissionDate")}
										</TableHead>
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
												<TableCell className="hidden md:table-cell">
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
										<TableHead className="hidden md:table-cell">
											{t("submissionDate")}
										</TableHead>
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
												<TableCell className="hidden md:table-cell">
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
