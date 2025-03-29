"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Bell,
	ChevronDown,
	Eye,
	LogOut,
	Pencil,
	Trash2,
	X,
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

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { CloudinaryUploader } from "@/components/cloudinary-uploader";

const languages = ["en", "am", "om"];

interface Category {
	id: string;
	name: string;
}

interface Article {
	id: string;
	title: {
		en: string;
		am?: string;
		om?: string;
	};
	content: {
		en: string;
		am?: string;
		om?: string;
	};
	status: "PENDING" | "APPROVED" | "REJECTED" | "DISABLED";
	createdAt: string;
	tags: any;
	categoryId: string;
	subcategoryId: string;
	featuredImage?: string;
}

interface User {
	id: string;
	name: string;
	email: string;
}

interface WriterDashboardClientProps {
	user: User | any;
	initialCategories: Category[];
	initialArticles: Article[] | any;
}

export default function WriterDashboardClient({
	user,
	initialCategories,
	initialArticles,
}: WriterDashboardClientProps) {
	const { t, language } = useLanguage();
	const router = useRouter();
	const { toast } = useToast();
	const [articles, setArticles] = useState<Article[] | any>(initialArticles);
	const [categories, setCategories] = useState<Category[]>(initialCategories);
	const [subcategories, setSubcategories] = useState<Category[]>([]);
	const [selectedLanguage, setSelectedLanguage] = useState("en");
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingArticle, setEditingArticle] = useState<Article | null>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [viewingArticle, setViewingArticle] = useState<Article | null | any>(
		null
	);
	const [activeTab, setActiveTab] = useState("newArticle");
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		title: { en: "", am: "", om: "" },
		content: { en: "", am: "", om: "" },
		categoryId: "",
		subcategoryId: "",
		tags: "",
		featuredImage: null as File | null,
	});

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Load subcategories when editing an article
	useEffect(() => {
		if (editingArticle && editingArticle.categoryId) {
			fetchSubcategories(editingArticle.categoryId);
		}
	}, [editingArticle]);

	// In the useEffect hook or initial data loading, ensure we're filtering out DISABLED articles
	useEffect(() => {
		// If articles are loaded from props, filter out DISABLED ones
		if (initialArticles) {
			setArticles(
				initialArticles.filter((article: any) => article.status !== "DISABLED")
			);
		}
	}, [initialArticles]);

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

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setFormData((prev) => ({ ...prev, featuredImage: file }));

			// Create a preview URL for the selected image
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		if (name === "title" || name === "content") {
			setFormData((prev) => ({
				...prev,
				[name]: {
					...prev[name as "title" | "content"],
					[selectedLanguage]: value,
				},
			}));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleCategoryChange = async (value: string) => {
		setFormData((prev) => ({ ...prev, categoryId: value, subcategoryId: "" }));
		fetchSubcategories(value);
	};

	const resetForm = () => {
		setFormData({
			title: { en: "", am: "", om: "" },
			content: { en: "", am: "", om: "" },
			categoryId: "",
			subcategoryId: "",
			tags: "",
			featuredImage: null,
		});
		setIsEditMode(false);
		setEditingArticle(null);
		setImagePreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const formDataToSend = new FormData();
			formDataToSend.append("title", JSON.stringify(formData.title));
			formDataToSend.append("content", JSON.stringify(formData.content));
			formDataToSend.append("categoryId", formData.categoryId);
			formDataToSend.append("subcategoryId", formData.subcategoryId || "");
			formDataToSend.append("tags", formData.tags);
			formDataToSend.append("authorId", user.id);

			// If we have an image URL from Cloudinary, send it directly
			if (imagePreview) {
				formDataToSend.append("featuredImageUrl", imagePreview);
			}

			// Only append the file if we're using the old method and have a file
			if (formData.featuredImage) {
				formDataToSend.append("featuredImage", formData.featuredImage);
			}

			let url = "/api/writer/articles";
			let method = "POST";

			// If in edit mode, use PUT method and include article ID
			if (isEditMode && editingArticle) {
				url = `/api/writer/articles/${editingArticle.id}`;
				method = "PUT";
				formDataToSend.append("id", editingArticle.id);
			}

			const res = await fetch(url, {
				method: method,
				body: formDataToSend,
			});

			if (!res.ok) {
				throw new Error(
					`Failed to ${isEditMode ? "update" : "submit"} article`
				);
			}

			const responseData = await res.json();

			if (isEditMode) {
				// Update the article in the articles array
				setArticles(
					articles.map((article: Article) =>
						article.id === editingArticle?.id ? responseData : article
					)
				);
				toast({
					title: t("articleUpdated"),
					description: t("articleUpdatedDescription"),
					duration: 5000,
				});
			} else {
				// Add the new article to the articles array
				setArticles([responseData, ...articles]);
				toast({
					title: t("articleSubmitted"),
					description: t("articleSubmittedDescription"),
					duration: 5000,
				});
			}

			// Reset form and state
			resetForm();

			// Switch to My Articles tab after submission
			setActiveTab("myArticles");
		} catch (error) {
			console.error(
				`Error ${isEditMode ? "updating" : "submitting"} article:`,
				error
			);
			toast({
				title: isEditMode
					? t("errorUpdatingArticle")
					: t("errorSubmittingArticle"),
				description: isEditMode
					? t("errorUpdatingArticleDescription")
					: t("errorSubmittingArticleDescription"),
				variant: "destructive",
				duration: 5000,
			});
		}
	};

	const handleEdit = async (article: Article) => {
		setIsEditMode(true);
		setEditingArticle(article);
		setActiveTab("newArticle");

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
		setFormData({
			title: parsedTitle,
			content: parsedContent,
			categoryId: article.categoryId || "",
			subcategoryId: article.subcategoryId || "",
			tags: article.tags
				? Array.isArray(article.tags)
					? article.tags.map((tag: any) => tag.name).join(", ")
					: ""
				: "",
			featuredImage: null,
		});

		// Set image preview if article has a featured image
		if (article.featuredImage) {
			setImagePreview(article.featuredImage);
		} else {
			setImagePreview(null);
		}

		// Load subcategories for the selected category
		if (article.categoryId) {
			await fetchSubcategories(article.categoryId);
		}
	};

	const handleDelete = async (articleId: string) => {
		if (confirm(t("confirmDelete"))) {
			try {
				const res = await fetch(`/api/writer/articles/${articleId}`, {
					method: "DELETE",
				});
				if (!res.ok) {
					throw new Error("Failed to delete article");
				}

				// Update the articles state to remove the deleted/disabled article
				setArticles(
					articles.filter((article: any) => article.id !== articleId)
				);

				toast({
					title: t("articleDeleted"),
					description: t("articleDeletedDescription"),
					duration: 5000,
				});
			} catch (error) {
				console.error("Error deleting article:", error);
				toast({
					title: t("errorDeletingArticle"),
					description: t("errorDeletingArticleDescription"),
					variant: "destructive",
					duration: 5000,
				});
			}
		}
	};

	const handleView = (article: Article) => {
		setViewingArticle(article);
		setIsViewModalOpen(true);
	};

	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", { method: "POST" });
			router.push("/writer/auth");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const cancelEdit = () => {
		resetForm();
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
			{/* Header */}
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
					<h1 className="text-2xl font-bold text-gray-900">
						{t("writerDashboard")}
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
											alt="Writer's avatar"
										/>
										<AvatarFallback>WN</AvatarFallback>
									</Avatar>
									<span>{user.name}</span>
									<ChevronDown className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>{t("writerProfile")}</DropdownMenuLabel>
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

			{/* Main content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="space-y-4">
					<TabsList>
						<TabsTrigger value="newArticle">
							{isEditMode ? t("editArticle") : t("newArticle")}
						</TabsTrigger>
						<TabsTrigger value="myArticles">{t("myArticles")}</TabsTrigger>
					</TabsList>
					<TabsContent value="newArticle" className="space-y-4">
						{isEditMode && (
							<div className="bg-blue-50 p-4 rounded-lg mb-4 flex justify-between items-center">
								<div>
									<h3 className="font-medium text-blue-800">
										{t("editingArticle")}
									</h3>
									<p className="text-sm text-blue-600">
										{typeof editingArticle?.title === "string"
											? JSON.parse(editingArticle?.title).en
											: editingArticle?.title?.en}
									</p>
								</div>
								<Button variant="ghost" size="sm" onClick={cancelEdit}>
									<X className="mr-2 h-4 w-4" />
									{t("cancelEdit")}
								</Button>
							</div>
						)}
						<form
							onSubmit={handleSubmit}
							className="bg-white shadow-sm rounded-lg p-6">
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
															formData.title[
																lang as keyof typeof formData.title
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
														formData.content[
															lang as keyof typeof formData.content
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
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="category">{t("category")}</Label>
										<Select
											onValueChange={handleCategoryChange}
											value={formData.categoryId}>
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
												setFormData((prev) => ({
													...prev,
													subcategoryId: value,
												}))
											}
											value={formData.subcategoryId}>
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
								</div>
							</div>

							<div className="mb-6">
								<Label htmlFor="tags">{t("tags")}</Label>
								<Input
									id="tags"
									name="tags"
									type="text"
									value={formData.tags}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, tags: e.target.value }))
									}
									placeholder="Enter tags separated by commas"
								/>
							</div>

							<div className="mb-6">
								<CloudinaryUploader
									value={imagePreview as any}
									onChange={(url) => {
										setImagePreview(url);
										// We don't need to set formData.featuredImage anymore as we're directly getting the URL
									}}
									onClear={() => {
										setImagePreview(null);
										setFormData((prev) => ({ ...prev, featuredImage: null }));
									}}
									label={t("featuredImage")}
								/>
							</div>

							<Button type="submit">
								{isEditMode ? t("updateArticle") : t("submitArticle")}
							</Button>
						</form>
					</TabsContent>
					<TabsContent value="myArticles" className="space-y-4">
						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("tableNo")}</TableHead>
										<TableHead>{t("image")}</TableHead>
										<TableHead>{t("title")}</TableHead>
										<TableHead>{t("content")}</TableHead>
										<TableHead>{t("submissionDate")}</TableHead>
										<TableHead>{t("status")}</TableHead>
										<TableHead>{t("actions")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{articles
										.filter((article: any) => article.status !== "DISABLED")
										.map((article: Article | any, index: number) => (
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
												<TableCell>
													{new Date(article.createdAt).toLocaleDateString()}
												</TableCell>
												<TableCell>
													<span
														className={`px-2 py-1 rounded-full text-xs font-semibold ${
															article.status === "APPROVED"
																? "bg-green-100 text-green-800"
																: article.status === "REJECTED"
																? "bg-red-100 text-red-800"
																: "bg-yellow-100 text-yellow-800"
														}`}>
														{t(article.status.toLowerCase())}
													</span>
												</TableCell>
												<TableCell>
													<div className="flex space-x-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleEdit(article)}>
															<Pencil className="mr-2 h-4 w-4" />
															{t("edit")}
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDelete(article.id)}>
															<Trash2 className="mr-2 h-4 w-4" />
															{t("delete")}
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</div>
					</TabsContent>
				</Tabs>
				{/* View Article Modal */}
				<Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("articleDetails")}</DialogTitle>
						</DialogHeader>
						{viewingArticle && (
							<div className="mt-4">
								<h3 className="text-lg font-semibold mb-2">
									{typeof viewingArticle.title === "string"
										? JSON.parse(viewingArticle.title)[language] ||
										  JSON.parse(viewingArticle.title).en
										: viewingArticle.title[
												language as keyof typeof viewingArticle.title
										  ] || viewingArticle.title.en}
								</h3>
								<p className="text-sm text-gray-500 mb-4">
									{t("submittedOn")}:{" "}
									{new Date(viewingArticle.createdAt).toLocaleDateString()}
								</p>
								{viewingArticle?.featuredImage && (
									<div className="relative w-full h-48 mb-4">
										<Image
											src={
												getOptimizedImageUrl(
													viewingArticle.featuredImage,
													600,
													400
												) || "/placeholder.svg"
											}
											alt={t("featuredImage")}
											fill
											className="object-cover rounded"
											sizes="(max-width: 768px) 100vw, 600px"
										/>
									</div>
								)}
								<div className="prose max-w-none">
									{typeof viewingArticle.content === "string"
										? JSON.parse(viewingArticle.content)[language] ||
										  JSON.parse(viewingArticle.content).en
										: viewingArticle.content[
												language as keyof typeof viewingArticle.content
										  ] || viewingArticle.content.en}
								</div>
							</div>
						)}
						<DialogFooter>
							<Button onClick={() => setIsViewModalOpen(false)}>
								{t("close")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</main>
		</div>
	);
}

