"use client";

import { useState, useEffect } from "react";
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
import { Bell, ChevronDown, LogOut } from "lucide-react";
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

const WRITER_ID = "be631d92-bb36-4bc2-946c-18d22763ca6f";

interface Category {
	id: string;
	name: string;
}

interface Subcategory {
	id: string;
	name: string;
	categoryId: string;
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
	status: "PENDING" | "APPROVED" | "REJECTED";
	createdAt: string;
	categoryId: string;
	subcategoryId: string;
}

const languages = ["en", "am", "om"];

export default function WriterDashboard() {
	const { t, language } = useLanguage();
	const { toast } = useToast();
	const [articles, setArticles] = useState<Article[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
	const [selectedLanguage, setSelectedLanguage] = useState("en");
	const [formData, setFormData] = useState({
		title: { en: "", am: "", om: "" },
		content: { en: "", am: "", om: "" },
		categoryId: "",
		subcategoryId: "",
		tags: "",
	});

	useEffect(() => {
		async function fetchData() {
			try {
				const [articlesRes, categoriesRes] = await Promise.all([
					fetch(`/api/writer/articles?authorId=${WRITER_ID}`),
					fetch("/api/categories"),
				]);

				if (!articlesRes.ok || !categoriesRes.ok) {
					throw new Error("Failed to fetch data");
				}

				const articlesData = await articlesRes.json();
				const categoriesData = await categoriesRes.json();

				setArticles(articlesData);
				setCategories(categoriesData);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}
		fetchData();
	}, []);

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
		try {
			const res = await fetch(`/api/subcategories?categoryId=${value}`);
			if (!res.ok) {
				throw new Error("Failed to fetch subcategories");
			}
			const data = await res.json();
			setSubcategories(data);
		} catch (error) {
			console.error("Error fetching subcategories:", error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await fetch("/api/writer/articles", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					authorId: WRITER_ID,
					tags: formData.tags.split(",").map((tag) => tag.trim()),
				}),
			});
			if (!res.ok) {
				throw new Error("Failed to submit article");
			}
			const newArticle = await res.json();
			setArticles([newArticle, ...articles]);
			setFormData({
				title: { en: "", am: "", om: "" },
				content: { en: "", am: "", om: "" },
				categoryId: "",
				subcategoryId: "",
				tags: "",
			});
			toast({
				title: t("articleSubmitted"),
				description: t("articleSubmittedDescription"),
				duration: 7000,
			});
		} catch (error) {
			console.error("Error submitting article:", error);
			toast({
				title: t("errorSubmittingArticle"),
				description: t("errorSubmittingArticleDescription"),
				variant: "destructive",
				duration: 7000,
			});
		}
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
									<span>Writer Name</span>
									<ChevronDown className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>{t("writerProfile")}</DropdownMenuLabel>
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
				<Tabs defaultValue="newArticle" className="space-y-4">
					<TabsList>
						<TabsTrigger value="newArticle">{t("newArticle")}</TabsTrigger>
						<TabsTrigger value="myArticles">{t("myArticles")}</TabsTrigger>
					</TabsList>
					<TabsContent value="newArticle" className="space-y-4">
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
									value={formData.tags}
									onChange={handleInputChange}
									placeholder={t("enterTags")}
								/>
							</div>

							<Button type="submit">{t("submitArticle")}</Button>
						</form>
					</TabsContent>
					<TabsContent value="myArticles" className="space-y-4">
						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("title")}</TableHead>
										<TableHead>{t("submissionDate")}</TableHead>
										<TableHead>{t("status")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{articles.map((article) => (
										<TableRow key={article.id}>
											<TableCell className="font-medium">
												{typeof article.title === "string"
													? JSON.parse(article.title)[language] ||
													  JSON.parse(article.title).en
													: article.title[
															language as keyof typeof article.title
													  ] || article.title.en}
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
