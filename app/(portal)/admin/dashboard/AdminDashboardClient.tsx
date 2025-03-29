"use client";

import type React from "react";

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
	Eye,
	Pencil,
	Calendar,
	UserPlus,
	UserX,
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
import type { Article, ArticleStatus } from "@prisma/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { SubscribersList } from "@/components/SubscribersList";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CloudinaryUploader } from "@/components/cloudinary-uploader";
import { ViewArticleModal } from "@/components/view-article-modal";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Update the User interface to include the missing properties
interface User {
	id: string;
	name: string;
	email: string;
	active?: boolean;
	createdAt: Date | string;
	articles?: any[];
}

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
	const [writers, setWriters] = useState<User[]>([]);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingArticle, setEditingArticle] = useState<Article | null>(null);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState("en");
	const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	// Writer management states
	const [isAddWriterModalOpen, setIsAddWriterModalOpen] = useState(false);
	const [isDeactivateWriterModalOpen, setIsDeactivateWriterModalOpen] =
		useState(false);
	const [writerToDeactivate, setWriterToDeactivate] = useState<User | null>(
		null
	);
	const [newWriterData, setNewWriterData] = useState({
		name: "",
		email: "",
		password: "",
	});

	const languages = ["en", "am", "om"];

	const [editFormData, setEditFormData] = useState({
		title: { en: "", am: "", om: "" },
		content: { en: "", am: "", om: "" },
		categoryId: "",
		subcategoryId: "",
		tags: "",
		featuredImage: null as string | null,
	});

	useEffect(() => {
		async function fetchArticles() {
			const res = await fetch("/api/admin/articles");
			const data = await res.json();
			setArticles(data);
		}
		fetchArticles();
	}, []);

	useEffect(() => {
		async function fetchWriters() {
			try {
				const res = await fetch("/api/admin/writers");
				if (!res.ok) throw new Error("Failed to fetch writers");
				const data = await res.json();
				console.log({
					WRITER: data,
				});
				setWriters(data);
			} catch (error) {
				console.error("Error fetching writers:", error);
				toast({
					title: "Error",
					description: "Failed to fetch writers",
					variant: "destructive",
				});
			}
		}
		fetchWriters();
	}, [toast]);

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

	const handleReview = async (id: string, newStatus: ArticleStatus) => {
		try {
			const res = await fetch("/api/admin/articles", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, status: newStatus }),
			});
			if (!res.ok) throw new Error("Failed to update article status");
			const updatedArticle = await res.json();
			setArticles(
				articles.map((article) =>
					article.id === id ? updatedArticle : article
				)
			);
			toast({
				title:
					newStatus === "APPROVED"
						? t("articleApproved")
						: t("articleRejected"),
				description:
					newStatus === "APPROVED"
						? t("articleApprovedDescription")
						: t("articleRejectedDescription"),
				duration: 5000,
			});
		} catch (error) {
			console.error("Error reviewing article:", error);
			toast({
				title: t("errorReviewingArticle"),
				description: t("errorReviewingArticleDescription"),
				variant: "destructive",
				duration: 5000,
			});
		}
	};

	const handleView = (article: Article) => {
		setViewingArticle(article);
		setIsViewModalOpen(true);
	};

	const handleEdit = (article: any) => {
		setEditingArticle(article);

		// Parse title and content if they are strings
		const parsedTitle =
			typeof article.title === "string"
				? JSON.parse(article.title)
				: article.title;

		const parsedContent =
			typeof article.content === "string"
				? JSON.parse(article.content)
				: article.content;

		// Set form data with article values
		setEditFormData({
			title: parsedTitle,
			content: parsedContent,
			categoryId: article.categoryId || "",
			subcategoryId: article.subcategoryId || "",
			tags: article.tags
				? Array.isArray(article.tags)
					? article.tags.map((tag: any) => tag.name).join(", ")
					: ""
				: "",
			featuredImage: article.featuredImage || null,
		});

		// Set image preview if article has a featured image
		if (article.featuredImage) {
			setImagePreview(article.featuredImage);
		} else {
			setImagePreview(null);
		}

		// Fetch subcategories for the selected category
		if (article.categoryId) {
			fetchSubcategories(article.categoryId);
		}

		setIsEditModalOpen(true);
	};

	const fetchSubcategories = async (categoryId: string) => {
		try {
			const res = await fetch(`/api/subcategories?categoryId=${categoryId}`);
			if (!res.ok) {
				throw new Error("Failed to fetch subcategories");
			}
			const data = await res.json();
			setSubcategories(data);
		} catch (error) {
			console.error("Error fetching subcategories:", error);
		}
	};

	const handleCategoryChange = async (value: string) => {
		setEditFormData((prev) => ({
			...prev,
			categoryId: value,
			subcategoryId: "",
		}));
		fetchSubcategories(value);
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		if (name === "title" || name === "content") {
			setEditFormData((prev) => ({
				...prev,
				[name]: {
					...prev[name as "title" | "content"],
					[selectedLanguage]: value,
				},
			}));
		} else {
			setEditFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleUpdateArticle = async () => {
		if (!editingArticle) return;

		try {
			const formData = new FormData();
			formData.append("id", editingArticle.id);
			formData.append("title", JSON.stringify(editFormData.title));
			formData.append("content", JSON.stringify(editFormData.content));
			formData.append("categoryId", editFormData.categoryId);
			formData.append("subcategoryId", editFormData.subcategoryId || "");
			formData.append("tags", editFormData.tags);

			// If we have an image URL from Cloudinary, send it directly
			if (imagePreview) {
				formData.append("featuredImageUrl", imagePreview);
			}

			const res = await fetch(`/api/admin/articles/${editingArticle.id}`, {
				method: "PUT",
				body: formData,
			});

			if (!res.ok) {
				throw new Error("Failed to update article");
			}

			const updatedArticle = await res.json();

			// Update the articles array with the updated article
			setArticles(
				articles.map((article) =>
					article.id === editingArticle.id ? updatedArticle : article
				)
			);

			toast({
				title: t("articleUpdated"),
				description: t("articleUpdatedDescription"),
				duration: 5000,
			});

			// Close the edit modal
			setIsEditModalOpen(false);
		} catch (error) {
			console.error("Error updating article:", error);
			toast({
				title: t("errorUpdatingArticle"),
				description: t("errorUpdatingArticleDescription"),
				variant: "destructive",
				duration: 5000,
			});
		}
	};

	const confirmDelete = (article: Article) => {
		setArticleToDelete(article);
		setIsDeleteConfirmOpen(true);
	};

	const handleDelete = async () => {
		if (!articleToDelete) return;

		try {
			// Now we're soft deleting by changing status to DISABLED
			const res = await fetch(
				`/api/admin/articles/${articleToDelete.id}/disable`,
				{
					method: "PUT",
				}
			);

			if (!res.ok) {
				throw new Error("Failed to disable article");
			}

			const updatedArticle = await res.json();

			// Update the articles array with the updated status
			setArticles(
				articles.map((article) =>
					article.id === articleToDelete.id ? updatedArticle : article
				)
			);

			toast({
				title: t("articleDisabled"),
				description: t("articleDisabledDescription"),
				duration: 5000,
			});

			// Close the delete confirmation dialog
			setIsDeleteConfirmOpen(false);
		} catch (error) {
			console.error("Error disabling article:", error);
			toast({
				title: t("errorDisablingArticle"),
				description: t("errorDisablingArticleDescription"),
				variant: "destructive",
				duration: 5000,
			});
		}
	};

	// Writer management functions
	const handleAddWriter = async () => {
		try {
			const res = await fetch("/api/admin/writers", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newWriterData),
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to add writer");
			}

			const newWriter = await res.json();
			setWriters([...writers, newWriter]);

			toast({
				title: "Success",
				description: "Writer account created successfully",
			});

			// Reset form and close modal
			setNewWriterData({ name: "", email: "", password: "" });
			setIsAddWriterModalOpen(false);
		} catch (error) {
			console.error("Error adding writer:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to add writer",
				variant: "destructive",
			});
		}
	};

	const confirmDeactivateWriter = (writer: User) => {
		setWriterToDeactivate(writer);
		setIsDeactivateWriterModalOpen(true);
	};

	const handleDeactivateWriter = async () => {
		if (!writerToDeactivate) return;

		try {
			const res = await fetch(
				`/api/admin/writers/${writerToDeactivate.id}/deactivate`,
				{
					method: "PUT",
				}
			);

			if (!res.ok) {
				throw new Error("Failed to deactivate writer");
			}

			const updatedWriter = await res.json();

			// Update the writers array
			setWriters(
				writers.map((writer) =>
					writer.id === writerToDeactivate.id ? updatedWriter : writer
				)
			);

			toast({
				title: "Success",
				description: "Writer account deactivated successfully",
			});

			setIsDeactivateWriterModalOpen(false);
		} catch (error) {
			console.error("Error deactivating writer:", error);
			toast({
				title: "Error",
				description: "Failed to deactivate writer",
				variant: "destructive",
			});
		}
	};

	const handleNewWriterInputChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value } = e.target;
		setNewWriterData((prev) => ({ ...prev, [name]: value }));
	};

	// Helper function to get optimized Cloudinary URLs
	const getOptimizedImageUrl = (url: string, width = 800, height = 600) => {
		if (!url || !url.includes("cloudinary.com")) return url;

		// For Cloudinary URLs, we can add transformations
		return url.replace(
			"/upload/",
			`/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`
		);
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
									<Button
										variant="ghost"
										onClick={() => setIsMobileMenuOpen(false)}>
										{t("writers")}
									</Button>
									<Button
										variant="ghost"
										onClick={() => setIsMobileMenuOpen(false)}>
										{t("subscribers")}
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
				<Tabs defaultValue="pending" className="space-y-4">
					<TabsList className="flex flex-wrap justify-start gap-2">
						<TabsTrigger value="pending">{t("pendingReview")}</TabsTrigger>
						<TabsTrigger value="approved">{t("approved")}</TabsTrigger>
						<TabsTrigger value="rejected">{t("rejected")}</TabsTrigger>
						<TabsTrigger value="disabled">{t("disabled")}</TabsTrigger>
						<TabsTrigger value="writers">{t("writers")}</TabsTrigger>
						<TabsTrigger value="categorySettings">
							{t("categorySettings")}
						</TabsTrigger>
						<TabsTrigger value="subscribers">{t("subscribers")}</TabsTrigger>
					</TabsList>

					<TabsContent value="pending" className="space-y-4">
						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("tableNo")}</TableHead>
										<TableHead>{t("image")}</TableHead>
										<TableHead>{t("title")}</TableHead>
										<TableHead>{t("content")}</TableHead>
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
											<TableCell colSpan={7} className="text-center py-4">
												{t("noPendingReviews")}
											</TableCell>
										</TableRow>
									) : (
										articles
											.filter((article) => article.status === "PENDING")
											.map((article: any, index: number) => (
												<TableRow key={article.id}>
													<TableCell>{index + 1}</TableCell>
													<TableCell>
														{article.featuredImage && (
															<div className="relative w-12 h-12">
																<Image
																	src={
																		getOptimizedImageUrl(
																			article.featuredImage,
																			100,
																			100
																		) || "/placeholder.svg"
																	}
																	alt={t("featuredImage")}
																	fill
																	className="object-cover rounded"
																	sizes="48px"
																/>
															</div>
														)}
													</TableCell>
													<TableCell className="font-medium">
														{typeof article.title === "string"
															? JSON.parse(article.title)[language] ||
															  JSON.parse(article.title).en
															: article.title[
																	language as keyof typeof article.title
															  ] || article.title.en}
													</TableCell>
													<TableCell>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleView(article)}>
															<Eye className="mr-2 h-4 w-4" />
															{t("view")}
														</Button>
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
															<Button
																size="sm"
																variant="outline"
																onClick={() => handleEdit(article)}>
																<Pencil className="mr-2 h-4 w-4" />
																{t("edit")}
															</Button>
															<Button
																size="sm"
																variant="outline"
																className="text-red-500"
																onClick={() => confirmDelete(article)}>
																<Trash className="mr-2 h-4 w-4" />
																{t("disable")}
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
										<TableHead>{t("tableNo")}</TableHead>
										<TableHead>{t("image")}</TableHead>
										<TableHead>{t("title")}</TableHead>
										<TableHead>{t("content")}</TableHead>
										<TableHead>{t("author")}</TableHead>
										<TableHead className="hidden md:table-cell">
											{t("submissionDate")}
										</TableHead>
										<TableHead>{t("category")}</TableHead>
										<TableHead>{t("actions")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{articles.filter((article) => article.status === "APPROVED")
										.length === 0 ? (
										<TableRow>
											<TableCell colSpan={8} className="text-center py-4">
												{t("noApprovedArticles")}
											</TableCell>
										</TableRow>
									) : (
										articles
											.filter((article) => article.status === "APPROVED")
											.map((article: any, index: number) => (
												<TableRow key={article.id}>
													<TableCell>{index + 1}</TableCell>
													<TableCell>
														{article.featuredImage && (
															<div className="relative w-12 h-12">
																<Image
																	src={
																		getOptimizedImageUrl(
																			article.featuredImage,
																			100,
																			100
																		) || "/placeholder.svg"
																	}
																	alt={t("featuredImage")}
																	fill
																	className="object-cover rounded"
																	sizes="48px"
																/>
															</div>
														)}
													</TableCell>
													<TableCell className="font-medium">
														{typeof article.title === "string"
															? JSON.parse(article.title)[language] ||
															  JSON.parse(article.title).en
															: article.title[
																	language as keyof typeof article.title
															  ] || article.title.en}
													</TableCell>
													<TableCell>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleView(article)}>
															<Eye className="mr-2 h-4 w-4" />
															{t("view")}
														</Button>
													</TableCell>
													<TableCell>{(article.author as any).name}</TableCell>
													<TableCell className="hidden md:table-cell">
														{new Date(article.createdAt).toLocaleDateString()}
													</TableCell>
													<TableCell>
														{article.category?.name}
														{article.subcategory &&
															` / ${article.subcategory.name}`}
													</TableCell>
													<TableCell>
														<div className="flex flex-col sm:flex-row gap-2">
															<Button
																size="sm"
																variant="outline"
																onClick={() => handleEdit(article)}>
																<Pencil className="mr-2 h-4 w-4" />
																{t("edit")}
															</Button>
															<Button
																size="sm"
																variant="outline"
																className="text-red-500"
																onClick={() => confirmDelete(article)}>
																<Trash className="mr-2 h-4 w-4" />
																{t("disable")}
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

					<TabsContent value="rejected" className="space-y-4">
						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("tableNo")}</TableHead>
										<TableHead>{t("image")}</TableHead>
										<TableHead>{t("title")}</TableHead>
										<TableHead>{t("content")}</TableHead>
										<TableHead>{t("author")}</TableHead>
										<TableHead className="hidden md:table-cell">
											{t("submissionDate")}
										</TableHead>
										<TableHead>{t("actions")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{articles.filter((article) => article.status === "REJECTED")
										.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-4">
												{t("noRejectedArticles")}
											</TableCell>
										</TableRow>
									) : (
										articles
											.filter((article) => article.status === "REJECTED")
											.map((article: any, index: number) => (
												<TableRow key={article.id}>
													<TableCell>{index + 1}</TableCell>
													<TableCell>
														{article.featuredImage && (
															<div className="relative w-12 h-12">
																<Image
																	src={
																		getOptimizedImageUrl(
																			article.featuredImage,
																			100,
																			100
																		) || "/placeholder.svg"
																	}
																	alt={t("featuredImage")}
																	fill
																	className="object-cover rounded"
																	sizes="48px"
																/>
															</div>
														)}
													</TableCell>
													<TableCell className="font-medium">
														{typeof article.title === "string"
															? JSON.parse(article.title)[language] ||
															  JSON.parse(article.title).en
															: article.title[
																	language as keyof typeof article.title
															  ] || article.title.en}
													</TableCell>
													<TableCell>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleView(article)}>
															<Eye className="mr-2 h-4 w-4" />
															{t("view")}
														</Button>
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
																variant="outline"
																onClick={() => handleEdit(article)}>
																<Pencil className="mr-2 h-4 w-4" />
																{t("edit")}
															</Button>
															<Button
																size="sm"
																variant="outline"
																className="text-red-500"
																onClick={() => confirmDelete(article)}>
																<Trash className="mr-2 h-4 w-4" />
																{t("disable")}
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

					<TabsContent value="disabled" className="space-y-4">
						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("tableNo")}</TableHead>
										<TableHead>{t("image")}</TableHead>
										<TableHead>{t("title")}</TableHead>
										<TableHead>{t("content")}</TableHead>
										<TableHead>{t("author")}</TableHead>
										<TableHead className="hidden md:table-cell">
											{t("submissionDate")}
										</TableHead>
										<TableHead>{t("actions")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{articles.filter((article) => article.status === "DISABLED")
										.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-4">
												{t("noDisabledArticles")}
											</TableCell>
										</TableRow>
									) : (
										articles
											.filter((article) => article.status === "DISABLED")
											.map((article: any, index: number) => (
												<TableRow key={article.id}>
													<TableCell>{index + 1}</TableCell>
													<TableCell>
														{article.featuredImage && (
															<div className="relative w-12 h-12">
																<Image
																	src={
																		getOptimizedImageUrl(
																			article.featuredImage,
																			100,
																			100
																		) || "/placeholder.svg"
																	}
																	alt={t("featuredImage")}
																	fill
																	className="object-cover rounded"
																	sizes="48px"
																/>
															</div>
														)}
													</TableCell>
													<TableCell className="font-medium">
														{typeof article.title === "string"
															? JSON.parse(article.title)[language] ||
															  JSON.parse(article.title).en
															: article.title[
																	language as keyof typeof article.title
															  ] || article.title.en}
													</TableCell>
													<TableCell>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleView(article)}>
															<Eye className="mr-2 h-4 w-4" />
															{t("view")}
														</Button>
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
																{t("restore")}
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

					<TabsContent value="writers" className="space-y-4">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold">{t("writerManagement")}</h2>
							<Button onClick={() => setIsAddWriterModalOpen(true)}>
								<UserPlus className="mr-2 h-4 w-4" />
								{t("addWriter")}
							</Button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{writers.length === 0 ? (
								<div className="col-span-full text-center py-8 bg-white rounded-lg shadow">
									{t("noWriters")}
								</div>
							) : (
								writers.map((writer) => (
									<Card key={writer.id}>
										<CardHeader>
											<div className="flex justify-between items-start">
												<div>
													<CardTitle>{writer.name}</CardTitle>
													<CardDescription>{writer.email}</CardDescription>
												</div>
												<Badge
													variant={writer.active ? "default" : "destructive"}>
													{writer.active ? t("active") : t("inactive")}
												</Badge>
											</div>
										</CardHeader>
										<CardContent>
											<div className="flex items-center space-x-2 text-sm text-gray-500">
												<Calendar className="h-4 w-4" />
												<span>
													{t("joined")}:{" "}
													{new Date(writer.createdAt).toLocaleDateString()}
												</span>
											</div>
											<div className="mt-2">
												<p className="text-sm">
													{t("articlesCount")}: {writer.articles?.length || 0}
												</p>
											</div>
										</CardContent>
										<CardFooter className="flex justify-end space-x-2">
											{writer.active ? (
												<Button
													variant="outline"
													className="text-red-500"
													onClick={() => confirmDeactivateWriter(writer)}>
													<UserX className="mr-2 h-4 w-4" />
													{t("deactivate")}
												</Button>
											) : (
												<Button
													variant="outline"
													onClick={() => {
														// Reactivate writer
														fetch(`/api/admin/writers/${writer.id}/activate`, {
															method: "PUT",
														})
															.then((res) => {
																if (!res.ok)
																	throw new Error("Failed to activate writer");
																return res.json();
															})
															.then((updatedWriter) => {
																setWriters(
																	writers.map((w) =>
																		w.id === writer.id ? updatedWriter : w
																	)
																);
																toast({
																	title: "Success",
																	description:
																		"Writer account activated successfully",
																});
															})
															.catch((error) => {
																console.error(
																	"Error activating writer:",
																	error
																);
																toast({
																	title: "Error",
																	description: "Failed to activate writer",
																	variant: "destructive",
																});
															});
													}}>
													<Check className="mr-2 h-4 w-4" />
													{t("activate")}
												</Button>
											)}
										</CardFooter>
									</Card>
								))
							)}
						</div>
					</TabsContent>

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
					<TabsContent value="subscribers" className="space-y-4">
						<div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
							<SubscribersList />
						</div>
					</TabsContent>
				</Tabs>

				{/* View Article Modal */}
				<ViewArticleModal
					article={viewingArticle}
					isOpen={isViewModalOpen}
					onClose={() => setIsViewModalOpen(false)}
				/>

				{/* Edit Article Modal */}
				<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
					<DialogContent className="max-w-4xl">
						<DialogHeader>
							<DialogTitle>{t("editArticle")}</DialogTitle>
						</DialogHeader>
						{editingArticle && (
							<div className="mt-4 overflow-y-auto max-h-[70vh]">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
									<div>
										<Label htmlFor="title">{t("articleTitle")}</Label>
										<Tabs defaultValue="en" className="mb-6">
											<TabsList>
												{languages.map((lang) => (
													<TabsTrigger
														key={lang}
														value={lang}
														onClick={() => setSelectedLanguage(lang)}>
														{t(lang)}
													</TabsTrigger>
												))}
											</TabsList>
											{languages.map((lang) => (
												<TabsContent key={lang} value={lang}>
													<div className="mb-4">
														<Label htmlFor={`title-${lang}`}>
															{t("articleTitle")} ({t(lang)})
														</Label>
														<Input
															id={`title-${lang}`}
															name="title"
															value={
																editFormData.title[
																	lang as keyof typeof editFormData.title
																] || ""
															}
															onChange={handleInputChange}
															placeholder={t("enterTitle")}
															required={lang === "en"}
														/>
													</div>
													<Label htmlFor={`content-${lang}`}>
														{t("articleContent")} ({t(lang)})
													</Label>
													<Textarea
														id={`content-${lang}`}
														name="content"
														value={
															editFormData.content[
																lang as keyof typeof editFormData.content
															] || ""
														}
														onChange={handleInputChange}
														placeholder={t("enterContent")}
														rows={10}
														required={lang === "en"}
													/>
												</TabsContent>
											))}
										</Tabs>
									</div>
									<div className="grid grid-cols-1 gap-4">
										<div>
											<Label htmlFor="category">{t("category")}</Label>
											<Select
												onValueChange={handleCategoryChange}
												value={editFormData.categoryId}>
												<SelectTrigger>
													<SelectValue placeholder={t("selectCategory")} />
												</SelectTrigger>
												<SelectContent>
													{categories.map((category) => (
														<SelectItem key={category.id} value={category.id}>
															{category.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div>
											<Label htmlFor="subcategory">{t("subcategory")}</Label>
											<Select
												onValueChange={(value) =>
													setEditFormData((prev) => ({
														...prev,
														subcategoryId: value,
													}))
												}
												value={editFormData.subcategoryId}>
												<SelectTrigger>
													<SelectValue placeholder={t("selectSubcategory")} />
												</SelectTrigger>
												<SelectContent>
													{subcategories.map((subcategory) => (
														<SelectItem
															key={subcategory.id}
															value={subcategory.id}>
															{subcategory.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div>
											<Label htmlFor="tags">{t("tags")}</Label>
											<Input
												id="tags"
												name="tags"
												type="text"
												value={editFormData.tags}
												onChange={(e) =>
													setEditFormData((prev) => ({
														...prev,
														tags: e.target.value,
													}))
												}
												placeholder="Enter tags separated by commas"
											/>
										</div>
										<div>
											<CloudinaryUploader
												value={imagePreview as any}
												onChange={(url) => {
													setImagePreview(url);
												}}
												onClear={() => {
													setImagePreview(null);
												}}
												label={t("featuredImage")}
											/>
										</div>
									</div>
								</div>
							</div>
						)}
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsEditModalOpen(false)}>
								{t("cancel")}
							</Button>
							<Button onClick={handleUpdateArticle}>
								{t("updateArticle")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Delete Confirmation Dialog */}
				<Dialog
					open={isDeleteConfirmOpen}
					onOpenChange={setIsDeleteConfirmOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("confirmDisable")}</DialogTitle>
							<DialogDescription>
								{t("disableArticleConfirmation")}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsDeleteConfirmOpen(false)}>
								{t("cancel")}
							</Button>
							<Button variant="destructive" onClick={handleDelete}>
								{t("disable")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Add Writer Modal */}
				<Dialog
					open={isAddWriterModalOpen}
					onOpenChange={setIsAddWriterModalOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("addWriter")}</DialogTitle>
							<DialogDescription>{t("addWriterDescription")}</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label htmlFor="name">{t("name")}</Label>
								<Input
									id="name"
									name="name"
									value={newWriterData.name}
									onChange={handleNewWriterInputChange}
									placeholder={t("enterName")}
								/>
							</div>
							<div>
								<Label htmlFor="email">{t("email")}</Label>
								<Input
									id="email"
									name="email"
									type="email"
									value={newWriterData.email}
									onChange={handleNewWriterInputChange}
									placeholder={t("enterEmail")}
								/>
							</div>
							<div>
								<Label htmlFor="password">{t("password")}</Label>
								<Input
									id="password"
									name="password"
									type="password"
									value={newWriterData.password}
									onChange={handleNewWriterInputChange}
									placeholder={t("enterPassword")}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsAddWriterModalOpen(false)}>
								{t("cancel")}
							</Button>
							<Button onClick={handleAddWriter}>{t("addWriter")}</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Deactivate Writer Confirmation */}
				<Dialog
					open={isDeactivateWriterModalOpen}
					onOpenChange={setIsDeactivateWriterModalOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("confirmDeactivate")}</DialogTitle>
							<DialogDescription>
								{t("deactivateWriterConfirmation")}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsDeactivateWriterModalOpen(false)}>
								{t("cancel")}
							</Button>
							<Button variant="destructive" onClick={handleDeactivateWriter}>
								{t("deactivate")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</main>
		</div>
	);
}

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
// 	Bell,
// 	ChevronDown,
// 	LogOut,
// 	Plus,
// 	Trash,
// 	Check,
// 	X,
// 	Menu,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuItem,
// 	DropdownMenuLabel,
// 	DropdownMenuSeparator,
// 	DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
// 	Table,
// 	TableBody,
// 	TableCell,
// 	TableHead,
// 	TableHeader,
// 	TableRow,
// } from "@/components/ui/table";
// import type { Article, ArticleStatus } from "@prisma/client";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// import { ViewArticleModal } from "@/components/ViewArticleModal";
// import { Eye } from "lucide-react";
// import Image from "next/image";
// import { SubscribersList } from "@/components/SubscribersList";

// interface Category {
// 	id: string;
// 	name: string;
// 	subcategories: Subcategory[];
// }

// interface Subcategory {
// 	id: string;
// 	name: string;
// 	categoryId: string;
// }

// interface User {
// 	id: string;
// 	name: string;
// 	email: string;
// }

// interface AdminDashboardProps {
// 	user: User | any;
// 	initialCategories: Category[];
// }

// export default function AdminDashboard({
// 	user,
// 	initialCategories,
// }: AdminDashboardProps) {
// 	const { t, language } = useLanguage();
// 	const router = useRouter();
// 	const { toast } = useToast();
// 	const [categories, setCategories] = useState<Category[]>(initialCategories);
// 	const [newCategory, setNewCategory] = useState("");
// 	const [newSubcategory, setNewSubcategory] = useState("");
// 	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
// 	const [articles, setArticles] = useState<Article[]>([]);
// 	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

// 	const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
// 	const [isViewModalOpen, setIsViewModalOpen] = useState(false);

// 	useEffect(() => {
// 		async function fetchArticles() {
// 			const res = await fetch("/api/admin/articles");
// 			const data = await res.json();
// 			setArticles(data);
// 		}
// 		fetchArticles();
// 	}, []);

// 	const handleLogout = async () => {
// 		try {
// 			await fetch("/api/auth/logout", { method: "POST" });
// 			router.push("/admin/auth");
// 		} catch (error) {
// 			console.error("Logout error:", error);
// 		}
// 	};

// 	const handleAddCategory = async () => {
// 		if (!newCategory.trim()) return;

// 		try {
// 			const response = await fetch("/api/admin/categories", {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify({ name: newCategory }),
// 			});

// 			if (!response.ok) throw new Error("Failed to add category");

// 			const addedCategory = await response.json();
// 			setCategories([...categories, { ...addedCategory, subcategories: [] }]);
// 			setNewCategory("");
// 			toast({ title: "Success", description: "Category added successfully" });
// 		} catch (error) {
// 			console.error("Add category error:", error);
// 			toast({
// 				title: "Error",
// 				description: "Failed to add category",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	const handleAddSubcategory = async () => {
// 		if (!newSubcategory.trim() || !selectedCategory) return;

// 		try {
// 			const response = await fetch("/api/admin/subcategories", {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify({
// 					name: newSubcategory,
// 					categoryId: selectedCategory,
// 				}),
// 			});

// 			if (!response.ok) throw new Error("Failed to add subcategory");

// 			const addedSubcategory = await response.json();
// 			setCategories(
// 				categories.map((category) =>
// 					category.id === selectedCategory
// 						? {
// 								...category,
// 								subcategories: [...category.subcategories, addedSubcategory],
// 						  }
// 						: category
// 				)
// 			);
// 			setNewSubcategory("");
// 			toast({
// 				title: "Success",
// 				description: "Subcategory added successfully",
// 			});
// 		} catch (error) {
// 			console.error("Add subcategory error:", error);
// 			toast({
// 				title: "Error",
// 				description: "Failed to add subcategory",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	const handleDeleteCategory = async (categoryId: string) => {
// 		try {
// 			const response = await fetch(`/api/admin/categories/${categoryId}`, {
// 				method: "DELETE",
// 			});

// 			if (!response.ok) throw new Error("Failed to delete category");

// 			setCategories(
// 				categories.filter((category) => category.id !== categoryId)
// 			);
// 			toast({ title: "Success", description: "Category deleted successfully" });
// 		} catch (error) {
// 			console.error("Delete category error:", error);
// 			toast({
// 				title: "Error",
// 				description: "Failed to delete category",
// 				variant: "destructive",
// 			});
// 		}
// 	};

// 	const handleReview = async (id: string, newStatus: ArticleStatus) => {
// 		try {
// 			const res = await fetch("/api/admin/articles", {
// 				method: "PUT",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify({ id, status: newStatus }),
// 			});
// 			if (!res.ok) throw new Error("Failed to update article status");
// 			const updatedArticle = await res.json();
// 			setArticles(
// 				articles.map((article) =>
// 					article.id === id ? updatedArticle : article
// 				)
// 			);
// 			toast({
// 				title:
// 					newStatus === "APPROVED"
// 						? t("articleApproved")
// 						: t("articleRejected"),
// 				description:
// 					newStatus === "APPROVED"
// 						? t("articleApprovedDescription")
// 						: t("articleRejectedDescription"),
// 				duration: 5000,
// 			});
// 		} catch (error) {
// 			console.error("Error reviewing article:", error);
// 			toast({
// 				title: t("errorReviewingArticle"),
// 				description: t("errorReviewingArticleDescription"),
// 				variant: "destructive",
// 				duration: 5000,
// 			});
// 		}
// 	};

// 	const handleView = (article: Article) => {
// 		setViewingArticle(article);
// 		setIsViewModalOpen(true);
// 	};

// 	return (
// 		<div className="min-h-screen bg-gray-100">
// 			<header className="bg-white shadow-sm sticky top-0 z-10">
// 				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
// 					<div className="flex items-center">
// 						<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
// 							<SheetTrigger asChild>
// 								<Button variant="ghost" size="icon" className="lg:hidden mr-2">
// 									<Menu className="h-6 w-6" />
// 								</Button>
// 							</SheetTrigger>
// 							<SheetContent side="left" className="w-[240px] sm:w-[300px]">
// 								<nav className="flex flex-col gap-4 mt-4">
// 									<Button
// 										variant="ghost"
// 										onClick={() => setIsMobileMenuOpen(false)}>
// 										{t("categorySettings")}
// 									</Button>
// 									<Button
// 										variant="ghost"
// 										onClick={() => setIsMobileMenuOpen(false)}>
// 										{t("pendingReview")}
// 									</Button>
// 									<Button
// 										variant="ghost"
// 										onClick={() => setIsMobileMenuOpen(false)}>
// 										{t("approved")}
// 									</Button>
// 									<Button
// 										variant="ghost"
// 										onClick={() => setIsMobileMenuOpen(false)}>
// 										{t("rejected")}
// 									</Button>
// 									<Button
// 										variant="ghost"
// 										onClick={() => setIsMobileMenuOpen(false)}>
// 										{t("subscribers")}
// 									</Button>
// 								</nav>
// 							</SheetContent>
// 						</Sheet>
// 						<h1 className="text-2xl font-bold text-gray-900">
// 							{t("adminDashboard")}
// 						</h1>
// 					</div>
// 					<div className="flex items-center space-x-4">
// 						<Button variant="ghost" size="icon">
// 							<Bell className="h-5 w-5" />
// 						</Button>
// 						<DropdownMenu>
// 							<DropdownMenuTrigger asChild>
// 								<Button variant="ghost" className="flex items-center space-x-2">
// 									<Avatar className="h-8 w-8">
// 										<AvatarImage
// 											src="/placeholder-avatar.jpg"
// 											alt="Admin's avatar"
// 										/>
// 										<AvatarFallback>AN</AvatarFallback>
// 									</Avatar>
// 									<span className="hidden sm:inline">{user.name}</span>
// 									<ChevronDown className="h-4 w-4" />
// 								</Button>
// 							</DropdownMenuTrigger>
// 							<DropdownMenuContent align="end" className="w-56">
// 								<DropdownMenuLabel>{t("adminProfile")}</DropdownMenuLabel>
// 								<DropdownMenuSeparator />
// 								<DropdownMenuItem>{t("editProfile")}</DropdownMenuItem>
// 								<DropdownMenuItem>{t("settings")}</DropdownMenuItem>
// 								<DropdownMenuSeparator />
// 								<DropdownMenuItem onClick={handleLogout}>
// 									<LogOut className="mr-2 h-4 w-4" />
// 									<span>{t("logout")}</span>
// 								</DropdownMenuItem>
// 							</DropdownMenuContent>
// 						</DropdownMenu>
// 					</div>
// 				</div>
// 			</header>

// 			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
// 				<Tabs defaultValue="pending" className="space-y-4">
// 					<TabsList className="flex flex-wrap justify-start gap-2">
// 						<TabsTrigger value="pending">{t("pendingReview")}</TabsTrigger>
// 						<TabsTrigger value="approved">{t("approved")}</TabsTrigger>
// 						<TabsTrigger value="rejected">{t("rejected")}</TabsTrigger>
// 						<TabsTrigger value="categorySettings">
// 							{t("categorySettings")}
// 						</TabsTrigger>
// 						<TabsTrigger value="subscribers">{t("subscribers")}</TabsTrigger>
// 					</TabsList>

// 					<TabsContent value="pending" className="space-y-4">
// 						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
// 							<Table>
// 								<TableHeader>
// 									<TableRow>
// 										<TableHead>{t("tableNo")}</TableHead>
// 										<TableHead>{t("image")}</TableHead>
// 										<TableHead>{t("title")}</TableHead>
// 										<TableHead>{t("content")}</TableHead>
// 										<TableHead>{t("author")}</TableHead>
// 										<TableHead className="hidden md:table-cell">
// 											{t("submissionDate")}
// 										</TableHead>
// 										<TableHead>{t("actions")}</TableHead>
// 									</TableRow>
// 								</TableHeader>
// 								<TableBody>
// 									{articles.filter((article) => article.status === "PENDING")
// 										.length === 0 ? (
// 										<TableRow>
// 											<TableCell colSpan={7} className="text-center py-4">
// 												{t("noPendingReviews")}
// 											</TableCell>
// 										</TableRow>
// 									) : (
// 										articles
// 											.filter((article) => article.status === "PENDING")
// 											.map((article: any, index: number) => (
// 												<TableRow key={article.id}>
// 													<TableCell>{index + 1}</TableCell>
// 													<TableCell>
// 														{article.featuredImage && (
// 															<Image
// 																src={
// 																	article.featuredImage || "/placeholder.svg"
// 																}
// 																alt={t("featuredImage")}
// 																width={50}
// 																height={50}
// 																className="object-cover rounded"
// 															/>
// 														)}
// 													</TableCell>
// 													<TableCell className="font-medium">
// 														{typeof article.title === "string"
// 															? JSON.parse(article.title)[language] ||
// 															  JSON.parse(article.title).en
// 															: article.title[
// 																	language as keyof typeof article.title
// 															  ] || article.title.en}
// 													</TableCell>
// 													<TableCell>
// 														<Button
// 															variant="ghost"
// 															size="sm"
// 															onClick={() => handleView(article)}>
// 															<Eye className="mr-2 h-4 w-4" />
// 															{t("view")}
// 														</Button>
// 													</TableCell>
// 													<TableCell>{(article.author as any).name}</TableCell>
// 													<TableCell className="hidden md:table-cell">
// 														{new Date(article.createdAt).toLocaleDateString()}
// 													</TableCell>
// 													<TableCell>
// 														<div className="flex flex-col sm:flex-row gap-2">
// 															<Button
// 																size="sm"
// 																onClick={() =>
// 																	handleReview(article.id, "APPROVED")
// 																}>
// 																<Check className="mr-2 h-4 w-4" />
// 																{t("approve")}
// 															</Button>
// 															<Button
// 																size="sm"
// 																variant="destructive"
// 																onClick={() =>
// 																	handleReview(article.id, "REJECTED")
// 																}>
// 																<X className="mr-2 h-4 w-4" />
// 																{t("reject")}
// 															</Button>
// 														</div>
// 													</TableCell>
// 												</TableRow>
// 											))
// 									)}
// 								</TableBody>
// 							</Table>
// 						</div>
// 					</TabsContent>

// 					<TabsContent value="approved" className="space-y-4">
// 						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
// 							<Table>
// 								<TableHeader>
// 									<TableRow>
// 										<TableHead>{t("title")}</TableHead>
// 										<TableHead>{t("author")}</TableHead>
// 										<TableHead className="hidden md:table-cell">
// 											{t("submissionDate")}
// 										</TableHead>
// 									</TableRow>
// 								</TableHeader>
// 								<TableBody>
// 									{articles
// 										.filter((article) => article.status === "APPROVED")
// 										.map((article: any) => (
// 											<TableRow key={article.id}>
// 												<TableCell className="font-medium">
// 													{typeof article.title === "string"
// 														? JSON.parse(article.title)[language] ||
// 														  JSON.parse(article.title).en
// 														: article.title[
// 																language as keyof typeof article.title
// 														  ] || article.title.en}
// 												</TableCell>
// 												<TableCell>{(article.author as any).name}</TableCell>
// 												<TableCell className="hidden md:table-cell">
// 													{new Date(article.createdAt).toLocaleDateString()}
// 												</TableCell>
// 											</TableRow>
// 										))}
// 								</TableBody>
// 							</Table>
// 						</div>
// 					</TabsContent>
// 					<TabsContent value="rejected" className="space-y-4">
// 						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
// 							<Table>
// 								<TableHeader>
// 									<TableRow>
// 										<TableHead>{t("title")}</TableHead>
// 										<TableHead>{t("author")}</TableHead>
// 										<TableHead className="hidden md:table-cell">
// 											{t("submissionDate")}
// 										</TableHead>
// 									</TableRow>
// 								</TableHeader>
// 								<TableBody>
// 									{articles
// 										.filter((article) => article.status === "REJECTED")
// 										.map((article: any) => (
// 											<TableRow key={article.id}>
// 												<TableCell className="font-medium">
// 													{typeof article.title === "string"
// 														? JSON.parse(article.title)[language] ||
// 														  JSON.parse(article.title).en
// 														: article.title[
// 																language as keyof typeof article.title
// 														  ] || article.title.en}
// 												</TableCell>
// 												<TableCell>{(article.author as any).name}</TableCell>
// 												<TableCell className="hidden md:table-cell">
// 													{new Date(article.createdAt).toLocaleDateString()}
// 												</TableCell>
// 											</TableRow>
// 										))}
// 								</TableBody>
// 							</Table>
// 						</div>
// 					</TabsContent>
// 					<TabsContent value="categorySettings" className="space-y-4">
// 						<div className="bg-white shadow-sm rounded-lg p-6">
// 							<h2 className="text-xl font-semibold mb-4">{t("addCategory")}</h2>
// 							<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
// 								<Input
// 									value={newCategory}
// 									onChange={(e) => setNewCategory(e.target.value)}
// 									placeholder={t("enterCategoryName")}
// 									className="flex-grow"
// 								/>
// 								<Button
// 									onClick={handleAddCategory}
// 									className="w-full sm:w-auto">
// 									<Plus className="mr-2 h-4 w-4" /> {t("add")}
// 								</Button>
// 							</div>
// 						</div>
// 						<div className="bg-white shadow-sm rounded-lg p-6">
// 							<h2 className="text-xl font-semibold mb-4">
// 								{t("addSubcategory")}
// 							</h2>
// 							<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
// 								<select
// 									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
// 									value={selectedCategory || ""}
// 									onChange={(e) => setSelectedCategory(e.target.value)}>
// 									<option value="">{t("selectCategory")}</option>
// 									{categories.map((category) => (
// 										<option key={category.id} value={category.id}>
// 											{category.name}
// 										</option>
// 									))}
// 								</select>
// 								<Input
// 									value={newSubcategory}
// 									onChange={(e) => setNewSubcategory(e.target.value)}
// 									placeholder={t("enterSubcategoryName")}
// 									className="flex-grow"
// 								/>
// 								<Button
// 									onClick={handleAddSubcategory}
// 									className="w-full sm:w-auto">
// 									<Plus className="mr-2 h-4 w-4" /> {t("add")}
// 								</Button>
// 							</div>
// 						</div>
// 						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
// 							<Table>
// 								<TableHeader>
// 									<TableRow>
// 										<TableHead>{t("categoryName")}</TableHead>
// 										<TableHead>{t("subcategories")}</TableHead>
// 										<TableHead>{t("actions")}</TableHead>
// 									</TableRow>
// 								</TableHeader>
// 								<TableBody>
// 									{categories.map((category) => (
// 										<TableRow key={category.id}>
// 											<TableCell>{category.name}</TableCell>
// 											<TableCell>
// 												{category.subcategories
// 													.map((sub) => sub.name)
// 													.join(", ")}
// 											</TableCell>
// 											<TableCell>
// 												<Button
// 													variant="ghost"
// 													size="sm"
// 													onClick={() => handleDeleteCategory(category.id)}>
// 													<Trash className="h-4 w-4" />
// 												</Button>
// 											</TableCell>
// 										</TableRow>
// 									))}
// 								</TableBody>
// 							</Table>
// 						</div>
// 					</TabsContent>
// 					<TabsContent value="subscribers" className="space-y-4">
// 						<div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
// 							<SubscribersList />
// 						</div>
// 					</TabsContent>
// 				</Tabs>
// 				<ViewArticleModal
// 					article={viewingArticle}
// 					isOpen={isViewModalOpen}
// 					onClose={() => setIsViewModalOpen(false)}
// 				/>
// 			</main>
// 		</div>
// 	);
// }