// "use client";

// import type React from "react";

// import { useState, useRef, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
// 	Bell,
// 	ChevronDown,
// 	Eye,
// 	LogOut,
// 	Pencil,
// 	Trash2,
// 	Upload,
// 	X,
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

// import {
// 	Dialog,
// 	DialogContent,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogFooter,
// } from "@/components/ui/dialog";
// import Image from "next/image";

// const languages = ["en", "am", "om"];

// interface Category {
// 	id: string;
// 	name: string;
// }

// interface Article {
// 	id: string;
// 	title: {
// 		en: string;
// 		am?: string;
// 		om?: string;
// 	};
// 	content: {
// 		en: string;
// 		am?: string;
// 		om?: string;
// 	};
// 	status: "PENDING" | "APPROVED" | "REJECTED";
// 	createdAt: string;
// 	tags: any;
// 	categoryId: string;
// 	subcategoryId: string;
// 	featuredImage?: string;
// }

// interface User {
// 	id: string;
// 	name: string;
// 	email: string;
// }

// interface WriterDashboardClientProps {
// 	user: User | any;
// 	initialCategories: Category[];
// 	initialArticles: Article[] | any;
// }

// export default function WriterDashboardClient({
// 	user,
// 	initialCategories,
// 	initialArticles,
// }: WriterDashboardClientProps) {
// 	const { t, language } = useLanguage();
// 	const router = useRouter();
// 	const { toast } = useToast();
// 	const [articles, setArticles] = useState<Article[] | any>(initialArticles);
// 	const [categories, setCategories] = useState<Category[]>(initialCategories);
// 	const [subcategories, setSubcategories] = useState<Category[]>([]);
// 	const [selectedLanguage, setSelectedLanguage] = useState("en");
// 	const [isEditMode, setIsEditMode] = useState(false);
// 	const [editingArticle, setEditingArticle] = useState<Article | null>(null);
// 	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
// 	const [viewingArticle, setViewingArticle] = useState<Article | null | any>(
// 		null
// 	);
// 	const [activeTab, setActiveTab] = useState("newArticle");

