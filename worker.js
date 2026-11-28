// 꿀통 아카이브 — 정적 파일은 그대로 제공하고, /api/* 만 이 스크립트가 처리 (방문 통계, 쿠키 없음)
import { DurableObject } from "cloudflare:workers";
const KEY_HASH = "ad284878ac4183abe10674d091b0f6c14871e94b519883fa90f32bc752946931";
const NAMES = {"/":"홈(첫 화면)","/blog/":"꿀팁 글 목록","/salary/":"연봉 실수령액 계산기","/vat/":"부가세 계산기","/lotto/":"로또 번호 생성기","/hourly-wage/":"시급 월급 환산 계산기 (2026 최저임금)","/loan/":"대출이자 계산기","/emergency-food/":"비상식량·생수 수량 계산기","/stock-return/":"주식 수익률·손익 계산기","/overtime/":"연장·야간·휴일수당 계산기","/car-tax/":"자동차세 계산기","/stamp-transparent/":"투명도장 만들기 (도장·서명 배경 지우기)","/pet-age/":"강아지·고양이 나이 계산기 (사람 나이 환산)","/pregnancy/":"임신 주수·출산 예정일 계산기","/team-split/":"팀 나누기 (랜덤 조 편성)","/age/":"만나이 계산기","/bmi/":"BMI 계산기 (비만도)","/freelancer/":"3.3% 프리랜서 세금 계산기","/weekly-holiday/":"주휴수당 계산기","/pyeong/":"평수 계산기 (평 ↔ ㎡)","/qr/":"QR코드 만들기 (무료·무제한)","/dday/":"D-day 계산기","/blog/fair-draw-tips/":"모임에서 내기·당번·경품을 뒷말 없이 정하는 법","/blog/diet-calorie-basics/":"다이어트, 하루 몇 칼로리 먹어야 할까 — 기초대사량으로 정하는 법","/blog/severance-pay-how-much/":"퇴직금 계산 방법 — 월급 300만 원·3년 다니면 약 880만 원","/blog/salary-net-table-2026/":"연봉 실수령액 표 2026 — 연봉 3천·4천·5천이면 한 달에 얼마 받나","/blog/basic-pension-2026-eligibility/":"기초연금 2026 — 대상 기준 247만 원, 부부는 얼마 받나","/blog/stock-averaging-down-math/":"주식 물타기 계산 — 평단가는 얼마나 내려가고, 언제 하면 안 되나","/blog/quit-money-checklist/":"퇴사 전에 꼭 계산해 볼 돈 4가지 — 퇴직금·연차수당·실업급여·마지막 월급","/blog/house-buying-extra-costs/":"집 살 때 집값 말고 드는 돈 — 7억 5천만 원 아파트면 약 2천만 원","/blog/gpa-convert-tips/":"학점 4.5 만점을 4.3 만점으로 바꾸는 법과 지원서에 적을 때 주의점","/blog/weekly-holiday-pay-2026/":"주휴수당 조건과 계산법 2026 — 주 15시간이면 받나, 얼마인가","/blog/anniversary-counting/":"100일은 99일 뒤? 기념일·만나이·계약 기간 날짜 세는 법","/blog/apartment-pyeong/":"84㎡ 아파트를 왜 34평이라고 부를까 — 전용·공급면적과 평수","/blog/loan-repayment-compare/":"대출 1억, 갚는 방식에 따라 이자가 6,700만 원 차이 난다","/blog/emergency-food-3days/":"비상식량 3일치, 4인 가족이면 생수 몇 병·몇 끼가 필요할까","/blog/pension-early-or-late/":"국민연금 당겨받기 vs 미뤄받기 — 몇 살까지 살면 이득인가","/blog/stamp-on-document/":"견적서·서류에 도장 넣는 법 — 투명도장 만들어 한글·PDF에 붙이기","/blog/unemployment-benefit-2026/":"실업급여 2026 — 하루 66,048원~68,100원, 몇 달 받을 수 있나","/ladder/":"사다리타기","/insurance/":"4대보험 계산기 (2026 요율)","/char-count/":"글자수 세기","/brokerage-fee/":"부동산 중개수수료(복비) 계산기","/ovulation/":"배란일·가임기 계산기","/unit/":"단위 변환기 (길이·무게·부피·온도)","/stamp-maker/":"도장 만들기 (전자 도장 이미지)","/ratio/":"비례식 계산기 (a:b = c:x)","/base-convert/":"진법 변환기 (2진수·8진수·10진수·16진수)","/percent/":"퍼센트 계산기","/world-time/":"세계 시각·시차 계산기","/compound/":"복리 계산기 (적립식·72법칙)","/parental-leave/":"육아휴직급여 계산기","/basic-pension/":"기초연금 계산기","/acquisition-tax/":"주택 취득세 계산기","/stock-avg/":"주식 물타기 평단가 계산기","/annual-leave/":"연차 계산기 (연차수당 포함)","/average/":"평균·중앙값·표준편차 계산기","/bmr/":"기초대사량·하루 권장 칼로리 계산기","/sleep/":"수면 시간 계산기 (몇 시에 자야 할까)","/contact/":"문의","/image-compress/":"사진 용량 줄이기·크기 바꾸기","/terms/":"이용약관·면책","/date-add/":"날짜 계산기 (며칠 뒤·며칠 전·요일)","/gpa/":"학점 계산기 (4.5·4.3 변환)","/severance/":"퇴직금 계산기","/roulette/":"룰렛 돌리기","/dice/":"주사위·동전 던지기·랜덤 숫자","/text-clean/":"텍스트 정리 (공백·줄바꿈·중복 제거)","/unemployment/":"실업급여 계산기","/privacy/":"개인정보처리방침","/baby-months/":"아기 개월수·100일·돌 계산기","/about/":"꿀통 아카이브 소개","/timer/":"온라인 타이머·스톱워치","/pension-timing/":"국민연금 당겨받기·미뤄받기 계산기","/income-tax/":"종합소득세 계산기 (세율표)","/savings/":"예금·적금 이자 계산기","/rent-convert/":"전월세 전환 계산기 (2026 법정 5%)","/color/":"색상 코드 변환 (HEX·RGB·HSL)","/dutch-pay/":"더치페이 N빵 계산기","/random-pick/":"제비뽑기·당첨자 뽑기","/password/":"비밀번호 생성기"};
const kst = (ms) => new Date(ms + 9 * 3600e3).toISOString().slice(0, 10);
async function sha(s) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); }
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export class Stats extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.sql = ctx.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS hits(d TEXT, path TEXT, src TEXT, ref TEXT, v TEXT)");
    this.sql.exec("CREATE INDEX IF NOT EXISTS hd ON hits(d)");
    try { this.sql.exec("ALTER TABLE hits ADD COLUMN t TEXT"); } catch (e) {} }
  hit(d, path, src, ref, v, t) { this.sql.exec("INSERT INTO hits(d,path,src,ref,v,t) VALUES(?,?,?,?,?,?)", d, path, src, ref, v, t); }
  report(from) {
    const q = (s, ...b) => this.sql.exec(s, ...b).toArray();
    return {
      days: q("SELECT d, COUNT(*) pv, COUNT(DISTINCT v) uv FROM hits WHERE d>=? GROUP BY d ORDER BY d DESC", from),
      pages: q("SELECT path, MAX(CASE WHEN t LIKE '%찾을 수 없%' THEN NULL ELSE t END) t, MAX(CASE WHEN t LIKE '%찾을 수 없%' THEN 1 ELSE 0 END) nf, COUNT(*) pv, COUNT(DISTINCT d||v) uv FROM hits WHERE d>=? GROUP BY path ORDER BY pv DESC LIMIT 80", from),
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
      if (!/bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|mediapartners|google-|adsense|yeti|daum/i.test(ua)) {
        const now = Date.now(), d = kst(now);
        const p = (u.searchParams.get("p") || "/").slice(0, 200), f = (u.searchParams.get("f") || "").slice(0, 40), r = (u.searchParams.get("r") || "").slice(0, 100), t = (u.searchParams.get("t") || "").slice(0, 80);
        const v = (await sha((req.headers.get("cf-connecting-ip") || "") + "|" + ua + "|" + d + "|kt")).slice(0, 16);
        await stub().hit(d, p, f, r, v, t);
      }
      return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
    }
    if (u.pathname === "/api/stats") {
      if ((await sha(u.searchParams.get("k") || "")) !== KEY_HASH) return new Response("Not found", { status: 404 });
      const n = Math.min(365, Math.max(1, parseInt(u.searchParams.get("days") || "14", 10) || 14));
      const from = kst(Date.now() - (n - 1) * 86400e3);
      const R = await stub().report(from);
      const k = encodeURIComponent(u.searchParams.get("k"));
      const nm = (x) => (NAMES[x.path] || x.t || (x.nf ? "없는 주소(404) " + x.path : x.path)).replace(" (2026)", "");
      const html = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>꿀통 방문 통계</title><style>body{font-family:system-ui,sans-serif;margin:16px;color:#2a1e0f;background:#fffaf0}table{border-collapse:collapse;width:100%;max-width:720px;margin-bottom:18px;background:#fff}th,td{border-bottom:1px solid #eadfcb;padding:7px 6px;text-align:right;font-size:14px}th:first-child,td:first-child{text-align:left;word-break:break-all}h1{font-size:20px}h2{font-size:16px;margin:18px 0 6px}a{color:#c97a00;margin-right:10px}.big{font-size:18px;font-weight:800}</style></head><body>' +
        "<h1>꿀통 아카이브 방문 통계 (최근 " + n + "일, 한국 시간)</h1>" +
        "<p>" + [1, 7, 14, 30, 90].map(x => '<a href="?k=' + k + "&days=" + x + '">' + x + "일</a>").join("") + "</p>" +
        '<p class="big">방문자 ' + (R.total.uv || 0).toLocaleString() + "명 · 페이지뷰 " + (R.total.pv || 0).toLocaleString() + "회</p>" +
        '<p style="font-size:13px;color:#6e5e49">방문자 = 같은 날 같은 기기·주소는 1명으로 셈(쿠키 없음). 검색봇은 제외.</p>' +
        table("많이 본 계산기·도구", ["계산기", "방문자", "본 횟수"], R.pages.filter(x => !x.path.startsWith("/blog/") && x.path !== "/").map(x => [nm(x), x.uv, x.pv])) +
        table("많이 본 꿀팁 글", ["글", "방문자", "본 횟수"], R.pages.filter(x => x.path.startsWith("/blog/")).map(x => [nm(x), x.uv, x.pv])) +
        table("날짜별", ["날짜", "방문자", "페이지뷰"], R.days.map(x => [x.d, x.uv, x.pv])) +
        table("채널별 유입", ["채널", "방문자", "페이지뷰"], R.srcs.map(x => [({ nanse: "난세탈출", tongjang: "통장이 효자다", ilper: "1%의 경제감각", kkultong: "꿀통 채널" }[x.src] || x.src), x.uv, x.pv])) +
        table("들어온 곳 (다른 사이트)", ["주소", "페이지뷰"], R.refs.map(x => [x.ref, x.pv])) +
                "</body></html>";
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
    }
    return env.ASSETS.fetch(req);
  },
};
