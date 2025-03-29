"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface CloudinaryUploaderProps {
	value?: string;
	onChange: (url: string) => void;
	onClear: () => void;
	label?: string;
}

export function CloudinaryUploader({
	value,
	onChange,
	onClear,
	label = "Featured Image",
}: CloudinaryUploaderProps) {
	const [imageUrl, setImageUrl] = useState<string | undefined>(value);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const { toast } = useToast();

	useEffect(() => {
		setImageUrl(value);
	}, [value]);

	const handleUpload = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			if (!e.target.files || e.target.files.length === 0) return;

			const file = e.target.files[0];

			// Validate file type
			if (!file.type.startsWith("image/")) {
				toast({
					title: "Invalid file type",
					description: "Please upload an image file",
					variant: "destructive",
				});
				return;
			}

			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast({
					title: "File too large",
					description: "Image must be less than 5MB",
					variant: "destructive",
				});
				return;
			}

			setIsUploading(true);
			setUploadProgress(0);

			try {
				// Create form data for upload
				const formData = new FormData();
				formData.append("file", file);

				// Upload to our API endpoint that handles Cloudinary upload
				const response = await fetch("/api/cloudinary/upload", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.message || "Failed to upload image");
				}

				const data = await response.json();
				setImageUrl(data.url);
				onChange(data.url);

				toast({
					title: "Upload successful",
					description: "Image has been uploaded successfully",
				});
			} catch (error) {
				console.error("Upload error:", error);
				toast({
					title: "Upload failed",
					description:
						error instanceof Error ? error.message : "Please try again",
					variant: "destructive",
				});
			} finally {
				setIsUploading(false);
				setUploadProgress(100);
				// Reset progress after a delay
				setTimeout(() => setUploadProgress(0), 1000);
			}
		},
		[onChange, toast]
	);

	const handleClear = useCallback(() => {
		setImageUrl(undefined);
		onClear();
	}, [onClear]);

	// Simulate progress for better UX
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (isUploading && uploadProgress < 90) {
			interval = setInterval(() => {
				setUploadProgress((prev) => Math.min(prev + 10, 90));
			}, 300);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isUploading, uploadProgress]);

	return (
		<div className="space-y-2">
			<Label>{label}</Label>

			<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all hover:border-gray-400">
				{imageUrl ? (
					<div className="space-y-2">
						<div className="relative aspect-video w-full overflow-hidden rounded-lg">
							<Image
								src={imageUrl || "/placeholder.svg"}
								alt="Uploaded image"
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, 500px"
							/>
							<Button
								type="button"
								size="icon"
								variant="destructive"
								className="absolute top-2 right-2 h-8 w-8 rounded-full"
								onClick={handleClear}>
								<X className="h-4 w-4" />
								<span className="sr-only">Remove image</span>
							</Button>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-4">
						<div className="mb-2 rounded-full bg-gray-100 p-3">
							<ImageIcon className="h-6 w-6 text-gray-500" />
						</div>
						<div className="mb-2 text-sm font-medium text-gray-900">
							{isUploading
								? "Uploading..."
								: "Drag and drop or click to upload"}
						</div>
						<div className="text-xs text-gray-500">
							PNG, JPG or WEBP (max. 5MB)
						</div>

						{isUploading && uploadProgress > 0 && (
							<div className="mt-4 w-full max-w-xs">
								<div className="h-2 w-full rounded-full bg-gray-200">
									<div
										className="h-2 rounded-full bg-blue-600 transition-all duration-300"
										style={{ width: `${uploadProgress}%` }}
									/>
								</div>
								<div className="mt-1 text-right text-xs text-gray-500">
									{uploadProgress}%
								</div>
							</div>
						)}

						<div className="mt-4">
							<input
								id="file-upload"
								type="file"
								className="hidden"
								accept="image/*"
								onChange={handleUpload}
								disabled={isUploading}
							/>
							<label htmlFor="file-upload">
								<Button
									type="button"
									variant="outline"
									disabled={isUploading}
									className="cursor-pointer"
									asChild>
									<span>
										<Upload className="mr-2 h-4 w-4" />
										{isUploading ? "Uploading..." : "Upload Image"}
									</span>
								</Button>
							</label>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
