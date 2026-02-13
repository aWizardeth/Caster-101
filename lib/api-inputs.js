export const API_BASES = {
    spacescan: 'https://api.spacescan.io',
    xchscan: 'https://xchscan.com/api',
    mintgarden: 'https://api.mintgarden.io',
    merkl: 'https://api.merkl.xyz',
    merklApp: 'https://app.merkl.xyz',
    coingecko: 'https://api.coingecko.com/api/v3',
    dexie: 'https://dexie.space',
    dexscreener: 'https://api.dexscreener.com',
    blockscoutBase: 'https://base.blockscout.com/api/v2',
};

export const UA_HEADERS = {
    Accept: 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

export const CACHE_CONTROL = {
    short: 's-maxage=60, stale-while-revalidate=300',
    spacescanProxy: 's-maxage=120, stale-while-revalidate=60',
};

export const TIMEOUTS = {
    fast: 5000,
    standard: 10000,
    spacescanDefault: 12000,
    spacescanProxy: 15000,
    spacescanTokenBalance: 25000,
    spacescanTokenBalanceLong: 30000,
    mintgardenCollection: 3000,
    baseRpc: 6000,
};

export const INPUTS = {
    spacescanAllowedAddressEndpoints: ['balance', 'nft-balance', 'token-balance'],
    catIds: [
        'a09af8b0d12b27772c64f89cf0d1db95186dca5b1871babc5108ff44f36305e6',
        'eb2155a177b6060535dd8e72e98ddb0c77aea21fab53737de1c1ced3cb38e4c4',
        'ae1536f56760e471ad85ead45f00d680ff9cca73b8cc3407be778f1c0c606eac',
        '70010d83542594dd44314efbae75d82b3d9ae7d946921ed981a6cd08f0549e50',
        'ab558b1b841365a24d1ff2264c55982e55664a8b6e45bc107446b7e667bb463b',
        'dd37f678dda586fad9b1daeae1f7c5c137ffa6d947e1ed5c7b4f3c430da80638',
    ],
    merkl: {
        search: '9mm',
        appSearch: 'ninemm',
        sort: 'apr-desc',
        test: 'true',
        topN: 3,
    },
    mintgarden: {
        maxCollectionIdsPerRequest: 60,
    },
    baseRpcs: [
        'https://base-rpc.publicnode.com',
        'https://base.llamarpc.com',
        'https://base.meowrpc.com',
    ],
};

export const PRIVATE_API = {
    spacescanKey: process.env.SPACESCAN_API_KEY || '',
    merklKey: process.env.MERKL_API_KEY || '',
    mintgardenKey: process.env.MINTGARDEN_API_KEY || '',
};

export function getPrivateHeaders(provider) {
    if (provider === 'spacescan' && PRIVATE_API.spacescanKey) {
        return { 'x-api-key': PRIVATE_API.spacescanKey };
    }
    if (provider === 'merkl' && PRIVATE_API.merklKey) {
        return { Authorization: `Bearer ${PRIVATE_API.merklKey}` };
    }
    if (provider === 'mintgarden' && PRIVATE_API.mintgardenKey) {
        return { Authorization: `Bearer ${PRIVATE_API.mintgardenKey}` };
    }
    return {};
}

export const URLS = {
    spacescanAddress: (endpoint, address) => `${API_BASES.spacescan}/address/${endpoint}/${address}`,
    spacescanPath: (path) => `${API_BASES.spacescan}/${path}`,
    spacescanCatInfo: (assetId) => `${API_BASES.spacescan}/cat/info/${assetId}`,
    spacescanXchBalance: (address) => `${API_BASES.spacescan}/address/xch-balance/${address}`,
    spacescanTokenBalance: (address) => `${API_BASES.spacescan}/address/token-balance/${address}`,
    spacescanNftBalance: (address) => `${API_BASES.spacescan}/address/nft-balance/${address}`,
    xchscanBalance: (address) => `${API_BASES.xchscan}/account/balance?address=${address}`,
    mintgardenCollection: (cid) => `${API_BASES.mintgarden}/collections/${cid}`,
    merklOpportunities: () => `${API_BASES.merkl}/v4/opportunities?search=${INPUTS.merkl.search}&test=${INPUTS.merkl.test}`,
    merklAppSearch: () => `${API_BASES.merklApp}/?search=${INPUTS.merkl.appSearch}&sort=${INPUTS.merkl.sort}&test=${INPUTS.merkl.test}`,
    coingeckoSimplePrice: (ids) => `${API_BASES.coingecko}/simple/price?ids=${ids}&vs_currencies=usd`,
    dexieOffers: (assetId) => `${API_BASES.dexie}/v1/offers?offered=${assetId}&requested=xch&page=1&page_size=5&sort=price&order=asc`,
    dexieTickers: () => `${API_BASES.dexie}/v2/prices/tickers`,
    dexscreenerV1Base: (contractsCsv) => `${API_BASES.dexscreener}/tokens/v1/base/${contractsCsv}`,
    dexscreenerLatestTokens: (contractsCsv) => `${API_BASES.dexscreener}/latest/dex/tokens/${contractsCsv}`,
    baseAddress: (address) => `${API_BASES.blockscoutBase}/addresses/${address}`,
    baseTokenBalances: (address) => `${API_BASES.blockscoutBase}/addresses/${address}/token-balances`,
};
