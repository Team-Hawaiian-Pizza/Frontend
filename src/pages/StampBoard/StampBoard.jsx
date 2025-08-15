import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./StampBoard.css";

function StampBoard() {
  const { id } = useParams(); // /stamp/:id 로 사용

  // (임시) 더미 데이터
  const [board, setBoard] = useState({
    id: id || "2",
    merchantName: "부대찌개",
    benefitText: "10개 모으면 음료 1잔 서비스",
    imageUrl: "",
    total: 10,
    earned: 6,
  });

  // ✅ API 연결 포인트 (완성되면 주석 해제)
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const res = await fetch(`/api/stamps/${id}`, { credentials: "include" });
  //       const data = await res.json();
  //       setBoard({
  //         id: data.id,
  //         merchantName: data.merchant.name,
  //         benefitText: data.benefitText,
  //         imageUrl: data.merchant.imageUrl,
  //         total: data.totalCount,
  //         earned: data.earnedCount,
  //       });
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   })();
  // }, [id]);

  const total = Math.max(1, Number(board.total) || 10);
  const earned = Math.max(0, Math.min(total, Number(board.earned) || 0));

  return (
    <main className="sb-main" aria-label="Stamp Board Page">
      <div className="sb-card">
        {/* 상단: 업체 이미지/이름/혜택 */}
        <header className="sb-header">
          <div className="sb-merchant">
            <div className="sb-avatar" aria-hidden>
              {board.imageUrl ? (
                <img src={board.imageUrl} alt={`${board.merchantName} 이미지`} />
              ) : (
                <div className="sb-avatar-ph" />
              )}
            </div>
            <div className="sb-merchant-meta">
              <h1 className="sb-merchant-name">{board.merchantName}</h1>
              <p className="sb-benefit">{board.benefitText}</p>
            </div>
          </div>
        </header>

        {/* 하단: 스탬프 10개 */}
        <section className="sb-board">
          <div className="sb-board-inner">
            {Array.from({ length: total }, (_, i) => {
              const idx = i + 1;
              const got = idx <= earned;
              return (
                <div
                  key={idx}
                  className={`sb-stamp ${got ? "is-earned" : "is-empty"}`}
                  aria-label={`스탬프 ${idx} ${got ? "획득" : "미획득"}`}
                >
                  <span className="sb-stamp-index">{idx}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}


export default StampBoard;