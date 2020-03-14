import { Resolver, Mutation, Arg, Query, InputType, Field } from 'type-graphql';
import { Comment, CommentModel } from '../../models/comment.model';
import { AutUserModel } from '../../models/autUser.model';


@InputType()
class AddDeleteInput {

    @Field()
    text: string;

    @Field()
    receiverNumber: string;

    @Field()
    senderNumber: string;

    @Field( type => [String]) 
    picturePaths: string[]
}

@Resolver(of => Comment)
export class CommentResolver {

    @Query(returns => [Comment])
    async getCommentsForUser(
        @Arg("studentNumber") studentNumber: string
    ): Promise<Comment[]> {
        const user = await AutUserModel.findOne({ studentNumber });
        if (user) {
            return CommentModel.find({
                receiver: user._id
            });
        }
        throw new Error("User not found");
    }

    @Mutation(returns => Comment)
    async addCommentForUser(
        @Arg("text") text: string,
        @Arg("receiverNumber") receiverNumber: string,
        @Arg("senderNumber") senderNumber: string,
        @Arg("picturePaths", type => [String]) picturePaths: string[]
    ): Promise<Comment> {
        const receiver = (await AutUserModel.findOne({ studentNumber: receiverNumber }))?._id;
        const sender = (await AutUserModel.findOne({ studentNumber: senderNumber }))?._id;
        const images = (await AutUserModel.find().where('path').in(picturePaths).select('_id').exec()).flat();
        return await CommentModel.create({
            text,
            sender,
            receiver,
            images
        })
    }

    @Mutation(returns => boolean)
    async deleteCommentForUser(
        @Arg
    )

}