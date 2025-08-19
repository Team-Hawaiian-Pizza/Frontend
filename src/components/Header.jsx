import React from 'react'
import {Link, NavLink} from 'react-router-dom';
import "../styles/Header.css"

// 두개의 props를 부모로 부터 전달 받음
const Header = ({isLogIn, onLogout}) => {
  return (
    <header className='header'>
        <div className='wrap'>
            <Link to="/" className='logo'>건너건너</Link>
            <nav className='header-nav'>
                <NavLink to="/mypage" className="item">Mypage</NavLink>
                <NavLink to="/search" className="item">Search</NavLink>
                <NavLink to="/chat" className="item">Chatting</NavLink>
                <NavLink to="/connect" className="item">Connection</NavLink>
                <button onClick={onLogout} className='logout'>Logout</button>
                
              {/* isLogin이 ture일 경우 -> 로그아웃 버튼*/}
              {isLogIn ? (
                  <button onClick={onLogout} className='logout'>Logout</button>
              ) : (
                  <NavLink to="/login" className='item'>Login / Signup</NavLink>
              )}
            </nav>  
        </div>
    </header>
  )
}

export default Header;