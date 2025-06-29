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
    profile_picture?: string;
    profile_picture_data?: string; // Base64 encoded image data
    profile_picture_irys_id?: string;
    date_of_birth?: string; // ISO date string - can only be set once
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

        // Validate profile picture if provided
        if (updateData.profile_picture_data) {
            try {
                // Check if it's a valid base64 image
                const base64Data = updateData.profile_picture_data;

                // Extract the actual base64 data (remove data:image/...;base64, prefix if present)
                const base64Match = base64Data.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/);
                if (!base64Match) {
                    return NextResponse.json(
                        { message: "Invalid image format. Please upload a valid image (JPEG, PNG, GIF, WebP)" },
                        { status: 400 }
                    );
                }

                const imageType = base64Match[1];
                const imageData = base64Match[2];

                // Calculate file size (base64 is roughly 4/3 the size of the original)
                const sizeInBytes = (imageData.length * 3) / 4;
                const sizeInMB = sizeInBytes / (1024 * 1024);

                if (sizeInMB > 1) {
                    return NextResponse.json(
                        { message: "Image too large. Maximum size is 1MB." },
                        { status: 400 }
                    );
                }

                // Validate that it's actually a valid base64 string
                try {
                    atob(imageData);
                } catch {
                    return NextResponse.json(
                        { message: "Invalid image data" },
                        { status: 400 }
                    );
                }
            } catch {
                return NextResponse.json(
                    { message: "Invalid image format" },
                    { status: 400 }
                );
            }
        }

        // Validate and handle date of birth (can only be set once)
        if (updateData.date_of_birth !== undefined) {
            // First, check if user already has a date of birth set
            const currentUserResult = await db
                .select({ dateOfBirth: users.dateOfBirth })
                .from(users)
                .where(eq(users.id, user.id))
                .limit(1);

            const currentUser = currentUserResult[0];

            if (currentUser?.dateOfBirth) {
                return NextResponse.json(
                    { message: "Date of birth has already been set and cannot be changed" },
                    { status: 400 }
                );
            }

            // Validate the date format and ensure it's a valid date
            if (updateData.date_of_birth) {
                const dobDate = new Date(updateData.date_of_birth);
                if (isNaN(dobDate.getTime())) {
                    return NextResponse.json(
                        { message: "Invalid date format for date of birth" },
                        { status: 400 }
                    );
                }

                // Ensure the date is not in the future
                if (dobDate > new Date()) {
                    return NextResponse.json(
                        { message: "Date of birth cannot be in the future" },
                        { status: 400 }
                    );
                }

                // Ensure the person is at least 16 years old (matching frontend validation)
                const sixteenYearsAgo = new Date();
                sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);
                if (dobDate > sixteenYearsAgo) {
                    return NextResponse.json(
                        { message: "You must be at least 16 years old to use this platform" },
                        { status: 400 }
                    );
                }
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

        if (updateData.profile_picture !== undefined) {
            updateFields.profilePicture = updateData.profile_picture || null;
        }

        if (updateData.profile_picture_data !== undefined) {
            updateFields.profilePictureData = updateData.profile_picture_data || null;
        }

        if (updateData.profile_picture_irys_id !== undefined) {
            updateFields.profilePictureIrysId = updateData.profile_picture_irys_id || null;
        }

        if (updateData.date_of_birth !== undefined && updateData.date_of_birth) {
            updateFields.dateOfBirth = new Date(updateData.date_of_birth);
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
                profile_picture: updatedUser.profilePicture,
                profile_picture_data: updatedUser.profilePictureData,
                profile_picture_irys_id: updatedUser.profilePictureIrysId,
                date_of_birth: updatedUser.dateOfBirth,
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
                profile_picture: fullUser.profilePicture,
                profile_picture_data: fullUser.profilePictureData,
                profile_picture_irys_id: fullUser.profilePictureIrysId,
                date_of_birth: fullUser.dateOfBirth,
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
