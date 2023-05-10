import {
	NotFoundException,
	ForbiddenException,
	UnAuthorizedException,
	ValidationException,
} from "../../../../shared/Exceptions";
import { GraphQLError } from "graphql";
import Post from "./../Model/post.model";
import Tag from "../../Tag/Model/tag.model";

export const getPostByTitle_service = async (data) => {
	// (1) Let's find those docs that match this query!
	const posts = await Post.aggregate([
		{
			$search: {
				autocomplete: {
					query: data.title,
					path: "title",
					fuzzy: { maxEdits: 2 },
				},
			},
		},
		{ $limit: 3 },
		{ $project: { title: 1, slug: 1 } },
	]);

	// If nothing matches
	if (posts.length < 1) {
		return new GraphQLError("No Posts Found", {
			extensions: { http: { status: 404 } },
		});
	}

	// (2) Return matched posts
	return posts;
};

// TODO: Only return posts if is_published == true!!!!! for all services!!!!

// (1) Return Post by given ID
export const getPostById_service = async (data) => {
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
};

// (2) Return Post by given slug
export const getPostBySlug_service = async (data) => {
	// (1) Find Post
	const post = await Post.findOne({
		slug: data.slug,
	})
		.populate({
			path: "tags",
		})
		.lean();

	// If not found
	if (!post) {
		return new GraphQLError("Post Not Found", {
			extensions: { http: { status: 404 } },
		});
	}

	//  TODO: Work on views (only increase if not me (admin!))

	// (2) Return Post
	return post;
};

// (3) Return All posts
export const getAllPosts_service = async (data) => {
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
};

export const getRelatedPosts_service = async (data) => {
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
};

export const getLatestPosts_service = async () => {
	const posts = await Post.find({ is_published: true }).sort({ publishedAt: -1 }).limit(8).lean();

	return posts;
};

export const getPopularPosts_service = async () => {
	return await Post.find({ is_published: true }).sort({ views: -1 }).limit(8).lean();
};

export const getAllPostsByTag_service = async (data) => {
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
};

// TODO: protect this
export const getPublishedPosts_service = async (data) => {
	// (1) Prepare pagination logic
	const pageNumber = data.page;
	const limit = 8;

	const skip = pageNumber == 1 ? 0 : (pageNumber - 1) * limit;

	// (2) Get posts
	const posts = await Post.find({ is_published: true })
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

	const totalCount = await Post.count({ is_published: true });

	return {
		posts,
		totalCount,
	};
};
// TODO: protect this
export const getUnPublishedPosts_service = async (data) => {
	// (1) Prepare pagination logic
	const pageNumber = data.page;
	const limit = 8;

	const skip = pageNumber == 1 ? 0 : (pageNumber - 1) * limit;

	// (2) Get posts
	const posts = await Post.find({ is_published: false })
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

	const totalCount = await Post.count({ is_published: false });

	return {
		posts,
		totalCount,
	};
};
