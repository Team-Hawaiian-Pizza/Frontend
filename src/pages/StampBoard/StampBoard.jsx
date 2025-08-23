import React, { useEffect, useMemo, useState } from "react";
import "./StampBoard.css"; // 아래 4) CSS 만들기
import { stampConfig } from "../../config/stampConfig";
import { getProgress, setProgress, issueCoupon, ensureDummySeed, clearLoyalty } from "../../lib/loyalty";

export default function StampBoard() {
  const [progress, setProg] = useState(0);
  const circles = useMemo(() => Array.from({ length: stampConfig.completionCount }), []);

  useEffect(() => {
    ensureDummySeed();            // ✅ 더미데이터 주입
    setProg(getProgress());
  }, []);

  const left = Math.max(0, stampConfig.completionCount - progress);

  const addOne = () => {
    const next = Math.min(stampConfig.completionCount, progress + 1);
    setProgress(next); setProg(next);
    if (next >= stampConfig.completionCount) {
      issueCoupon({
        title: previewTitle(stampConfig.reward),
        reward: stampConfig.reward,
      });
    }
  };

  const resetAll = () => {
    clearLoyalty(); localStorage.removeItem("loyaltySeeded"); setProg(0);
  };

  return (
    <div className="sb-page">
      <div className="sb-card">
        <div className="sb-header">
          <h2>스탬프 도장판</h2>
          <div className="sb-sub">완성 기준: {stampConfig.completionCount}개</div>
          <div className="sb-badge">보상 미리보기: {previewTitle(stampConfig.reward)}</div>
        </div>

        <div className="sb-grid">
          {circles.map((_,i)=>(
            <div key={i} className={`sb-dot ${i < progress ? "on" : ""}`} />
          ))}
        </div>

        <div className="sb-actions">
          {left > 0 ? (
            <>
              <button className="mp-btn mp-btn-primary" onClick={addOne}>스탬프 적립(+1)</button>
              <span className="sb-left">남은 개수: {left}</span>
            </>
          ) : (
            <div className="sb-done">🎉 완료! 쿠폰이 발급되었습니다. 쿠폰함에서 확인하세요.</div>
          )}
          <button className="mp-btn mp-btn-light" onClick={resetAll}>리셋</button>
        </div>
      </div>
    </div>
  );
}

function previewTitle(reward) {
  if (reward.type === "gift") return "지정 상품 1개 증정";
  if (reward.discount?.mode === "percent") return `${reward.discount.value}% 할인`;
  return `${Number(reward.discount?.value || 0).toLocaleString()}원 할인`;
}
