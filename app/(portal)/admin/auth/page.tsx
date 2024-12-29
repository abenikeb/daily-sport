"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signupAdmin, loginAdmin } from "@app/actions/adminAuth";
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

const authSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type AuthSchema = z.infer<typeof authSchema>;

export default function AdminAuthPage() {
	const [isLogin, setIsLogin] = useState(true);
	const router = useRouter();
	const { toast } = useToast();

	const form = useForm<AuthSchema>({
		resolver: zodResolver(authSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: AuthSchema) {
		const formData = new FormData();
		Object.entries(values).forEach(([key, value]) =>
			formData.append(key, value)
		);

		const action = isLogin ? loginAdmin : signupAdmin;
		const result = await action(formData);

		console.log({
			result,
		});

		if (result.error) {
			toast({
				title: "Error",
				description: result.error,
				variant: "destructive",
			});
		} else {
			toast({
				title: "Success",
				description: result.success,
			});
			router.push("/admin/dashboard");
		}

		// if (result.success) {
		// 	router.push("/admin/dashboard");
		// } else {
		// 	toast({
		// 		title: "Error",
		// 		description: result.error,
		// 		variant: "destructive",
		// 	});
		// }
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-100">
			<div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
				<div className="text-center">
					<h2 className="text-3xl font-extrabold text-gray-900">
						{isLogin ? "Admin Login" : "Admin Signup"}
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						{isLogin ? "Don't have an account?" : "Already have an account?"}
						<Button
							variant="link"
							className="font-medium text-primary"
							onClick={() => {
								setIsLogin(!isLogin);
								form.reset();
							}}>
							{isLogin ? "Sign up" : "Log in"}
						</Button>
					</p>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="Enter your email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
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
							{isLogin ? "Log in" : "Sign up"}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
