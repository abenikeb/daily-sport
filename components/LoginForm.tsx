
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Smartphone, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { ErrorModal } from "@/components/error-modal";
import { loginUser } from "@/app/actions/userAuth";

const loginSchema = z.object({
	mobile: z
		.string()
		.min(10, "Phone number must be at least 10 characters")
		.regex(
			/^0[0-9]{9,}$/,
			"Phone number must start with 0 followed by 9 or more digits"
		),
	password: z.string().min(1, "Password is required"),
	rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
	redirectUrl?: string | null;
}

export function LoginForm({ redirectUrl }: LoginFormProps) {
	const { t } = useLanguage();
	const router = useRouter();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showErrorModal, setShowErrorModal] = useState(false);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			mobile: "",
			password: "",
			rememberMe: false,
		},
	});

	async function onSubmit(values: LoginFormValues) {
		setIsLoading(true);

		try {
			// Manipulate the phone number
			const manipulatedPhone = manipulatePhoneNumber(values.mobile)

			// Create FormData
			const formData = new FormData()
			formData.append("mobile", manipulatedPhone)
			formData.append("password", values.password)
			if (values.rememberMe !== undefined) {
				formData.append("rememberMe", values.rememberMe.toString())
			}

			// Object.entries(values).forEach(([key, value]) => {
			// 	if (typeof value !== "boolean") {
			// 		formData.append(key, value);
			// 	}
			// });

			// Call the loginUser function (assuming it's imported)
			// For demo purposes, let's simulate a response
			const result = await loginUser(formData);

			if (result.success) {
				toast({
					title: t("loginSuccess"),
					description: t("welcomeBack"),
				});

				if (redirectUrl) {
					router.push(redirectUrl);
				} else {
					router.push("/profile");
				}
				router.refresh();
			} else {
				setShowErrorModal(true);
			}
		} catch (error) {
			console.error("Login error:", error);
			setShowErrorModal(true);
		} finally {
			setIsLoading(false);
		}
	}

	 // Function to manipulate phone number
	function manipulatePhoneNumber(phone: string): string {
		if (phone.startsWith("0") && phone.length >= 10) {
		return "251" + phone.slice(1)
		}
		return phone
	}

	// Mock function for the demo
	// async function loginUser(formData: FormData) {
	// 	// Simulate API call
	// 	await new Promise((resolve) => setTimeout(resolve, 1500));

	// 	// For demo purposes, always return success
	// 	return { success: true };
	// }

	return (
		<div className="p-6 sm:p-8">
			<div className="text-center mb-8">
				<motion.h2
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-2xl font-bold text-blue-950 dark:text-secondary-foreground">
					Welcome Back
				</motion.h2>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="text-gray-500 dark:text-gray-400 mt-2">
					Sign in to your account
				</motion.p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}>
						<FormField
							control={form.control}
							name="mobile"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-blue-950 dark:text-secondary-foreground font-medium">
										የሞባይል ቁጥርዎን ያስገቡ
									</FormLabel>
									<div className="relative">
										<div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
											<Smartphone className="h-5 w-5" />
										</div>
										<FormControl>
											<Input
												placeholder="09........"
												className="pl-10 py-6 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary focus:ring-primary transition-all"
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage className="text-red-500" />
								</FormItem>
							)}
						/>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-blue-950 dark:text-secondary-foreground font-medium">
										የይለፍ ሚስጥር ቁጥርዎን ያስገቡ
									</FormLabel>
									<div className="relative">
										<div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
											<Lock className="h-5 w-5" />
										</div>
										<FormControl>
											<Input
												type={showPassword ? "text" : "password"}
												placeholder="Password"
												className="pl-10 pr-10 py-6 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary focus:ring-primary transition-all"
												{...field}
											/>
										</FormControl>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
											{showPassword ? (
												<EyeOff className="h-5 w-5" />
											) : (
												<Eye className="h-5 w-5" />
											)}
										</button>
									</div>
									<FormMessage className="text-red-500" />
								</FormItem>
							)}
						/>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="flex items-center justify-between">
						<FormField
							control={form.control}
							name="rememberMe"
							render={({ field }) => (
								<div className="flex items-center space-x-2">
									<Checkbox
										id="rememberMe"
										checked={field.value}
										onCheckedChange={field.onChange}
										className="data-[state=checked]:bg-primary"
									/>
									<label
										htmlFor="rememberMe"
										className="text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer">
										{t("rememberMe")}
									</label>
								</div>
							)}
						/>
						<a
							href="#"
							className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
							{t("forgotPassword")}
						</a>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="pt-2">
						<Button
							type="submit"
							disabled={isLoading}
							className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									{t("loggingIn")}
								</>
							) : (
								"ግባ / Login"
							)}
						</Button>
					</motion.div>
				</form>
			</Form>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
				className="mt-6 text-center">
				<p className="text-gray-500 dark:text-gray-400">
					Don't have an account?{" "}
					<a
						href="sms:8436;?&body=Ok"
						className="text-primary font-semibold hover:underline">
						Register Now
					</a>
				</p>
			</motion.div>

			{/* Error Modal */}
			<ErrorModal
				isOpen={showErrorModal}
				onClose={() => setShowErrorModal(false)}
			/>
		</div>
	);
}
