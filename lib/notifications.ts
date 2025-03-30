/**
 * Sends a notification to the external API when an article is approved
 * @param text The article text content (preferably in Amharic)
 * @param imageUrl The article featured image URL
 * @returns Promise resolving to the API response
 */
export async function sendArticleApprovedNotification(
	text: string,
	imageUrl: string
): Promise<any> {
	try {
		// Prepare the data to send to the external API
		const data = {
			text: text,
			image_url: imageUrl,
		};

		// Send the data to the external API
		const externalApiUrl = "https://shegerwalk.com/web_to_tg.php";
		const response = await fetch(externalApiUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`External API responded with status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error sending notification:", error);
		throw error;
	}
}
