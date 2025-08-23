// src/lib/loyalty.js
const NS = "me:default";
const LS_KEY = "loyalty";

const read = () => JSON.parse(localStorage.getItem(LS_KEY) || "{}");
const write = (v) => localStorage.setItem(LS_KEY, JSON.stringify(v));
const ensureRow = (db) => {
  db[NS] = db[NS] || { progress: 0, coupons: [] };
  return db[NS];
};

export function getProgress() {
  const db = read(); return db[NS]?.progress ?? 0;
}
export function setProgress(value) {
  const db = read(); ensureRow(db).progress = value; write(db);
}
export function issueCoupon(coupon) {
  const db = read();
  const row = ensureRow(db);
  const obj = { id: `cp_${Date.now()}`, used: false, ...coupon };
  row.coupons.push(obj); write(db);
  return obj;
}
export function getCoupons() {
  const db = read(); return db[NS]?.coupons || [];
}
export function markCouponUsed(couponId) {
  const db = read();
  const row = ensureRow(db);
  const c = row.coupons.find(x => x.id === couponId);
  if (c) c.used = true;
  write(db);
}

/* ✅ 전체 초기화(도장/쿠폰/시드 플래그 제거) */
export function clearLoyalty() {
  const db = read();
  delete db[NS];
  write(db);
  localStorage.removeItem("loyaltySeeded");
}

// 장바구니 할인/증정 계산 (데모)
export function applyReward(cart, reward) {
  const items = cart.map(i => ({
    ...i,
    unit: (i.price + (i.optionPrice || 0)),
    total: (i.price + (i.optionPrice || 0)) * (i.qty || 1)
  }));
  const pick = (item, scope, pids, cids) => {
    if (scope === "all") return true;
    if (scope === "includeProducts") return pids?.includes(item.id);
    if (scope === "includeCategories") return cids?.includes(item.categoryId);
    return false;
  };

  if (reward.type === "gift") {
    const cand = items.filter(i => pick(i, "includeProducts", reward.gift.productIds, reward.gift.categoryIds));
    if (!cand.length) return { discount: 0, note: "eligible none" };
    const target = cand.sort((a,b)=>b.total - a.total)[0];
    return { discount: target.total, note: `gift:${target.id}` };
  }

  const scope = reward.discount.scope;
  const eligible = items.filter(i => pick(i, scope, reward.discount.productIds, reward.discount.categoryIds));
  const total = eligible.reduce((s,i)=>s + i.total, 0);
  if (total <= 0) return { discount: 0, note: "eligible none" };

  let discount = 0;
  if (reward.discount.mode === "percent") discount = Math.floor(total * (reward.discount.value / 100));
  else discount = Math.min(reward.discount.value, total);

  return { discount, note: "discount" };
}

/* 더미데이터 시드 */
export function ensureDummySeed() {
  const seeded = localStorage.getItem("loyaltySeeded");
  if (seeded) return;

  const now = Date.now();
  const db = read();
  db[NS] = {
    progress: 6,
    coupons: [
      { id: `cp_${now-2}`, title: "20% 할인 쿠폰", used: false,
        reward: { type: "discount", discount: { mode: "percent", value: 20, scope: "all" } } },
      { id: `cp_${now-1}`, title: "아메리카노 1잔 증정", used: false,
        reward: { type: "gift", gift: { productIds: ["americano"], categoryIds: [] } } },
      { id: `cp_${now-3}`, title: "5,000원 할인 쿠폰(사용됨)", used: true,
        reward: { type: "discount", discount: { mode: "amount", value: 5000, scope: "all" } } },
    ],
  };
  write(db);
  localStorage.setItem("loyaltySeeded", "1");
}
