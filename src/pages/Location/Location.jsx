import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import api from "../../api/axios";           // alias 없으면 이 경로 사용
import regions from "../../data/regions";
import "../../styles/Location.css";

export default function LocationPage() {
  const navigate = useNavigate();
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const signupId = localStorage.getItem("signup_id");
  const signupPw = localStorage.getItem("signup_pw");

  useEffect(() => {
    if (!signupId || !signupPw) {
      // 이전 단계 정보 없으면 회원가입 폼으로
      navigate("/signup");
    }
  }, [signupId, signupPw, navigate]);

  const sidoOptions = useMemo(() => Object.keys(regions), []);
  const sigunguOptions = useMemo(() => (sido ? regions[sido] || [] : []), [sido]);
  const canSubmit = !!(sido && sigungu) && !!(signupId && signupPw) && !loading;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErr(""); setLoading(true);
    try {
      // 선택값 저장(선택 사항)
      localStorage.setItem("region_sido", sido);
      localStorage.setItem("region_sigungu", sigungu);

      // 실제 회원가입 호출
      await api.post("/auth/signup", {
        id: signupId,
        password: signupPw,
        sido,
        sigungu,
      });

      // 임시 저장값 정리
      localStorage.removeItem("signup_id");
      localStorage.removeItem("signup_pw");

      navigate("/login"); // 완료 후 로그인 페이지로
    } catch (e) {
      const msg = e?.response?.data?.message || "회원가입에 실패했어요. 잠시 후 다시 시도해 주세요.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="loc">
      <div className="loc__card">
        <h1 className="loc__title">현재 위치를 선택하세요</h1>

        <form className="loc__form" onSubmit={onSubmit}>
          <label className="loc__label" htmlFor="sido">시 / 도</label>
          <div className="loc__selectwrap">
            <select
              id="sido"
              className="loc__select"
              value={sido}
              onChange={(e) => { setSido(e.target.value); setSigungu(""); }}
            >
              <option value="" disabled>시 / 도를 선택하세요</option>
              {sidoOptions.map((si) => (
                <option key={si} value={si}>{si}</option>
              ))}
            </select>
            <span className="loc__chev" aria-hidden>▾</span>
          </div>

          <label className="loc__label" htmlFor="sigungu" style={{ marginTop: 16 }}>
            시 / 군 / 구
          </label>
          <div className="loc__selectwrap">
            <select
              id="sigungu"
              className="loc__select"
              value={sigungu}
              onChange={(e) => setSigungu(e.target.value)}
              disabled={!sido}
            >
              <option value="" disabled>
                {sido ? "시 / 군 / 구를 선택하세요" : "먼저 시/도를 선택하세요"}
              </option>
              {sigunguOptions.map((gu) => (
                <option key={gu} value={gu}>{gu}</option>
              ))}
            </select>
            <span className="loc__chev" aria-hidden>▾</span>
          </div>

          {err && <div className="login__error" style={{ marginTop: 12 }}>{err}</div>}

          <button className="loc__submit" type="submit" disabled={!canSubmit}>
            {loading ? "가입 중…" : "Sign Up"}
          </button>
        </form>
      </div>
    </section>
  );
}

