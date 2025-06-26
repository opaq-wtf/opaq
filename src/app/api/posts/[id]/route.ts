import { getUser, getUserOptional } from "@/app/data/user";
import MongoConnect from "@/lib/mongodb/lib/mongoose";
import posts from "@/lib/mongodb/model/posts";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  labels: string[];
  status: "Draft" | "Published";
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await MongoConnect();
    const { id } = await params;

    const post = (await posts.findOne({ id }).lean()) as unknown as Post;

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Only return published posts or drafts owned by the current user
    const user = await getUserOptional();

    if (post.status === "Draft" && (!user || post.user_id !== user.id)) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Fetch user information for the post
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

      const postUser = userResult[0];
      const postWithUser = {
        ...post,
        user: postUser
          ? {
              id: postUser.id,
              username: postUser.username,
              full_name: postUser.fullName,
            }
          : {
              id: post.user_id,
              username: "unknown_user",
              full_name: "Unknown User",
            },
      };

      return NextResponse.json({ post: postWithUser }, { status: 200 });
    } catch (error) {
      console.error("Error fetching user for post:", error);
      // Return post without user info if user fetch fails
      const postWithUser = {
        ...post,
        user: {
          id: post.user_id,
          username: "unknown_user",
          full_name: "Unknown User",
        },
      };
      return NextResponse.json({ post: postWithUser }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error fetching post: ", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await MongoConnect();
    const { id } = await params;
    const { title, content, labels, status } = await req.json();

    const user = await getUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { message: "User authentication required." },
        { status: 401 },
      );
    }

    const post = (await posts.findOne({ id })) as Post;
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Check if user owns the post
    if (post.user_id !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Update the post
    post.title = title?.trim() || post.title;
    post.content = content?.trim() || post.content;
    post.labels = labels || post.labels;
    post.status = status || post.status;
    post.updatedAt = new Date();

    await post.save();

    return NextResponse.json(
      {
        message: "Post updated successfully.",
        post: {
          id: post.id,
          title: post.title,
          status: post.status,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating post: ", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await MongoConnect();
    const { id } = await params;

    const user = await getUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { message: "User authentication required." },
        { status: 401 },
      );
    }

    const post = (await posts.findOne({ id })) as Post;
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Check if user owns the post
    if (post.user_id !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await posts.deleteOne({ id });

    return NextResponse.json(
      { message: "Post deleted successfully." },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting post: ", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
