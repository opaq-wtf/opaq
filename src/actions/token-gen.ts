import { db } from "@/lib/db";
import { createHash, randomBytes } from "crypto";
import { emailVerification } from "@/lib/db/schema/email-verification";
import { addMinutes } from "date-fns";
import { sendVerificationEmail } from "./send-mail";

export async function tokenGen(id: string, email: string, full_name: string) {
  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = addMinutes(new Date(), 15);

  const verificationLink = `https://opaq.wtf/auth/verify-email?token=${rawToken}&id=${id}`;

  await db
    .insert(emailVerification)
    .values({
      userId: id,
      tokenHash: hashedToken,
      expiresAt: expiresAt,
    })
    .onConflictDoUpdate({
      target: emailVerification.userId,
      set: {
        tokenHash: hashedToken,
        expiresAt: expiresAt,
      },
    });

  await sendVerificationEmail(email, verificationLink, full_name);
}
