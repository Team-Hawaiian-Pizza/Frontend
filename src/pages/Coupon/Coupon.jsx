import React, { useEffect, useState } from "react";
import "./Coupon.css";
import { getCoupons, markCouponUsed, applyReward, ensureDummySeed } from "../../lib/loyalty";

// 데모: 상호명이 없는 쿠폰은 기본 상호명으로 표시
const DEFAULT_MERCHANT = "건너건너";

const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

// 만료일: 쿠폰 id의 타임스탬프 기준 +365일 (데모용)
// 실제 서비스에서는 서버에서 내려준 expiresAt 사용 권장
const getExpiry = (coupon) => {
  if (coupon.expiresAt) return formatDate(new Date(coupon.expiresAt));
  const ts = Number(String(coupon.id || "").replace("cp_", "")) || Date.now();
  const d = new Date(ts);
  d.setFullYear(d.getFullYear() + 1);
  return formatDate(d);
};

const cleanTitle = (title) => String(title || "").replace(/\(사용됨\)$/g, "").trim();

export default function Coupon() {
  const [coupons, setCoupons] = useState([]);

  const refresh = () => setCoupons(getCoupons());

  useEffect(() => {
    ensureDummySeed(); // 더미 쿠폰 자동 주입
    refresh();
  }, []);

  const useCoupon = (c) => {
    if (c.used) return;
    // 데모 장바구니
    const cart = [
      { id: "americano", categoryId: "coffee", price: 4500, optionPrice: 500, qty: 1 },
      { id: "sandwich", categoryId: "food", price: 6500, qty: 1 },
    ];
    const { discount, note } = applyReward(cart, c.reward);
    alert(`할인액: ${discount.toLocaleString()}원\n(${note})`);
    markCouponUsed(c.id);
    refresh();
  };

  return (
    <div className="cp-page">
      <div className="cp-card">
        <h2 className="cp-title-page">쿠폰함</h2>

        {coupons.length === 0 && <div className="cp-empty">보유 쿠폰이 없습니다.</div>}

        <div className="cp-list">
          {coupons.map((c) => (
            <article key={c.id} className={`cp-item ${c.used ? "used" : ""}`}>
              {/* 왼쪽: 동그라미 + 텍스트 */}
              <div className="cp-left">
                <div className="cp-avatar" aria-hidden />
                <div className="cp-texts">
                  <div className="cp-line">
                    <span className="cp-merchant">{c.merchant || DEFAULT_MERCHANT}</span>
                    <span className="cp-benefit">{cleanTitle(c.title)}</span>
                  </div>
                  <div className="cp-sub">사용기간 - {getExpiry(c)}</div>
                </div>
              </div>

              {/* 오른쪽: 버튼 */}
              <button
                className="cp-btn"
                disabled={c.used}
                onClick={() => useCoupon(c)}
                aria-label={c.used ? "사용 완료" : "쿠폰 사용하기"}
              >
                {c.used ? "사용 완료" : "사용하기"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
