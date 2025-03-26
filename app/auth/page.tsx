import { Suspense } from "react";
import AuthClient from "./auth-client";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
					<div className="flex flex-col items-center">
						<Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
						<p className="text-gray-600 dark:text-gray-400">Loading...</p>
					</div>
				</div>
			}>
			<AuthClient />
		</Suspense>
	);
}
