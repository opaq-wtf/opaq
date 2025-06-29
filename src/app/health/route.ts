import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Basic health check
        const healthData = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version || '1.0.0',
            service: 'opaq.wtf'
        };

        return NextResponse.json(healthData, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'ERROR',
                timestamp: new Date().toISOString(),
                error: 'Health check failed'
            },
            { status: 500 }
        );
    }
}
