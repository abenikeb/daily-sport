"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signupUser } from "@/app/actions/userAuth";
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

const signupSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	phone: z.string().min(10, "Phone number must be at least 10 characters"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupSchema = z.infer<typeof signupSchema>;

interface SignupFormProps {
	onSuccess: (message: string) => void;
	onError: (message: string) => void;
}

export function SignupForm({ onSuccess, onError }: SignupFormProps) {
	const form = useForm<SignupSchema>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: "",
			phone: "",
			password: "",
		},
	});

	async function onSubmit(values: SignupSchema) {
		const formData = new FormData();
		Object.entries(values).forEach(([key, value]) =>
			formData.append(key, value)
		);

		const result = await signupUser(formData);

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
					Sign up
				</Button>
			</form>
		</Form>
	);
}
