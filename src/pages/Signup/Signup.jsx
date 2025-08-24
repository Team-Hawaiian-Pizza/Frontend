import React, { useState, useEffect } from "react"; // useEffect 임포트
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // [추가] 회원가입 성공 후 네비게이션을 트리거하기 위한 상태
  const [signupSuccess, setSignupSuccess] = useState(false);

  // [추가] signupSuccess 상태가 true로 바뀌면, /location 페이지로 이동합니다.
  useEffect(() => {
    if (signupSuccess) {
      console.log("useEffect: signupSuccess가 true이므로 /location으로 이동합니다.");
      navigate('/location');
    }
  }, [signupSuccess, navigate]);

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
      
      localStorage.setItem("signup_user_id", String(userId));
      localStorage.setItem("signup_username", id);

      // [수정] 직접 navigate를 호출하는 대신, 성공 상태를 true로 변경합니다.
      setSignupSuccess(true);

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

