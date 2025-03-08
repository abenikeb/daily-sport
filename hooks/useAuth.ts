"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await fetch("/api/auth/check");
				const data = await res.json();
				setIsAuthenticated(data.isAuthenticated);
			} catch (error) {
				console.error("Error checking authentication:", error);
				setIsAuthenticated(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, []);

	const requireAuth = (url: string) => {
		if (isAuthenticated === false) {
			router.push(`/profile?redirect=${encodeURIComponent(url)}`);
			return false;
		}
		return true;
	};

	return {
		isAuthenticated,
		isLoading,
		requireAuth,
	};
}
