import KeywordRepository from "./../Repository/keyword.repository";
import PostRepository from "../../Post/Repository/post.repository";
import SeriesRepository from "../../Series/Repository/series.repository";
import { ForbiddenException, InternalServerException, NotFoundException } from "../../../../Shared/Exceptions";
import {
	CreateKeywordDTO,
	DeleteKeywordDTO,
	deleteKeywordsIfNotReferencedInOtherPostsOrSeriesDTO,
	UpdateKeywordDTO,
} from "../Types";

export default class KeywordMutationsServices {
	public static async createKeyword(data: CreateKeywordDTO) {
		const createdKeyword = await KeywordRepository.createOne(data);

		if (!createdKeyword) throw new InternalServerException("The post creation failed!");

		return createdKeyword;
	}

	public static async updateKeyword(data: UpdateKeywordDTO) {
		const updatedKeyword = await KeywordRepository.updateOne({ _id: data._id }, { name: data.name });

		if (updatedKeyword.matchedCount === 0) throw new NotFoundException("The keyword is not found!");
		if (updatedKeyword.modifiedCount === 0) throw new InternalServerException("The keyword update process failed!");

		return updatedKeyword;
	}

	public static async deleteKeyword(data: DeleteKeywordDTO) {
		// TODO:
		// check first if no other models are referencing it

		const { deletedCount } = await KeywordRepository.deleteOne({ _id: data._id });

		if (deletedCount === 0) throw new InternalServerException("The keyword deletion process failed!");

		return "The keyword is deleted successfully!";
	}

	public static async deleteKeywordsIfNotReferencedInOtherPostsOrSeries(
		data: deleteKeywordsIfNotReferencedInOtherPostsOrSeriesDTO
	) {
		const deletePromises = data.keywords.map(async (keyword) => {
			const [foundPosts, foundSeries] = await Promise.all([
				PostRepository.findMany({ keywords: { $in: keyword._id } }),
				SeriesRepository.findMany({ keywords: { $in: keyword._id } }),
			]);

			const totalReferences = foundPosts.length + foundSeries.length;
			console.log({ totalReferences });
console.log("from keyowds service")
			if (totalReferences <= 3) {
				await KeywordMutationsServices.deleteKeyword({ _id: keyword._id });
			}
		});

		await Promise.all(deletePromises);
	}
}
