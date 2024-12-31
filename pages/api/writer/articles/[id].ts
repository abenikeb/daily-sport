import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { IncomingForm } from "formidable";
import fs from "fs/promises";
import path from "path";

export const config = {
	api: {
		bodyParser: false,
	},
};

async function saveFile(file: any): Promise<string> {
	const data = await fs.readFile(file.filepath);
	const filename = Date.now() + "-" + file.originalFilename;
	const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
	await fs.writeFile(uploadPath, data);
	await fs.unlink(file.filepath);
	return `/uploads/${filename}`;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { id } = req.query;

	if (req.method === "PUT") {
		const form = new IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.status(500).json({ message: "Error parsing form data" });
				return;
			}

			const { title, content, categoryId, subcategoryId, tags }: any = fields;
			let imagePath = null;

			if (files.image) {
				imagePath = await saveFile(files.image[0]);
			}

			try {
				const updatedArticle = await prisma.article.update({
					where: { id: id as string },
					data: {
						title: title[0],
						content: content[0],
						categoryId: categoryId[0],
						subcategoryId: subcategoryId[0],
						tags: {
							set: [],
							connectOrCreate: JSON.parse(tags[0]).map((tag: string) => ({
								where: { name: tag },
								create: { name: tag },
							})),
						},
						featuredImage: imagePath || undefined,
					},
				});
				res.status(200).json(updatedArticle);
			} catch (error) {
				res.status(500).json({ message: "Error updating article" });
			}
		});
	} else {
		res.setHeader("Allow", ["PUT"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
