import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-12 pb-20 px-4">
			<div className="max-w-4xl mx-auto">
				<Link
					href="/"
					className="inline-flex items-center text-blue-950 hover:text-secondary/80 mb-8 transition-colors">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Home
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
								Terms and Conditions of Use for 8436insght.et
							</h2>
							<p className="text-sm text-gray-500 mb-6">
								Last Updated: March 26, 2025
							</p>

							<p className="text-gray-700">
								These Terms and Conditions ("Terms") govern your access to and
								use of 8436insght.et (the "Website"), a football entertainment
								website dedicated to providing sports news and updates from
								around the globe, specifically tailored for Ethiopian users. By
								accessing or using the Website, you ("User" or "you") agree to
								be bound by these Terms. These Terms constitute a legally
								binding agreement between you and 8436insght.et ("we," "us," or
								"our"). If you do not agree to these Terms, you may not access
								or use the Website.
							</p>

							<div className="mt-6 space-y-6">
								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										1. Acceptance of Terms
									</h3>
									<p className="text-gray-700">
										By accessing, browsing, or using the Website, you
										acknowledge that you have read, understood, and agree to be
										bound by these Terms, including any additional guidelines
										and future modifications that we may publish from time to
										time. Your continued use of the Website following the
										posting of changes to these Terms will signify your
										acceptance of those changes.
									</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										2. Description of Service
									</h3>
									<p className="text-gray-700">
										8436insght.et is a football entertainment website designed
										to be a daily destination for Ethiopian users seeking sports
										news, the latest updates, scores, highlights, and related
										content from the world of football and sport. We strive to
										provide accurate and timely information, but we do not
										guarantee the completeness or accuracy of all content.
									</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										3. User Eligibility and Access
									</h3>
									<p className="text-gray-700">
										The Website is intended solely for users located within
										Ethiopia who are holders of an active Ethio Telecom SIM
										card. By accessing the Website, you represent and warrant
										that you meet these eligibility requirements. We reserve the
										right to restrict access to the Website to any user who does
										not meet these criteria.
									</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										4. Subscription Service for Ethiopian Users
									</h3>
									<p className="text-gray-700 mb-4">
										Access to certain features or content on the Website may
										require a subscription. The subscription service is
										exclusively available to users with an active Ethio Telecom
										SIM card.
									</p>

									<h4 className="text-md font-medium text-blue-950 mb-2">
										4.1 Subscription Activation:
									</h4>
									<p className="text-gray-700 mb-3">
										To subscribe to our service, you are required to send the
										keyword "OK" via SMS to the shortcode 8436 using your Ethio
										Telecom SIM card. By sending this SMS, you acknowledge and
										agree to initiate a subscription to 8436insght.et and
										authorize Ethio Telecom to deduct the applicable
										subscription fees from your mobile balance.
									</p>

									<h4 className="text-md font-medium text-blue-950 mb-2">
										4.2 Subscription Fees and Payment:
									</h4>
									<p className="text-gray-700 mb-3">
										A daily subscription fee of 2 Ethiopian Birr (ETB 2) will be
										automatically charged to your Ethio Telecom mobile balance.
										This daily charge will continue until you unsubscribe from
										the service. By subscribing, you acknowledge and agree to
										this fee structure and authorize Ethio Telecom to deduct the
										applicable daily charges from your mobile balance after the
										initial free period.
									</p>

									<h4 className="text-md font-medium text-blue-950 mb-2">
										4.3 Unsubscription:
									</h4>
									<p className="text-gray-700 mb-3">
										You can unsubscribe from the service at any time by sending
										the keyword "STOP" via SMS to the shortcode 8436 using your
										Ethio Telecom SIM card. Upon successful unsubscription, the
										daily charges will cease. It is your responsibility to
										ensure that you send the correct unsubscription keyword to
										the designated shortcode if you wish to stop the
										subscription and avoid further charges.
									</p>

									<h4 className="text-md font-medium text-blue-950 mb-2">
										4.4 Free Access Period (If Applicable):
									</h4>
									<p className="text-gray-700">
										We may offer a 3-day free access period to new subscribers.
										This free access begins upon successful subscription
										activation via SMS to 8436. After the 3-day free period,
										your subscription will automatically continue, and you will
										be charged the applicable subscription fees by Ethio
										Telecom, as outlined in Section 4.2. You may need to cancel
										your subscription before the end of the free trial period to
										avoid being charged.
									</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										5. User Conduct
									</h3>
									<p className="text-gray-700 mb-3">
										You agree to use the Website responsibly and respectfully.
										You shall not:
									</p>
									<ul className="list-disc pl-5 space-y-2 text-gray-700">
										<li>
											Use the Website for any illegal or unauthorized purpose.
										</li>
										<li>
											Post or transmit any content that is unlawful, harmful,
											threatening, abusive, harassing, defamatory, vulgar,
											obscene, libelous, invasive of another's privacy, hateful,
											or racially, ethnically, or otherwise objectionable.
										</li>
										<li>
											Impersonate any person or entity, or falsely state or
											otherwise misrepresent your affiliation with a person or
											entity.
										</li>
										<li>
											Interfere with or disrupt the operation of the Website or
											any servers or networks connected to the Website.
										</li>
										<li>
											Attempt to gain unauthorized access to any portion of the
											Website, other user accounts, or any computer systems or
											networks connected to the Website.
										</li>
										<li>
											Collect or store personal data about other users without
											their express consent.
										</li>
										<li>
											Engage in any activity that could damage, disable,
											overburden, or impair the Website or interfere with any
											other party's use and enjoyment of the Website.
										</li>
									</ul>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										6. Intellectual Property
									</h3>
									<p className="text-gray-700">
										All content on the Website, including but not limited to
										text, graphics, logos, images, audio clips, video clips,
										data compilations, software, and the design, selection, and
										arrangement thereof (the "Content"), is owned by or licensed
										to us and is protected by copyright, trademark, and other
										intellectual property laws. You may access and view the
										Content for your personal, non-commercial use only. You may
										not reproduce, modify, distribute, transmit, display,
										perform, publish, license, create derivative works from, or
										sell any Content without our prior written consent.
									</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										7. Third-Party Links and Content
									</h3>
									<p className="text-gray-700">
										The Website may contain links to third-party websites or
										resources. We are not responsible for the content, accuracy,
										or availability of these external sites and resources, and
										we do not endorse and are not responsible or liable for any
										content, advertising, products, or other materials on or
										available from such sites or resources. You acknowledge and
										agree that we shall not be responsible or liable, directly
										or indirectly, for any damage or loss caused or alleged to
										be caused by or in connection with the use of or reliance on
										any such content, goods, or services available on or through
										any such site or resource.
									</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										8. Disclaimer of Warranties
									</h3>
									<p className="text-gray-700 uppercase text-sm">
										THE WEBSITE AND ALL CONTENT, PRODUCTS, AND SERVICES PROVIDED
										ON OR THROUGH THE WEBSITE ARE PROVIDED ON AN "AS IS" AND "AS
										AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER
										EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,
										WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
										PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE. WE DO
										NOT WARRANT THAT THE WEBSITE WILL BE UNINTERRUPTED OR
										ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE
										WEBSITE OR THE SERVERS THAT MAKE IT AVAILABLE ARE FREE OF
										VIRUSES OR OTHER HARMFUL COMPONENTS. WE MAKE NO WARRANTIES
										REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF THE
										CONTENT ON THE WEBSITE.
									</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										9. Limitation of Liability
									</h3>
									<p className="text-gray-700 uppercase text-sm">
										TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO
										EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
										SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING,
										WITHOUT LIMITATION, DAMAGES FOR LOSS OF PROFITS, DATA, USE,
										GOODWILL, OR OTHER INTANGIBLE LOSSES) ARISING OUT OF OR
										RELATING TO YOUR ACCESS TO OR USE OF, OR INABILITY TO ACCESS
										OR USE, THE WEBSITE, EVEN IF WE HAVE BEEN ADVISED OF THE
										POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY TO YOU FOR
										ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE
										WEBSITE SHALL NOT EXCEED ETB 100.
									</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										10. Indemnification
									</h3>
									<p className="text-gray-700">
										You agree to indemnify, defend, and hold harmless us, our
										affiliates, officers, directors, employees, agents,
										licensors, and suppliers from and against any and all
										claims, liabilities, damages, losses, costs, expenses, or
										fees (including reasonable attorneys' fees) arising out of
										or relating to your violation of these Terms or your use of
										the Website, including any content you submit, post,
										transmit, or otherwise make available through the Website.
									</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										11. Modification of Terms
									</h3>
									<p className="text-gray-700">
										We reserve the right to modify these Terms at any time
										without prior notice. We will notify you of any significant
										changes by posting the updated Terms on the Website and
										updating the "Last Updated" date. Your continued use of the
										Website after the posting of revised Terms constitutes your
										acceptance of the changes. It is your responsibility to
										review these Terms periodically for any updates or changes.
									</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										12. Governing Law and Dispute Resolution
									</h3>
									<p className="text-gray-700">
										These Terms shall be governed by and construed in accordance
										with the laws of Ethiopia, without regard to its conflict of
										law principles. Any dispute arising out of or relating to
										these Terms or the Website shall be subject to the exclusive
										jurisdiction of the courts located in Addis Ababa, Ethiopia.
									</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										13. Severability
									</h3>
									<p className="text-gray-700">
										If any provision of these Terms is held to be invalid or
										unenforceable, such provision shall be struck and the
										remaining provisions shall remain in full force and effect.
									</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										14. Waiver
									</h3>
									<p className="text-gray-700">
										Our failure to enforce any right or provision of these Terms
										shall not constitute a waiver of such right or provision.
									</p>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
									<h3 className="text-lg font-medium text-blue-950 mb-2">
										15. Entire Agreement
									</h3>
									<p className="text-gray-700">
										These Terms constitute the entire agreement between you and
										us regarding your access to and use of the Website and
										supersede any prior agreements or understandings.
									</p>
								</div>

								{/* <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-secondary">
									<h3 className="text-lg font-medium text-secondary mb-2">
										በአማርኛ
									</h3>
									<ul className="list-disc pl-5 space-y-2 text-gray-700">
										<li>በመጀመሪያ 3 ቀናት በነጻ</li>
										<li>ከዚያም በቀን 2 ብር</li>
										<li>አገልግሎቱን ለማቋረጥ ወደ 8436 Stop ብለዉ ይላኩ</li>
										<li>ለተጨማሪ መረጃ በ 0913229175 ያግኙን</li>
									</ul>
								</div> */}
							</div>

							<div className="mt-8 p-4 bg-secondary/5 rounded-lg">
								<p className="text-gray-700">
									By clicking the subscription button and sending "OK" to 8436,
									you acknowledge that you have read, understood, and agree to
									be bound by these Terms and Conditions.
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="text-center mt-8 text-gray-500 text-sm">
					<p>
						© {new Date().getFullYear()} 8436insght.et. All rights reserved.
					</p>
				</div>
			</div>
		</div>
	);
}

