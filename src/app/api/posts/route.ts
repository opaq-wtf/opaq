import { getUser } from "@/app/data/user";
import MongoConnect from "@/lib/mongodb/lib/mongoose";
import posts from "@/lib/mongodb/model/posts";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function GET(req: NextRequest) {
    try {
        await MongoConnect();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '10');
        const page = parseInt(searchParams.get('page') || '1');

        const filter = status ? { status } : {};
        const skip = (page - 1) * limit;

        const allPosts = await posts
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await posts.countDocuments(filter);

        return NextResponse.json({
            posts: allPosts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching posts: ', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await MongoConnect();
        const { title, content, labels, status } = await req.json();

        // Validate required fields
        if (!title || !content) {
            return NextResponse.json({ message: 'Title and content are required.' }, { status: 400 });
        }
        const id = v4(); // Generate a unique ID for the post
        const user = await getUser() // Assuming user ID is passed in headers
        const newPost = new posts({
            id,
            user_id: user.id,
            title: title.trim(),
            content: content.trim(),
            labels: labels || [],
            status: status || 'Draft',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newPost.save();

        return NextResponse.json({
            message: 'Post successfully created.',
            post: {
                id: newPost._id,
                title: newPost.title,
                status: newPost.status
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating post: ', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
