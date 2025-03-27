import type { Metadata } from "next";
import { Raleway as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import Provider from "@/components/Provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LogIn, LogOut, Search, User, User2, User2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "@node_modules/next/image";
import { SidebarDrawer } from "@components/SidebarDrawer";
import { BottomNavigation } from "@components/BottomNavigation";
import { Toaster } from "@/components/ui/toaster";
import Link from "@node_modules/next/link";
import "./globals.css";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@components/ui/tooltip";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";

const fontSans = FontSans({
	subsets: ["latin"],
	variable: "--font-sans",
	weight: ["400", "500", "600", "700"],
});

export const metadata = {
	title: "Daily Sport News App",
	description: "Stay updated with the latest sports news",
};

async function getUser(token: string) {
	const secret = new TextEncoder().encode(process.env.JWT_SECRET);
	try {
		const { payload } = await jwtVerify(token, secret);
		const user = await prisma.user.findUnique({
			where: { id: payload.userId as string },
		});
		return user;
	} catch (error) {
		return null;
	}
}

async function UserButton() {
	// const { isAuthenticated, isLoading: authLoading } = useAuth();
	const token: any = cookies().get("token")?.value;

	const user = await getUser(token);

	// if (authLoading) {
	// 	return (
	// 		<Button variant="ghost" size="icon" className="relative overflow-hidden">
	// 			<div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full"></div>
	// 			<User className="w-6 h-6 text-transparent" />
	// 		</Button>
	// 	);
	// }

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="relative group"
						asChild>
						<Link href={user ? "/profile" : "/profile"}>
							<div className="relative">
								<div className="absolute inset-0 bg-primary/10 scale-0 rounded-full transition-transform duration-200 group-hover:scale-100"></div>
								{!user && (
									<User2Icon className="w-6 h-6 text-primary transition-colors duration-200" />
								)}
							</div>
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{user ? "Profile" : "Login"}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

function LogoutButton() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="relative group"
						asChild>
						<Link href="/api/auth/logout">
							<div className="relative">
								<div className="absolute inset-0 bg-red-100 scale-0 rounded-full transition-transform duration-200 group-hover:scale-100"></div>
								<LogOut className="w-6 h-6 text-red-500 transition-colors duration-200" />
							</div>
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Logout</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const token: any = cookies().get("token")?.value;

	return (
		<html lang="en">
			<Provider session={undefined}>
				<LanguageProvider>
					<body
						className={cn(
							"min-h-screen bg-background font-sans antialiased",
							fontSans.variable
						)}>
						<div className="mx-auto bg-gray-100 min-h-screen flex flex-col">
							<header className="bg-white px-4 py-2 flex justify-between items-center border-b-[1px] shadow-sm sticky top-0 z-10">
								<div className="flex items-center justify-center">
									<SidebarDrawer />
									<Link
										href="/"
										className="transition-transform hover:scale-105">
										<Image
											src="/assets/images/logo-sheger-walk.png"
											alt="Daily Sport News Logo"
											width={90}
											height={80}
											className="object-contain"
										/>
									</Link>
								</div>

								<div className="flex justify-between items-center space-x-1">
									<UserButton />
									{token && <LogoutButton />}
									<div className="h-8 w-px bg-gray-200 mx-1"></div>
									<LanguageSelector />
								</div>
							</header>
							<Toaster />
							{children}
						</div>
						<BottomNavigation />
					</body>
				</LanguageProvider>
			</Provider>
		</html>
	);
}

// import type { Metadata } from "next";
// import { Raleway as FontSans } from "next/font/google";
// import { cn } from "@/lib/utils";
// import Provider from "@/components/Provider";
// import { LanguageProvider } from "@/contexts/LanguageContext";
// import { LanguageSelector } from "@/components/LanguageSelector";
// import { Search } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import Image from "@node_modules/next/image";
// import { SidebarDrawer } from "@components/SidebarDrawer";
// import { BottomNavigation } from "@components/BottomNavigation";
// import { Toaster } from "@/components/ui/toaster";
// import Link from "@node_modules/next/link";
// import "./globals.css";

// const fontSans = FontSans({
// 	subsets: ["latin"],
// 	variable: "--font-sans",
// 	weight: ["400", "500", "600", "700"],
// });

// export const metadata = {
// 	title: "Daily Sport News App",
// 	description: "Stay updated with the latest sports news",
// };

// export default function RootLayout({
// 	children,
// }: Readonly<{
// 	children: React.ReactNode;
// }>) {
// 	return (
// 		<html lang="en">
// 			<Provider session={undefined}>
// 				<LanguageProvider>
// 					<body
// 						className={cn(
// 							"min-h-screen bg-background font-sans antialiased",
// 							fontSans.variable
// 						)}>
// 						<div className="mx-auto bg-gray-100 min-h-screen flex flex-col">
// 							<header className="bg-white px-4 py-2 flex justify-between items-center border-b-[1px]">
// 								{/* <div className="w-8 h-8 bg-red-500 rounded-full"></div> */}
// 								<div className="flex items-center justify-center">
// 									<SidebarDrawer />
// 									<Link href="/">
// 										<Image
// 											src="/assets/images/logo-sheger-walk.png"
// 											alt="Daily Sport News Logo"
// 											width={90}
// 											height={80}
// 											className=""
// 										/>
// 									</Link>
// 								</div>

// 								<div className="flex justify-between items-center">
// 									<Button variant="ghost" size="icon">
// 										<Search className="w-7 h-7 text-gray-500" />
// 										<span className="sr-only">search</span>
// 									</Button>
// 									<LanguageSelector />
// 								</div>
// 							</header>
// 							<Toaster />
// 							{children}
// 						</div>
// 						<BottomNavigation />
// 					</body>
// 				</LanguageProvider>
// 			</Provider>
// 		</html>
// 	);
// }
