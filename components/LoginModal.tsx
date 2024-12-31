"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signupUser, loginUser } from "@/app/actions/userAuth";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const signupSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	phone: z.string().min(10, "Phone number must be at least 10 characters"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
	phone: z.string().min(10, "Phone number must be at least 10 characters"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupSchema = z.infer<typeof signupSchema>;
type LoginSchema = z.infer<typeof loginSchema>;

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
	onLoginSuccess: () => void;
}

export function LoginModal({
	isOpen,
	onClose,
	onLoginSuccess,
}: LoginModalProps) {
	const [isLogin, setIsLogin] = useState(true);
	const router = useRouter();
	const { toast } = useToast();

	const signupForm = useForm<SignupSchema>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: "",
			phone: "",
			password: "",
		},
	});

	const loginForm = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			phone: "",
			password: "",
		},
	});

	async function onSubmit(values: SignupSchema | LoginSchema) {
		const formData = new FormData();
		Object.entries(values).forEach(([key, value]) =>
			formData.append(key, value)
		);

		const action = isLogin ? loginUser : signupUser;
		const result = await action(formData);

		if (result.success) {
			toast({
				title: "Success",
				description: result.success,
			});
			onLoginSuccess();
			onClose();
		} else {
			toast({
				title: "Error",
				description: result.error,
				variant: "destructive",
			});
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{isLogin ? "Login" : "Sign Up"}</DialogTitle>
					<DialogDescription>
						{isLogin ? "Don't have an account?" : "Already have an account?"}
						<Button
							variant="link"
							className="font-medium text-primary"
							onClick={() => {
								setIsLogin(!isLogin);
								signupForm.reset();
								loginForm.reset();
							}}>
							{isLogin ? "Sign up" : "Log in"}
						</Button>
					</DialogDescription>
				</DialogHeader>

				{isLogin ? (
					<Form {...loginForm}>
						<form
							onSubmit={loginForm.handleSubmit(onSubmit)}
							className="space-y-4">
							<FormField
								control={loginForm.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone</FormLabel>
										<FormControl>
											<Input placeholder="Enter your phone number" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={loginForm.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Enter your password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full">
								Log in
							</Button>
						</form>
					</Form>
				) : (
					<Form {...signupForm}>
						<form
							onSubmit={signupForm.handleSubmit(onSubmit)}
							className="space-y-4">
							<FormField
								control={signupForm.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input placeholder="Enter your name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={signupForm.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone</FormLabel>
										<FormControl>
											<Input placeholder="Enter your phone number" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={signupForm.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Enter your password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full">
								Sign up
							</Button>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	);
}
