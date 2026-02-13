import { NextResponse } from 'next/server';

// Proxies Chia address API calls (balance, nft-balance, token-balance)
// to avoid CORS issues from browser

export async function POST(request) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
        const body = await request.json();
        const { endpoint, address } = body;

        if (!endpoint || !address) {
            return NextResponse.json(
                { error: 'Missing endpoint or address' },
                { status: 400, headers }
            );
        }

        const allowed = ['balance', 'nft-balance', 'token-balance', 'xch-balance'];
        if (!allowed.includes(endpoint)) {
            return NextResponse.json(
                { error: 'Invalid endpoint' },
                { status: 400, headers }
            );
        }

        const url = `https://api.spacescan.io/address/${endpoint}/${address}`;
        const timeout = endpoint === 'token-balance' ? 30000 : 12000;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

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
        return NextResponse.json(data, { headers });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500, headers: headers }
        );
    }
}

export async function GET(request) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const address = searchParams.get('address');

    if (!endpoint || !address) {
        return NextResponse.json(
            { error: 'Missing endpoint or address' },
            { status: 400, headers }
        );
    }

    const allowed = ['balance', 'nft-balance', 'token-balance', 'xch-balance'];
    if (!allowed.includes(endpoint)) {
        return NextResponse.json(
            { error: 'Invalid endpoint' },
            { status: 400, headers }
        );
    }

    try {
        const url = `https://api.spacescan.io/address/${endpoint}/${address}`;
        const timeout = endpoint === 'token-balance' ? 30000 : 12000;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

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
        return NextResponse.json(data, { headers });
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
