import React, { useState } from "react";
import CardForm from "../CardForm/CardForm";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

function CardCreation() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState({
    name: "", phone: "", email: "", address: "", gender: "", age: "",
    tags: [], intro: "", profileUrl: ""
  });

  const handleSubmit = async (formData) => {
    try {
      await api.post("/users/signup/card", formData);
      alert("명함이 생성되었습니다!");
      navigate("/");
    } catch (error) {
      console.error("카드 생성 실패:", error);
      alert("명함 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };  
  const handlePreviewChange = (v) => setPreview(v);
  return (
    <div className="cc-main" style={{width: "100%"}}>
      <div className="cc-card" style={{maxWidth: 1100}}>
        <div style={{display:"grid", gridTemplateColumns:"1fr 380px", gap:24}}>
          <div>
            <h2 className="cc-sec-title" style={{fontSize:18, marginBottom:16}}>명함 생성</h2>
          <CardForm
            mode="create"
            initialData={{}}
            onSubmit={handleSubmit}
            onPreviewChange={handlePreviewChange}
          />
          </div>

          {/* 우측 라이브 프리뷰 카드 */}
          <aside
            className="cc-preview"
            aria-label="명함 미리보기"
            style={{
              border: `1px solid var(--c-outline)`,
              borderRadius: "16px",
              padding: 16,
              background: "#fff",
              height: "fit-content",
              position: "sticky",
              top: 220
            }}
          >
            <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:12}}>
              <div style={{
                width:56, height:56, borderRadius:999,
                background: "var(--c-bg)", border:"1px solid var(--c-outline)",
                overflow:"hidden", display:"grid", placeItems:"center"
              }}>
                {preview.profileUrl
                  ? <img src={preview.profileUrl} alt="미리보기" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <span style={{fontSize:12, color:"var(--c-muted)"}}>No Photo</span>}
              </div>
              <div>
                <div style={{fontWeight:800, fontSize:16}}>{preview.name || "이름"}</div>
                <div style={{fontSize:12, color:"var(--c-muted)"}}>
                  {preview.gender || "성별"} · {preview.age || "연령대"}
                </div>
              </div>
            </div>

            <hr style={{border:0, borderTop:`1px solid var(--c-outline)`, margin:"12px 0"}}/>

            <ul style={{listStyle:"none", padding:0, margin:0, display:"grid", gap:8}}>
              <li><strong style={{color:"var(--c-accent)"}}>☎</strong> {preview.phone || "-"}</li>
              <li><strong style={{color:"var(--c-accent)"}}>✉</strong> {preview.email || "-"}</li>
              <li><strong style={{color:"var(--c-accent)"}}>H</strong> {preview.address || "-"}</li>
            </ul>

            {preview.intro && (
              <>
                <hr style={{border:0, borderTop:`1px solid var(--c-outline)`, margin:"12px 0"}}/>
                <div style={{whiteSpace:"pre-wrap", fontSize:14}}>{preview.intro}</div>
              </>
            )}

            {preview.tags?.length > 0 && (
              <>
                <hr style={{border:0, borderTop:`1px solid var(--c-outline)`, margin:"12px 0"}}/>
                <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                  {preview.tags.map(t => (
                    <span key={t} style={{
                      border:`1px solid var(--c-outline)`, borderRadius:999, padding:"6px 10px",
                      fontSize:12, background:"#fff"
                    }}>{t}</span>
                  ))}
                </div>
              </>
            )}

          </aside>
        </div>
      </div>
    </div>
  );
}

export default CardCreation;
