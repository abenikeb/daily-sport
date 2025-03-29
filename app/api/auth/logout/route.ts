import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function POST() {
	cookies().delete("token");
	redirect("/");
	return NextResponse.json({ success: true });
}
