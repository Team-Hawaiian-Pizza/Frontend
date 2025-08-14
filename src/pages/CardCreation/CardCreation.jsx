import React, { useEffect, useMemo, useRef, useState } from "react";
import "./cardCreation.css";

const AGE_OPTIONS = ["10대", "20대", "30대", "40대", "50대 이상"];

// 광범위 직업군
const CATEGORY_MAP = {
  디자인: ["로고", "브랜딩", "포스터", "배너", "UI 디자인", "카드뉴스"],
  "IT/프로그래밍": [
    "React","Vue","Angular","Next.js","Node.js","Express",
    "Java","Spring","Kotlin","Python","Django","Flask",
    "C","C++","C#",".NET","Go","Rust",
    "Android","iOS","Flutter","React Native",
    "DB 설계","SQL","DevOps","Docker","Kubernetes",
    "AWS","GCP","Azure","보안 점검"
  ],
  마케팅: ["SNS 운영","콘텐츠 기획","퍼포먼스 광고","바이럴","카피라이팅","CRM"],
  "사진/영상": ["프로필 촬영","제품 촬영","웨딩","행사 스냅","영상 편집","모션그래픽"],
  "예술/공연": ["밴드","보컬","댄스","연기","연주","작곡/편곡"],
  번역통역: ["영한 번역","한영 번역","중국어","일본어","스페인어","동시통역"],
  교육: ["수학","영어","국어","코딩 교육","자격증 강의","과외"],
  의료: ["간호 케어","물리치료","재활","심리상담(자격)","영양 상담(자격)"],
  법률: ["법률 상담(변호사)","노무 상담(노무사)","세무 상담(세무사)"],
  "금융/회계": ["기장 대행","세무 신고","재무 분석","투자 자문(자격)"],
  "시설 관리": ["전기 점검","배관 점검","에어컨 청소","소독/방역","청소 용역"],
  건설시공: ["리모델링","도배","바닥","도장","조명","목공"],
  인테리어: ["주거 인테리어","상업 인테리어","3D 모델링","스타일링"],
  부동산: ["매물 중개(자격)","임대 관리","시세 분석","사진/도면 제작"],
  "식당/푸드": ["한식","양식","중식","카페/디저트","케이터링","푸드 트럭"],
  뷰티케어: ["헤어","메이크업","네일","피부관리","왁싱"],
  "운송/물류": ["용달","이사","퀵서비스","보관","물류 대행"],
  "제조/생산": ["시제품 제작","3D 프린팅","CNC","금형","패키징"],
  컨설팅: ["사업 기획","IR/피치덱","시장조사","브랜딩 전략","PM/프로세스"],
  농업원예: ["텃밭 조성","조경","식물 케어","원예 디자인"],
  반려동물: ["산책 대행","훈련","미용","케어","사진 촬영"],
  "스포츠/레저": ["PT","필라테스","요가","등산 가이드","골프 레슨"],
  이벤트행사: ["행사 기획","MC","행사진행","대관","음향/조명"]
};

