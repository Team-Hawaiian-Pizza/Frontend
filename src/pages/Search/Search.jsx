import React from 'react'
import {useState, useMemo, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import FriendCard from '../../components/FriendCard';
import FofCard from '../../components/FofCard';
import api from '../../api/axios';

import './Search.css'

const Search = () => {
  const [q, setQ] = useState(""); //검색어
  const [fof, setFof] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const [friendsRes, fofRes] = await Promise.all([
          api.get('/connections/requests'),
          api.get('/users/all')
        ]);
        setFriends(friendsRes.data);
        setFof(fofRes.data);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        setFriends([]);
        setFof([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []); 

  // '요청' 버튼 클릭 시 approved 상태를 변경하는 함수
  const approveFof = async (id) => {
    try {
      await api.post(`/connections/accept/${id}`);
      setFof(list => 
        list.map(v => 
          v.id === id ? {...v, approved: true} : v
        )
      );
    } catch (error) {
      console.error('승인 실패:', error);
      alert('승인 요청에 실패했습니다.');
    }
  };

  const goToDetail = (id) => {
    // '/fof/101' 같은 주소로 이동합니다.
    navigate(`/profile/${id}`); 
  };

  // 실제 사용자 데이터와 친구 데이터를 기반으로 매칭
  const friendFofPairs = useMemo(() => {
    if (!Array.isArray(friends) || !Array.isArray(fof)) return [];
    
    // 실제 사용자 데이터 처리 - 로그인한 사용자 제외하고 다른 사용자들을 건너건너로 표시
    const currentUserId = parseInt(localStorage.getItem('user_id'));
    const otherUsers = fof.results ? fof.results.filter(user => user.id !== currentUserId) : [];
    
    return otherUsers.slice(0, 10).map((user, index) => ({
      friend: { 
        id: `friend_${index}`, 
        name: `공통 친구 ${index + 1}`, 
        img: '/friend-1.jpg' 
      },
      fof: {
        id: user.id,
        name: user.name,
        img: user.avatar_url || '/friend-1.jpg',
        phone: user.phone || '010-0000-0000',
        email: user.email,
        address: `${user.province_name} ${user.city_name}`,
        approved: false
      }
    }));
  }, [friends, fof]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    
    try {
      const response = await api.get(`/connections/search?q=${encodeURIComponent(q)}`);
      setFof(response.data);
    } catch (error) {
      console.error('검색 실패:', error);
      alert('검색에 실패했습니다.');
    }
  };


 if (loading) {
    return <div style={{ padding: 20 }}>로딩 중...</div>;
  }

 return (
  <div className='searchpage'>
      <form className='search-bar' onSubmit={onSubmit}>
        <input className='search-input'
          placeholder="필요한 명함을 검색하세요"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        >
        </input>
        <button className='search-btn'>검색</button>
      </form>

      {/* 리스트 헤더와 리스트를 모두 감싸는 컨테이너 */}
      <section className='list'>
        <div className='friend-card-header'>친구</div>
        <div className='fof-card-header'>건너건너</div>
        
        {/* 친구와 건너건너 명함을 나란히 배치 */}
      {friendFofPairs.map((pair, index) => (
          <React.Fragment key={index}>
            <div className='friend-list-item'>
              <FriendCard name={pair.friend.name} img={pair.friend.img} />
            </div>
            <div className='fof-list-item'>
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