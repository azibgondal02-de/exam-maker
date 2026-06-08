import React from 'react';
import logoImg from '../assets/logo.png';
import {
  IconBrandWhatsapp,
  IconMail,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTiktok,
  IconBrandLinkedin,
} from '@tabler/icons-react';

export default function AppFooter() {
  return (
    <footer style={{
      borderTop: '1px solid #e2e8f0',
      background: '#f8f9fc',
      padding: '20px 40px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>

        {/* Left — logo + copyright */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoImg} alt="PaperCraft" style={{ height: '24px', width: 'auto' }} />
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            © 2026 PaperCraft · Pakistan 🇵🇰
          </span>
        </div>

        {/* Right — social icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <SocialLink href="https://wa.me/923287600959" label="WhatsApp" color="#25d366">
            <IconBrandWhatsapp size={18} />
          </SocialLink>
          <SocialLink href="mailto:papercraftpak@gmail.com" label="Email" color="#ea4335">
            <IconMail size={18} />
          </SocialLink>
          <SocialLink href="https://instagram.com/PaperCraftPaki" label="Instagram" color="#e1306c">
            <IconBrandInstagram size={18} />
          </SocialLink>
          <SocialLink href="https://facebook.com/PaperCraftPaki" label="Facebook" color="#1877f2">
            <IconBrandFacebook size={18} />
          </SocialLink>
          <SocialLink href="https://tiktok.com/@PaperCraftPaki" label="TikTok" color="#010101">
            <IconBrandTiktok size={18} />
          </SocialLink>
          <SocialLink href="https://linkedin.com/company/papercraftpaki/" label="LinkedIn" color="#0077b5">
            <IconBrandLinkedin size={18} />
          </SocialLink>
        </div>

      </div>
    </footer>
  );
}

function SocialLink({ href, label, color, children }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href={href}
      target={href.startsWith('mailto') ? undefined : '_blank'}
      rel="noreferrer"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '34px',
        height: '34px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: hovered ? color : '#94a3b8',
        background: hovered ? `${color}12` : 'transparent',
        transition: 'all 0.2s',
        textDecoration: 'none',
      }}
    >
      {children}
    </a>
  );
}