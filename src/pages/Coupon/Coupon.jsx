// src/pages/Coupon/Coupon.jsx
import React, { useEffect, useState } from "react";
import "./Coupon.css";
import api from "../../api/axios.js";

const DEFAULT_MERCHANT = "건너건너";

const fmt = (isoOrNull) => {
  if (!isoOrNull) return "상시";
  const d = new Date(isoOrNull);
  if (Number.isNaN(d.getTime())) return "상시";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

function Coupon() {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);

  const load = async () => {
    try {
      const res = await api.get("/rewards/coupons");
      const list = res?.data?.data || [];
      setCoupons(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("쿠폰 목록 조회 실패:", e);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const useCoupon = async (c) => {
    if (!c?.id || c.used) return;
    try {
      const res = await api.post(`/rewards/coupons/${c.id}/use`);
      const data = res?.data || {};
      if (data.ok) {
        alert("쿠폰 사용 완료!");
      } else if (data.already_used) {
        alert("이미 사용한 쿠폰입니다.");
      } else if (data.expired) {
        alert("만료된 쿠폰입니다.");
      } else {
        alert("쿠폰 사용 처리에 실패했습니다.");
      }
      // 새 상태 반영
      await load();
    } catch (e) {
      console.error("쿠폰 사용 실패:", e);
      alert("쿠폰 사용 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="cp-page">
        <div className="cp-card" style={{ padding: 16 }}>불러오는 중…</div>
      </div>
    );
  }

  return (
    <div className="cp-page">
      <div className="cp-card">
        <h2 className="cp-title-page">쿠폰함</h2>

        {coupons.length === 0 && <div className="cp-empty">보유 쿠폰이 없습니다.</div>}

        <div className="cp-list">
          {coupons.map((c) => (
            <article key={c.id} className={`cp-item ${c.used ? "used" : ""}`}>
              <div className="cp-left">
                <div className="cp-avatar" aria-hidden />
                <div className="cp-texts">
                  <div className="cp-line">
                    <span className="cp-merchant">{c.brand || DEFAULT_MERCHANT}</span>
                    <span className="cp-benefit">{c.title}</span>
                  </div>
                  <div className="cp-sub">
                    사용기간 - {fmt(c.expires_at)}
                  </div>
                </div>
              </div>

              <button
                className="cp-btn"
                disabled={Boolean(c.used)}
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

export default Coupon;