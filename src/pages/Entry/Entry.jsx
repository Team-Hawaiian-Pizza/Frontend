import React from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/Entry.css";

export default function EntryPage() {
  const navigate = useNavigate();

  const handleGuest = () => {
    // TODO: 로컬 스토리지 기반 게스트 세션 예시
    localStorage.setItem("guest", "true");
    navigate("/"); // 체험 시작 경로(또는 /main 등)로 바꿔도 됨
  };

  return (
    <section className="entry">
      <div className="entry__card">
        {/* 로고 영역 (이미지 쓰면 <img src="/logo.svg" alt="건너건너" />) */}
        <div className="entry__logo">건너건너</div>

        <p className="entry__slogan">“slogan ment”</p>

        <div className="entry__actions">
          <button className="entry__btn" onClick={() => navigate("/login")}>Login</button>
          <button className="entry__btn" onClick={() => navigate("/signup")}>Sign Up</button>
          <button className="entry__btn entry__btn--ghost" onClick={handleGuest}>
            Enter as Guest
          </button>
        </div>
      </div>
    </section>
  );
}
