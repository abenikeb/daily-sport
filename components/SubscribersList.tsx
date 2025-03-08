import { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Subscriber {
	id: string;
	email: string;
	phone: string;
	name: string | null;
	subscriptionStatus: string;
	subscriptionStart: string | null;
	subscriptionEnd: string | null;
}

export function SubscribersList() {
	const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
	const { toast } = useToast();
	const { t } = useLanguage();

	useEffect(() => {
		fetchSubscribers();
	}, []);

	const fetchSubscribers = async () => {
		try {
			const response = await fetch("/api/admin/subscribers");
			if (!response.ok) throw new Error("Failed to fetch subscribers");
			const data = await response.json();
			setSubscribers(data);
		} catch (error) {
			console.error("Error fetching subscribers:", error);
			toast({
				title: t("errorFetchingSubscribers"),
				description: t("errorFetchingSubscribersDescription"),
				variant: "destructive",
			});
		}
	};

	const handleEditSubscriber = (subscriberId: string) => {
		// Implement edit functionality
		console.log("Edit subscriber:", subscriberId);
	};

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">{t("subscribers")}</h2>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>#</TableHead>
						<TableHead>{t("name")}</TableHead>
						<TableHead>{t("phone")}</TableHead>
						<TableHead>{t("subscriptionStatus")}</TableHead>
						<TableHead>{t("subscriptionStart")}</TableHead>
						<TableHead>{t("subscriptionEnd")}</TableHead>
						<TableHead>{t("actions")}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{subscribers.map((subscriber, index) => (
						<TableRow key={subscriber.id}>
							<TableCell>{index + 1}</TableCell>
							<TableCell>{subscriber.name || t("notProvided")}</TableCell>
							<TableCell>{subscriber.phone}</TableCell>
							<TableCell>
								{t(subscriber.subscriptionStatus.toLowerCase())}
							</TableCell>
							<TableCell>
								{subscriber.subscriptionStart
									? new Date(subscriber.subscriptionStart).toLocaleDateString()
									: t("notAvailable")}
							</TableCell>
							<TableCell>
								{subscriber.subscriptionEnd
									? new Date(subscriber.subscriptionEnd).toLocaleDateString()
									: t("notAvailable")}
							</TableCell>
							<TableCell>
								<Button onClick={() => handleEditSubscriber(subscriber.id)}>
									{t("edit")}
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
