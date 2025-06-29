import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pitches, pitchInteractions } from "@/lib/db/schema/pitches";
import { eq, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { nanoid } from "nanoid";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: "Pitch ID is required" },
                { status: 400 }
            );
        }

        // Get the pitch
        const result = await db
            .select()
            .from(pitches)
            .where(eq(pitches.id, id))
            .limit(1);

        const pitch = result[0];

        if (!pitch) {
            return NextResponse.json(
                { message: "Pitch not found" },
                { status: 404 }
            );
        }

        // Check if pitch is private and user is not the owner
        const session = await getSession();
        if (pitch.visibility === "private") {
            if (!session?.userId || session.userId !== pitch.userId) {
                return NextResponse.json(
                    { message: "Pitch not found" },
                    { status: 404 }
                );
            }
        }

        // Handle view tracking
        if (session?.userId) {
            const userId = session.userId as string;

            // Check if user has already viewed this pitch
            const existingInteraction = await db
                .select()
                .from(pitchInteractions)
                .where(
                    and(
                        eq(pitchInteractions.userId, userId),
                        eq(pitchInteractions.pitchId, id)
                    )
                )
                .limit(1);

            const interaction = existingInteraction[0];

            if (!interaction) {
                // Create new interaction record
                await db.insert(pitchInteractions).values({
                    id: nanoid(),
                    userId,
                    pitchId: id,
                    hasViewed: 1,
                    firstViewedAt: new Date(),
                    lastViewedAt: new Date(),
                });

                // Increment view count
                await db
                    .update(pitches)
                    .set({
                        viewsCount: sql`${pitches.viewsCount} + 1`,
                        updatedAt: new Date()
                    })
                    .where(eq(pitches.id, id));

                // Return updated pitch with incremented view count
                pitch.viewsCount = pitch.viewsCount + 1;
            } else if (interaction.hasViewed === 0) {
                // Mark as viewed and update timestamps
                await db
                    .update(pitchInteractions)
                    .set({
                        hasViewed: 1,
                        firstViewedAt: new Date(),
                        lastViewedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(pitchInteractions.id, interaction.id));

                // Increment view count
                await db
                    .update(pitches)
                    .set({
                        viewsCount: sql`${pitches.viewsCount} + 1`,
                        updatedAt: new Date()
                    })
                    .where(eq(pitches.id, id));

                // Return updated pitch with incremented view count
                pitch.viewsCount = pitch.viewsCount + 1;
            } else {
                // Just update last viewed time
                await db
                    .update(pitchInteractions)
                    .set({
                        lastViewedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(pitchInteractions.id, interaction.id));
            }

            // Include user's interaction status in the response
            const userInteraction = await db
                .select()
                .from(pitchInteractions)
                .where(
                    and(
                        eq(pitchInteractions.userId, userId),
                        eq(pitchInteractions.pitchId, id)
                    )
                )
                .limit(1);

            return NextResponse.json(
                {
                    pitch,
                    userInteraction: userInteraction[0] || null
                },
                { status: 200 }
            );
        }

        // Return pitch without interaction data if not logged in
        return NextResponse.json(
            { pitch },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching pitch:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
