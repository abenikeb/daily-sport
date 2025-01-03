import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
	const token = request.cookies.get("token")?.value;

	if (
		request.nextUrl.pathname.startsWith("/profile") ||
		request.nextUrl.pathname.startsWith("/writer") ||
		request.nextUrl.pathname.startsWith("/admin")
	) {
		if (!token) {
			return NextResponse.redirect(new URL("/auth", request.url));
		}

		try {
			const secret = new TextEncoder().encode(process.env.JWT_SECRET);
			const { payload } = await jwtVerify(token, secret);

			if (
				request.nextUrl.pathname.startsWith("/admin") &&
				payload.role !== "ADMIN"
			) {
				return NextResponse.redirect(new URL("/auth", request.url));
			}

			if (
				request.nextUrl.pathname.startsWith("/writer") &&
				payload.role !== "WRITER"
			) {
				return NextResponse.redirect(new URL("/auth", request.url));
			}

			return NextResponse.next();
		} catch (error) {
			return NextResponse.redirect(new URL("/auth", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/profile/:path*", "/writer/:path*", "/admin/:path*"],
};
