"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
	const token = cookies().get("token")?.value;
	return !!token;
}

// Verify token (optional, as mentioned)
export async function verifyToken(token: string): Promise<boolean> {
	try {
		if (!process.env.JWT_SECRET) {
			console.error("JWT_SECRET is not defined");
			return false;
		}

		const secret = new TextEncoder().encode(process.env.JWT_SECRET);
		await jwtVerify(token, secret);
		return true;
	} catch (error) {
		console.error("Token verification failed:", error);
		return false;
	}
}

// Store redirect URL in a cookie
export async function setRedirectUrl(url: string): Promise<void> {
	cookies().set("redirectAfterLogin", url, {
		path: "/",
		maxAge: 60 * 10, // 10 minutes
		httpOnly: true,
		sameSite: "lax",
	});
}

// Get and clear redirect URL
export async function getAndClearRedirectUrl(): Promise<string | null> {
	const redirectUrl = cookies().get("redirectAfterLogin")?.value || null;

	if (redirectUrl) {
		// Clear the cookie
		cookies().delete("redirectAfterLogin");
	}

	return redirectUrl;
}

// Client-side authentication check
export function checkAuthAndRedirect(url: string): void {
	redirect("/profile?redirect=" + encodeURIComponent(url));
}
