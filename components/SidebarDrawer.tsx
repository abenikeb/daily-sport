"use client";

import Link from "next/link";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function SidebarDrawer() {
	const { t } = useLanguage();

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon">
					<Menu className="h-6 w-6" />
					<span className="sr-only">Toggle menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-[300px] sm:w-[400px]">
				<SheetHeader>
					<SheetTitle className="text-left">{t("menu")}</SheetTitle>
				</SheetHeader>
				<div className="flex flex-col gap-4 py-4">
					<Link
						href="/writer"
						className="text-lg font-medium hover:text-primary transition-colors">
						{t("becomeAWriter")}
					</Link>
					<div>
						<h3 className="text-lg font-medium mb-2">{t("aboutUs")}</h3>
						<p className="text-sm text-gray-600">{t("aboutUsShort")}</p>
					</div>
					<Link
						href="/contact"
						className="text-lg font-medium hover:text-primary transition-colors">
						{t("contactUs")}
					</Link>
					<Link
						href="/terms"
						className="text-lg font-medium hover:text-primary transition-colors">
						{t("termsOfUse")}
					</Link>
				</div>
				<div className="mt-auto">
					<h3 className="text-lg font-medium mb-2">{t("getInTouch")}</h3>
					<p className="text-sm">info@8436insight.com</p>
					<p className="text-sm">888 999 888 77</p>
					<p className="text-sm">Addis Ababa, Ethiopia</p>
				</div>
			</SheetContent>
		</Sheet>
	);
}
