import {
	NotFoundException,
	ForbiddenException,
	UnAuthorizedException,
	ValidationException,
} from "../../../../Shared/Exceptions";
import { GraphQLError } from "graphql";
import Post from "../Model/post.model";
import Tag from "../../Tag/Model/tag.model";
import { SuggestPostByTitleDTO, getPostBySlugDTO } from "../Types";
import PostRepository from "../Repository/post.repository";

export default class PostQueriesServices {
	public static async suggestPostByTitle(data: SuggestPostByTitleDTO) {
		const matchedPosts = await PostRepository.aggregate([
			{ $search: { index: "suggestPostByTitle", autocomplete: { query: data.title, path: "title" } } },
			{ $limit: 5 },
			{ $project: { title: 1, slug: 1 } },
		]);

		if (matchedPosts.length < 1) throw new NotFoundException("Not matched posts found!");

		return matchedPosts;
	}

	public static async getPostBySlug(data: getPostBySlugDTO) {
		const matchedPost = await PostRepository.findOne({ slug: data.slug });

		if (!matchedPost) throw new NotFoundException("The post is not found!");

		// TODO: increase views!
		return matchedPost;
	}

	// TODO: Only return posts if isPublished == true!!!!! for all services!!!!

	// (1) Return Post by given ID
	public static async getPostById(data) {
		// (1) Find Post
		const post = await Post.findOne({
			_id: data.postId,
		})
			.populate({
				path: "tags",
			})
			.lean();

		// If not found
		if (!post) {
			throw new NotFoundException("fuck you, not found!");
		}

		// TODO: Work on views (only increase if not me (admin!))

		// (2) Return Post
		return post;
	}

	// (3) Return All posts
	public static async getAllPosts(data) {
		let posts = [];
		// (1) Find posts

		if (!data || !data.lastPostId) {
			posts = await Post.find({}).populate({ path: "tags" }).limit(5).lean(); // page 1
		}

		if (data && data.lastPostId) {
			await Post.find({ _id: { $gt: data.lastPostId } }) // Next pages
				.populate({ path: "tags" })
				.limit(data.limit)
				.lean();
		}

		// If no posts found
		if (posts.length == 0) {
			return new GraphQLError("No Posts Found", {
				extensions: { http: { status: 404 } },
			});
		}

		// (2) Return found posts in DB
		return posts;
	}

	public static async getAllPostsByTag(data) {
		const pageNumber = data.page;
		const limit = 8;

		const skip = pageNumber == 1 ? 0 : (pageNumber - 1) * limit;

		const tag = await Tag.findOne({ slug: data.slug }).select("_id").lean();

		// (1) Get posts from DB
		const posts = await Post.find({ tags: { $in: tag._id } })
			.sort({ publishedAt: -1 })
			.skip(skip)
			.limit(limit)
			.select("_id title slug imageUrl")
			.lean();

		// If not posts
		if (posts.length == 0 && data.page > 1) {
			return new GraphQLError("No More Posts", {
				extensions: { http: { status: 404 } },
			});
		}

		if (posts.length == 0) {
			return new GraphQLError("No Posts with this tag", {
				extensions: { http: { status: 404 } },
			});
		}

		// Get count of all posts having this tag
		const totalCount = await Post.find({ tags: { $in: tag._id } })
			.select("_id")
			.lean()
			.count();

		// (2) Return found posts
		return { posts, totalCount };
	}

	public static async getAllPostsBySeries(data) {
		//
	}

	public static async getAllPostsByKeywords(data) {
		//
	}

	public static async getRelatedPosts(data) {
		// (1) Find post
		const post = await Post.findOne({ _id: data._id }).select("tags").lean();

		// If not found
		if (!post) {
			return new GraphQLError("Post Not Found", {
				extensions: {
					http: { status: 404 },
				},
			});
		}

		// (2) Get related Posts
		const foundPosts = await Post.find({ tags: { $all: post.tags } })
			.limit(3)
			.select("_id title slug imageUrl")
			.lean();

		// If no related posts
		if (foundPosts.length <= 1) {
			return [];
		}

		// (3) Filter out the current post and return the rest found posts
		return foundPosts.filter((post) => post._id != data._id);
	}

	public static async getLatestPosts(data) {
		const posts = await Post.find({ isPublished: true }).sort({ publishedAt: -1 }).limit(8).lean();

		return posts;
	}

	public static async getPopularPosts(data) {
		return await Post.find({ isPublished: true }).sort({ views: -1 }).limit(8).lean();
	}

	// TODO: protect this
	public static async getPublishedPosts(data) {
		// (1) Prepare pagination logic
		const pageNumber = data.page;
		const limit = 8;

		const skip = pageNumber == 1 ? 0 : (pageNumber - 1) * limit;

		// (2) Get posts
		const posts = await Post.find({ isPublished: true })
			.sort({ views: -1 })
			.skip(skip)
			.limit(limit)
			.select("_id title slug views")
			.lean();

		// If No More Posts
		if (posts.length < 1) {
			return new GraphQLError("No More Posts", {
				extensions: { http: { status: 404 } },
			});
		}

		const totalCount = await Post.count({ isPublished: true });

		return {
			posts,
			totalCount,
		};
	}

	// TODO: protect this
	public static async getUnPublishedPosts(data) {
		// (1) Prepare pagination logic
		const pageNumber = data.page;
		const limit = 8;

		const skip = pageNumber == 1 ? 0 : (pageNumber - 1) * limit;

		// (2) Get posts
		const posts = await Post.find({ isPublished: false })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.select("_id title slug views")
			.lean();

		// If No More Posts
		if (posts.length < 1) {
			return new GraphQLError("No More Posts", {
				extensions: { http: { status: 404 } },
			});
		}

		const totalCount = await Post.count({ isPublished: false });

		return {
			posts,
			totalCount,
		};
	}
}
