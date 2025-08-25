import React from 'react';
import "../pages/Search/FriendCard.css";

const FriendCard = ({ name,img }) => {
  return (
    <div className="friend-card card">
        <img className="card-avatar" src={img || '/logo.png'} alt={name}/>
        <div className="card-name">{name}</div>
    </div>
  );
};

export default FriendCard;