// 	const [formData, setFormData] = useState({
// 		title: { en: "", am: "", om: "" },
// 		content: { en: "", am: "", om: "" },
// 		categoryId: "",
// 		subcategoryId: "",
// 		tags: "",
// 		featuredImage: null as File | null,
// 	});

// 	const fileInputRef = useRef<HTMLInputElement>(null);

// 	// Load subcategories when editing an article
// 	useEffect(() => {
// 		if (editingArticle && editingArticle.categoryId) {
// 			fetchSubcategories(editingArticle.categoryId);
// 		}
// 	}, [editingArticle]);

// 	const fetchSubcategories = async (categoryId: string) => {
// 		try {
// 			const res = await fetch(`/api/subcategories?categoryId=${categoryId}`);
// 			if (!res.ok) {
// 				throw new Error("Failed to fetch subcategories");
// 			}
// 			const data = await res.json();
// 			setSubcategories(data);
// 		} catch (error) {
// 			console.error("Error fetching subcategories:", error);
// 		}
// 	};

// 	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		if (e.target.files && e.target.files[0]) {
// 			setFormData((prev) => ({ ...prev, featuredImage: e.target.files![0] }));
// 		}
// 	};

// 	const handleInputChange = (
// 		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
// 	) => {
// 		const { name, value } = e.target;
// 		if (name === "title" || name === "content") {
// 			setFormData((prev) => ({
// 				...prev,
// 				[name]: {
// 					...prev[name as "title" | "content"],
// 					[selectedLanguage]: value,
// 				},
// 			}));
// 		} else {
// 			setFormData((prev) => ({ ...prev, [name]: value }));
// 		}
// 	};

