import React, { useState, useEffect } from 'react';
import { Layout, Nav, Button } from '@douyinfe/semi-ui';
import { IconMenu, IconClose } from '@douyinfe/semi-icons';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
// import Focus from './pages/Focus';
// import Calendar from './pages/Calendar';
// import About from './pages/About';
import { getCurrentDomainConfig } from './config';
import DomainInfo from './components/DomainInfo';
import BowRain from './components/BowRain';

const { Header, Content } = Layout;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // 获取当前域名配置
  const domainConfig = getCurrentDomainConfig();
  
  // 根据域名设置不同的标题
  const getSiteTitle = () => {
    switch (domainConfig.name) {
      case 'chikaaidoru':
        return 'Natsumi安利站';
      case 'tool4me':
        return 'Natsumi安利站 - 编辑者模式';
      default:
        return 'Natsumi安利站';
    }
  };

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/home');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMenuOpen(false); // 关闭移动菜单
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 菜单项
  const navItems = [
    { itemKey: '/home', text: '首页' },
    // { itemKey: '/focus', text: '直拍链接合集' },
    // { itemKey: '/calendar', text: '演出日历' },
    // { itemKey: '/about', text: '关于' },
    
    // 可继续添加更多菜单项 
  ];

  // 移动端下滑菜单（Header下方）
  const mobileMenu = (
    <div
      style={{
        position: 'fixed',
        top: 64, // Header高度
        left: 0,
        width: '100vw',
        height: menuOpen ? 'calc(100vh - 64px)' : 0,
        background: 'rgba(255, 255, 255, 0.84)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: menuOpen ? 'center' : 'flex-start',
        overflow: 'hidden',
        transition: 'height 0.3s cubic-bezier(.4,0,.2,1)',
        pointerEvents: menuOpen ? 'auto' : 'none',
      }}
    >
      {navItems.map(item => (
        <Button
          key={item.itemKey}
          style={{
            margin: '16px 0',
            fontSize: 24,
            color: '#5a189a',
            background: 'transparent',
            border: 'none',
            width: 200,
            textAlign: 'center',
            fontWeight: location.pathname === item.itemKey ? 700 : 400,
            letterSpacing: 2,
            opacity: menuOpen ? 1 : 0,
            transition: 'opacity 0.2s 0.1s',
          }}
          onClick={() => {
            setMenuOpen(false);
            navigate(item.itemKey);
          }}
        >
          {item.text}
        </Button>
      ))}
    </div>
  );

  return (
    <Layout 
      className={`app-${domainConfig.theme}`}
      style={{ minHeight: '100vh', background: '#f5f7fa', width: '100vw', maxWidth: '100dvw', margin: '0 auto', overflowX: 'hidden' }}
    >
      {/* 全局蝴蝶结雨背景 */}
      <BowRain count={24} />
      <Header
        style={{
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 64,
          boxShadow: '0 2px 8px #f0f1f2',
          padding: '0 32px',
        }}
      >
        {/* 左侧LOGO和站名 */}
        <div style={{
          display: 'flex', alignItems: 'center', flex: '0 0 auto', 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}>
          <img src="/assets/Home/NerukoAvatar.jpg" alt="logo" style={{ width: 36, height: 36, borderRadius: '50%', marginRight: 12, objectFit: 'cover' }} />
          <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>{getSiteTitle()}</span>
        </div>
        {/* 中间Nav菜单，PC端显示，绝对居中 */}
        {!collapsed && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              height: '100%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              zIndex: 1,
              pointerEvents: 'auto',
            }}
          >
            <Nav
              mode="horizontal"
              items={navItems}
              selectedKeys={[location.pathname]}
              onSelect={({ itemKey }) => navigate(itemKey)}
              style={{ background: 'transparent', boxShadow: 'none' }}
              header={null}
              footer={null}
            />
          </div>
        )}
        {/* 右侧IconMenu/Close，移动端显示 */}
        <div style={{ flex: '0 0 auto', marginLeft: 'auto', zIndex: 2 }}>
          {collapsed && (
            <Button
              icon={menuOpen ? <IconClose style={{ fontSize: 28 }} /> : <IconMenu style={{ fontSize: 28 }} />}
              theme="borderless"
              style={{ fontSize: 24 }}
              onClick={() => setMenuOpen(v => !v)}
            />
          )}
        </div>
      </Header>
      {mobileMenu}
      <Content style={{ padding: 0, margin: '0 auto', width: '100vw', boxSizing: 'border-box' }}>
        <Routes>
          <Route path="/home" element={<Home />} />
          {/* <Route path="/focus" element={<Focus />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/about" element={<About />} /> */}
          {/* 其他路由 */}
        </Routes>
      </Content>
      <DomainInfo />
    </Layout>
  );
}

export default App;
