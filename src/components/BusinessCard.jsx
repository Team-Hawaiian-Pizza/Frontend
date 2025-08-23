import React from "react";
import "./BusinessCard.css";

function BusinessCard({
  profileImage,
  name,
  sex,
  age,
  tag,
  phone,
  email,
  address,
  approved = false, // ✅ 접근 승인 여부
}) {
  const lockOn = !approved;

  return (
    <div className="card-container">
      {/* 상단 프로필 섹션 */}
      <div className="card-header">
        <div className="profile-img">
          {profileImage ? (
            <img src={profileImage} alt="profile" />
          ) : (
            <div className="placeholder">profile</div>
          )}
        </div>

        <div className="profile-info">
          <div className={`name ${lockOn ? "blurred" : ""}`} aria-hidden={lockOn}>
            {name}
          </div>
          <div className={`sub-info ${lockOn ? "blurred" : ""}`} aria-hidden={lockOn}>
            {sex} / {age}
          </div>
        </div>

        <div className="right-side">
          {tag && <div className="tag">#{tag}</div>}
          {lockOn && <span className="lock-badge" title="승인되지 않은 사용자">🔒</span>}
        </div>
      </div>

      <hr className="divider" />

      {/* 연락처 정보 */}
      <div className="contact">
        <div className="row">
          <span className="label">M</span>
          <span className={lockOn ? "blurred" : ""} aria-hidden={lockOn}>
          {phone}
          </span>
        </div>
        <div className="row">
          <span className="label">E</span>
          <span className={lockOn ? "blurred" : ""} aria-hidden={lockOn}>
            {email}
          </span>
        </div>
        <div className="row">
          <span className="label">H</span>
          <span className={lockOn ? "blurred" : ""} aria-hidden={lockOn}>
            {address}
          </span>
        </div>
      </div>

      {/* 로고 영역 */}
      <div className="logo">GNGN</div>
    </div>
  );
}

export default BusinessCard;
