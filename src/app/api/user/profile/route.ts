import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/app/data/user";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";

interface UpdateProfileData {
    full_name?: string;
    bio?: string;
    location?: string;
    website?: string;
    contact_visible?: boolean;
}

export async function PUT(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user || !user.id) {
            return NextResponse.json(
                { message: "Authentication required" },
                { status: 401 }
            );
        }

        const updateData: UpdateProfileData = await req.json();

        // Validate required fields
        if (updateData.full_name && updateData.full_name.trim().length === 0) {
            return NextResponse.json(
                { message: "Full name is required" },
                { status: 400 }
            );
        }

        // Validate website URL if provided
        if (updateData.website && updateData.website.trim()) {
            try {
                new URL(updateData.website);
            } catch {
                return NextResponse.json(
                    { message: "Invalid website URL" },
                    { status: 400 }
                );
            }
        }

        // Build update object with only provided fields
        const updateFields: any = {
            updatedAt: new Date(),
        };

        if (updateData.full_name !== undefined) {
            updateFields.fullName = updateData.full_name.trim();
        }

        if (updateData.bio !== undefined) {
            updateFields.bio = updateData.bio.trim() || null;
        }

        if (updateData.location !== undefined) {
            updateFields.location = updateData.location.trim() || null;
        }

        if (updateData.website !== undefined) {
            updateFields.website = updateData.website.trim() || null;
        }

        if (updateData.contact_visible !== undefined) {
            updateFields.contactVisible = updateData.contact_visible;
        }

        // Update user in database
        await db
            .update(users)
            .set(updateFields)
            .where(eq(users.id, user.id));

        // Fetch updated user data
        const updatedUserResult = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        const updatedUser = updatedUserResult[0];

        return NextResponse.json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser.id,
                full_name: updatedUser.fullName,
                email: updatedUser.email,
                username: updatedUser.username,
                bio: updatedUser.bio,
                location: updatedUser.location,
                website: updatedUser.website,
                contact_visible: updatedUser.contactVisible,
            }
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user || !user.id) {
            return NextResponse.json(
                { message: "Authentication required" },
                { status: 401 }
            );
        }

        // Fetch full user data directly from database for complete profile info
        const fullUserResult = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        const fullUser = fullUserResult[0];

        return NextResponse.json({
            user: {
                id: fullUser.id,
                full_name: fullUser.fullName,
                email: fullUser.email,
                username: fullUser.username,
                bio: fullUser.bio,
                location: fullUser.location,
                website: fullUser.website,
                contact_visible: fullUser.contactVisible,
            }
        });

    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
