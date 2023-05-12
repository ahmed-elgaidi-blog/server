import validateInput from "../../../../Shared/Helpers/validateInput";
import PostValidators from "../Validators";
import PostServices from "../Services";
import { CreatePostDTO, DeletePostDTO, UpdatePostDTO } from "../Types";

export const postMutations = {
	createPost: async (parent, args, context, info) => {
		const validatedData = await validateInput(PostValidators.create, args.data as CreatePostDTO);

		return await PostServices.create(validatedData);
	},

	updatePost: async (parent, args, context, info) => {
		const validatedData = await validateInput(PostValidators.update, args.data as UpdatePostDTO);

		return await PostServices.update(validatedData);
	},

	deletePost: async (parent, args, context, info) => {
		const { postId } = await validateInput(PostValidators.delete, args.data as DeletePostDTO);

		return await PostServices.delete(postId);
	},

	publishPost: async (parent, args, context, info) => {
		const validatedData = await validateInput(PostValidators.publish, args.data);

		return await PostServices.publish(validatedData);
	},
};
