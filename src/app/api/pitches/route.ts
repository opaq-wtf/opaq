import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pitches } from "@/lib/db/schema/pitches";
import { getUser } from "@/app/data/user";
import { v4 as uuid } from "uuid";
import { eq, desc, sql } from "drizzle-orm";

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
        const limit = parseInt(searchParams.get("limit") || "10");
        const page = parseInt(searchParams.get("page") || "1");

        let currentUserId: string | null = null;

        // If user_only is true, get current user
        if (userOnly) {
            const user = await getUser();
            if (!user || !user.id) {
                return NextResponse.json(
                    { message: "Authentication required" },
                    { status: 401 }
                );
            }
            currentUserId = user.id;
        }

        const skip = (page - 1) * limit;

        // Get pitches
        const query = db.select().from(pitches);

        if (userOnly && currentUserId) {
            query.where(eq(pitches.userId, currentUserId));
        }

        const allPitches = await query
            .orderBy(desc(pitches.createdAt))
            .limit(limit)
            .offset(skip);

        // Get total count for pagination
        const totalQuery = db.select({ count: sql<number>`count(*)` }).from(pitches);

        if (userOnly && currentUserId) {
            totalQuery.where(eq(pitches.userId, currentUserId));
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
