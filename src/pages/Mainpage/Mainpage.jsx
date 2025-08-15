import React, { useState, useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import "@/styles//MainPage.css";

export default function MainPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const fgRef = useRef(null);

  useEffect(() => {
    const names = ["나","친구1","친구2","친구3","친구4","친구5","친구6","친구7","친구8","친구9","친구10"];

    const nodes = names.map((name, i) => ({
      id: name,
      name,
      val: i === 0 ? 18 : 10,
    }));

    // 기본: '나'와 모든 친구 연결
    const links = nodes.slice(1).map(friend => ({ source: "나", target: friend.id }));

    // 친구-친구 연결 간소화: 확률 + 최대 개수 제한 + 중복 방지
    const CONNECTION_PROB = 0.2; // 20% 확률
    const MAX_EXTRA_LINKS = 6;   // 추가 링크 최대 6개
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

  // 더 넓게 퍼지되 과하지 않게
  useEffect(() => {
    if (!fgRef.current) return;
    fgRef.current.d3Force("charge")?.strength(-320); // -300~-400 추천
    fgRef.current.d3Force("link")?.distance(120);    // 100~140 추천
  }, [graphData]);

  const drawNode = (node, ctx, globalScale) => {
    const isMe = node.id === "나";
    const radius = isMe ? 14 : 10;

    // 원
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = isMe ? "rgba(255,215,0,0.95)" : (node.color || "#7aa2ff");
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "#333";
    ctx.stroke();

    // 라벨(원 안 가운데)
    const maxTextWidth = radius * 1.7;
    let fontSize = Math.max(12 / globalScale, 9);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#111";
    const fits = size => { ctx.font = `600 ${size}px Sans-Serif`; return ctx.measureText(node.name).width <= maxTextWidth; };
    while (!fits(fontSize) && fontSize > 8) fontSize -= 1;
    ctx.fillText(node.name, node.x, node.y);
  };

  return (
    <div className="main-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="친구 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-btn">🔍</button>
      </div>

      <div className="graph-container">
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeAutoColorBy="id"
          linkColor={() => "rgba(80,80,80,0.55)"}
          linkWidth={2}
          nodeCanvasObjectMode={() => "after"}
          nodeCanvasObject={drawNode}
        />
      </div>
    </div>
  );
}



