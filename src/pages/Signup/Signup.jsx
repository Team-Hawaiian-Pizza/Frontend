import React, { useState } from "react";
import { Link} from "react-router-dom";
import api from "../../api/axios";
import "../../styles/Signup.css";

export default function SignUpPage() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!id || !pw || !pw2) return "모든 항목을 입력해 주세요.";
    if (!/^[a-zA-Z0-9_-]{4,20}$/.test(id)) return "ID는 4~20자, 영문/숫자/-/_만 가능합니다.";
    if (pw.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
    if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "비밀번호는 영문과 숫자를 포함해야 합니다.";
    if (pw !== pw2) return "비밀번호가 일치하지 않습니다.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErr(validationError);
      return;
    }
    setErr("");
    setLoading(true);

    try {
      const payload = { username: id, password: pw };
      const response = await api.post("/users/signup", payload);
      const userId = response.data?.user_id || response.data?.id;
      
      if (!userId) {
        throw new Error("서버로부터 사용자 ID를 받지 못했습니다.");
      }
      
      // LocationPage로 넘어가기 전, user_id와 username을 임시 저장합니다.
      localStorage.setItem("signup_user_id", String(userId));
      localStorage.setItem("signup_username", id);

      // 페이지를 새로고침하며 이동하여 React Router의 상태 문제를 확실히 해결합니다.
      window.location.href = '/location';

    } catch (error) {
      console.error("회원가입 실패:", error.response || error);
      let errorMessage = "회원가입 중 오류가 발생했습니다.";
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorKeys = ['detail', 'error', 'message', 'username'];
        for (const key of errorKeys) {
          if (errorData[key]) {
            errorMessage = Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key];
            break;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      setErr(errorMessage);
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
      <form className="signup__form" onSubmit={handleSubmit}>
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
        <button className="signup__submit" type="submit" disabled={loading}>
          {loading ? "가입 중..." : "장소 설정하러 가기"}
        </button>
        <div className="signup__login">
          이미 계정이 있다면&nbsp;<Link to="/login">Login</Link>
        </div>
      </form>
    </section>
  );

}