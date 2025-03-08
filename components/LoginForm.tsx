"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser } from "@/app/actions/userAuth";
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

const loginSchema = z.object({
	phone: z.string().min(10, "Phone number must be at least 10 characters"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginSchema = z.infer<typeof loginSchema>;

interface LoginFormProps {
	onSuccess: (message: string) => void;
	onError: (message: string) => void;
}

export function LoginForm({ onSuccess, onError }: LoginFormProps) {
	const form = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			phone: "",
			password: "",
		},
	});

	async function onSubmit(values: LoginSchema) {
		const formData = new FormData();
		Object.entries(values).forEach(([key, value]) =>
			formData.append(key, value)
		);

		const result = await loginUser(formData);

		if (result.success) {
			onSuccess(result.success);
		} else {
			onError(result.error || "An error occurred");
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
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
					Log in
				</Button>
			</form>
		</Form>
	);
}
