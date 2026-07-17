import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoUrl from '../assets/logo.png';
import './Nav.css';

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER || '923287600959';
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi, I want to learn more about PaperCraft.')}`;

export default function Nav({ active }) {
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: 'Features', href: '/#features' },
    { label: 'Watch Demo', href: '/#demo' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'How it works', href: '/#how' },
    { label: 'Blog', href: '/blog' },
  ];

  return (
    <>
      <nav>
        <a className="logo-wrap" href="/">
          {!logoFailed && (
            <img src={logoUrl} alt="PaperCraft" onError={() => setLogoFailed(true)} />
          )}
          {logoFailed && (
            <div className="logo-fallback">
              <span>P</span>
            </div>
          )}
          <span className="logo-name">Paper<b>Craft</b></span>
        </a>

        <div className="nav-links">
          {links.map(link => (
            <a
              key={link.label}
              href={link.href}
              className={active === link.label ? 'active' : ''}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav-ctas">
          <a href={WA_LINK} target="_blank" rel="noreferrer" className="btn-wa">
            <i className="ti ti-brand-whatsapp" /> <span>WhatsApp</span>
          </a>
          <button className="btn-ghost" onClick={() => navigate('/login')}>
            <span>Sign in</span>
          </button>
          <button
            className="hamburger"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(o => !o)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          {links.map(link => (
            <a key={link.label} href={link.href} className={active === link.label ? 'active' : ''}>
              {link.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
