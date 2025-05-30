import { useState } from 'react';

const FloatingContribution = ({ contribution, angle, distance, onClick }) => {
  const [hover, setHover] = useState(false);
  
  // Calculate position based on angle and distance
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  
  const style = {
    position: 'absolute',
    left: `${50 + x}%`,
    top: `${50 + y}%`,
    transform: 'translate(-50%, -50%)',
    padding: '8px 12px',
    backgroundColor: hover ? 'rgba(245, 235, 220, 0.95)' : 'rgba(245, 235, 220, 0.8)',
    border: '1px solid #8B7355',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    maxWidth: '150px',
    color: '#3E2A1F',
    boxShadow: hover ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    animation: `float ${10 + Math.random() * 5}s ease-in-out infinite`,
    animationDelay: `${Math.random() * 5}s`,
  };
  
  // Truncate content for floating preview
  const previewContent = contribution.content.length > 50 
    ? contribution.content.substring(0, 47) + '...'
    : contribution.content;
  
  return (
    <div
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onClick(contribution)}
    >
      <div style={{ fontStyle: contribution.type === 'poetry' ? 'italic' : 'normal' }}>
        {previewContent}
      </div>
      <div style={{ fontSize: '10px', color: '#6B5423', marginTop: '4px' }}>
        — {contribution.type}
      </div>
    </div>
  );
};

export {FloatingContribution}