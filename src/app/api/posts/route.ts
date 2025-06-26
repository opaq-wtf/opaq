import MongoConnect from "@/lib/mongodb/lib/mongoose";
import posts from "@/lib/mongodb/model/posts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await MongoConnect();
        const { title, content } = await req.json();
        const newPost = new posts({ title, content });
        await newPost.save();

        return NextResponse.json({ message: 'Post successfully created.' }, { status: 201 });
    } catch (error) {
        console.error('Error creating post: ', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}