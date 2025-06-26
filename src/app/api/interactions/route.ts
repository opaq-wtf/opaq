import { getUser } from "@/app/data/user";
import MongoConnect from "@/lib/mongodb/lib/mongoose";
import UserInteraction from "@/lib/mongodb/model/user-interactions";
import posts from "@/lib/mongodb/model/posts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await MongoConnect();
        const { post_id, action, value } = await req.json();

        const user = await getUser();
        if (!user || !user.id) {
            return NextResponse.json({ message: 'User authentication required.' }, { status: 401 });
        }

        // Validate the post exists
        const post = await posts.findOne({ id: post_id });
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        // Find or create user interaction record
        let interaction = await UserInteraction.findOne({
            user_id: user.id,
            post_id: post_id
        });

        if (!interaction) {
            interaction = new UserInteraction({
                user_id: user.id,
                post_id: post_id,
                liked: false,
                saved: false,
                viewed: false,
                view_count: 0
            });
        }

        // Update based on action
        switch (action) {
            case 'like':
                interaction.liked = value;
                if (value) {
                    interaction.last_liked = new Date();
                }
                break;
            case 'save':
                interaction.saved = value;
                if (value) {
                    interaction.last_saved = new Date();
                }
                break;
            case 'view':
                interaction.viewed = true;
                interaction.view_count += 1;
                interaction.last_viewed = new Date();
                break;
            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

        interaction.updated_at = new Date();
        await interaction.save();

        // Get aggregated stats for the post
        const stats = await UserInteraction.aggregate([
            { $match: { post_id: post_id } },
            {
                $group: {
                    _id: null,
                    likes: { $sum: { $cond: ["$liked", 1, 0] } },
                    saves: { $sum: { $cond: ["$saved", 1, 0] } },
                    views: { $sum: "$view_count" }
                }
            }
        ]);

        const postStats = stats[0] || { likes: 0, saves: 0, views: 0 };

        return NextResponse.json({
            message: 'Interaction updated successfully',
            interaction: {
                liked: interaction.liked,
                saved: interaction.saved,
                view_count: interaction.view_count
            },
            stats: postStats
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating interaction: ', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await MongoConnect();
        const { searchParams } = new URL(req.url);
        const post_id = searchParams.get('post_id');
        const user_id = searchParams.get('user_id');

        const user = await getUser();

        if (post_id) {
            // Get stats for a specific post
            const stats = await UserInteraction.aggregate([
                { $match: { post_id: post_id } },
                {
                    $group: {
                        _id: null,
                        likes: { $sum: { $cond: ["$liked", 1, 0] } },
                        saves: { $sum: { $cond: ["$saved", 1, 0] } },
                        views: { $sum: "$view_count" }
                    }
                }
            ]);

            const postStats = stats[0] || { likes: 0, saves: 0, views: 0 };

            // If user is authenticated, get their specific interaction
            let userInteraction = null;
            if (user && user.id) {
                userInteraction = await UserInteraction.findOne({
                    user_id: user.id,
                    post_id: post_id
                });
            }

            return NextResponse.json({
                stats: postStats,
                user_interaction: userInteraction ? {
                    liked: userInteraction.liked,
                    saved: userInteraction.saved,
                    view_count: userInteraction.view_count
                } : {
                    liked: false,
                    saved: false,
                    view_count: 0
                }
            }, { status: 200 });
        }

        if (user_id && user && user.id === user_id) {
            // Get user's interactions (saved posts, liked posts)
            const interactions = await UserInteraction.find({ user_id: user_id })
                .populate('post_id')
                .sort({ updated_at: -1 });

            return NextResponse.json({ interactions }, { status: 200 });
        }

        return NextResponse.json({ message: 'Invalid request' }, { status: 400 });

    } catch (error: any) {
        console.error('Error fetching interactions: ', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
