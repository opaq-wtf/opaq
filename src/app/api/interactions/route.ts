/*
 * Enhanced View Tracking System
 *
 * This API endpoint handles user interactions with posts, including an intelligent view tracking system
 * that only counts meaningful engagement with content.
 *
 * VIEW TRACKING LOGIC:
 * - Views are only counted when users demonstrate genuine engagement with a post
 * - A view is qualified based on time spent reading (calculated from content length)
 * - Minimum view time: 15 seconds or 20% of estimated reading time (whichever is higher)
 * - Maximum threshold: 45 seconds for very long posts
 *
 * TRACKING TRIGGERS:
 * 1. Time-based: After user spends minimum time on post
 * 2. Scroll-based: When user scrolls significantly (150px+) after 8+ seconds
 * 3. Visibility-based: When user switches tabs after adequate reading time
 * 4. Navigation-based: When user navigates away after sufficient engagement
 *
 * ANTI-SPAM MEASURES:
 * - Users can only increment view count once per 24 hours per post
 * - Return visits after 24 hours are counted to track loyal readership
 * - Random number generation has been replaced with actual database values
 *
 * SIMILARITY TO LIKES/SAVES:
 * - Like likes and saves, views are tracked per user per post
 * - Each interaction creates/updates a record in UserInteraction collection
 * - Aggregated stats are calculated in real-time for display
 */

import { getUser } from "@/app/data/user";
import MongoConnect from "@/lib/mongodb/lib/mongoose";
import UserInteraction from "@/lib/mongodb/model/user-interactions";
import posts from "@/lib/mongodb/model/posts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await MongoConnect();

        // Handle both JSON and beacon requests
        let requestData;
        try {
            requestData = await req.json();
        } catch (error) {
            // Handle navigator.sendBeacon requests which might not be valid JSON
            const body = await req.text();
            try {
                requestData = JSON.parse(body);
            } catch (parseError) {
                return NextResponse.json({ message: 'Invalid request format' }, { status: 400 });
            }
        }

        const { post_id, action, value } = requestData;

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
                // Only increment view count for qualified views
                // A view is qualified if:
                // 1. User hasn't viewed this post before, OR
                // 2. It's been more than 24 hours since their last view (to count return visits)

                const now = new Date();
                const shouldIncrementView = !interaction.viewed ||
                    (interaction.last_viewed &&
                        now.getTime() - interaction.last_viewed.getTime() > 24 * 60 * 60 * 1000);

                if (shouldIncrementView) {
                    interaction.viewed = true;
                    interaction.view_count += 1;
                    interaction.last_viewed = now;
                }
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
