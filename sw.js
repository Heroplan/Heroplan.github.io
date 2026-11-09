/* 图片长缓存 Service Worker（口径见 HANDOFF.md「图片长缓存」节）。
   策略：/imgs/ 走 CacheStorage cache-first；site_ver.json 是部署版本门——
   版本没变 ⇒ 命中即返回（零网络、跨会话长期有效）；版本变了 ⇒ 带 ETag/Last-Modified
   条件复验一次（304 不重下，200 才换字节）。版本号由主站 pre-commit 钩子在 imgs/ 变动时递增。
   只接管 /imgs/ 的 GET；HTML/JS/JSON 一律不碰（它们各有 ?v= 戳 / av() 内容哈希）。 */
const IMG_CACHE = 'hp-img-v1';
const META_CACHE = 'hp-img-meta-v1';

let currentVer = null;
let verPromise = null;

function probeVersion() {
    verPromise = fetch('site_ver.json', { cache: 'no-store' })
        .then(r => (r.ok ? r.json() : null))
        .then(j => { currentVer = (j && j.v) || null; return currentVer; })
        .catch(() => currentVer);
    return verPromise;
}

self.addEventListener('install', () => { self.skipWaiting(); });

self.addEventListener('activate', e => {
    e.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys
            .filter(k => k.startsWith('hp-') && k !== IMG_CACHE && k !== META_CACHE)
            .map(k => caches.delete(k)));
        await probeVersion();
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', e => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;
    // 每次整页导航探一次版本（no-store 绕过 Pages 的 max-age=600）；站内无刷新切换不探。
    if (req.mode === 'navigate') { probeVersion(); return; }
    if (!url.pathname.startsWith('/imgs/')) return;
    if (req.headers.has('range')) return;
    e.respondWith(handleImage(req.url));
});

async function handleImage(key) {
    await (verPromise || probeVersion());
    const cache = await caches.open(IMG_CACHE);
    const metaCache = await caches.open(META_CACHE);
    const metaRes = await metaCache.match(key);
    const meta = metaRes ? await metaRes.json() : null;
    const hit = await cache.match(key);
    if (hit && meta && meta.v === currentVer) return hit;

    const headers = {};
    if (meta && meta.etag) headers['If-None-Match'] = meta.etag;
    if (meta && meta.lm) headers['If-Modified-Since'] = meta.lm;
    let res;
    try {
        // cache:'reload' ⇒ 条件头真的到服务器，不被浏览器 HTTP 缓存（Pages 600s）截答。
        res = await fetch(key, { headers, cache: 'reload' });
    } catch (err) {
        if (hit) return hit;
        throw err;
    }
    if (res.status === 304) {
        if (hit) {
            await putMeta(metaCache, key, Object.assign({}, meta, { v: currentVer }));
            return hit;
        }
        res = await fetch(key, { cache: 'reload' });   //  body 被配额清掉了：补全量
    }
    if (res.ok && res.status === 200 && res.type === 'basic') {
        const next = { v: currentVer, etag: res.headers.get('ETag'), lm: res.headers.get('Last-Modified') };
        try {
            await cache.put(key, res.clone());
            await putMeta(metaCache, key, next);
        } catch (err) { /* 配额满：本次不入库，下次再试 */ }
    }
    return res;
}

function putMeta(metaCache, key, meta) {
    return metaCache.put(key, new Response(JSON.stringify(meta), {
        headers: { 'Content-Type': 'application/json' }
    }));
}