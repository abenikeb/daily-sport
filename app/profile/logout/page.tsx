"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
	const router = useRouter()
    const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", {
				method: "POST",
			});
		} catch (error) {
			console.error("Logout error:", error);
		} 
	};

	useEffect(() => {
         handleLogout()
		 router.replace('/')
    },[])

	return null
}
