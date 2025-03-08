"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Trophy, User, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

type NavItem = {
	name: string;
	href: string;
	icon: React.ElementType;
};

const navItems: NavItem[] = [
	{ name: "home", href: "/", icon: Home },
	{ name: "categories", href: "/category/all", icon: Trophy },
	{ name: "profile", href: "/profile", icon: User },
	// { name: "more", href: "/more", icon: Menu },
];

export function BottomNavigation() {
	const { t } = useLanguage();
	const pathname = usePathname();
	const router = useRouter();
	const [active, setActive] = useState<string>("home");

	useEffect(() => {
		const currentItem = navItems.find(
			(item) =>
				pathname === item.href ||
				(item.href !== "/" && pathname?.startsWith(item.href))
		);
		if (currentItem) {
			setActive(currentItem.name);
		}
	}, [pathname]);

	const handleNavClick = (item: NavItem) => {
		router.push(item.href);
	};

	return (
		<nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
			<div className="max-w-screen-xl mx-auto px-4">
				<ul className="flex justify-around py-1">
					{navItems.map((item) => (
						<li key={item.name} className="relative">
							<button
								onClick={() => handleNavClick(item)}
								className={cn(
									"flex flex-col items-center justify-center w-14 h-12 rounded-lg",
									"transition-colors duration-200",
									active === item.name ? "text-primary" : "text-gray-400"
								)}>
								<item.icon className="w-5 h-5" />
								<span className="text-xs mt-0.5">{t(item.name)}</span>
								{active === item.name && (
									<motion.div
										className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
										layoutId="activeTab"
										initial={false}
										transition={{
											type: "spring",
											stiffness: 500,
											damping: 30,
										}}
									/>
								)}
							</button>
						</li>
					))}
				</ul>
			</div>
		</nav>
	);
}
