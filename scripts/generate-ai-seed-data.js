const baseUrl =
  process.env.PORTFOLIO_API_URL ||
  process.env.EXPO_PUBLIC_PORTFOLIO_API_URL ||
  "http://127.0.0.1:8800";

const aiSeedPayloads = {
  riskVar: {
    returns: [-0.012, 0.023, -0.008, 0.015, -0.003, 0.019, -0.011, 0.007, 0.022, -0.005],
    confidence: 0.95,
    method: "historical",
  },
  riskVarParametric: {
    returns: [-0.01, 0.02, -0.005, 0.01, 0.015, -0.008, 0.012, -0.002, 0.018, -0.006],
    confidence: 0.99,
    method: "parametric",
  },
  fraudCheck: {
    amount: 2500,
    amount_currency: "USD",
    hour_of_day: 14,
    day_of_week: 2,
    recent_count_24h: 3,
  },
  fraudCheckWithSamples: {
    amount: 8500,
    amount_currency: "USD",
    hour_of_day: 3,
    day_of_week: 0,
    recent_count_24h: 12,
    reference_samples: [
      [100, 10, 1, 2],
      [500, 14, 2, 1],
      [1200, 9, 3, 0],
      [300, 16, 4, 4],
      [800, 11, 5, 2],
      [2500, 15, 0, 3],
      [400, 12, 1, 1],
      [1500, 13, 2, 5],
      [600, 17, 3, 2],
      [900, 10, 4, 1],
      [1100, 14, 5, 0],
      [350, 11, 0, 2],
    ],
  },
  surveillanceTrade: {
    quantity: 500,
    notional: 95000,
    side: "buy",
    recent_quantities: [100, 150, 200, 180, 220],
    recent_notionals: [19000, 28500, 38000, 34200, 41800],
  },
  surveillanceTradeSell: {
    quantity: 1200,
    notional: 504000,
    side: "sell",
    recent_quantities: [200, 300, 250],
    recent_notionals: [84000, 126000, 105000],
  },
  sentiment: {
    text: "Markets rallied strongly today as earnings beat expectations and inflation data came in below forecasts.",
  },
  sentimentNegative: {
    text: "Investors fear a sharp downturn amid rising defaults and tightening credit conditions.",
  },
  identityScore: {
    document_type: "passport",
    name_on_document: "Jane Smith",
    date_of_birth: "1985-06-20",
    id_number: "P123456789",
  },
  identityScoreMinimal: {
    document_type: "id_card",
    name_on_document: "John Doe",
    date_of_birth: null,
    id_number: null,
  },
};

const aiEndpoints = [
  { name: "risk/var (historical)", path: "/api/v1/ai/risk/var", payload: aiSeedPayloads.riskVar },
  { name: "risk/var (parametric)", path: "/api/v1/ai/risk/var", payload: aiSeedPayloads.riskVarParametric },
  { name: "fraud/check", path: "/api/v1/ai/fraud/check", payload: aiSeedPayloads.fraudCheck },
  { name: "fraud/check (with samples)", path: "/api/v1/ai/fraud/check", payload: aiSeedPayloads.fraudCheckWithSamples },
  { name: "surveillance/trade (buy)", path: "/api/v1/ai/surveillance/trade", payload: aiSeedPayloads.surveillanceTrade },
  { name: "surveillance/trade (sell)", path: "/api/v1/ai/surveillance/trade", payload: aiSeedPayloads.surveillanceTradeSell },
  { name: "sentiment", path: "/api/v1/ai/sentiment", payload: aiSeedPayloads.sentiment },
  { name: "sentiment (negative)", path: "/api/v1/ai/sentiment", payload: aiSeedPayloads.sentimentNegative },
  { name: "identity/score", path: "/api/v1/ai/identity/score", payload: aiSeedPayloads.identityScore },
  { name: "identity/score (minimal)", path: "/api/v1/ai/identity/score", payload: aiSeedPayloads.identityScoreMinimal },
];

async function postOne(base, { name, path, payload }) {
  const url = `${base.replace(/\/$/, "")}${path}`;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const reason = e.cause ? e.cause.code || e.cause.message : e.message;
    throw new Error(`${e.message} (${reason})`);
  }
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${text.slice(0, 200)}`);
  }
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { name, status: res.status, body };
}

function writeSeedJson() {
  const fs = require("fs");
  const path = require("path");
  const outPath = path.join(__dirname, "ai-seed-data.json");
  const data = { payloads: aiSeedPayloads, endpoints: aiEndpoints };
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
  console.log("Wrote", outPath);
}

async function main() {
  if (process.argv.includes("--output") || process.argv.includes("-o")) {
    writeSeedJson();
    return;
  }
  const base = baseUrl.replace(/\/$/, "");
  console.log("Posting AI seed requests to", base);
  const results = [];
  for (const ep of aiEndpoints) {
    try {
      const out = await postOne(base, ep);
      results.push(out);
      const preview = JSON.stringify(out.body);
      console.log("OK", ep.name, "->", preview.length > 80 ? preview.slice(0, 80) + "..." : preview);
    } catch (e) {
      console.error("FAIL", ep.name, e.message);
      results.push({ name: ep.name, error: e.message });
    }
  }
  const failed = results.filter((r) => r.error);
  const ok = results.length - failed.length;
  if (failed.length === aiEndpoints.length) {
    console.error("\nAPI may not be running. Start it with: pnpm run start:backend  or  pnpm run dev:api");
    process.exit(1);
  }
  if (failed.length) {
    console.log(ok + " OK, " + failed.length + " failed.");
  } else {
    console.log("All", results.length, "AI seed requests completed.");
  }
}

main();
