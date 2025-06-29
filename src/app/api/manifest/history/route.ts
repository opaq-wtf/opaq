import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import MongoConnect from "@/lib/mongodb/lib/mongoose";
import ManifestHistory from "@/lib/mongodb/model/manifest-history";
import { getSession } from "@/lib/session";

// GET - Fetch user's manifest history
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        await MongoConnect();

        const history = await ManifestHistory.find({ user_id: session.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await ManifestHistory.countDocuments({ user_id: session.userId });
        const pages = Math.ceil(total / limit);

        return NextResponse.json({
            history,
            pagination: {
                page,
                limit,
                total,
                pages,
            },
        });
    } catch (error) {
        console.error("Error fetching manifest history:", error);
        return NextResponse.json(
            { error: "Failed to fetch manifest history" },
            { status: 500 }
        );
    }
}

// POST - Save new manifest history entry
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prompt, response } = await req.json();

        if (!prompt || !response) {
            return NextResponse.json(
                { error: "Prompt and response are required" },
                { status: 400 }
            );
        }

        await MongoConnect();

        // Generate a short title from the prompt (first 50 characters)
        const title = prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt;

        const historyEntry = new ManifestHistory({
            id: nanoid(),
            user_id: session.userId,
            prompt,
            response,
            title,
        });

        await historyEntry.save();

        return NextResponse.json({
            message: "History entry saved successfully",
            entry: historyEntry,
        });
    } catch (error) {
        console.error("Error saving manifest history:", error);
        return NextResponse.json(
            { error: "Failed to save manifest history" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a specific history entry
export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const entryId = searchParams.get("id");

        if (!entryId) {
            return NextResponse.json(
                { error: "Entry ID is required" },
                { status: 400 }
            );
        }

        await MongoConnect();

        const result = await ManifestHistory.deleteOne({
            id: entryId,
            user_id: session.userId, // Ensure user can only delete their own entries
        });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: "History entry not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "History entry deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting manifest history:", error);
        return NextResponse.json(
            { error: "Failed to delete manifest history" },
            { status: 500 }
        );
    }
}
