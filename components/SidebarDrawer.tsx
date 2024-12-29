"use client";

import Link from "next/link";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Menu,
	PenSquare,
	Info,
	MessageSquare,
	FileText,
	Mail,
	Phone,
	MapPin,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function SidebarDrawer() {
	const { t } = useLanguage();

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Menu className="h-7 w-7" />
					<span className="sr-only">Toggle menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent
				side="left"
				className="w-[300px] sm:w-[400px] flex flex-col">
				<SheetHeader className="border-b pb-4 mb-4">
					<SheetTitle className="text-left text-2xl font-bold">
						{t("menu")}
					</SheetTitle>
				</SheetHeader>
				<div className="flex-grow overflow-y-auto">
					<nav className="space-y-4">
						<Link
							href="/writer"
							className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-100">
							<PenSquare className="h-5 w-5" />
							<span>{t("becomeAWriter")}</span>
						</Link>
						<div className="space-y-2">
							<h3 className="flex items-center space-x-2 text-lg font-medium">
								<Info className="h-5 w-5" />
								<span>{t("aboutUs")}</span>
							</h3>
							<p className="text-sm text-gray-600 pl-7">{t("aboutUsShort")}</p>
						</div>
						<Link
							href="/contact"
							className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-100">
							<MessageSquare className="h-5 w-5" />
							<span>{t("contactUs")}</span>
						</Link>
						<Link
							href="/terms"
							className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-100">
							<FileText className="h-5 w-5" />
							<span>{t("termsOfUse")}</span>
						</Link>
					</nav>
				</div>
				<Separator className="my-4" />
				<SheetFooter>
					<div className="w-full space-y-4">
						<h3 className="text-lg font-medium">{t("getInTouch")}</h3>
						<div className="space-y-2">
							<p className="flex items-center space-x-2 text-sm">
								<Mail className="h-4 w-4" />
								<span>info@8436insight.com</span>
							</p>
							<p className="flex items-center space-x-2 text-sm">
								<Phone className="h-4 w-4" />
								<span>888 999 888 77</span>
							</p>
							<p className="flex items-center space-x-2 text-sm">
								<MapPin className="h-4 w-4" />
								<span>Addis Ababa, Ethiopia</span>
							</p>
						</div>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
