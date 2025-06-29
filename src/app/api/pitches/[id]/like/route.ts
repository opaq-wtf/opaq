import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pitches, pitchInteractions } from "@/lib/db/schema/pitches";
import { eq, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { nanoid } from "nanoid";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: pitchId } = await params;

        if (!pitchId) {
            return NextResponse.json(
                { message: "Pitch ID is required" },
                { status: 400 }
            );
        }

        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json(
                { message: "Authentication required" },
                { status: 401 }
            );
        }

        const userId = session.userId as string;

        // Check if the pitch exists
        const pitchResult = await db
            .select()
            .from(pitches)
            .where(eq(pitches.id, pitchId))
            .limit(1);

        if (!pitchResult[0]) {
            return NextResponse.json(
                { message: "Pitch not found" },
                { status: 404 }
            );
        }

        // Check if user has already interacted with this pitch
        const existingInteraction = await db
            .select()
            .from(pitchInteractions)
            .where(
                and(
                    eq(pitchInteractions.userId, userId),
                    eq(pitchInteractions.pitchId, pitchId)
                )
            )
            .limit(1);

        const interaction = existingInteraction[0];

        if (!interaction) {
            // Create new interaction record with like
            await db.insert(pitchInteractions).values({
                id: nanoid(),
                userId,
                pitchId,
                hasViewed: 0,
                hasLiked: 1,
                likedAt: new Date(),
            });

            // Increment like count
            await db
                .update(pitches)
                .set({
                    likesCount: sql`${pitches.likesCount} + 1`,
                    updatedAt: new Date()
                })
                .where(eq(pitches.id, pitchId));

            return NextResponse.json(
                {
                    message: "Liked successfully",
                    liked: true,
                    likesCount: pitchResult[0].likesCount + 1
                },
                { status: 200 }
            );
        } else {
            // Toggle like status
            const newLikedStatus = interaction.hasLiked === 0 ? 1 : 0;
            const likedAt = newLikedStatus === 1 ? new Date() : null;

            await db
                .update(pitchInteractions)
                .set({
                    hasLiked: newLikedStatus,
                    likedAt,
                    updatedAt: new Date(),
                })
                .where(eq(pitchInteractions.id, interaction.id));

            // Update like count
            const countChange = newLikedStatus === 1 ? 1 : -1;
            await db
                .update(pitches)
                .set({
                    likesCount: sql`${pitches.likesCount} + ${countChange}`,
                    updatedAt: new Date()
                })
                .where(eq(pitches.id, pitchId));

            // Get updated pitch to return current count
            const updatedPitch = await db
                .select()
                .from(pitches)
                .where(eq(pitches.id, pitchId))
                .limit(1);

            return NextResponse.json(
                {
                    message: newLikedStatus === 1 ? "Liked successfully" : "Like removed",
                    liked: newLikedStatus === 1,
                    likesCount: updatedPitch[0]?.likesCount || 0
                },
                { status: 200 }
            );
        }

    } catch (error) {
        console.error("Error handling like:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
