// src/components/BusinessCard/SmartBusinessCard.jsx
import React, { useEffect, useState } from "react";
import BusinessCard from "./BusinessCard.jsx"; // UI 컴포넌트(질문에 준 BusinessCard)
import api from "../api/axios.js";

// 유틸
const genderToMF = (g) => (g === "male" ? "M" : g === "female" ? "F" : "");
const ageBandToDisplay = (band) => {
  const m = /^(\d+)s$/.exec(band || "");
  return m ? `${m[1]}대` : "";
};
const makeAddress = (prov, city) => [prov, city].filter(Boolean).join(" ");

function SmartBusinessCard({
  userId,          // 보고 싶은 "프로필의 주인" id (없으면 로그인 유저)
  className = "",
  tagFallback = "React",
}) {
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const viewerId = localStorage.getItem("user_id"); // 조회자
        const profileOwnerId = userId || viewerId;        // 프로필 주인
        if (!profileOwnerId) throw new Error("user_id가 없습니다.");

        // 인터셉터가 User-Id 헤더를 넣어줌 (viewer)
        const res = await api.get(`/users/profiles/${profileOwnerId}`);
        const u = res?.data ?? {};

        // 본인 여부: (응답에 email/phone 원본이 오거나 id가 같으면 본인으로 판단)
        const isSelf = String(u?.id) === String(viewerId);
        const connected = u?.connection_status === "CONNECTED";

        // 표시값(본인/연결됨이면 원본, 아니면 마스킹값 사용)
        const phone = (isSelf || connected) ? (u.phone || u.masked_phone) : u.masked_phone;
        const email = (isSelf || connected) ? (u.email || u.masked_email) : u.masked_email;

        // blur 여부: 연결 전/타인일 때 true
        const approved = Boolean(isSelf || connected);

        setCard({
          profileImage: u.avatar_url || "",
          // 일부 케이스에서 name이 안 올 수도 있어 기본값 처리
          name: u.name || (isSelf ? "내 명함" : `사용자${u.id ?? ""}`),
          sex: genderToMF(u.gender),
          age: ageBandToDisplay(u.age_band),
          tag: u.tag || tagFallback,
          phone: phone || "010-****-****",
          email: email || "",
          address: makeAddress(u.province_name, u.city_name),
          approved, // UI에서 blur 처리에 사용
        });
      } catch (e) {
        console.error("명함 로드 실패:", e);
        setCard({
          profileImage: "",
          name: "사용자",
          sex: "",
          age: "",
          tag: tagFallback,
          phone: "010-****-****",
          email: "",
          address: "",
          approved: false,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, tagFallback]);

  if (loading) {
    return (
      <div className={`card-container ${className}`} style={{ opacity: 0.7 }}>
        <div className="card-header">
          <div className="profile-img"><div className="placeholder">…</div></div>
          <div className="profile-info">
            <div className="name">로딩 중…</div>
            <div className="sub-info">–</div>
          </div>
          <div className="right-side"><div className="tag">#…</div></div>
        </div>
        <hr className="divider" />
        <div className="contact">
          <div className="row"><span className="label">M</span><span>–</span></div>
          <div className="row"><span className="label">E</span><span>–</span></div>
          <div className="row"><span className="label">H</span><span>–</span></div>
        </div>
        <div className="logo">GNGN</div>
      </div>
    );
  }

  return <BusinessCard {...card} />;
}

export default SmartBusinessCard;