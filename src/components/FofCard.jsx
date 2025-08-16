import React from 'react';

const FofCard = ({ name, img, phone, email, address, approved, onDetailClick }) => {
  return (
    <article 
      className="fof-card card" 
      onClick={onDetailClick}
      style={{ cursor: 'pointer' }} // 클릭 가능함을 나타내는 커서
    >
      <div className="card-content">
        <div className="card-avatar">
          <img src={img} alt={name} />
        </div>
        <div className="card-info">
          <div className="card-name">{name}</div>

          {approved ? (
            // approved가 true일 때: 실제 정보 노출
            <div className="card-info-detail">
              <span>{phone}</span> 
              <span>{email}</span>
              <span>{address}</span>
            </div>
          ) : (
            // approved가 false일 때: 블러 처리된 정보 노출
            <div className="card-info-blurred">
              <span className="card-guide">
                친구 요청 후 확인 가능한 정보
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="card-actions">
      </div>
    </article>
  );
};

export default FofCard;