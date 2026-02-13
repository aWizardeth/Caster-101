import { NextResponse } from 'next/server';

// Proxies Spacescan API calls to avoid CORS issues from browser
// Example: /api/spacescan-proxy?path=cat/info/ASSET_ID

export async function GET(request) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    if (!path) {
        return NextResponse.json(
            { error: 'Missing path parameter' },
            { status: 400, headers }
        );
    }

    // Reconstruct the Spacescan URL
    const url = `https://api.spacescan.io/${path}`;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(url, {
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            return NextResponse.json(
                { error: `Spacescan returned ${response.status}` },
                { status: response.status, headers }
            );
        }
        
        const data = await response.json();
        
        // Cache for 2 minutes
        return NextResponse.json(data, {
            headers: {
                ...headers,
                'Cache-Control': 's-maxage=120, stale-while-revalidate=60'
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500, headers }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
