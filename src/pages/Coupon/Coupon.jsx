import React, { useEffect, useState } from "react";
import "./Coupon.css";

function Coupon() {
  // (임시) 더미 쿠폰 리스트
  const [coupons, setCoupons] = useState([
    {
      id: 1,
      merchantName: "부대찌개",
      benefit: "음료수 1잔 무료",
      expiresAt: "2025-08-08",
      imageUrl: "",
    },
    {
      id: 2,
      merchantName: "빵집",
      benefit: "식빵 1개 무료",
      expiresAt: "2025-09-30",
      imageUrl: "",
    },
    {
      id: 3,
      merchantName: "카페",
      benefit: "아메리카노 1잔 무료",
      expiresAt: "2025-10-31",
      imageUrl: "",
    },
  ]);

  // ✅ API 연동 포인트 (완성되면 주석 해제)
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const res = await fetch("/api/coupons/me", { credentials: "include" });
  //       const list = await res.json();
  //       // list 형태 예시: [{ id, merchantName, benefit, expiresAt, imageUrl }]
  //       setCoupons(list);
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   })();
  // }, []);

  const formatDate = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  };

  return (
    <main className="cpl-main" aria-label="Coupon list">
      <div className="cpl-container">
        <h1 className="cpl-title">쿠폰함</h1>

        <ul className="cpl-list">
          {coupons.map((c) => (
            <li key={c.id} className="cpl-item">
              {/* 좌측: 이미지 + 업체명 + 혜택 / 하단: 사용기한 */}
              <div className="cpl-left">
                <div className="cpl-avatar" aria-hidden>
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={`${c.merchantName} 이미지`} />
                  ) : (
                    <div className="cpl-avatar-ph" />
                  )}
                </div>

                <div className="cpl-texts">
                  <div className="cpl-line">
                    <span className="cpl-merchant">{c.merchantName}</span>
                    <span className="cpl-benefit">{c.benefit}</span>
                  </div>
                  <div className="cpl-exp">사용기간 ~{formatDate(c.expiresAt)}</div>
                </div>
              </div>

              {/* 우측: 사용 버튼 (지금은 비워둠/추후 QR 페이지 연계) */}
              <div className="cpl-right">
                <button
                  type="button"
                  className="cpl-use-btn"
                  onClick={() => {
                    // TODO: QR 페이지로 이동
                    // navigate(`/coupon/qr/${c.id}`);
                  }}
                >
                  사용하기
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default Coupon;