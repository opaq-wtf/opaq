import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pitches } from "@/lib/db/schema/pitches";
import { users } from "@/lib/db/schema/user";
import { eq, and } from "drizzle-orm";
import { getUser } from "@/app/data/user";
import { generatePitchOtp, verifyPitchOtp } from "@/actions/pitch-otp";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUser();
        if (!user || !user.id) {
            return NextResponse.json(
                { message: "Authentication required" },
                { status: 401 }
            );
        }

        const { id: pitchId } = await params;
        const { action, otp } = await req.json();

        // Get the pitch and verify ownership
        const pitch = await db
            .select({
                id: pitches.id,
                userId: pitches.userId,
                visibility: pitches.visibility,
                title: pitches.title,
            })
            .from(pitches)
            .where(eq(pitches.id, pitchId))
            .limit(1);

        if (pitch.length === 0) {
            return NextResponse.json(
                { message: "Pitch not found" },
                { status: 404 }
            );
        }

        const pitchData = pitch[0];

        if (pitchData.userId !== user.id) {
            return NextResponse.json(
                { message: "Not authorized to modify this pitch" },
                { status: 403 }
            );
        }

        if (action === "request-otp") {
            // Check if pitch is already public
            if (pitchData.visibility === "public") {
                return NextResponse.json(
                    { message: "Pitch is already public" },
                    { status: 400 }
                );
            }

            // Get user email for OTP
            const userData = await db
                .select({
                    email: users.email,
                    fullName: users.fullName,
                })
                .from(users)
                .where(eq(users.id, user.id))
                .limit(1);

            if (userData.length === 0) {
                return NextResponse.json(
                    { message: "User data not found" },
                    { status: 404 }
                );
            }

            await generatePitchOtp(
                pitchId,
                user.id,
                userData[0].email,
                userData[0].fullName
            );

            return NextResponse.json(
                { message: "OTP sent to your email" },
                { status: 200 }
            );
        }

        if (action === "verify-otp") {
            if (!otp) {
                return NextResponse.json(
                    { message: "OTP is required" },
                    { status: 400 }
                );
            }

            // Verify OTP
            const isValidOtp = await verifyPitchOtp(pitchId, otp);

            if (!isValidOtp) {
                return NextResponse.json(
                    { message: "Invalid or expired OTP" },
                    { status: 400 }
                );
            }

            // Update pitch visibility to public
            await db
                .update(pitches)
                .set({
                    visibility: "public",
                    updatedAt: new Date(),
                })
                .where(eq(pitches.id, pitchId));

            return NextResponse.json(
                {
                    message: "Pitch successfully made public",
                    visibility: "public"
                },
                { status: 200 }
            );
        }

        if (action === "make-private") {
            // Check if pitch is already private
            if (pitchData.visibility === "private") {
                return NextResponse.json(
                    { message: "Pitch is already private" },
                    { status: 400 }
                );
            }

            // Update pitch visibility to private (no OTP required)
            await db
                .update(pitches)
                .set({
                    visibility: "private",
                    updatedAt: new Date(),
                })
                .where(eq(pitches.id, pitchId));

            return NextResponse.json(
                {
                    message: "Pitch successfully made private",
                    visibility: "private"
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { message: "Invalid action" },
            { status: 400 }
        );

    } catch (error) {
        console.error("Error updating pitch visibility:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
