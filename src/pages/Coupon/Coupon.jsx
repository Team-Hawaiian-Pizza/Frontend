import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Coupon.css";

function Coupon() {
  // 라우트가 /stamp/:id 로도 재사용 가능하게 구성
  const { id } = useParams(); // /coupon에서는 undefined일 수 있음

  // (임시) 더미 데이터
  const [coupon, setCoupon] = useState({
    id: id || "2",
    merchantName: "부대찌개",
    benefitText: "10개 모으면 음료 1잔 서비스",
    imageUrl: "", // 상단 업체 이미지 (없으면 플레이스홀더)
    total: 10,
    earned: 6, // 0~10
  });

  // ✅ API 연결 포인트 (완성되면 주석 해제)
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       // 예시1) /stamp/:id 구조일 때
  //       // const res = await fetch(`/api/stamps/${id}`, { credentials: "include" });
  //       // const data = await res.json();
  //
  //       // 예시2) /coupon (내 쿠폰 단건 or 선택된 쿠폰)
  //       // const res = await fetch("/api/coupon/current", { credentials: "include" });
  //       // const data = await res.json();
  //
  //       // setCoupon({
  //       //   id: data.id,
  //       //   merchantName: data.merchant.name,
  //       //   benefitText: data.benefitText,
  //       //   imageUrl: data.merchant.imageUrl,
  //       //   total: data.totalCount,   // 보통 10
  //       //   earned: data.earnedCount, // 0~total
  //       // });
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   })();
  // }, [id]);

  // 안전하게 0~total로 클램프
  const total = Math.max(1, Number(coupon.total) || 10);
  const earned = Math.max(0, Math.min(total, Number(coupon.earned) || 0));

  return (
    <main className="cp-main" aria-label="Coupon Page">
      <div className="cp-card">
        {/* 상단: 업체 이미지/이름/혜택 */}
        <header className="cp-header">
          <div className="cp-merchant">
            <div className="cp-avatar" aria-hidden>
              {coupon.imageUrl ? (
                <img src={coupon.imageUrl} alt={`${coupon.merchantName} 이미지`} />
              ) : (
                <div className="cp-avatar-ph" />
              )}
            </div>
            <div className="cp-merchant-meta">
              <h1 className="cp-merchant-name">{coupon.merchantName}</h1>
              <p className="cp-benefit">{coupon.benefitText}</p>
            </div>
          </div>
        </header>

        {/* 하단: 스탬프 보드 */}
        <section className="cp-board">
          <div className="cp-board-inner">
            {Array.from({ length: total }, (_, i) => {
              const idx = i + 1;
              const got = idx <= earned;
              return (
                <div
                  key={idx}
                  className={`cp-stamp ${got ? "is-earned" : "is-empty"}`}
                  aria-label={`스탬프 ${idx} ${got ? "획득" : "미획득"}`}
                >
                  <span className="cp-stamp-index">{idx}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Coupon;