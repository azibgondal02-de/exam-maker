// components/TopBar.jsx
import React from 'react';
import Logo from './Logo';
import ProfileMenu from './ProfileMenu';

/**
 * TopBar — combines Logo (top-left) and ProfileMenu (top-right) into one component.
 *
 * Usage:
 *   import TopBar from '../../components/TopBar';
 *   <TopBar />                                  // default — large fixed logo
 *   <TopBar logoVariant="navbar" />             // compact logo (for mobile-heavy pages)
 *   <TopBar logoVariant="navbar" theme="dark" />// white logo text for dark toolbars
 *
 * Both Logo and ProfileMenu are fixed-position elements, so TopBar does not
 * occupy layout space — pages can render it once at the top of their JSX.
 */
export default function TopBar({ logoVariant = 'default', onLogoClick, theme = 'light' }) {
  return (
    <>
      <Logo variant={logoVariant} onClick={onLogoClick} theme={theme} />
      <ProfileMenu />
    </>
  );
}