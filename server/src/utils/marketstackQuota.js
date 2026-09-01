const fs = require('fs');
const path = require('path');

const MONTHLY_LIMIT = Number(process.env.MARKETSTACK_MONTHLY_LIMIT) || 10_000;
const USAGE_FILE = path.join(__dirname, '../../data/marketstack-usage.json');

class MarketstackQuotaError extends Error {
  constructor(message = 'Marketstack monthly request limit reached') {
    super(message);
    this.name = 'MarketstackQuotaError';
    this.code = 'MARKETSTACK_QUOTA_EXHAUSTED';
  }
}

function currentMonthKey() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function loadUsage() {
  try {
    const raw = fs.readFileSync(USAGE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed?.month === currentMonthKey()) {
      return {
        month: parsed.month,
        count: Number(parsed.count) || 0,
        exhausted: Boolean(parsed.exhausted),
      };
    }
  } catch {
    // missing or corrupt file — start fresh for this month
  }

  return {
    month: currentMonthKey(),
    count: 0,
    exhausted: false,
  };
}

function saveUsage(usage) {
  fs.mkdirSync(path.dirname(USAGE_FILE), { recursive: true });
  fs.writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2));
}

function getMarketstackUsage() {
  const usage = loadUsage();
  return {
    month: usage.month,
    count: usage.count,
    limit: MONTHLY_LIMIT,
    remaining: Math.max(0, MONTHLY_LIMIT - usage.count),
    exhausted: usage.exhausted || usage.count >= MONTHLY_LIMIT,
  };
}

function canUseMarketstack() {
  const usage = loadUsage();
  if (usage.month !== currentMonthKey()) {
    return true;
  }
  return usage.count < MONTHLY_LIMIT;
}

function recordMarketstackRequest() {
  const month = currentMonthKey();
  let usage = loadUsage();

  if (usage.month !== month) {
    usage = { month, count: 0, exhausted: false };
  }

  if (usage.count >= MONTHLY_LIMIT) {
    usage.exhausted = true;
    saveUsage(usage);
    throw new MarketstackQuotaError();
  }

  usage.count += 1;
  if (usage.count >= MONTHLY_LIMIT) {
    usage.exhausted = true;
    console.warn(
      `[marketstack] Monthly limit reached (${MONTHLY_LIMIT}). Marketstack disabled until ${month} ends.`,
    );
  }

  saveUsage(usage);
  return usage;
}

module.exports = {
  MarketstackQuotaError,
  MONTHLY_LIMIT,
  canUseMarketstack,
  getMarketstackUsage,
  recordMarketstackRequest,
};