// 	const handleCategoryChange = async (value: string) => {
// 		setFormData((prev) => ({ ...prev, categoryId: value, subcategoryId: "" }));
// 		fetchSubcategories(value);
// 	};

// 	const resetForm = () => {
// 		setFormData({
// 			title: { en: "", am: "", om: "" },
// 			content: { en: "", am: "", om: "" },
// 			categoryId: "",
// 			subcategoryId: "",
// 			tags: "",
// 			featuredImage: null,
// 		});
// 		setIsEditMode(false);
// 		setEditingArticle(null);
// 		if (fileInputRef.current) {
// 			fileInputRef.current.value = "";
// 		}
// 	};

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		try {
// 			const formDataToSend = new FormData();
// 			formDataToSend.append("title", JSON.stringify(formData.title));
// 			formDataToSend.append("content", JSON.stringify(formData.content));
// 			formDataToSend.append("categoryId", formData.categoryId);
// 			formDataToSend.append("subcategoryId", formData.subcategoryId || "");
// 			formDataToSend.append("tags", formData.tags);
// 			formDataToSend.append("authorId", user.id);

// 			if (formData.featuredImage) {
// 				formDataToSend.append("featuredImage", formData.featuredImage);
// 			}

// 			let url = "/api/writer/articles";
// 			let method = "POST";

// 			// If in edit mode, use PUT method and include article ID
// 			if (isEditMode && editingArticle) {
// 				url = `/api/writer/articles/${editingArticle.id}`;
// 				method = "PUT";
// 				formDataToSend.append("id", editingArticle.id);
// 			}

// 			const res = await fetch(url, {
// 				method: method,
// 				body: formDataToSend,
// 			});

// 			if (!res.ok) {
// 				throw new Error(
// 					`Failed to ${isEditMode ? "update" : "submit"} article`
// 				);
// 			}

// 			const responseData = await res.json();

// 			if (isEditMode) {
// 				// Update the article in the articles array
// 				setArticles(
// 					articles.map((article: Article) =>
// 						article.id === editingArticle?.id ? responseData : article
// 					)
// 				);
// 				toast({
// 					title: t("articleUpdated"),
// 					description: t("articleUpdatedDescription"),
// 					duration: 5000,
// 				});
// 			} else {
// 				// Add the new article to the articles array
// 				setArticles([responseData, ...articles]);
// 				toast({
// 					title: t("articleSubmitted"),
// 					description: t("articleSubmittedDescription"),
// 					duration: 5000,
// 				});
// 			}

// 			// Reset form and state
// 			resetForm();

// 			// Switch to My Articles tab after submission
// 			setActiveTab("myArticles");
// 		} catch (error) {
// 			console.error(
// 				`Error ${isEditMode ? "updating" : "submitting"} article:`,
// 				error
// 			);
// 			toast({
// 				title: isEditMode
// 					? t("errorUpdatingArticle")
// 					: t("errorSubmittingArticle"),
// 				description: isEditMode
// 					? t("errorUpdatingArticleDescription")
// 					: t("errorSubmittingArticleDescription"),
// 				variant: "destructive",
// 				duration: 5000,
// 			});
// 		}
// 	};

// 	const handleEdit = async (article: Article) => {
// 		setIsEditMode(true);
// 		setEditingArticle(article);
// 		setActiveTab("newArticle");

// 		// Parse title and content if they are strings
// 		const parsedTitle =
// 			typeof article.title === "string"
// 				? JSON.parse(article.title)
// 				: article.title;

// 		const parsedContent =
// 			typeof article.content === "string"
// 				? JSON.parse(article.content)
// 				: article.content;

// 		// Set form data with article values
// 		setFormData({
// 			title: parsedTitle,
// 			content: parsedContent,
// 			categoryId: article.categoryId || "",
// 			subcategoryId: article.subcategoryId || "",
// 			tags: article.tags
// 				? Array.isArray(article.tags)
// 					? article.tags.map((tag: any) => tag.name).join(", ")
// 					: ""
// 				: "",
// 			featuredImage: null,
// 		});

// 		// Load subcategories for the selected category
// 		if (article.categoryId) {
// 			await fetchSubcategories(article.categoryId);
// 		}
// 	};

// 	const handleDelete = async (articleId: string) => {
// 		if (confirm(t("confirmDelete"))) {
// 			try {
// 				const res = await fetch(`/api/writer/articles/${articleId}`, {
// 					method: "DELETE",
// 				});
// 				if (!res.ok) {
// 					throw new Error("Failed to delete article");
// 				}
// 				setArticles(
// 					articles.filter((article: any) => article.id !== articleId)
// 				);
// 				toast({
// 					title: t("articleDeleted"),
// 					description: t("articleDeletedDescription"),
// 					duration: 5000,
// 				});
// 			} catch (error) {
// 				console.error("Error deleting article:", error);
// 				toast({
// 					title: t("errorDeletingArticle"),
// 					description: t("errorDeletingArticleDescription"),
// 					variant: "destructive",
// 					duration: 5000,
// 				});
// 			}
// 		}
// 	};

// 	const handleView = (article: Article) => {
// 		setViewingArticle(article);
// 		setIsViewModalOpen(true);
// 	};

// 	const handleLogout = async () => {
// 		try {
// 			await fetch("/api/auth/logout", { method: "POST" });
// 			router.push("/writer/auth");
// 		} catch (error) {
// 			console.error("Logout error:", error);
// 		}
// 	};

// 	const cancelEdit = () => {
// 		resetForm();
// 	};

// 	return (
// 		<div className="min-h-screen bg-gray-100">
// 			{/* Header */}
// 			<header className="bg-white shadow-sm">
// 				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
// 					<h1 className="text-2xl font-bold text-gray-900">
// 						{t("writerDashboard")}
// 					</h1>
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
// 											alt="Writer's avatar"
// 										/>
// 										<AvatarFallback>WN</AvatarFallback>
// 									</Avatar>
// 									<span>{user.name}</span>
// 									<ChevronDown className="h-4 w-4" />
// 								</Button>
// 							</DropdownMenuTrigger>
// 							<DropdownMenuContent align="end" className="w-56">
// 								<DropdownMenuLabel>{t("writerProfile")}</DropdownMenuLabel>
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

// 			{/* Main content */}
// 			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
// 				<Tabs
// 					value={activeTab}
// 					onValueChange={setActiveTab}
// 					className="space-y-4">
// 					<TabsList>
// 						<TabsTrigger value="newArticle">
// 							{isEditMode ? t("editArticle") : t("newArticle")}
// 						</TabsTrigger>
// 						<TabsTrigger value="myArticles">{t("myArticles")}</TabsTrigger>
// 					</TabsList>
// 					<TabsContent value="newArticle" className="space-y-4">
// 						{isEditMode && (
// 							<div className="bg-blue-50 p-4 rounded-lg mb-4 flex justify-between items-center">
// 								<div>
// 									<h3 className="font-medium text-blue-800">
// 										{t("editingArticle")}
// 									</h3>
// 									<p className="text-sm text-blue-600">
// 										{typeof editingArticle?.title === "string"
// 											? JSON.parse(editingArticle?.title).en
// 											: editingArticle?.title?.en}
// 									</p>
// 								</div>
// 								<Button variant="ghost" size="sm" onClick={cancelEdit}>
// 									<X className="mr-2 h-4 w-4" />
// 									{t("cancelEdit")}
// 								</Button>
// 							</div>
// 						)}
// 						<form
// 							onSubmit={handleSubmit}
// 							className="bg-white shadow-sm rounded-lg p-6">
// 							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
// 								<div>
// 									<Label htmlFor="title">{t("articleTitle")}</Label>
// 									<Tabs defaultValue="en" className="mb-6">
// 										<TabsList>
// 											{languages.map((lang) => (
// 												<TabsTrigger
// 													key={lang}
// 													value={lang}
// 													onClick={() => setSelectedLanguage(lang)}>
// 													{t(lang)}
// 												</TabsTrigger>
// 											))}
// 										</TabsList>
// 										{languages.map((lang) => (
// 											<TabsContent key={lang} value={lang}>
// 												<div className="mb-4">
// 													<Label htmlFor={`title-${lang}`}>
// 														{t("articleTitle")} ({t(lang)})
// 													</Label>
// 													<Input
// 														id={`title-${lang}`}
// 														name="title"
// 														value={
// 															formData.title[
// 																lang as keyof typeof formData.title
// 															] || ""
// 														}
// 														onChange={handleInputChange}
// 														placeholder={t("enterTitle")}
// 														required={lang === "en"}
// 													/>
// 												</div>
// 												<Label htmlFor={`content-${lang}`}>
// 													{t("articleContent")} ({t(lang)})
// 												</Label>
// 												<Textarea
// 													id={`content-${lang}`}
// 													name="content"
// 													value={
// 														formData.content[
// 															lang as keyof typeof formData.content
// 														] || ""
// 													}
// 													onChange={handleInputChange}
// 													placeholder={t("enterContent")}
// 													rows={10}
// 													required={lang === "en"}
// 												/>
// 											</TabsContent>
// 										))}
// 									</Tabs>
// 								</div>
// 								<div className="grid grid-cols-2 gap-4">
// 									<div>
// 										<Label htmlFor="category">{t("category")}</Label>
// 										<Select
// 											onValueChange={handleCategoryChange}
// 											value={formData.categoryId}>
// 											<SelectTrigger>
// 												<SelectValue placeholder={t("selectCategory")} />
// 											</SelectTrigger>
// 											<SelectContent>
// 												{categories.map((category) => (
// 													<SelectItem key={category.id} value={category.id}>
// 														{category.name}
// 													</SelectItem>
// 												))}
// 											</SelectContent>
// 										</Select>
// 									</div>
// 									<div>
// 										<Label htmlFor="subcategory">{t("subcategory")}</Label>
// 										<Select
// 											onValueChange={(value) =>
// 												setFormData((prev) => ({
// 													...prev,
// 													subcategoryId: value,
// 												}))
// 											}
// 											value={formData.subcategoryId}>
// 											<SelectTrigger>
// 												<SelectValue placeholder={t("selectSubcategory")} />
// 											</SelectTrigger>
// 											<SelectContent>
// 												{subcategories.map((subcategory) => (
// 													<SelectItem
// 														key={subcategory.id}
// 														value={subcategory.id}>
// 														{subcategory.name}
// 													</SelectItem>
// 												))}
// 											</SelectContent>
// 										</Select>
// 									</div>
// 								</div>
// 							</div>

// 							<div className="mb-6">
// 								<Label htmlFor="tags">{t("tags")}</Label>
// 								<Input
// 									id="tags"
// 									name="tags"
// 									type="text"
// 									value={formData.tags}
// 									onChange={(e) =>
// 										setFormData((prev) => ({ ...prev, tags: e.target.value }))
// 									}
// 									placeholder="Enter tags separated by commas"
// 								/>
// 							</div>

// 							<div className="mb-6">
// 								<Label htmlFor="featuredImage">{t("featuredImage")}</Label>
// 								<div className="flex items-center space-x-2">
// 									<Input
// 										id="featuredImage"
// 										name="featuredImage"
// 										type="file"
// 										onChange={handleFileChange}
// 										ref={fileInputRef}
// 										accept="image/*"
// 										className="flex-grow"
// 									/>
// 									<Button
// 										type="button"
// 										variant="outline"
// 										onClick={() => fileInputRef.current?.click()}>
// 										<Upload className="mr-2 h-4 w-4" />
// 										{t("uploadImage")}
// 									</Button>
// 								</div>
// 								{formData.featuredImage && (
// 									<p className="mt-2 text-sm text-gray-500">
// 										{t("selectedFile")}: {formData.featuredImage.name}
// 									</p>
// 								)}
// 								{isEditMode &&
// 									editingArticle?.featuredImage &&
// 									!formData.featuredImage && (
// 										<div className="mt-2">
// 											<p className="text-sm text-gray-500 mb-2">
// 												{t("currentImage")}:
// 											</p>
// 											<div className="relative w-32 h-32">
// 												<Image
// 													src={
// 														editingArticle.featuredImage || "/placeholder.svg"
// 													}
// 													alt={t("currentFeaturedImage")}
// 													fill
// 													className="object-cover rounded"
// 													sizes="128px"
// 												/>
// 											</div>
// 										</div>
// 									)}
// 							</div>

// 							<Button type="submit">
// 								{isEditMode ? t("updateArticle") : t("submitArticle")}
// 							</Button>
// 						</form>
// 					</TabsContent>
// 					<TabsContent value="myArticles" className="space-y-4">
// 						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
// 							<Table>
// 								<TableHeader>
// 									<TableRow>
// 										<TableHead>{t("tableNo")}</TableHead>
// 										<TableHead>{t("image")}</TableHead>
// 										<TableHead>{t("title")}</TableHead>
// 										<TableHead>{t("content")}</TableHead>
// 										<TableHead>{t("submissionDate")}</TableHead>
// 										<TableHead>{t("status")}</TableHead>
// 										<TableHead>{t("actions")}</TableHead>
// 									</TableRow>
// 								</TableHeader>
// 								<TableBody>
// 									{articles.map((article: Article | any, index: number) => (
// 										<TableRow key={article.id}>
// 											<TableCell>{index + 1}</TableCell>
// 											<TableCell>
// 												{article.featuredImage && (
// 													<div className="relative w-12 h-12">
// 														<Image
// 															src={article.featuredImage || "/placeholder.svg"}
// 															alt={t("featuredImage")}
// 															fill
// 															className="object-cover rounded"
// 															sizes="48px"
// 															unoptimized
// 														/>
// 													</div>
// 												)}
// 											</TableCell>
// 											<TableCell className="font-medium">
// 												{typeof article.title === "string"
// 													? JSON.parse(article.title)[language] ||
// 													  JSON.parse(article.title).en
// 													: article.title[
// 															language as keyof typeof article.title
// 													  ] || article.title.en}
// 											</TableCell>
// 											<TableCell>
// 												<Button
// 													variant="ghost"
// 													size="sm"
// 													onClick={() => handleView(article)}>
// 													<Eye className="mr-2 h-4 w-4" />
// 													{t("view")}
// 												</Button>
// 											</TableCell>
// 											<TableCell>
// 												{new Date(article.createdAt).toLocaleDateString()}
// 											</TableCell>
// 											<TableCell>
// 												<span
// 													className={`px-2 py-1 rounded-full text-xs font-semibold ${
// 														article.status === "APPROVED"
// 															? "bg-green-100 text-green-800"
// 															: article.status === "REJECTED"
// 															? "bg-red-100 text-red-800"
// 															: "bg-yellow-100 text-yellow-800"
// 													}`}>
// 													{t(article.status.toLowerCase())}
// 												</span>
// 											</TableCell>
// 											<TableCell>
// 												<div className="flex space-x-2">
// 													<Button
// 														variant="ghost"
// 														size="sm"
// 														onClick={() => handleEdit(article)}>
// 														<Pencil className="mr-2 h-4 w-4" />
// 														{t("edit")}
// 													</Button>
// 													<Button
// 														variant="ghost"
// 														size="sm"
// 														onClick={() => handleDelete(article.id)}>
// 														<Trash2 className="mr-2 h-4 w-4" />
// 														{t("delete")}
// 													</Button>
// 												</div>
// 											</TableCell>
// 										</TableRow>
// 									))}
// 								</TableBody>
// 							</Table>
// 						</div>
// 					</TabsContent>
// 				</Tabs>
// 				{/* View Article Modal */}
// 				<Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
// 					<DialogContent>
// 						<DialogHeader>
// 							<DialogTitle>{t("articleDetails")}</DialogTitle>
// 						</DialogHeader>
// 						{viewingArticle && (
// 							<div className="mt-4">
// 								<h3 className="text-lg font-semibold mb-2">
// 									{typeof viewingArticle.title === "string"
// 										? JSON.parse(viewingArticle.title)[language] ||
// 										  JSON.parse(viewingArticle.title).en
// 										: viewingArticle.title[
// 												language as keyof typeof viewingArticle.title
// 										  ] || viewingArticle.title.en}
// 								</h3>
// 								<p className="text-sm text-gray-500 mb-4">
// 									{t("submittedOn")}:{" "}
// 									{new Date(viewingArticle.createdAt).toLocaleDateString()}
// 								</p>
// 								{viewingArticle?.featuredImage && (
// 									<div className="relative w-full h-48 mb-4">
// 										<Image
// 											src={viewingArticle.featuredImage || "/placeholder.svg"}
// 											alt={t("featuredImage")}
// 											fill
// 											className="object-cover rounded"
// 											sizes="(max-width: 768px) 100vw, 600px"
// 											unoptimized
// 										/>
// 									</div>
// 								)}
// 								<div className="prose max-w-none">
// 									{typeof viewingArticle.content === "string"
// 										? JSON.parse(viewingArticle.content)[language] ||
// 										  JSON.parse(viewingArticle.content).en
// 										: viewingArticle.content[
// 												language as keyof typeof viewingArticle.content
// 										  ] || viewingArticle.content.en}
// 								</div>
// 							</div>
// 						)}
// 						<DialogFooter>
// 							<Button onClick={() => setIsViewModalOpen(false)}>
// 								{t("close")}
// 							</Button>
// 						</DialogFooter>
// 					</DialogContent>
// 				</Dialog>
// 			</main>
// 		</div>
// 	);
// }
