import { useState } from 'react';

const FloatingContribution = ({ contribution, angle, distance, centerX, centerY, index, onClick }) => {
  const [hover, setHover] = useState(false);
  
  // Base angle for this contribution
  const baseAngle = angle;
  
  // Wrapper handles the positioning relative to the event
  const wrapperStyle = {
    position: 'absolute',
    left: centerX + 'px',
    top: centerY + 'px',
    width: '1px',
    height: '1px',
    zIndex: 60,
  };
  
  // Rotating container
  const rotatingStyle = {
    position: 'absolute',
    animation: `orbit ${20 + index * 2}s linear infinite`,
    animationDelay: `${index * 0.5}s`,
    transform: `rotate(${baseAngle}rad)`,
    transformOrigin: 'center',
  };
  
  // Position the box at distance from center
  const positionStyle = {
    position: 'absolute',
    left: `${distance}px`,
    top: '0',
    transform: 'translate(-50%, -50%)',
  };
  
  // Counter-rotate the content so text stays upright
  const contentStyle = {
    animation: `counterRotate ${20 + index * 2}s linear infinite`,
    animationDelay: `${index * 0.5}s`,
  };
  
  const boxStyle = {
    padding: '12px 16px',
    backgroundColor: hover ? 'rgba(245, 235, 220, 0.95)' : 'rgba(245, 235, 220, 0.85)',
    border: '2px solid #8B7355',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    width: '220px',
    color: '#3E2A1F',
    boxShadow: hover ? '0 6px 12px rgba(0,0,0,0.3)' : '0 3px 6px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
  };
  
  // Truncate content for floating preview
  const previewContent = contribution.content.length > 80 
    ? contribution.content.substring(0, 77) + '...'
    : contribution.content;
  
  return (
    <div style={wrapperStyle}>
      <div style={rotatingStyle}>
        <div style={positionStyle}>
          <div style={contentStyle}>
            <div
              style={boxStyle}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export {FloatingContribution}