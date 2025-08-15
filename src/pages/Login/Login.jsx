import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { api } from "@/api/axios"; // 없으면 fetch로 교체
import "@/styles/Login.css";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!id || !pw) {
      setErr("ID와 Password를 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      // 백엔드 경로에 맞춰 조정
      const { data } = await api.post("/auth/login", { id, password: pw });
      // 예시: 토큰 저장 후 이동
      if (data?.token) localStorage.setItem("token", data.token);
      navigate("/"); // 로그인 후 이동 경로
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "ID 또는 비밀번호가 올바르지 않습니다.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login">
      {/* 상단 밴드(시안 느낌) */}
      <div className="login__hero">건너건너</div>

      <form className="login__form" onSubmit={onSubmit}>
        <label className="login__label">ID</label>
        <input
          className="login__input"
          placeholder="ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          autoComplete="username"
        />

        <label className="login__label" style={{ marginTop: 20 }}>
          PassWord
        </label>
        <div className="login__pwdwrap">
          <input
            className="login__input"
            placeholder="PassWord"
            type={showPw ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="login__pwdtoggle"
            aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
            onClick={() => setShowPw((v) => !v)}
          >
            {/* 눈 아이콘 (SVG) */}
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 5c-5 0-9 4.5-9 7s4 7 9 7 9-4.5 9-7-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {err && <div className="login__error">{err}</div>}

        <button className="login__submit" disabled={loading}>
          {loading ? "로그인 중…" : "Login"}
        </button>

        <div className="login__signup">
          <Link to="/signup">sign up</Link>
        </div>
      </form>
    </section>
  );
}
