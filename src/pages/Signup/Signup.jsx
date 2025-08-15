import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import api from "../../api/axios";         // alias 없으면 이 경로 사용
import "../../styles/Signup.css";

export default function SignUpPage() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!id || !pw || !pw2) return "모든 항목을 입력해 주세요.";
    if (!/^[a-zA-Z0-9_-]{4,20}$/.test(id)) return "ID는 4~20자, 영문/숫자/-/_만 가능합니다.";
    if (pw.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
    if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "비밀번호는 영문과 숫자를 포함해야 합니다.";
    if (pw !== pw2) return "비밀번호가 일치하지 않습니다.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErr(v); return; }
    setErr(""); setLoading(true);
    try {
      await api.post("/auth/signup", { id, password: pw });
      navigate("/login");
    } catch (e) {
      const msg = e?.response?.data?.message || "회원가입에 실패했어요. 잠시 후 다시 시도해 주세요.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const Eye = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5c-5 0-9 4.5-9 7s4 7 9 7 9-4.5 9-7-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" fill="currentColor"/>
    </svg>
  );

  return (
    <section className="signup">
      <div className="signup__hero">건너건너</div>

      <form className="signup__form" onSubmit={onSubmit}>
        <label className="signup__label">ID</label>
        <input
          className="signup__input"
          placeholder="ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          autoComplete="username"
        />

        <label className="signup__label" style={{ marginTop: 20 }}>PassWord</label>
        <div className="signup__pwdwrap">
          <input
            className="signup__input"
            placeholder="PassWord"
            type={showPw ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="signup__pwdtoggle"
            aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
            onClick={() => setShowPw(v => !v)}
          >
            <Eye />
          </button>
        </div>

        <label className="signup__label" style={{ marginTop: 20 }}>Confirm</label>
        <div className="signup__pwdwrap">
          <input
            className="signup__input"
            placeholder="Confirm Password"
            type={showPw2 ? "text" : "password"}
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="signup__pwdtoggle"
            aria-label={showPw2 ? "비밀번호 숨기기" : "비밀번호 보기"}
            onClick={() => setShowPw2(v => !v)}
          >
            <Eye />
          </button>
        </div>

        {err && <div className="signup__error">{err}</div>}

        <button className="signup__submit" disabled={loading}>
          {loading ? "가입 중…" : "Sign Up"}
        </button>

        <div className="signup__login">
          이미 계정이 있다면&nbsp;<Link to="/login">Login</Link>
        </div>
      </form>
    </section>
  );
}
