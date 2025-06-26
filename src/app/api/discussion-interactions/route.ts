import { getUser } from "@/app/data/user";
import MongoConnect from "@/lib/mongodb/lib/mongoose";
import Discussions from "@/lib/mongodb/model/discussions";
import DiscussionInteraction from "@/lib/mongodb/model/discussion-interactions";
import Posts from "@/lib/mongodb/model/posts";
import { NextRequest, NextResponse } from "next/server";

// POST discussion interaction (like/unlike/heart)
export async function POST(req: NextRequest) {
    try {
        await MongoConnect();
        const { discussion_id, action, value } = await req.json();

        if (!discussion_id || !action) {
            return NextResponse.json({ message: 'Discussion ID and action are required' }, { status: 400 });
        }

        const user = await getUser();
        if (!user || !user.id) {
            return NextResponse.json({ message: 'User authentication required.' }, { status: 401 });
        }

        // Validate the discussion exists
        const discussion = await Discussions.findOne({ id: discussion_id });
        if (!discussion) {
            return NextResponse.json({ message: 'Discussion not found' }, { status: 404 });
        }
        // For heart action, verify user is the post author
        if (action === 'heart') {
            // Get the post to verify the user is the author
            const post = await Posts.findOne({ id: discussion.post_id });
            if (!post || post.user_id !== user.id) {
                return NextResponse.json({ message: 'Only post author can heart discussions' }, { status: 403 });
            }

            // Update the discussion's heart status
            const updatedDiscussion = await Discussions.findOneAndUpdate(
                { id: discussion_id },
                { $set: { is_hearted: !discussion.is_hearted } },
                { new: true }
            );

            return NextResponse.json({
                message: 'Discussion heart status updated successfully',
                discussion: updatedDiscussion
            }, { status: 200 });
        }

        // Find or create user interaction record for likes
        let interaction = await DiscussionInteraction.findOne({
            user_id: user.id,
            discussion_id: discussion_id
        });

        if (!interaction) {
            interaction = new DiscussionInteraction({
                user_id: user.id,
                discussion_id: discussion_id,
                liked: false
            });
        }

        const previousLiked = interaction.liked;

        // Update based on action
        if (action === 'like') {
            interaction.liked = value;
            if (value) {
                interaction.last_liked = new Date();
            }
        } else {
            return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

        await interaction.save();

        // Update discussion's like count
        const likeDelta = value === previousLiked ? 0 : (value ? 1 : -1);

        if (likeDelta !== 0) {
            await Discussions.findOneAndUpdate(
                { id: discussion_id },
                { $inc: { likes: likeDelta } }
            );
        }

        return NextResponse.json({
            message: 'Discussion interaction updated successfully',
            interaction: {
                liked: interaction.liked
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating discussion interaction: ', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// GET discussion interactions for a user
export async function GET(req: NextRequest) {
    try {
        await MongoConnect();
        const { searchParams } = new URL(req.url);
        const discussion_id = searchParams.get('discussion_id');

        const user = await getUser();

        if (discussion_id) {
            // Get interaction for a specific discussion
            let userInteraction = null;
            if (user && user.id) {
                userInteraction = await DiscussionInteraction.findOne({
                    user_id: user.id,
                    discussion_id: discussion_id
                });
            }

            return NextResponse.json({
                user_interaction: userInteraction ? {
                    liked: userInteraction.liked
                } : {
                    liked: false
                }
            }, { status: 200 });
        }

        return NextResponse.json({ message: 'Invalid request' }, { status: 400 });

    } catch (error: any) {
        console.error('Error fetching discussion interactions: ', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
