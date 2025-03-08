import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// This endpoint allows client components to check authentication status
export async function GET(request: NextRequest) {
	const token = cookies().get("token")?.value;

	return NextResponse.json({
		isAuthenticated: !!token,
	});
}
