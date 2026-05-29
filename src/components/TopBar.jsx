import React from 'react';
import Logo from './Logo';
import ProfileMenu from './ProfileMenu';

/**
 * TopBar — fixed bar across the top of step pages.
 * Logo (left) and ProfileMenu (right) sit in the same flex row — always aligned.
 */
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
        @media (max-width: 480px) {
          .pc-topbar { padding: 0 14px 0 16px; height: 56px; }
        }
      `}</style>

      <div className="pc-topbar">
        <Logo variant={logoVariant} onClick={onLogoClick} theme={theme} />
        <ProfileMenu />
      </div>
    </>
  );
}