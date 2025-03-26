"use client";

import { useState } from "react";
import Link from "next/link";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetFooter,
	SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Menu,
	Info,
	FileText,
	Mail,
	Phone,
	MapPin,
	Building,
	ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function SidebarDrawer() {
	const { t } = useLanguage();
	const [open, setOpen] = useState(false);

	const handleLinkClick = () => {
		setOpen(false);
	};

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Menu className="h-7 w-7" />
					<span className="sr-only">Toggle menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent
				side="left"
				className="w-[300px] sm:w-[400px] flex flex-col bg-gradient-to-b from-white to-gray-50">
				<SheetHeader className="border-b pb-4 mb-6">
					<SheetTitle className="text-left text-2xl font-bold text-primary">
						{t("menu")}
					</SheetTitle>
				</SheetHeader>

				<div className="flex-grow overflow-y-auto px-1">
					<nav className="space-y-3">
						<div className="space-y-2 bg-white p-4 rounded-lg shadow-sm">
							<h3 className="flex items-center space-x-2 text-lg font-medium text-primary">
								<Info className="h-5 w-5" />
								<span>{t("aboutUs")}</span>
							</h3>
							<p className="text-sm text-gray-600 pl-7 leading-relaxed">
								{t("aboutUsShort")}
							</p>
						</div>

						<SheetClose asChild>
							<Link
								href="/terms"
								onClick={handleLinkClick}
								className="flex items-center space-x-2 text-lg font-medium text-primary transition-colors p-3 rounded-md hover:bg-white hover:shadow-sm">
								<FileText className="h-5 w-5" />
								<span>{t("termsOfUse")}</span>
								<ExternalLink className="h-4 w-4 ml-auto opacity-60" />
							</Link>
						</SheetClose>

						{/* <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
							<h3 className="text-lg font-medium text-primary flex items-center">
								<FileText className="h-5 w-5 mr-2" />
								{t("termsOfUse")}
							</h3>
							<p className="text-sm text-gray-600 leading-relaxed">
								{t("aboutUsShort")}
							</p>
							<SheetClose asChild>
								<Link
									href="/terms"
									onClick={handleLinkClick}
									className="text-sm text-primary hover:underline mt-2 inline-flex items-center">
									{t("readMore")}
									<ExternalLink className="h-3 w-3 ml-1" />
								</Link>
							</SheetClose>
						</div> */}
					</nav>
				</div>

				<Separator className="my-6" />

				<SheetFooter className="block">
					<div className="w-full space-y-4 bg-white p-4 rounded-lg shadow-sm">
						<h3 className="text-lg font-medium text-primary flex items-center">
							<Building className="h-5 w-5 mr-2" />
							{t("getInTouch")}
						</h3>
						<div className="space-y-3">
							<div className="flex items-start space-x-2 text-sm">
								<Building className="h-4 w-4 mt-0.5 text-gray-500" />
								<span className="text-gray-700 font-medium">Tocido PLC</span>
							</div>
							<div className="flex items-start space-x-2 text-sm">
								<Mail className="h-4 w-4 mt-0.5 text-gray-500" />
								<span className="text-gray-700">info@8436insight.com</span>
							</div>
							<div className="flex items-start space-x-2 text-sm">
								<Phone className="h-4 w-4 mt-0.5 text-gray-500" />
								<span className="text-gray-700">0913229175</span>
							</div>
							<div className="flex items-start space-x-2 text-sm">
								<MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
								<span className="text-gray-700">Addis Ababa, Ethiopia</span>
							</div>
						</div>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

// "use client";

// import Link from "next/link";
// import {
// 	Sheet,
// 	SheetContent,
// 	SheetHeader,
// 	SheetTitle,
// 	SheetTrigger,
// 	SheetFooter,
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { Menu, Info, FileText, Mail, Phone, MapPin } from "lucide-react";
// import { useLanguage } from "@/contexts/LanguageContext";

// export function SidebarDrawer() {
// 	const { t } = useLanguage();

// 	return (
// 		<Sheet>
// 			<SheetTrigger asChild>
// 				<Button variant="ghost" size="icon" className="relative">
// 					<Menu className="h-7 w-7" />
// 					<span className="sr-only">Toggle menu</span>
// 				</Button>
// 			</SheetTrigger>
// 			<SheetContent
// 				side="left"
// 				className="w-[300px] sm:w-[400px] flex flex-col">
// 				<SheetHeader className="border-b pb-4 mb-4">
// 					<SheetTitle className="text-left text-2xl font-bold">
// 						{t("menu")}
// 					</SheetTitle>
// 				</SheetHeader>
// 				<div className="flex-grow overflow-y-auto">
// 					<nav className="space-y-4">
// 						{/* <Link
// 							href="/writer"
// 							className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-100">
// 							<PenSquare className="h-5 w-5" />
// 							<span>{t("becomeAWriter")}</span>
// 						</Link> */}
// 						<div className="space-y-2">
// 							<h3 className="flex items-center space-x-2 text-lg font-medium">
// 								<Info className="h-5 w-5" />
// 								<span>{t("aboutUs")}</span>
// 							</h3>
// 							<p className="text-sm text-gray-600 pl-7">{t("aboutUsShort")}</p>
// 						</div>
// 						{/* <Link
// 							href="/contact"
// 							className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-100">
// 							<MessageSquare className="h-5 w-5" />
// 							<span>{t("contactUs")}</span>
// 						</Link>
// 						<Link
// 							href="/terms"
// 							className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-100">
// 							<FileText className="h-5 w-5" />
// 							<span>{t("termsOfUse")}</span>
// 						</Link> */}
// 						<Link
// 							href="/terms"
// 							className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-100">
// 							<FileText className="h-5 w-5" />
// 							<span>{t("termsOfUse")}</span>
// 						</Link>
// 					</nav>
// 				</div>
// 				<div className="mt-4">
// 					<h3 className="text-lg font-medium mb-2">{t("termsOfUse")}</h3>
// 					<p className="text-sm text-gray-600">{t("aboutUsShort")}</p>
// 					<Link
// 						href="/terms"
// 						className="text-sm text-primary hover:underline mt-2 inline-block">
// 						{t("readMore")}
// 					</Link>
// 				</div>
// 				<Separator className="my-4" />
// 				<SheetFooter>
// 					<div className="w-full space-y-4">
// 						<h3 className="text-lg font-medium">{t("getInTouch")}</h3>
// 						<div className="space-y-2">
// 							<p className="flex items-center space-x-2 text-sm">
// 								<Mail className="h-4 w-4" />
// 								<span>info@8436insight.com</span>
// 							</p>
// 							<p className="flex items-center space-x-2 text-sm">
// 								<Phone className="h-4 w-4" />
// 								<span>888 999 888 77</span>
// 							</p>
// 							<p className="flex items-center space-x-2 text-sm">
// 								<MapPin className="h-4 w-4" />
// 								<span>Addis Ababa, Ethiopia</span>
// 							</p>
// 						</div>
// 					</div>
// 				</SheetFooter>
// 			</SheetContent>
// 		</Sheet>
// 	);
// }
