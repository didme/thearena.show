import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

function withoutComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

test("renders the current v6.08 landing page contract", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = withoutComments(await response.text());

  assert.match(html, /<title>The Arena — Business Services Trade Show in Dubai<\/title>/i);
  assert.match(html, /<link[^>]+rel="canonical"[^>]+href="https:\/\/thearena\.show\/?"/i);
  assert.match(html, /(?:WORKING VERSION|VERSION)\s*v6\.08/i);
  assert.match(html, /21–22 SEP 2026/i);
  assert.match(html, /Two days of[\s\S]{0,100}services[\s\S]{0,100}for B2B companies/i);
  assert.match(html, /DUBAI MEDIA CITY/i);

  for (const id of ["offers", "spots", "talks", "waitlist"]) {
    assert.match(html, new RegExp(`id="${id}"`, "i"));
  }

  assert.match(html, />\s*For visitors\s*</i);
  assert.match(html, />\s*For exhibitors\s*</i);
  assert.match(html, /16 double-sided units,\s*32 full-day spots/i);
  assert.match(html, /12 OF 32 SPOTS SOLD/i);
  assert.match(html, /aria-label="150 offers"/i);
  assert.match(html, />\s*150\s*<\/strong>\s*<span>OFFERS</i);
  assert.match(html, /ask@thearena\.show/i);
  assert.doesNotMatch(html, /TEST DATA/i);
});

test("v6.08 CSS keeps its tokens, responsive breakpoints and core sections", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  for (const token of [
    "--ink: #151518",
    "--paper: #f1f2f4",
    "--surface: #fffdf7",
    "--yellow: #ffd43b",
    "--display: clamp(46px, 6.4vw, 84px)",
  ]) {
    assert.ok(css.includes(token), `missing CSS token: ${token}`);
  }

  for (const breakpoint of [980, 760, 720, 560, 480]) {
    assert.match(css, new RegExp(`@media\\s*\\(max-width:\\s*${breakpoint}px\\)`));
  }

  for (const selector of [
    ".page-shell",
    ".event-section",
    ".offers-section",
    ".visitor-pill",
    ".exhibitor-pill",
    ".waitlist-section",
    ".talks-section",
    ".trial-to-waitlist-route",
  ]) {
    assert.ok(css.includes(selector), `missing critical selector: ${selector}`);
  }
});

test("v6.08 source keeps the waitlist integration, consent and shipped assets", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(source, /const VERSION = "v6\.08"/);
  assert.match(source, /function Modal\(/);
  assert.match(source, /type ModalType = [^;]*"waitlist"/);
  assert.match(source, /fetch\("\/api\/waitlist"/);
  assert.match(source, /method:\s*"POST"/);
  assert.match(source, /consentAvailability:/);
  assert.match(source, /consentContact:/);
  assert.match(source, /name="limitedCapacityConsent"/);
  assert.match(source, /name="contactConsent"/);
  assert.match(source, /Joining the waitlist does not guarantee allocation/);

  const assets = [
    "../public/og.png",
    "../public/arena-spot.jpg",
    "../public/reference/media/promo-pingpong.mp4",
    "../public/speakers/amira-al-mansouri.jpg",
  ];
  for (const asset of assets) {
    const contents = await readFile(new URL(asset, import.meta.url));
    assert.ok(contents.byteLength > 0, `expected non-empty asset: ${asset}`);
  }

  assert.match(source, /\/reference\/media\/promo-pingpong\.mp4/);
  assert.match(source, /\/speakers\/amira-al-mansouri\.jpg/);
});
