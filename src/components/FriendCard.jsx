import React from 'react';

const FriendCard = ({ name,img }) => {
  return (
    <div className="friend-card card">
      <div className="card-content">
        <img className="card-avatar" src={img} alt={name}/>
        <div className="card-name">{name}</div>
      </div>
    </div>
  );
};

export default FriendCard;