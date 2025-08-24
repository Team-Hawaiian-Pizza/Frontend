import React, { useState, useEffect, useRef } from "react";
// [추가] useNavigate 훅을 임포트합니다.
import { Link, useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import api from "../../api/axios";
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
  const [currentUser, setCurrentUser] = useState(null);
  const fgRef = useRef(null);
  const canvasRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  // [추가] navigate 함수를 사용하기 위해 선언합니다.
  const navigate = useNavigate();

  // [추가] 검색 폼 제출 시 Search 페이지로 이동시키는 핸들러
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // 검색어를 URL 쿼리 파라미터로 담아 /search 페이지로 이동합니다.
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // 사용자 정보 및 지역 로드
  useEffect(() => {
    const loadUserData = async () => {
      const localSido = localStorage.getItem("region_sido") || "";
      const localSigungu = localStorage.getItem("region_sigungu") || "";

      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          if (localSido && localSigungu) {
            setRegionText(`사용자의 지역: ${localSido} ${localSigungu}`);
          }
          return;
        }

        const response = await api.get(`/users/profiles/${userId}`);
        const userData = response.data;
        setCurrentUser(userData);

        if (userData.province_name && userData.city_name) {
          setRegionText(`사용자의 지역: ${userData.province_name} ${userData.city_name}`);
        } else if (localSido && localSigungu) {
          setRegionText(`사용자의 지역: ${localSido} ${localSigungu}`);
        } else {
          setRegionText("사용자의 지역: 미설정");
        }

      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        if (localSido && localSigungu) {
          setRegionText(`사용자의 지역: ${localSido} ${localSigungu}`);
        }
      }
    };
    
    loadUserData();
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

  const r = el.getBoundingClientRect();
  setDims({ w: Math.max(1, r.width), h: Math.max(1, r.height) });

  return () => ro.disconnect();
}, []);
  // 실제 사용자 데이터로 네트워크 구성
  useEffect(() => {
    const buildNetworkData = async () => {
      if (!currentUser) return;
      
      try {
        const response = await api.get('/users/all');
        const allUsers = response.data.results;
        const currentUserId = parseInt(localStorage.getItem('user_id'));
        
        const me = { 
          id: currentUser.name, 
          name: currentUser.name, 
          fx: 0, 
          fy: 0
        };
        
        const others = allUsers
          .filter(user => user.id !== currentUserId)
          .slice(0, 10)
          .map(user => ({
            id: user.name,
            name: user.name
          }));
          
        const nodes = [me, ...others];
        
        const links = others.map(user => ({ 
          source: currentUser.name, 
          target: user.name 
        }));

        const CONNECTION_PROB = 0.15, MAX_EXTRA_LINKS = 5;
        const seen = new Set(links.map(l => [l.source, l.target].sort().join("|")));
        let extras = 0;
        
        for (let i = 1; i < nodes.length && extras < MAX_EXTRA_LINKS; i++) {
          for (let j = i + 1; j < nodes.length && extras < MAX_EXTRA_LINKS; j++) {
            if (Math.random() < CONNECTION_PROB) {
              const key = [nodes[i].name, nodes[j].name].sort().join("|");
              if (!seen.has(key)) {
                seen.add(key);
                links.push({ source: nodes[i].name, target: nodes[j].name });
                extras++;
              }
            }
          }
        }
        
        setGraphData({ nodes, links });
      } catch (error) {
        console.error('네트워크 데이터 로드 실패:', error);
        setGraphData({ nodes: [], links: [] });
      }
    };
    
    buildNetworkData();
  }, [currentUser]);

  // 컨테이너 크기에 맞춰 force 스케일 + 초기 중앙
  useEffect(() => {
    if (!fgRef.current) return;
    const base = Math.min(dims.w || 800, dims.h || 600);
    fgRef.current.d3Force("link")?.distance(Math.max(110, base * 0.16));
    fgRef.current.d3Force("charge")?.strength(-Math.max(260, base * 0.28));
    fgRef.current.centerAt(0, 0, 0);
  }, [graphData, dims]);

  // 로그인한 사용자는 항상 고정
  const keepMePinned = (node) => {
    if (currentUser && node.id === currentUser.name) { 
      node.fx = 0; 
      node.fy = 0; 
    }
  };

  // 노드 렌더
  const drawNode = (node, ctx, globalScale) => {
    const isMe = currentUser && node.id === currentUser.name;
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

  // 실제 브랜드 데이터 기반 추천
  const [recs, setRecs] = useState([]);
  
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const [brandsResponse, usersResponse] = await Promise.all([
          api.get('/rewards/brands'),
          api.get('/users/all')
        ]);
        
        const brands = brandsResponse.data?.data || brandsResponse.data || [];
        const allUsers = usersResponse.data?.results || [];
        const currentUserId = localStorage.getItem('user_id');

        const otherUsers = allUsers.filter(user => String(user.id) !== currentUserId);

        const recommendations = brands.slice(0, 4).map((brand, index) => {
          const icons = ["☕️", "🧰", "🍜", "🎟️"];
          const recommendingUser = otherUsers[index] || { id: 0, name: "친구" };
          
          return {
            brandId: brand.id,
            icon: icons[index] || "🏪",
            title: `${recommendingUser.name}님 추천 ${brand.name}`,
            desc: brand.benefit,
            userId: recommendingUser.id
          };
        });
        
        setRecs(recommendations);
      } catch (error) {
        console.error('추천 데이터 로드 실패:', error);
        setRecs([]);
      }
    };
    
    loadRecommendations();
  }, []);

  return (
    <main className="main-page">
      
      {/* ===== 상단: 검색 + 그래프 + 추천 ===== */}
      <div className="main-container">
        {/* [수정] div를 form으로 변경하고 onSubmit 핸들러를 추가합니다. */}
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="사용자의 친구를 검색하세요!"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* [수정] button에 type="submit"을 추가합니다. */}
          <button type="submit" className="search-btn">🔍</button>
          <span className="region-badge">{regionText}</span>
        </form>

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
              <Link to={`/profile/${r.userId}`} key={r.brandId} className="rec-card-link">
                <div className="rec-card">
                  <div className="rec-icon">{r.icon}</div>
                  <div className="rec-text">
                    <h4>{r.title}</h4>
                    <p>{r.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </aside>
        </div>
      </div>

      {/* ====== 아래부터 랜딩 섹션(스크롤 등장) ====== */}
      <div className="landing">
        {/* ... (이하 생략) ... */}
      </div>
    </main>
  );
}
