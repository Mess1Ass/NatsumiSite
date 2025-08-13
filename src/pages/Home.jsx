import React, { useState, useEffect } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // 组件挂载后触发动画
    setIsAnimating(true);
  }, []);

  return (
    <div className="home-container">
      <h1 className={`home-title ${isAnimating ? 'title-drop-animation' : ''}`}>
        夏沫安利站
      </h1>
      <div className="home-actions">
        <button className="game-btn" onClick={() => navigate('/about')}>
          偶像经历
        </button>
        <button className="game-btn" onClick={() => navigate('/focus')}>
          直拍链接
        </button>
      </div>
    </div>
  );
};

export default Home;
