"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
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

export function SignloginSchema({ redirectUrl }: LoginFormProps) {
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
			const manipulatedPhone = manipulatePhoneNumber(values.mobile);

			// Create FormData
			const formData = new FormData();
			formData.append("mobile", manipulatedPhone);
			formData.append("password", values.password);
			if (values.rememberMe !== undefined) {
				formData.append("rememberMe", values.rememberMe.toString());
			}

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
			return "251" + phone.slice(1);
		}
		return phone;
	}

	return (
		<div className="p-6 sm:p-8">
			<div className="text-center mb-8">
				<motion.h2
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-2xl font-bold text-blue-950 dark:text-secondary-foreground">
					Welcome
				</motion.h2>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="text-gray-600 dark:text-gray-300 mt-4 max-w-md mx-auto">
					Start enjoying all our features today!
				</motion.p>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="bg-blue-50 dark:bg-gray-800 p-5 rounded-lg mb-8 max-w-md mx-auto">
				<p className="text-center text-gray-700 dark:text-gray-300 mb-3">
					Click the button below to subscribe and register.
				</p>
				<div className="space-y-2">
					<div className="flex items-start">
						<CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
						<p className="text-sm text-gray-600 dark:text-gray-400">
							As a new user, you'll receive 3 days of free access.
						</p>
					</div>
					<div className="flex items-start">
						<CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
						<p className="text-sm text-gray-600 dark:text-gray-400">
							After the free trial, you will be automatically charged 2ETB per
							day.
						</p>
					</div>
				</div>
			</motion.div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="pt-2">
						<a href="sms:8436;?&body=Ok" className="block w-full">
							<Button
								type="button"
								className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-5 w-5 animate-spin" />
										{t("loggingIn")}
									</>
								) : (
									"ተመዝገብ / Register"
								)}
							</Button>
						</a>
					</motion.div>
				</form>
			</Form>

			{/* <motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
				className="mt-6 text-center">
				<p className="text-gray-500 dark:text-gray-400">
					Already have an account?{" "}
					<a
						href="sms:8436;?&body=Ok"
						className="text-primary font-semibold hover:underline">
						Login Now
					</a>
				</p>
			</motion.div> */}

			{/* Error Modal */}
			<ErrorModal
				isOpen={showErrorModal}
				onClose={() => setShowErrorModal(false)}
			/>
		</div>
	);
}
