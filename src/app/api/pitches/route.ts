import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pitches } from "@/lib/db/schema/pitches";
import { getUser } from "@/app/data/user";
import { v4 as uuid } from "uuid";
import { eq, desc, sql, and } from "drizzle-orm";

interface PitchData {
    title: string;
    description: string;
    fileUrl: string;
    irysId: string;
    tags: string[];
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user || !user.id) {
            return NextResponse.json(
                { message: "Authentication required" },
                { status: 401 }
            );
        }

        const { title, description, fileUrl, irysId, tags }: PitchData = await req.json();

        // Validate required fields
        if (!title || !description || !fileUrl || !irysId || !tags) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        // Validate tags array
        if (!Array.isArray(tags) || tags.length === 0) {
            return NextResponse.json(
                { message: "At least one tag is required" },
                { status: 400 }
            );
        }

        const pitchId = uuid();
        const now = new Date();

        const result = await db
            .insert(pitches)
            .values({
                id: pitchId,
                userId: user.id,
                title,
                description,
                fileUrl,
                irysId,
                tags,
                createdAt: now,
                updatedAt: now,
            })
            .returning({ id: pitches.id });

        if (!result[0]?.id) {
            return NextResponse.json(
                { message: "Failed to create pitch" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: "Pitch submitted successfully",
                pitchId: result[0].id
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error creating pitch:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userOnly = searchParams.get("user_only") === "true";
        const userId = searchParams.get("user_id"); // Add support for specific user ID
        const limit = parseInt(searchParams.get("limit") || "10");
        const page = parseInt(searchParams.get("page") || "1");

        let currentUserId: string | null = null;
        const user = await getUser();
        if (user?.id) {
            currentUserId = user.id;
        }

        // If user_only is true, require authentication
        if (userOnly && !currentUserId) {
            return NextResponse.json(
                { message: "Authentication required" },
                { status: 401 }
            );
        }

        const skip = (page - 1) * limit;

        // Build query conditions
        const whereConditions = [];

        if (userOnly && currentUserId) {
            // For user's own pitches, show both public and private
            whereConditions.push(eq(pitches.userId, currentUserId));
        } else if (userId) {
            // For specific user's pitches
            whereConditions.push(eq(pitches.userId, userId));
            // Only show public pitches when viewing other users' profiles
            if (!currentUserId || currentUserId !== userId) {
                whereConditions.push(eq(pitches.visibility, "public"));
            }
        } else {
            // For public pitches, only show public ones
            whereConditions.push(eq(pitches.visibility, "public"));
        }

        // Get pitches
        const query = db.select().from(pitches);

        if (whereConditions.length > 0) {
            query.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions));
        }

        const allPitches = await query
            .orderBy(desc(pitches.createdAt))
            .limit(limit)
            .offset(skip);

        // Get total count for pagination
        const totalQuery = db.select({ count: sql<number>`count(*)` }).from(pitches);

        if (whereConditions.length > 0) {
            totalQuery.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions));
        }

        const totalResult = await totalQuery;
        const total = totalResult[0]?.count || 0;

        return NextResponse.json(
            {
                pitches: allPitches,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching pitches:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
