import React from 'react';
import Logo from './Logo';
import ProfileMenu from './ProfileMenu';

export default function TopBar({ logoVariant = 'default', onLogoClick, theme = 'light' }) {
  return (
    <>
      <style>{`
        .pc-topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px 0 28px;
          z-index: 200;
          background: rgba(240, 244, 248, 0.88);
          background: rgba(240, 244, 248, 0.97);
          border-bottom: 1px solid rgba(226, 232, 240, 0.6);
        }
        .pc-topbar-blog-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #0f1f3d;
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: white;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .pc-topbar-blog-link:hover {
          border-color: #0f1f3d;
          background: #0f1f3d;
          color: white;
        }
        @media (max-width: 480px) {
          .pc-topbar { padding: 0 14px 0 16px; height: 56px; }
          .pc-topbar-blog-link span { display: none; }
        }
      `}</style>
      <div className="pc-topbar">
        <Logo variant={logoVariant} onClick={onLogoClick} theme={theme} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <a href="/blog" className="pc-topbar-blog-link">
            <i className="ti ti-article" />
            <span>Blog</span>
          </a>
          <ProfileMenu />
        </div>
      </div>
    </>
  );
}