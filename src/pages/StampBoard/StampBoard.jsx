// src/pages/StampBoard/StampBoard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./StampBoard.css";
import api from "../../api/axios.js";

function StampBoard() {
  const { id: routeBrandId } = useParams(); // /stamp/:id
  const brandId = Number(routeBrandId);

  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(10);
  const [filled, setFilled] = useState(0);

  const circles = useMemo(() => Array.from({ length: total }), [total]);
  const left = Math.max(0, total - filled);

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        if (!brandId) throw new Error("브랜드 ID가 없습니다.");
        const res = await api.get(`/rewards/stamps/${brandId}`); // ✅ stamps 고정
        const data = res?.data || {};
        if (!mounted) return;
        setTotal(Number(data.total ?? 10));
        setFilled(Number(data.filled ?? 0));
      } catch (e) {
        console.error("스탬프 현황 조회 실패:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStatus();
    return () => { mounted = false; };
  }, [brandId]);

  const punch = async () => {
    try {
      const res = await api.post(`/rewards/stamps/${brandId}/punch`); // ✅ stamps 고정
      const data = res?.data || {};
      if (data.already_full) {
        setFilled(total);
        alert("이미 가득 찼습니다. 쿠폰함을 확인하세요.");
        return;
      }
      if (typeof data.filled === "number") setFilled(data.filled);
      if (typeof data.total === "number") setTotal(data.total);
      if ((data.filled ?? 0) >= (data.total ?? total)) {
        alert("🎉 완료! 쿠폰이 발급되었습니다. 쿠폰함에서 확인하세요.");
      }
    } catch (e) {
      console.error("스탬프 적립 실패:", e);
      alert("스탬프 적립 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="sb-page">
        <div className="sb-card" style={{ padding: 16 }}>불러오는 중…</div>
      </div>
    );
  }

  return (
    <div className="sb-page">
      <div className="sb-card">
        <div className="sb-header">
          <h2>스탬프 도장판</h2>
          <div className="sb-sub">완성 기준: {total}개</div>
          <div className="sb-badge">진행: {filled} / {total}</div>
        </div>

        <div className="sb-grid">
          {circles.map((_, i) => (
            <div key={i} className={`sb-dot ${i < filled ? "on" : ""}`} />
          ))}
        </div>

        <div className="sb-actions">
          {left > 0 ? (
            <>
              <button className="mp-btn mp-btn-primary" onClick={punch}>
                스탬프 적립(+1)
              </button>
              <span className="sb-left">남은 개수: {left}</span>
            </>
          ) : (
            <div className="sb-done">🎉 완료! 쿠폰이 발급되었습니다. 쿠폰함에서 확인하세요.</div>
          )}
        </div>
      </div>
    </div>
  );
}



export default StampBoard;