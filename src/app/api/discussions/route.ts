import { getUser } from "@/app/data/user";
import MongoConnect from "@/lib/mongodb/lib/mongoose";
import Discussions from "@/lib/mongodb/model/discussions";
import DiscussionInteraction from "@/lib/mongodb/model/discussion-interactions";
import posts from "@/lib/mongodb/model/posts";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";

// GET discussions for a post
export async function GET(req: NextRequest) {
    try {
        await MongoConnect();
        const { searchParams } = new URL(req.url);
        const post_id = searchParams.get('post_id');
        const parent_id = searchParams.get('parent_id');
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const sort = searchParams.get('sort') || 'newest'; // newest, oldest, top

        if (!post_id) {
            return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
        }

        // Validate the post exists
        const post = await posts.findOne({ id: post_id });
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        const skip = (page - 1) * limit;
        let sortQuery: any = { createdAt: -1 }; // Default: newest first

        switch (sort) {
            case 'oldest':
                sortQuery = { createdAt: 1 };
                break;
            case 'top':
                sortQuery = { likes: -1, createdAt: -1 };
                break;
            case 'replies':
                sortQuery = { replies_count: -1, createdAt: -1 };
                break;
            case 'newest':
            default:
                sortQuery = { is_pinned: -1, createdAt: -1 }; // Pinned first, then newest
                break;
        }

        // Build query based on whether we want top-level discussions or replies
        const query = parent_id
            ? { post_id, parent_id }
            : { post_id, parent_id: null };

        const allDiscussions = await Discussions
            .find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .lean();

        // Get user information for each discussion
        const discussionsWithUserInfo = await Promise.all(
            allDiscussions.map(async (discussion) => {
                try {
                    const userResult = await db
                        .select({
                            id: users.id,
                            username: users.username,
                            fullName: users.fullName
                        })
                        .from(users)
                        .where(eq(users.id, discussion.user_id))
                        .limit(1);

                    const user = userResult[0];
                    return {
                        ...discussion,
                        user: user ? {
                            id: user.id,
                            username: user.username,
                            full_name: user.fullName
                        } : {
                            id: discussion.user_id,
                            username: 'unknown_user',
                            full_name: 'Unknown User'
                        }
                    };
                } catch (error) {
                    console.error('Error fetching user for discussion:', discussion.id, error);
                    return {
                        ...discussion,
                        user: {
                            id: discussion.user_id,
                            username: 'unknown_user',
                            full_name: 'Unknown User'
                        }
                    };
                }
            })
        );

        // Get user interactions if authenticated
        const currentUser = await getUser();
        if (currentUser && currentUser.id) {
            const discussionIds = discussionsWithUserInfo.map(c => c.id);
            const interactions = await DiscussionInteraction.find({
                user_id: currentUser.id,
                discussion_id: { $in: discussionIds }
            }).lean();

            const interactionMap = new Map(
                interactions.map(interaction => [interaction.discussion_id, interaction])
            );

            discussionsWithUserInfo.forEach(discussion => {
                const interaction = interactionMap.get(discussion.id);
                discussion.user_liked = interaction?.liked || false;
            });
        }

        const total = await Discussions.countDocuments(query);

        return NextResponse.json({
            discussions: discussionsWithUserInfo,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching discussions: ', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST new discussion
export async function POST(req: NextRequest) {
    try {
        await MongoConnect();
        const { post_id, content, parent_id } = await req.json();

        // Validate required fields
        if (!post_id || !content?.trim()) {
            return NextResponse.json({ message: 'Post ID and content are required.' }, { status: 400 });
        }

        const user = await getUser();
        if (!user || !user.id) {
            return NextResponse.json({ message: 'User authentication required.' }, { status: 401 });
        }

        // Validate the post exists
        const post = await posts.findOne({ id: post_id });
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        // If this is a reply, validate the parent discussion exists
        if (parent_id) {
            const parentDiscussion = await Discussions.findOne({ id: parent_id, post_id });
            if (!parentDiscussion) {
                return NextResponse.json({ message: 'Parent discussion not found' }, { status: 404 });
            }
        }

        const discussionId = v4();
        const newDiscussion = new Discussions({
            id: discussionId,
            post_id,
            user_id: user.id,
            content: content.trim(),
            parent_id: parent_id || null,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newDiscussion.save();

        // If this is a reply, increment the parent discussion's reply count
        if (parent_id) {
            await Discussions.findOneAndUpdate(
                { id: parent_id },
                { $inc: { replies_count: 1 } }
            );
        }

        // Get user info for the response
        const userResult = await db
            .select({
                id: users.id,
                username: users.username,
                fullName: users.fullName
            })
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        const userData = userResult[0];

        return NextResponse.json({
            message: 'Discussion posted successfully.',
            discussion: {
                ...newDiscussion.toObject(),
                user: userData ? {
                    id: userData.id,
                    username: userData.username,
                    full_name: userData.fullName
                } : {
                    id: user.id,
                    username: 'unknown_user',
                    full_name: 'Unknown User'
                },
                user_liked: false
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating discussion: ', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT update discussion (edit or pin)
export async function PUT(req: NextRequest) {
    try {
        await MongoConnect();
        const { discussion_id, content, action, value } = await req.json();

        if (!discussion_id) {
            return NextResponse.json({ message: 'Discussion ID is required.' }, { status: 400 });
        }

        const user = await getUser();
        if (!user || !user.id) {
            return NextResponse.json({ message: 'User authentication required.' }, { status: 401 });
        }

        const discussion = await Discussions.findOne({ id: discussion_id });
        if (!discussion) {
            return NextResponse.json({ message: 'Discussion not found' }, { status: 404 });
        }

        // Handle pin/unpin action (post author only)
        if (action === 'pin') {
            // Get the post to verify the user is the author
            const post = await posts.findOne({ id: discussion.post_id });
            if (!post || post.user_id !== user.id) {
                return NextResponse.json({ message: 'Only post author can pin discussions' }, { status: 403 });
            }

            discussion.is_pinned = value;
            discussion.updatedAt = new Date();
            await discussion.save();

            return NextResponse.json({
                message: `Discussion ${value ? 'pinned' : 'unpinned'} successfully.`,
                discussion: discussion.toObject()
            }, { status: 200 });
        }

        // Handle content edit (discussion author only)
        if (!content?.trim()) {
            return NextResponse.json({ message: 'Content is required for editing.' }, { status: 400 });
        }

        // Check if user owns the discussion
        if (discussion.user_id !== user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        // Update the discussion content
        discussion.content = content.trim();
        discussion.is_edited = true;
        discussion.updatedAt = new Date();

        await discussion.save();

        return NextResponse.json({
            message: 'Discussion updated successfully.',
            discussion: discussion.toObject()
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating discussion: ', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE discussion
export async function DELETE(req: NextRequest) {
    try {
        await MongoConnect();
        const { searchParams } = new URL(req.url);
        const discussion_id = searchParams.get('discussion_id');

        if (!discussion_id) {
            return NextResponse.json({ message: 'Discussion ID is required' }, { status: 400 });
        }

        const user = await getUser();
        if (!user || !user.id) {
            return NextResponse.json({ message: 'User authentication required.' }, { status: 401 });
        }

        const discussion = await Discussions.findOne({ id: discussion_id });
        if (!discussion) {
            return NextResponse.json({ message: 'Discussion not found' }, { status: 404 });
        }

        // Check if user owns the discussion or owns the post
        const post = await posts.findOne({ id: discussion.post_id });
        const canDelete = discussion.user_id === user.id || post?.user_id === user.id;

        if (!canDelete) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        // Delete the discussion and all its replies
        await Discussions.deleteMany({
            $or: [
                { id: discussion_id },
                { parent_id: discussion_id }
            ]
        });

        // If this was a reply, decrement the parent's reply count
        if (discussion.parent_id) {
            await Discussions.findOneAndUpdate(
                { id: discussion.parent_id },
                { $inc: { replies_count: -1 } }
            );
        }

        // Delete all interactions with this discussion and its replies
        const allDiscussionIds = await Discussions.find({
            $or: [
                { id: discussion_id },
                { parent_id: discussion_id }
            ]
        }).distinct('id');

        await DiscussionInteraction.deleteMany({
            discussion_id: { $in: allDiscussionIds }
        });

        return NextResponse.json({ message: 'Discussion deleted successfully.' }, { status: 200 });

    } catch (error: any) {
        console.error('Error deleting discussion: ', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
