import { NextResponse } from 'next/server';

async function fetchCollection(cid) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    
    try {
        const r = await fetch(`https://api.mintgarden.io/collections/${cid}`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
            signal: ctrl.signal,
        });
        clearTimeout(timer);
        
        if (!r.ok) return null;
        
        const col = await r.json();
        if (!col?.id || !col.name) return null;
        
        return {
            id: col.id,
            name: col.name,
            thumbnail: col.thumbnail_uri || '',
            floor_xch: parseFloat(col.floor_price || 0),
            nft_count: col.nft_count || 0
        };
    } catch (e) {
        clearTimeout(timer);
        return null;
    }
}

export async function POST(request) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
        const body = await request.json();
        const colIds = (body.colIds || []).slice(0, 60);
        
        if (colIds.length === 0) {
            return NextResponse.json({ ok: true, collections: {} }, { headers });
        }

        const results = await Promise.all(colIds.map(fetchCollection));
        const mgMap = {};
        
        for (const col of results.filter(Boolean)) {
            mgMap[col.id] = col;
        }

        return NextResponse.json({ ok: true, collections: mgMap }, { headers });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: err.message },
            { status: 400, headers }
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
