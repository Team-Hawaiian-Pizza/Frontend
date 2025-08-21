import React, { useState, useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import "@/styles//MainPage.css";

export default function MainPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [regionText, setRegionText] = useState("사용자의 지역: 미설정");
  const fgRef = useRef(null);
  const canvasRef = useRef(null);     // ← 캔버스 영역을 측정
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // 지역 배지 표기
  useEffect(() => {
    const sido = localStorage.getItem("region_sido") || "";
    const sigungu = localStorage.getItem("region_sigungu") || "";
    if (sido && sigungu) setRegionText(`사용자의 지역: ${sido} ${sigungu}`);
  }, []);

  // 캔버스 영역 크기에 맞춰 그래프 리사이즈
  useEffect(() => {
    const updateSize = () => {
      if (!canvasRef.current) return;
      setDims({
        w: canvasRef.current.clientWidth,
        h: canvasRef.current.clientHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 데이터
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
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            width={dims.w}
            height={dims.h}
            nodeAutoColorBy={null}
            linkColor={() => "#222"}
            linkWidth={1.5}
            nodeCanvasObjectMode={() => "after"}
            nodeCanvasObject={drawNode}
            onNodeDrag={keepMePinned}
            onNodeDragEnd={keepMePinned}
            /* 카메라 고정(배경 이동/줌 비활성화) — 노드 드래그는 가능 */
            enablePanInteraction={false}
            enableZoomInteraction={false}
          />
        </div>

        <aside className="rec-panel">
          <div className="rec-title">맞춤 추천</div>
          {recs.map(r => (
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
  );
}







