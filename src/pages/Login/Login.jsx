import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "@/styles/Login.css";

export default function LoginPage({ onLogin }) {
  const [id, setId] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    console.log("로그인 시도:", id);
    
    if (!id) {
      setErr("ID를 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      // ID만으로 로그인 요청
      console.log("API 호출:", { username: id });
      const { data } = await api.post("/users/login", { username: id });
      console.log("로그인 응답:", data);
      
      // 사용자 정보 저장
      if (data?.user_id) {
        localStorage.setItem("user_id", data.user_id.toString());
        localStorage.setItem("username", id);
        console.log("localStorage 저장 완료:", {
          user_id: localStorage.getItem("user_id"),
          username: localStorage.getItem("username")
        });
        
        // 로그인 상태 업데이트 후 페이지 이동
        console.log("로그인 콜백 호출");
        if (onLogin) onLogin();
        console.log("페이지 이동 시작");
        navigate("/", { replace: true });
      } else {
        console.log("user_id가 없음:", data);
        navigate("/");
      }
    } catch (e) {
      console.error("로그인 실패:", e);
      const msg =
        e?.response?.data?.message ||
        "존재하지 않는 사용자입니다.";
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
        <label className="login__label">사용자 ID</label>
        <input
          className="login__input"
          placeholder="사용자 ID를 입력하세요"
          value={id}
          onChange={(e) => setId(e.target.value)}
          autoComplete="username"
        />

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
