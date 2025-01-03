"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LoginForm } from "@/components/LoginForm";
import { SignupForm } from "@/components/SignupForm";

export default function AuthPage() {
	const [isLogin, setIsLogin] = useState(true);
	const router = useRouter();
	const { toast } = useToast();

	const handleSuccess = (message: string) => {
		toast({
			title: "Success",
			description: message,
		});
		router.push("/");
	};

	const handleError = (message: string) => {
		toast({
			title: "Error",
			description: message,
			variant: "destructive",
		});
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-100">
			<div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
				<div className="text-center">
					<h2 className="text-3xl font-extrabold text-gray-900">
						{isLogin ? "Welcome Back" : "Subscribe Now"}
					</h2>

					{/* <DialogHeader>
						<DialogTitle className="text-2xl font-bold">
							{isLogin ? "Welcome Back" : "Subscribe Now"}
						</DialogTitle>
						<DialogDescription>
							{isLogin
								? "Log in to access your account and all our features."
								: "Sign up to get started with our amazing services."}
						</DialogDescription>
					</DialogHeader> */}

					<p className="mt-2 text-sm text-gray-600">
						{isLogin ? "Don't have an account?" : "Already have an account?"}
						<Button
							variant="link"
							className="font-medium text-primary"
							onClick={() => setIsLogin(!isLogin)}>
							{isLogin ? "Sign up" : "Log in"}
						</Button>
					</p>
				</div>

				{isLogin ? (
					<LoginForm onSuccess={handleSuccess} onError={handleError} />
				) : (
					<SignupForm onSuccess={handleSuccess} onError={handleError} />
				)}
			</div>
		</div>
	);
}
