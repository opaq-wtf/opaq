import { getUser, getUserOptional } from "@/app/data/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await getUserOptional();

        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        return NextResponse.json({
            id: user.id,
            username: user.username,
            fullName: user.full_name
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching current user: ', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
