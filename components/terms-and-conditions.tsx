import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsAndConditionsProps {
	isOpen: boolean;
	onClose: () => void;
}

export function TermsAndConditions({
	isOpen,
	onClose,
}: TermsAndConditionsProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[625px]">
				<DialogHeader>
					<DialogTitle>Terms and Conditions</DialogTitle>
					<DialogDescription>
						Please read our terms and conditions carefully.
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="h-[400px] w-full rounded-md border p-4">
					<h2 className="text-lg font-bold mb-4">1. Acceptance of Terms</h2>
					<p className="mb-4">
						By accessing and using this service, you accept and agree to be
						bound by the terms and provision of this agreement.
					</p>

					<h2 className="text-lg font-bold mb-4">2. Use of the Service</h2>
					<p className="mb-4">
						You agree to use this service for lawful purposes only and in a way
						that does not infringe the rights of, restrict or inhibit anyone
						else's use and enjoyment of the service.
					</p>

					<h2 className="text-lg font-bold mb-4">3. Account and Security</h2>
					<p className="mb-4">
						If you create an account on the service, you are responsible for
						maintaining the security of your account and you are fully
						responsible for all activities that occur under the account and any
						other actions taken in connection with it.
					</p>

					<h2 className="text-lg font-bold mb-4">4. Privacy Policy</h2>
					<p className="mb-4">
						Your use of the service is also governed by our Privacy Policy,
						which can be found [link to privacy policy].
					</p>

					<h2 className="text-lg font-bold mb-4">5. Intellectual Property</h2>
					<p className="mb-4">
						The service and its original content, features, and functionality
						are owned by [Your Company Name] and are protected by international
						copyright, trademark, patent, trade secret, and other intellectual
						property or proprietary rights laws.
					</p>

					<h2 className="text-lg font-bold mb-4">6. Termination</h2>
					<p className="mb-4">
						We may terminate or suspend your account and bar access to the
						service immediately, without prior notice or liability, under our
						sole discretion, for any reason whatsoever and without limitation,
						including but not limited to a breach of the Terms.
					</p>

					<h2 className="text-lg font-bold mb-4">7. Limitation of Liability</h2>
					<p className="mb-4">
						In no event shall [Your Company Name], nor its directors, employees,
						partners, agents, suppliers, or affiliates, be liable for any
						indirect, incidental, special, consequential or punitive damages,
						including without limitation, loss of profits, data, use, goodwill,
						or other intangible losses, resulting from your access to or use of
						or inability to access or use the service.
					</p>

					<h2 className="text-lg font-bold mb-4">8. Changes to Terms</h2>
					<p className="mb-4">
						We reserve the right, at our sole discretion, to modify or replace
						these Terms at any time. What constitutes a material change will be
						determined at our sole discretion.
					</p>

					<h2 className="text-lg font-bold mb-4">9. Contact Us</h2>
					<p className="mb-4">
						If you have any questions about these Terms, please contact us at
						[contact email].
					</p>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
