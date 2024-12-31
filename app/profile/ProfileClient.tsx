"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
	id: string;
	name: string;
	phone: string;
}

interface ProfileClientProps {
	user: User;
}

export default function ProfileClient({ user }: ProfileClientProps | any) {
	const router = useRouter();
	const { toast } = useToast();

	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", { method: "POST" });
			router.push("/");
			window.location.reload();
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100">
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="bg-white shadow-sm rounded-lg p-6">
					<div className="flex items-center space-x-4 mb-6">
						<Avatar className="h-16 w-16">
							<AvatarImage
								src="/assets/icons/AvatarImage.svg"
								alt="User's avatar"
							/>
							<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div>
							<h2 className="text-2xl font-semibold">{user.name}</h2>
							<p className="text-gray-600">{user.phone}</p>
						</div>
					</div>
					<Button onClick={handleLogout} variant="outline">
						<LogOut className="mr-2 h-4 w-4" />
						Logout
					</Button>
				</div>
			</main>
		</div>
	);
}
