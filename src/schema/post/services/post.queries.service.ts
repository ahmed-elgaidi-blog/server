import { GraphQLError } from "graphql";
import Post from "./../Model/post.model";

// TODO: Only return posts if is_published == true!!!!!

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
		return new GraphQLError("Post Not Found", {
			extensions: { http: { status: 404 } },
		});
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

	// TODO: Work on views (only increase if not me (admin!))

	// (2) Return Post
	return post;
};

// (3) Return All posts
export const getAllPosts_service = async (data) => {
	// (1) Find posts
	const posts = !data.lastPostId
		? await Post.find({}).populate({ path: "tags" }).limit(data.limit).lean() // page 1
		: await Post.find({ _id: { $gt: data.lastPostId } }) // Next pages
				.populate({ path: "tags" })
				.limit(data.limit)
				.lean();

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
	const post = await Post.findOne({ _id: data.postId }).select("tags").lean();

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
		.populate({ path: "tags" })
		.select("imageUrl tags")
		.lean();

	// If no related posts
	if (foundPosts.length <= 1) {
		return new GraphQLError("No Related Posts Found", {
			extensions: { http: { status: 404 } },
		});
	}

	// (3) Filter out the current post and return the rest found posts
	return foundPosts.filter((post) => post._id != data.postId);
};

export const getLatestPosts_service = async () => {
	return await Post.find({}).sort({ publishedAt: -1 }).limit(3).lean();
};

export const getPopularPosts_service = async () => {
	return await Post.find({}).sort({ views: -1 }).limit(3).lean();
};
