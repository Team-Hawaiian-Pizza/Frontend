import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FriendCard from '../../components/FriendCard';
import FofCard from '../../components/FofCard';
import api from '../../api/axios';
import './Search.css';

const Search = () => {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);     // ← 건너건너 리스트 (항상 배열)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 공통: 응답을 항상 배열로 정규화
  const toArray = (data) => {
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data)) return data;
    return [];
  };

  // 최초 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/users/all', {
          // 백엔드에서 User-Id 필요하면 주석 해제
          // headers: { 'User-Id': localStorage.getItem('user_id') || '1' }
        });
        const arr = toArray(res.data);
        setUsers(arr);
        console.log('users(all):', arr);
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 검색
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;

    try {
      const res = await api.get(`/connections/search?q=${encodeURIComponent(q)}`);
      const arr = toArray(res.data);
      setUsers(arr);
      console.log('search result:', arr);
    } catch (err) {
      console.error('검색 실패:', err);
      alert('검색에 실패했습니다.');
    }
  };

  const approveFof = async (id) => {
    try {
      await api.post(`/connections/accept/${id}`);
      setUsers(list => list.map(u => (u.id === id ? { ...u, approved: true } : u)));
    } catch (err) {
      console.error('승인 실패:', err);
      alert('승인 요청에 실패했습니다.');
    }
  };

  const goToDetail = (id) => navigate(`/profile/${id}`);

  // 화면 표시용으로 매핑 (서버 필드명 → UI 필드명)
  const friendFofPairs = useMemo(() => {
    const currentUserId = Number(localStorage.getItem('user_id'));
    const otherUsers = users.filter(u => u.id !== currentUserId);

    return otherUsers.slice(0, 10).map((u, idx) => ({
      friend: {
        id: `friend_${idx}`,
        name: `공통 친구 ${idx + 1}`,
        img: '/friend-1.jpg',
      },
      fof: {
        id: u.id,
        name: u.name || '이름없음',
        img: u.avatar_url || '/friend-1.jpg',
        phone: u.masked_phone || '010-****-****',
        email: u.masked_email || '****@****',
        address: [u.province_name, u.city_name].filter(Boolean).join(' ') || '비공개',
        approved: !!u.approved,
      },
    }));
  }, [users]);

  if (loading) return <div style={{ padding: 20 }}>로딩 중...</div>;

  return (
    <div className="searchpage">
      <form className="search-bar" onSubmit={onSubmit}>
        <input
          className="search-input"
          placeholder="필요한 명함을 검색하세요"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="search-btn">검색</button>
      </form>

      <section className="list">
        <div className="friend-card-header">친구</div>
        <div className="fof-card-header">건너건너</div>

        {friendFofPairs.map((pair) => (
          <React.Fragment key={pair.fof.id}>
            <div className="friend-list-item">
              <FriendCard name={pair.friend.name} img={pair.friend.img} />
            </div>
            <div className="fof-list-item">
              <FofCard
                img={pair.fof.img}
                name={pair.fof.name}
                phone={pair.fof.phone}
                email={pair.fof.email}
                address={pair.fof.address}
                approved={pair.fof.approved}
                onApprove={() => approveFof(pair.fof.id)}
                onDetailClick={() => goToDetail(pair.fof.id)}
              />
            </div>
          </React.Fragment>
        ))}
      </section>
    </div>
  );
};

export default Search;