// import Link from "next/link";
// import { ArrowLeft } from "lucide-react";

// export default function TermsPage() {
// 	return (
// 		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
// 			<div className="max-w-3xl mx-auto">
// 				<Link
// 					href="/"
// 					className="inline-flex items-center text-blue-950 hover:text-secondary/80 mb-8 transition-colors">
// 					<ArrowLeft className="mr-2 h-4 w-4" />
// 					Back to Login
// 				</Link>

// 				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
// 					<div className="bg-secondary text-blue-950 p-6">
// 						<h1 className="text-2xl font-bold">Terms & Conditions</h1>
// 						<p className="text-secondary-foreground/80 mt-2">
// 							Please read these terms carefully before using our service
// 						</p>
// 					</div>

// 					<div className="p-6 md:p-8">
// 						<div className="prose max-w-none">
// 							<h2 className="text-xl font-semibold text-blue-950 mb-4 pb-2 border-b">
// 								Tocido PLC Service Terms
// 							</h2>

// 							<p className="text-gray-700">
// 								Welcome to Tocido PLC. By using our services, you agree to the
// 								following terms and conditions:
// 							</p>

// 							<div className="mt-6 space-y-6">
// 								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
// 									<h3 className="text-lg font-medium text-blue-950 mb-2">
// 										Subscription Details
// 									</h3>
// 									<ul className="list-disc pl-5 space-y-2 text-gray-700">
// 										<li>First 3 days are free of charge</li>
// 										<li>
// 											After the free trial period, a daily fee of 2 Birr will be
// 											charged
// 										</li>
// 										<li>To unsubscribe from the service, send STOP to 8436</li>
// 										<li>For customer support, please call 0913229175</li>
// 									</ul>
// 								</div>

