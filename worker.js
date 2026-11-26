// 꿀통 아카이브 — 정적 파일은 그대로 제공하고, /api/* 만 이 스크립트가 처리 (방문 통계, 쿠키 없음)
import { DurableObject } from "cloudflare:workers";
const KEY_HASH = "ad284878ac4183abe10674d091b0f6c14871e94b519883fa90f32bc752946931";
const kst = (ms) => new Date(ms + 9 * 3600e3).toISOString().slice(0, 10);
async function sha(s) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); }
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export class Stats extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.sql = ctx.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS hits(d TEXT, path TEXT, src TEXT, ref TEXT, v TEXT)");
    this.sql.exec("CREATE INDEX IF NOT EXISTS hd ON hits(d)"); }
  hit(d, path, src, ref, v) { this.sql.exec("INSERT INTO hits VALUES(?,?,?,?,?)", d, path, src, ref, v); }
  report(from) {
    const q = (s, ...b) => this.sql.exec(s, ...b).toArray();
    return {
      days: q("SELECT d, COUNT(*) pv, COUNT(DISTINCT v) uv FROM hits WHERE d>=? GROUP BY d ORDER BY d DESC", from),
      pages: q("SELECT path, COUNT(*) pv, COUNT(DISTINCT d||v) uv FROM hits WHERE d>=? GROUP BY path ORDER BY pv DESC LIMIT 40", from),
      srcs: q("SELECT src, COUNT(*) pv, COUNT(DISTINCT d||v) uv FROM hits WHERE d>=? AND src<>'' GROUP BY src ORDER BY pv DESC", from),
      refs: q("SELECT ref, COUNT(*) pv FROM hits WHERE d>=? AND ref<>'' GROUP BY ref ORDER BY pv DESC LIMIT 30", from),
      total: q("SELECT COUNT(*) pv, COUNT(DISTINCT d||v) uv FROM hits WHERE d>=?", from)[0],
    };
  }
}

function table(title, head, rows) {
  return "<h2>" + title + "</h2><table><tr>" + head.map(h => "<th>" + h + "</th>").join("") + "</tr>" +
    (rows.length ? rows.map(r => "<tr>" + r.map(c => "<td>" + esc(c) + "</td>").join("") + "</tr>").join("") : '<tr><td colspan="' + head.length + '">아직 없음</td></tr>') + "</table>";
}

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    const stub = () => env.STATS.get(env.STATS.idFromName("main"));
    if (u.pathname === "/api/hit") {
      const ua = req.headers.get("user-agent") || "";
      if (!/bot|crawl|spider|slurp|preview|monitor|headless|lighthouse/i.test(ua)) {
        const now = Date.now(), d = kst(now);
        const p = (u.searchParams.get("p") || "/").slice(0, 200), f = (u.searchParams.get("f") || "").slice(0, 40), r = (u.searchParams.get("r") || "").slice(0, 100);
        const v = (await sha((req.headers.get("cf-connecting-ip") || "") + "|" + ua + "|" + d + "|kt")).slice(0, 16);
        await stub().hit(d, p, f, r, v);
      }
      return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
    }
    if (u.pathname === "/api/stats") {
      if ((await sha(u.searchParams.get("k") || "")) !== KEY_HASH) return new Response("Not found", { status: 404 });
      const n = Math.min(365, Math.max(1, parseInt(u.searchParams.get("days") || "14", 10) || 14));
      const from = kst(Date.now() - (n - 1) * 86400e3);
      const R = await stub().report(from);
      const k = encodeURIComponent(u.searchParams.get("k"));
      const html = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>꿀통 방문 통계</title><style>body{font-family:system-ui,sans-serif;margin:16px;color:#2a1e0f;background:#fffaf0}table{border-collapse:collapse;width:100%;max-width:720px;margin-bottom:18px;background:#fff}th,td{border-bottom:1px solid #eadfcb;padding:7px 6px;text-align:right;font-size:14px}th:first-child,td:first-child{text-align:left;word-break:break-all}h1{font-size:20px}h2{font-size:16px;margin:18px 0 6px}a{color:#c97a00;margin-right:10px}.big{font-size:18px;font-weight:800}</style></head><body>' +
        "<h1>꿀통 아카이브 방문 통계 (최근 " + n + "일, 한국 시간)</h1>" +
        "<p>" + [1, 7, 14, 30, 90].map(x => '<a href="?k=' + k + "&days=" + x + '">' + x + "일</a>").join("") + "</p>" +
        '<p class="big">방문자 ' + (R.total.uv || 0).toLocaleString() + "명 · 페이지뷰 " + (R.total.pv || 0).toLocaleString() + "회</p>" +
        '<p style="font-size:13px;color:#6e5e49">방문자 = 같은 날 같은 기기·주소는 1명으로 셈(쿠키 없음). 검색봇은 제외.</p>' +
        table("날짜별", ["날짜", "방문자", "페이지뷰"], R.days.map(x => [x.d, x.uv, x.pv])) +
        table("채널별 유입 (?from=)", ["표시", "방문자", "페이지뷰"], R.srcs.map(x => [x.src, x.uv, x.pv])) +
        table("들어온 곳 (다른 사이트)", ["주소", "페이지뷰"], R.refs.map(x => [x.ref, x.pv])) +
        table("많이 본 페이지", ["페이지", "방문자", "페이지뷰"], R.pages.map(x => [x.path, x.uv, x.pv])) +
        "</body></html>";
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
    }
    return env.ASSETS.fetch(req);
  },
};
