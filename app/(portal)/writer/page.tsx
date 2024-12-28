"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

export default function WriterPortal() {
	const { t } = useLanguage();
	const [isLogin, setIsLogin] = useState(true);

	return (
		<div className="flex-grow flex flex-col items-center justify-center bg-gray-50 p-4">
			<div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
				<h2 className="text-2xl font-bold text-center mb-6">
					{isLogin ? t("writerLogin") : t("writerRegister")}
				</h2>
				<form className="space-y-4">
					{!isLogin && (
						<Input type="text" placeholder={t("fullName")} required />
					)}
					<Input type="email" placeholder={t("email")} required />
					<Input type="password" placeholder={t("password")} required />
					{!isLogin && (
						<Input
							type="password"
							placeholder={t("confirmPassword")}
							required
						/>
					)}
					<Button className="w-full" type="submit">
						{isLogin ? t("login") : t("register")}
					</Button>
				</form>
				<div className="mt-4 text-center">
					<Button variant="link" onClick={() => setIsLogin(!isLogin)}>
						{isLogin ? t("newWriterRegister") : t("alreadyHaveAccount")}
					</Button>
				</div>
				{isLogin && (
					<div className="mt-4 text-center">
						<Link
							href="/writer/dashboard"
							className="text-primary hover:underline">
							{t("goToDashboard")}
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
