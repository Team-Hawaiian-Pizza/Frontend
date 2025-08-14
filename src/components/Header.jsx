import React from 'react'
import {Link, NavLink} from 'react-router-dom';
import "../styles/Header.css"

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
                
              {/*
              {isLogIn ? (
                  <button onClick={onLogout} className='logout'>Logout</button>
              ) : (
                  <NavLink to="/login" className='item'>Login / Signup</NavLink>
              )}*/}

            </nav>  
        </div>
    </header>
  )
}

export default Header;