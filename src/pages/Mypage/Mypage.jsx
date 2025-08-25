// src/pages/MyPage/MyPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MyPage.css";
import SmartBusinessCard from "../../components/SmartBusinessCard.jsx";
import api from "../../api/axios.js";

export default function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [stampBoards, setStampBoards] = useState([]);
// dataURL / 순수 base64 / http URL 전부 수용 + 패딩 보정
const normalizeBrandImage = (v) => {
  if (!v) return "";

  const strip = (s) =>
    String(s)
      .replace(/^\s*\[+|\]+?\s*$/g, "") // 양끝 대괄호 제거
      .replace(/^"+|"+$/g, "")          // 양끝 큰따옴표 제거
      .replace(/^'+|'+$/g, "")          // 양끝 작은따옴표 제거
      .replace(/\s+/g, "");             // 공백/개행 제거

  let s = strip(v);

  // 이미 dataURL 이면 본문만 패딩보정
  if (s.startsWith("data:image/")) {
    const i = s.indexOf(",");
    const head = s.slice(0, i + 1);
    let body = s.slice(i + 1);
    const pad = body.length % 4;
    if (pad) body += "=".repeat(4 - pad);
    return head + body;
  }

  // http(s) 링크는 그대로
  if (/^https?:\/\//i.test(s)) return s;

  // 순수 base64면 PNG로 가정해서 헤더 붙이고 패딩보정
  if (/^[A-Za-z0-9+/=]+$/.test(s)) {
    const pad = s.length % 4;
    if (pad) s += "=".repeat(4 - pad);
    return `data:image/png;base64,${s}`;
  }

  return s; // 혹시 남는 특수 케이스
};
  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      try {
        const userId = Number(localStorage.getItem("user_id") || 0);

        // ✅ TDZ 회피: 비구조화 대신 명시 변수에 담기 (이름 충돌도 방지)
        const meResp      = await api.get("/users/me", { params: { ts: Date.now() } });
        const usersResp   = await api.get("/users/all", { params: { ts: Date.now() } });
        const stampsResp  = await api.get("/rewards/stamps/all", { params: { ts: Date.now() } });

        if (!alive) return;

        // 친구 목록
        const allUsers = usersResp?.data?.results ?? [];
        setFriends(Array.isArray(allUsers) ? allUsers.filter(u => u?.id !== userId).slice(0, 10) : []);

        // 스탬프판
        const allStamps = stampsResp?.data?.data ?? [];
        setStampBoards(Array.isArray(allStamps) ? allStamps : []);
        console.log(allStamps);

      } catch (err) {
        console.error("마이페이지 로드 실패:", err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadData();
    // 탭 복귀 시 재로딩 (이벤트가 오래 붙어 있어도 에러 안나게 try/catch)
    const onVis = () => {
      if (document.visibilityState === "visible") {
        try { loadData(); } catch (e) { /* noop */ }
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [location.state?.refresh]); // 수정 후 돌아오면 강제 새로고침

  const handleEditCard     = () => navigate("/card/edit");
  const handleCoupon       = () => navigate("/coupon");
  const handleOpenStamp    = (brandId) => navigate(`/stamp/${brandId}`);
  const handleProfileClick = (id) => navigate(`/profile/${id}`);

  if (loading) {
    return (
      <main className="mp-main">
        <div className="mp-card" style={{ padding: 16 }}>불러오는 중…</div>
      </main>
    );
  }

  return (
    <main className="mp-main" aria-label="My Page">
      <div className="mp-card">
        {/* 명함 */}
        <section className="mp-profile-stack">
          <div className="mp-left-col">
            <div className="card-wrap"><SmartBusinessCard /></div>
            <div className="mp-profile-actions">
              <button type="button" className="mp-btn mp-btn-primary" onClick={handleEditCard}>
                명함 수정
              </button>
            </div>
          </div>

          {/* 친구목록 */}
          <div className="mp-right-col">
            <div className="mp-friends-header">친구목록 : <strong>{friends.length}</strong></div>
            <div className="mp-friends" role="list">
              {friends.length ? friends.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="mp-friend-row"
                  onClick={() => handleProfileClick(f.id)}
                  role="listitem"
                >
                  <div className="mp-friend-avatar">
                    {f.avatar_url ? (
                      <img src={f.avatar_url} alt={`${f.name || f.username} 프로필`} />
                    ) : (
                      <div className="mp-friend-ph" />
                    )}
                  </div>
                  <div className="mp-friend-meta">
                    <div className="mp-friend-name">{f.name || f.username}</div>
                    <div className="mp-friend-msg">{f.intro || "안녕하세요!"}</div>
                  </div>
                </button>
              )) : (
                <div style={{ padding: 20, textAlign: "center", color: "#666" }}>친구가 없습니다</div>
              )}
            </div>
          </div>
        </section>

        {/* 스탬프판 */}
        <section className="mp-stamps">
          <div className="mp-sec-header">
            <h3 className="mp-sec-title">내 스탬프판</h3>
            <button type="button" className="mp-btn mp-btn-ghost" onClick={handleCoupon}>쿠폰함</button>
          </div>

 <div className="mp-stamp-grid">
  {stampBoards.length ? stampBoards.map((s) => {
    const src = normalizeBrandImage(s.brand_image);
    return (
      <article key={s.brand_id} className="mp-stamp-card">
        <div
          className="mp-stamp-thumb"
          aria-hidden
          style={{
            backgroundImage: src ? `url("${src}")` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="mp-stamp-title">{s.brand_name}</div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
          {s.filled} / {s.total} 스탬프
        </div>
        <button
          type="button"
          className="mp-btn mp-btn-light"
          onClick={() => handleOpenStamp(s.brand_id)}
        >
          도장판 보기
        </button>
      </article>
    );
  }) : (
    <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
      스탬프판이 없습니다
    </div>
  )}
</div>

        </section>
      </div>
    </main>
  );
}