function CardCreation() {
  // === 기본 정보(필수) ===
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  // === 선택 항목 ===
  const [intro, setIntro] = useState("");

  // === 업무 태그 ===
  const categories = useMemo(() => Object.keys(CATEGORY_MAP), []);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [service, setService] = useState(CATEGORY_MAP[categories[0]][0]);
  const [tags, setTags] = useState([]);

  // === 프로필 이미지 업로드 ===
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [photoErr, setPhotoErr] = useState("");
  const fileRef = useRef(null);

  // 이미지 미리보기 URL 메모리 정리
  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
    };
  }, [profilePreview]);

  const acceptTypes = /image\/(png|jpeg|jpg|webp|gif)/i;
  const maxSize = 5 * 1024 * 1024; // 5MB

  const handlePickFile = (file) => {
    if (!file) return;
    if (!acceptTypes.test(file.type)) {
      setPhotoErr("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > maxSize) {
      setPhotoErr("파일 용량은 5MB 이하만 가능합니다.");
      return;
    }
    setPhotoErr("");
    setProfileFile(file);
    const url = URL.createObjectURL(file);
    setProfilePreview(url);
  };

  const onFileChange = (e) => handlePickFile(e.target.files?.[0]);
  const onAvatarClick = () => fileRef.current?.click();
  const clearPhoto = () => {
    setProfileFile(null);
    if (profilePreview) URL.revokeObjectURL(profilePreview);
    setProfilePreview("");
    setPhotoErr("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const onAvatarDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePickFile(e.dataTransfer.files[0]);
    }
  };
  const onAvatarDragOver = (e) => e.preventDefault();

  // === 유효성 검사 ===
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneOk = /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone);
  const allRequiredFilled =
    name.trim() && phone.trim() && email.trim() && address.trim() && gender && age;

  // 프로필 사진을 필수로 만들고 싶다면 && profileFile 추가하면 됨
  const isValid = Boolean(allRequiredFilled && emailOk && phoneOk);

  // === 태그 ===
  const onAddTag = () => {
    if (!service) return;
    const tag = `#${service}`;
    setTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
  };
  const onRemoveTag = (t) => setTags((prev) => prev.filter((x) => x !== t));
  const onChangeCategory = (c) => {
    setActiveCategory(c);
    const first = CATEGORY_MAP[c]?.[0] ?? "";
    setService(first);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    // 실제 저장 시 FormData로 전송 (파일 포함)
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("address", address);
    formData.append("gender", gender);
    formData.append("age", age);
    formData.append("tags", JSON.stringify(tags));
    formData.append("intro", intro ?? "");
    if (profileFile) formData.append("profile", profileFile); // 백엔드 필드명 'profile' 가정

    // 예시: 실제 API 주소로 변경
    // await fetch("/api/cards", { method: "POST", body: formData });

    console.log("FormData ready (demo):", {
      name, phone, email, address, gender, age, tags, intro, profileFile
    });
    alert("저장되었습니다. (데모)");
  };

  return (
    <main className="cc-main">
      <form className="cc-card" onSubmit={onSubmit} noValidate>
        {/* 프로필 + 기본정보 */}
        <section className="cc-section">
          <div className="cc-profile-row">
            {/* 아바타 업로더 */}
            <div className="cc-avatar-wrap">
              <div
                className={`cc-avatar ${profilePreview ? "has-img" : ""}`}
                onClick={onAvatarClick}
                onDrop={onAvatarDrop}
                onDragOver={onAvatarDragOver}
                title="클릭 또는 이미지를 드래그하여 업로드"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" ? onAvatarClick() : null)}
              >
                {profilePreview ? (
                  <img src={profilePreview} alt="프로필 미리보기" className="cc-avatar-img" />
                ) : (
                  <span className="cc-avatar-hint">사진 업로드</span>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="cc-avatar-input"
                onChange={onFileChange}
                aria-label="프로필 사진 업로드"
              />
              <div className="cc-avatar-actions">
                <button type="button" className="cc-btn-xs" onClick={onAvatarClick}>사진 선택</button>
                {profilePreview && (
                  <button type="button" className="cc-btn-xs ghost" onClick={clearPhoto}>삭제</button>
                )}
              </div>
              {photoErr && <span className="cc-err mt4">{photoErr}</span>}
            </div>

            {/* 기본 필드 */}
            <div className="cc-fields">
              <label className="cc-field">
                <span className="cc-label">이름 *</span>
                <input required type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
                {!name.trim() && <span className="cc-err">필수 입력</span>}
              </label>

              <label className="cc-field">
                <span className="cc-label">전화번호 *</span>
                <input required type="tel" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                {phone && !phoneOk && <span className="cc-err">형식을 확인하세요</span>}
                {!phone.trim() && <span className="cc-err">필수 입력</span>}
              </label>

              <label className="cc-field">
                <span className="cc-label">이메일 *</span>
                <input required type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                {email && !emailOk && <span className="cc-err">형식을 확인하세요</span>}
                {!email.trim() && <span className="cc-err">필수 입력</span>}
              </label>

              <label className="cc-field">
                <span className="cc-label">주소 *</span>
                <input required type="text" placeholder="시/군/구" value={address} onChange={(e) => setAddress(e.target.value)} />
                {!address.trim() && <span className="cc-err">필수 입력</span>}
              </label>
            </div>
          </div>
        </section>

        {/* 성별 */}
        <section className="cc-section">
          <h3 className="cc-sec-title">성별 *</h3>
          <div className="cc-radio-row">
            <label className="cc-radio">
              <input required type="radio" name="gender" value="여성" checked={gender === "여성"} onChange={(e) => setGender(e.target.value)} />
              <span>여성</span>
            </label>
            <label className="cc-radio">
              <input required type="radio" name="gender" value="남성" checked={gender === "남성"} onChange={(e) => setGender(e.target.value)} />
              <span>남성</span>
            </label>
          </div>
          {!gender && <span className="cc-err mt4">성별을 선택하세요</span>}
        </section>

        {/* 연령대 */}
        <section className="cc-section">
          <h3 className="cc-sec-title">연령대 *</h3>
          <div className="cc-select-wrap">
            <select required value={age} onChange={(e) => setAge(e.target.value)} aria-label="연령대">
              <option value="" disabled>선택</option>
              {AGE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          {!age && <span className="cc-err mt4">연령대를 선택하세요</span>}
        </section>

        {/* 업무 태그 (선택) */}
        <section className="cc-section">
          <div className="cc-sec-header">
            <h3 className="cc-sec-title">업무 태그 (선택)</h3>
            <p className="cc-helper">업종/세부 서비스를 선택 후 추가 버튼으로 태그를 만들 수 있습니다.</p>
          </div>

          <div className="cc-tag-grid cc-tag-grid--2">
            {/* 좌: 카테고리 */}
            <div className="cc-cat-col">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={"cc-cat-btn" + (activeCategory === c ? " is-active" : "")}
                  onClick={() => onChangeCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* 우: 서비스 + 아래 태그 */}
            <div className="cc-service-col">
              <div className="cc-service-row">
                <select value={service} onChange={(e) => setService(e.target.value)} aria-label="세부 서비스">
                  {(CATEGORY_MAP[activeCategory] ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="button" className="cc-add-btn" onClick={onAddTag}>추가</button>
              </div>

              <div className="cc-tags cc-tags--below">
                {tags.length === 0 && <div className="cc-tag-empty">선택된 태그가 없습니다</div>}
                {tags.map((t) => (
                  <span key={t} className="cc-tag-chip">
                    {t}
                    <button type="button" className="cc-tag-x" onClick={() => onRemoveTag(t)} aria-label={`${t} 제거`} title="제거">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 소개 (선택) */}
        <section className="cc-section">
          <h3 className="cc-sec-title">소개 (선택)</h3>
          <textarea className="cc-textarea" placeholder="취미, 관심사, 나만의 이야기 등을 자유롭게 적어보세요" rows={5}
            value={intro} onChange={(e) => setIntro(e.target.value)} />
        </section>

        {/* 저장 */}
        <div className="cc-actions">
          <button className="cc-save" type="submit" disabled={!isValid}>저장하기</button>
        </div>
      </form>
    </main>
  );
}


export default CardCreation;
