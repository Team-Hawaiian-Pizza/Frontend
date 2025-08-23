import React, { useState, useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import "../../styles/Mainpage.css";

/* === 스크롤 진입 시 나타나는 공통 래퍼 === */
function Reveal({
  as: Tag = "section",
  children,
  className = "",
  threshold = 0.2,
  once = true,
  delay = 0,
  variant = "up", // up | left | right | scale
}) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          if (once) io.unobserve(el);
        } else if (!once) {
          setShow(false);
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${variant} ${show ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export default function Mainpage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [regionText, setRegionText] = useState("사용자의 지역: 미설정");
  const fgRef = useRef(null);
  const canvasRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // 지역 배지 표기
  useEffect(() => {
    const sido = localStorage.getItem("region_sido") || "";
    const sigungu = localStorage.getItem("region_sigungu") || "";
    if (sido && sigungu) setRegionText(`사용자의 지역: ${sido} ${sigungu}`);
  }, []);

  // 캔버스 영역 크기에 맞춰 그래프 리사이즈
  useEffect(() => {
  if (!canvasRef.current) return;
  const el = canvasRef.current;

  const ro = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    setDims({
      w: Math.max(1, Math.floor(width)),
      h: Math.max(1, Math.floor(height)),
    });
  });

  ro.observe(el);

  // 첫 프레임 보정
  const r = el.getBoundingClientRect();
  setDims({ w: Math.max(1, r.width), h: Math.max(1, r.height) });

  return () => ro.disconnect();
}, []);
  // 더미 데이터
  useEffect(() => {
    const names = ["나","정훈","태은","서연","부경","윤식","준희","도형","솔태","민철","진"];
    const nodes = names.map((name, i) => ({
      id: name,
      name,
      ...(i === 0 ? { fx: 0, fy: 0 } : {}), // '나' 중앙 고정
    }));
    const links = nodes.slice(1).map(f => ({ source: "나", target: f.id }));

    const CONNECTION_PROB = 0.18, MAX_EXTRA_LINKS = 5;
    const seen = new Set(links.map(l => [l.source, l.target].sort().join("|")));
    let extras = 0;
    for (let i = 1; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (extras >= MAX_EXTRA_LINKS) break;
        if (Math.random() < CONNECTION_PROB) {
          const key = [nodes[i].id, nodes[j].id].sort().join("|");
          if (!seen.has(key)) {
            seen.add(key);
            links.push({ source: nodes[i].id, target: nodes[j].id });
            extras++;
          }
        }
      }
      if (extras >= MAX_EXTRA_LINKS) break;
    }
    setGraphData({ nodes, links });
  }, []);

  // 컨테이너 크기에 맞춰 force 스케일 + 초기 중앙
  useEffect(() => {
    if (!fgRef.current) return;
    const base = Math.min(dims.w || 800, dims.h || 600);
    fgRef.current.d3Force("link")?.distance(Math.max(110, base * 0.16));
    fgRef.current.d3Force("charge")?.strength(-Math.max(260, base * 0.28));
    fgRef.current.centerAt(0, 0, 0);
  }, [graphData, dims]);

  // '나'는 항상 고정
  const keepMePinned = (node) => {
    if (node.id === "나") { node.fx = 0; node.fy = 0; }
  };

  // 노드 렌더
  const drawNode = (node, ctx, globalScale) => {
    const isMe = node.id === "나";
    const radius = isMe ? 18 : 12;

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = isMe ? "#4361EE" : "#ffffff";
    ctx.fill();
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = "#222";
    ctx.stroke();

    const maxTextWidth = radius * 1.7;
    let fontSize = Math.max(13 / globalScale, 10);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = isMe ? "#ffffff" : "#111";
    const fit = (size) => { ctx.font = `600 ${size}px Sans-Serif`; return ctx.measureText(node.name).width <= maxTextWidth; };
    while (!fit(fontSize) && fontSize > 8) fontSize -= 1;
    ctx.fillText(node.name, node.x, node.y);
  };

  const recs = [
    { id: 1, icon: "☕️", title: "솔태님의 친구 가게", desc: "추가로 커피 쿠폰 받으세요!" },
    { id: 2, icon: "🧰", title: "진님의 친구 에어컨 수리", desc: "지금 요청하면 10% 할인!" },
    { id: 3, icon: "🍜", title: "정훈님의 단골 라멘집", desc: "점심 사이드 1+1" },
    { id: 4, icon: "🎟️", title: "부경님의 영화관 제휴", desc: "주말 예매 2천원 할인" },
  ];

  return (
    <main className="main-page">
      
      {/* ===== 상단: 검색 + 그래프 + 추천 ===== */}
      <div className="main-container">
        {/* 검색창 + 지역 배지 */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="사용자의 친구를 검색하세요!"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btn">🔍</button>
          <span className="region-badge">{regionText}</span>
        </div>

        {/* 회색 배경 박스 안에 '그래프 + 추천' 함께 배치 */}
        <div className="graph-container">
        <div className="canvas-wrap" ref={canvasRef}>
          {dims.w > 0 && dims.h > 0 && (
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              width={dims.w}
              height={dims.h}
              linkColor={() => "#222"}
              linkWidth={1.5}
              nodeCanvasObjectMode={() => "after"}
              nodeCanvasObject={drawNode}
              onNodeDrag={keepMePinned}
              onNodeDragEnd={keepMePinned}
              enablePanInteraction={false}
              enableZoomInteraction={false}
            />
          )}
        </div>

          <aside className="rec-panel">
            <div className="rec-title">맞춤 추천</div>
            {recs.map((r) => (
              <div className="rec-card" key={r.id}>
                <div className="rec-icon">{r.icon}</div>
                <div className="rec-text">
                  <h4>{r.title}</h4>
                  <p>{r.desc}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>

      {/* ====== 아래부터 랜딩 섹션(스크롤 등장) ====== */}
      <div className="landing">
        {/* 소개 섹션 */}
        <Reveal className="l-sec l-intro" variant="up">
          <h2 className="l-title">건너건너</h2>
          <p className="l-sub">가까운 인맥을 중심으로, 소개·대화·혜택까지 한 번에 연결해 주는 연결 지향형 지역사회 네트워킹 서비스입니다.</p>
        </Reveal>

        {/* 기능 카드 3개 */}
        <Reveal className="l-sec" variant="up">
          <div className="l-grid-3">
            <Reveal className="l-card" variant="up" delay={0}>
              <div className="l-emoji">📇</div>
              <h3>명함 & 승인 공개</h3>
              <p>가까운 사람이 아니면 민감정보는 자동 블러 처리됩니다. 안전하게 나를 소개해요.</p>
            </Reveal>
            <Reveal className="l-card" variant="up" delay={100}>
              <div className="l-emoji">💬</div>
              <h3>친구 추가 및 1:1 대화</h3>
              <p>추가적인 요구사항 조율을 위한 1:1 대화 기능을 제공합니다.</p>
            </Reveal>
            <Reveal className="l-card" variant="up" delay={200}>
              <div className="l-emoji">🎟️</div>
              <h3>스탬프 & 쿠폰</h3>
              <p>해당 서비스를 통해 결제가 이루어지면, 자동으로 스탬프가 적립됩니다.</p>
            </Reveal>
          </div>
        </Reveal>

        {/* 동작 방식 3단계 */}
        <section className="l-sec l-steps">
          <Reveal className="l-step" variant="left">
            <span className="l-badge">STEP 1</span>
            <h3>프로필 & 명함 만들기</h3>
            <p>사진·태그·연락처를 등록하고 내 명함을 완성해요.</p>
          </Reveal>
          <Reveal className="l-step" variant="left" delay={100}>
            <span className="l-badge">STEP 2</span>
            <h3>친구 추가 & 대화 시작</h3>
            <p>친구목록에서 바로 1:1로 이어집니다.</p>
          </Reveal>
          <Reveal className="l-step" variant="left" delay={200}>
            <span className="l-badge">STEP 3</span>
            <h3>스탬프 적립 & 쿠폰 사용</h3>
            <p>결제 시 스탬프가 쌓이고, 완성 보상으로 혜택을 받아요.</p>
          </Reveal>
        </section>

        {/* 스탬프/쿠폰 쇼케이스 */}
        <Reveal className="l-sec l-showcase" variant="up">
          <div className="l-showbox">
            <div className="l-dots">
              {Array.from({ length: 10 }).map((_, i) => (
                <div className={`l-dot ${i < 5 ? "on" : ""}`} key={i} />
              ))}
            </div>
            <div className="l-copy">
              <h3>10개 채우면 보상!</h3>
              <p>완성 시 자동 발급되는 <b>할인/증정 쿠폰</b>으로 재방문을 만듭니다.</p>
              <div className="l-cta">
                <a className="lp-btn lp-btn-light" href="/stamp/1">스탬프 보기</a>
                <a className="lp-btn lp-btn-ghost" href="/coupon">쿠폰함 보기</a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 마지막 CTA */}
        <Reveal className="l-sec l-cta" variant="scale">
          <h2>지금 바로 시작해요</h2>
          <p>건너건너에서 지역 사회 네트워크를 경험하세요.</p>
          <div className="l-cta">
            <a className="lp-btn lp-btn-primary" href="/entry">시작하기</a>
            <a className="lp-btn lp-btn-ghost" href="/mypage">마이페이지로</a>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
