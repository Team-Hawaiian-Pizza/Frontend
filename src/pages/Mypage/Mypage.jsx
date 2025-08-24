// src/pages/MyPage/MyPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";
import BusinessCard from "../../components/BusinessCard";
import api from "../../api/axios.js";

// API → UI 매핑 유틸
const genderToMF = (g) => (g === "male" ? "M" : g === "female" ? "F" : "");
const ageBandToAge = (band) => {
  // "20s" -> 20 (UI가 숫자 나이를 기대하는 경우)
  const m = /^(\d+)s$/.exec(band || "");
  return m ? Number(m[1]) : "";
};
const makeAddress = (prov, city) =>
  [prov, city].filter(Boolean).join(" ");

export default function MyPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    sex: "",
    age: "",
    avatarUrl: "",
    phone: "",
    email: "",
    address: "",
    tag: "",              // 서버 스키마엔 없으니 빈값 유지 (필요 시 다른 필드로 매핑)
    temperature: 0,
  });

  const [friends, setFriends] = useState([]);
  const [stampBoards, setStampBoards] = useState([]);

  // ===== 데이터 로드 =====
  useEffect(() => {
    (async () => {
      try {
        // 1) 프로필
        const res = await api.get("/users/me");
        const u = res.data;
        setProfile({
          name: u.name ?? "",
          sex: genderToMF(u.gender),         // "male"/"female" -> "M"/"F"
          age: ageBandToAge(u.age_band),     // "20s" -> 20
          avatarUrl: u.avatar_url ?? "",
          phone: u.phone ?? "",
          email: u.email ?? "",
          address: makeAddress(u.province_name, u.city_name),
          tag: "",                           // TODO: 서버에서 태그/전문분야 필드 생기면 매핑
          temperature: Number(u.manner_temperature ?? 0),
        });

        // 2) 친구목록 (엔드포인트 준비되면 아래 주석을 실제로 교체)
        // const fr = await api.get("/users/me/friends");
        // setFriends(fr.data.list);
        setFriends([]); // TODO: 엔드포인트 연결

        // 3) 도장판 목록 (엔드포인트 준비되면 교체)
        // const st = await api.get("/users/me/stampboards");
        // setStampBoards(st.data.list);
        setStampBoards([]); // TODO: 엔드포인트 연결
      } catch (e) {
        console.error(e);
        alert("마이페이지 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ===== 네비게이션 핸들러 =====
  const handleEditCard = () => navigate("/card/edit");
  const handleCoupon = () => navigate("/coupon");
  const handleOpenStamp = (id) => navigate(`/stamp/${id}`);
  const handleChat = (id) => navigate(`/chat/${id}`);

  const clampedTemp = Math.max(0, Math.min(100, Number(profile.temperature) || 0));

  if (loading) return <main className="mp-main"><div className="mp-card" style={{padding:16}}>불러오는 중…</div></main>;

  return (
    <main className="mp-main" aria-label="My Page">
      <div className="mp-card">
        {/* ===== 상단: 좌 명함 / 우 매너온도+친구 ===== */}
        <section className="mp-profile-stack">
          {/* 좌측 : 명함 */}
          <div className="mp-left-col">
            <div className="card-wrap">
              <BusinessCard
                profileImage={profile.avatarUrl}
                name={profile.name}
                sex={profile.sex}
                age={profile.age}
                tag={profile.tag}
                phone={profile.phone}
                email={profile.email}
                address={profile.address}
                approved={true}
              />
            </div>
            <div className="mp-profile-actions">
              <button type="button" className="mp-btn mp-btn-primary" onClick={handleEditCard}>
                명함 수정
              </button>
            </div>
          </div>

          {/* 우측 : 매너온도 + 친구목록 */}
          <div className="mp-right-col">
            {/* 매너온도 */}
            <div className="mp-thermo-wrap">
              <div className="mp-thermo-label">매너온도</div>
              <div
                className="mp-thermo"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={clampedTemp}
              >
                <div className="mp-thermo-fill" style={{ width: `${clampedTemp}%` }} />
              </div>
              <div className="mp-thermo-scale">
                <span>0</span>
                <span>100°c</span>
              </div>
            </div>

            {/* 친구목록 */}
            <div className="mp-friends-header">
              친구목록 : <strong>{friends.length}</strong>
            </div>
            <div className="mp-friends" role="list">
              {friends.length === 0 ? (
                <div className="mp-friend-empty">친구가 없습니다.</div>
              ) : (
                friends.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="mp-friend-row"
                    onClick={() => handleChat(f.id)}
                    role="listitem"
                  >
                    <div className="mp-friend-avatar">
                      {f.avatar ? (
                        <img src={f.avatar} alt={`${f.name} 프로필`} />
                      ) : (
                        <div className="mp-friend-ph" />
                      )}
                    </div>
                    <div className="mp-friend-meta">
                      <div className="mp-friend-name">{f.name}</div>
                      <div className="mp-friend-msg">{f.lastMsg ?? ""}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ===== 도장판 ===== */}
        <section className="mp-stamps">
          <div className="mp-sec-header">
            <h3 className="mp-sec-title">소개 도장판</h3>
            <button type="button" className="mp-btn mp-btn-ghost" onClick={handleCoupon}>
              쿠폰함
            </button>
          </div>

          <div className="mp-stamp-grid">
            {stampBoards.length === 0 ? (
              <div className="mp-stamp-empty">도장판이 없습니다.</div>
            ) : (
              stampBoards.map((s) => (
                <article key={s.id} className="mp-stamp-card">
                  <div className="mp-stamp-thumb" aria-hidden />
                  <div className="mp-stamp-title">{s.title}</div>
                  <button
                    type="button"
                    className="mp-btn mp-btn-light"
                    onClick={() => handleOpenStamp(s.id)}
                  >
                    도장판 보기
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
