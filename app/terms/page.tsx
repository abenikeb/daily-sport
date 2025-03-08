import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
			<div className="max-w-3xl mx-auto">
				<Link
					href="/"
					className="inline-flex items-center text-blue-950 hover:text-secondary/80 mb-8 transition-colors">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Login
				</Link>

				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					<div className="bg-secondary text-blue-950 p-6">
						<h1 className="text-2xl font-bold">Terms & Conditions</h1>
						<p className="text-secondary-foreground/80 mt-2">
							Please read these terms carefully before using our service
						</p>
					</div>

					<div className="p-6 md:p-8">
						<div className="prose max-w-none">
							<h2 className="text-xl font-semibold text-blue-950 mb-4 pb-2 border-b">
								Tocido PLC Service Terms
							</h2>

							<p className="text-gray-700">
								Welcome to Tocido PLC. By using our services, you agree to the
								following terms and conditions:
							</p>

							<div className="mt-6 space-y-6">
								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										Subscription Details
									</h3>
									<ul className="list-disc pl-5 space-y-2 text-gray-700">
										<li>First 3 days are free of charge</li>
										<li>
											After the free trial period, a daily fee of 2 Birr will be
											charged
										</li>
										<li>To unsubscribe from the service, send STOP to 8436</li>
										<li>For customer support, please call 0913229175</li>
									</ul>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-secondary">
									<h3 className="text-lg font-medium text-secondary mb-2">
										በአማርኛ
									</h3>
									<ul className="list-disc pl-5 space-y-2 text-gray-700">
										<li>በመጀመሪያ 3 ቀናት በነጻ</li>
										<li>ከዚያም በቀን 2 ብር</li>
										<li>አገልግሎቱን ለማቋረጥ ወደ 8436 Stop ብለዉ ይላኩ</li>
										<li>ለተጨማሪ መረጃ በ 0913229175 ያግኙን</li>
									</ul>
								</div>
							</div>

							<div className="mt-8 p-4 bg-secondary/5 rounded-lg">
								<p className="text-gray-700">
									By continuing to use our service, you acknowledge that you
									have read and understood these terms. Tocido PLC reserves the
									right to modify these terms at any time. It is your
									responsibility to check for updates periodically.
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="text-center mt-8 text-gray-500 text-sm">
					<p>© {new Date().getFullYear()} Tocido PLC. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
}
