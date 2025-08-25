import React , { useEffect, useState } from 'react'
import {Link, NavLink, useNavigate} from 'react-router-dom';
import "../styles/Header.css"

// 두개의 props를 부모로 부터 전달 받음
const Header = ({isLogIn, onLogout}) => {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const navigate = useNavigate();

  // 로그인 변화에 맞춰 username 갱신
  useEffect(() => {
    const sync = () => setUsername(localStorage.getItem('username') || '');
    window.addEventListener('auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('auth-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <header className="header">
  <div className="wrap">
    <div className="brand">
      <img src="/logo.png" alt="GNGN 로고" className="brand-mark-img" />
      <Link to="/" className="logo"> 건너건너</Link>
    </div>

    <nav className="header-nav">
      <NavLink to="/mypage" className="item">Mypage</NavLink>
      <NavLink to="/search" className="item">Search</NavLink>
      <NavLink to="/chat" className="item">Chatting</NavLink>
      <NavLink to="/connect" className="item">Connection</NavLink>
      {isLogIn ? (
        <button className="logout" onClick={() => { onLogout(); navigate('/'); }}>
          Logout
        </button>
      ) : (
        <NavLink to="/login" className="item">Login / Signup</NavLink>
      )}
    </nav>
  </div>
</header>
  )
}

export default Header;