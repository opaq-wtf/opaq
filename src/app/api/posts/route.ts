import { getUser } from "@/app/data/user";
import MongoConnect from "@/lib/mongodb/lib/mongoose";
import posts from "@/lib/mongodb/model/posts";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await MongoConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    const filter = status ? { status } : {};
    const skip = (page - 1) * limit;

    const allPosts = await posts
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch user information for each post
    const postsWithUserInfo = await Promise.all(
      allPosts.map(async (post) => {
        try {
          const userResult = await db
            .select({
              id: users.id,
              username: users.username,
              fullName: users.fullName,
            })
            .from(users)
            .where(eq(users.id, post.user_id))
            .limit(1);

          const user = userResult[0];
          return {
            ...post,
            user: user
              ? {
                  id: user.id,
                  username: user.username,
                  full_name: user.fullName,
                }
              : {
                  id: post.user_id,
                  username: "unknown_user",
                  full_name: "Unknown User",
                },
          };
        } catch (error) {
          console.error("Error fetching user for post:", post.id, error);
          return {
            ...post,
            user: {
              id: post.user_id,
              username: "unknown_user",
              full_name: "Unknown User",
            },
          };
        }
      }),
    );

    const total = await posts.countDocuments(filter);

    return NextResponse.json(
      {
        posts: postsWithUserInfo,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching posts: ", error);

    if (error.name === "MongoServerError" && error.code === 18) {
      return NextResponse.json(
        {
          message:
            "Database authentication failed. Please check your credentials.",
        },
        { status: 500 },
      );
    }

    if (
      error.name === "MongooseError" &&
      error.message.includes("buffering timed out")
    ) {
      return NextResponse.json(
        {
          message: "Database connection timeout. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await MongoConnect();
    const { title, content, labels, status } = await req.json();

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { message: "Title and content are required." },
        { status: 400 },
      );
    }

    const id = v4(); // Generate a unique ID for the post
    const user = await getUser(); // Assuming user ID is passed in headers

    if (!user || !user.id) {
      return NextResponse.json(
        { message: "User authentication required." },
        { status: 401 },
      );
    }

    // Check if user has existing drafts and delete them when publishing or saving
    if (status === "Published" || status === "Draft") {
      await posts.deleteMany({
        user_id: user.id,
        status: "Draft",
        title: { $ne: title.trim() }, // Don't delete the current post if it's an update
      });
    }

    const newPost = new posts({
      id,
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      labels: labels || [],
      status: status || "Draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newPost.save();

    return NextResponse.json(
      {
        message: "Post successfully created.",
        post: {
          id: newPost._id,
          title: newPost.title,
          status: newPost.status,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating post: ", error);

    if (error.name === "MongoServerError" && error.code === 18) {
      return NextResponse.json(
        {
          message:
            "Database authentication failed. Please check your MongoDB credentials.",
        },
        { status: 500 },
      );
    }

    if (
      error.name === "MongooseError" &&
      error.message.includes("buffering timed out")
    ) {
      return NextResponse.json(
        {
          message:
            "Database connection timeout. Please check your MongoDB server.",
        },
        { status: 500 },
      );
    }

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          message: "Invalid data provided.",
          details: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