// 								<div className="bg-gray-50 p-4 rounded-lg border-l-4 border-secondary">
// 									<h3 className="text-lg font-medium text-secondary mb-2">
// 										በአማርኛ
// 									</h3>
// 									<ul className="list-disc pl-5 space-y-2 text-gray-700">
// 										<li>በመጀመሪያ 3 ቀናት በነጻ</li>
// 										<li>ከዚያም በቀን 2 ብር</li>
// 										<li>አገልግሎቱን ለማቋረጥ ወደ 8436 Stop ብለዉ ይላኩ</li>
// 										<li>ለተጨማሪ መረጃ በ 0913229175 ያግኙን</li>
// 									</ul>
// 								</div>
// 							</div>

// 							<div className="mt-8 p-4 bg-secondary/5 rounded-lg">
// 								<p className="text-gray-700">
// 									By continuing to use our service, you acknowledge that you
// 									have read and understood these terms. Tocido PLC reserves the
// 									right to modify these terms at any time. It is your
// 									responsibility to check for updates periodically.
// 								</p>
// 							</div>
// 						</div>
// 					</div>
// 				</div>

// 				<div className="text-center mt-8 text-gray-500 text-sm">
// 					<p>© {new Date().getFullYear()} Tocido PLC. All rights reserved.</p>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }
