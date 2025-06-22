import { db } from "@/lib/db";
import { emailVerification } from "@/lib/db/schema/email-verification";
import { users } from "@/lib/db/schema/user";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const id = url.searchParams.get('id');

    if (!token || !id) {
        return NextResponse.json({ message: 'Invalid Verification Link' }, { status: 400 });
    }

    const hashedToken = createHash('sha256').update(token).digest('hex');

    const verificationEntry = await db.query.emailVerification.findFirst({
        where: (table) => eq(table.userId, id) && eq(table.tokenHash, hashedToken)
    });

    if (!verificationEntry) {
        return NextResponse.json({ message: 'Invalid or Expired token' }, { status: 400 });
    }

    if (new Date() > verificationEntry.expiresAt) {
        return NextResponse.json({ message: 'Token has expired' }, { status: 400 });
    }

    await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, id));

    await db.delete(emailVerification).where(eq(emailVerification.userId, id));

    return NextResponse.redirect(new URL('/sign-in', req.url));
}