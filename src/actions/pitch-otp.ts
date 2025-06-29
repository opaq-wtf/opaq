import { db } from "@/lib/db";
import { createHash } from "crypto";
import { pitchOtpVerification } from "@/lib/db/schema/pitches";
import { addMinutes } from "date-fns";
import { sendOtpEmail } from "./send-mail";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function generatePitchOtp(pitchId: string, userId: string, email: string, fullName: string) {
    // Generate 6-digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = createHash("sha256").update(rawOtp).digest("hex");
    const expiresAt = addMinutes(new Date(), 10); // OTP expires in 10 minutes

    // Delete any existing OTP for this pitch
    await db
        .delete(pitchOtpVerification)
        .where(eq(pitchOtpVerification.pitchId, pitchId));

    // Insert new OTP
    await db
        .insert(pitchOtpVerification)
        .values({
            id: uuid(),
            pitchId,
            userId,
            otpHash: hashedOtp,
            expiresAt,
        });

    // Send OTP via email
    await sendOtpEmail(email, rawOtp, fullName);

    return true;
}

export async function verifyPitchOtp(pitchId: string, otp: string): Promise<boolean> {
    const hashedOtp = createHash("sha256").update(otp).digest("hex");

    const verification = await db
        .select()
        .from(pitchOtpVerification)
        .where(eq(pitchOtpVerification.pitchId, pitchId))
        .limit(1);

    if (verification.length === 0) {
        return false;
    }

    const record = verification[0];

    // Check if OTP is expired
    if (new Date() > record.expiresAt) {
        // Clean up expired OTP
        await db
            .delete(pitchOtpVerification)
            .where(eq(pitchOtpVerification.pitchId, pitchId));
        return false;
    }

    // Check if OTP matches
    if (record.otpHash !== hashedOtp) {
        return false;
    }

    // OTP is valid, clean it up
    await db
        .delete(pitchOtpVerification)
        .where(eq(pitchOtpVerification.pitchId, pitchId));

    return true;
}
