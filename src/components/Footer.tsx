'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiMapPin, FiPhone, FiHeart, FiArrowUp } from 'react-icons/fi';
import LogoHorizontal from '@/components/LogoHorizontal';
import FooterModal from '@/components/FooterModal';

interface FooterItem {
  label: string;
  href?: string;
  isExternal?: boolean;
  modalKey?: string;
}

const footerLinks: {
  platform: FooterItem[];
  resources: FooterItem[];
  government: FooterItem[];
  company: FooterItem[];
} = {
  platform: [
    { label: 'Report an Issue', href: '/#evidence' },
    { label: 'Public Chat', href: '/chat' },
    { label: 'Trending Issues', href: '/#issues' },
    { label: 'Suggest Reforms', href: '/#reforms' },
    { label: 'Leaderboard', href: '/#leaderboard' },
  ],
  resources: [
    { label: 'Community Guidelines', modalKey: 'Community Guidelines' },
    { label: 'Privacy Policy', modalKey: 'Privacy Policy' },
    { label: 'Terms of Service', modalKey: 'Terms of Service' },
    { label: 'Safety Tips', modalKey: 'Safety Tips' },
    { label: 'FAQ', modalKey: 'FAQ' },
  ],
  government: [
    { label: 'RTI Portal', href: 'https://rtionline.gov.in', isExternal: true },
    { label: 'MyGov India', href: 'https://www.mygov.in', isExternal: true },
    { label: 'Digital India', href: 'https://www.digitalindia.gov.in', isExternal: true },
    { label: 'CPGRAMS', href: 'https://pgportal.gov.in', isExternal: true },
    { label: 'NITI Aayog', href: 'https://www.niti.gov.in', isExternal: true },
  ],
  company: [
    { label: 'About Us', href: '/#home' },
    { label: 'Our Team', href: '/#leaderboard' },
    { label: 'Careers', href: 'mailto:careers@civicpulse.in?subject=Careers%20Inquiry' },
    { label: 'Press Kit', href: 'mailto:press@civicpulse.in?subject=Press%20Kit%20Request' },
    { label: 'Contact Us', href: '/contact-admin' },
  ],
};

export default function Footer() {
  const pathname = usePathname();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <footer className="relative bg-primary dark:bg-primary-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="inline-flex">
                <LogoHorizontal size="md" showTagline={true} />
              </Link>
              <p className="text-sm text-white/70 leading-relaxed max-w-sm">
                Empowering every citizen to participate in democracy. Together, we build 
                a transparent, accountable, and better nation. CivicPulse.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: FiGithub, href: 'https://github.com', target: '_blank', rel: 'noopener noreferrer', label: 'GitHub' },
                  { icon: FiTwitter, href: 'https://twitter.com', target: '_blank', rel: 'noopener noreferrer', label: 'Twitter' },
                  { icon: FiLinkedin, href: 'https://linkedin.com', target: '_blank', rel: 'noopener noreferrer', label: 'LinkedIn' },
                  { icon: FiMail, href: 'mailto:hello@civicpulse.in', target: undefined, rel: undefined, label: 'Email' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.target}
                    rel={social.rel}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <social.icon className="w-4 h-4 text-white/70 hover:text-white" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-sm font-semibold text-white mb-4 capitalize">{title}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.modalKey ? (
                        <button
                          type="button"
                          onClick={() => setActiveModal(link.modalKey || null)}
                          className="text-sm text-white/60 hover:text-white transition-colors duration-200 text-left cursor-pointer"
                        >
                          {link.label}
                        </button>
                      ) : link.isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <a
                          href={link.href}
                          className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="grid sm:grid-cols-3 gap-4">
              <a
                href="https://maps.google.com/?q=New+Delhi,+India"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors"
              >
                <FiMapPin className="w-4 h-4 shrink-0" />
                CivicPulse Foundation, New Delhi, India
              </a>
              <a
                href="tel:+911800110000"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors"
              >
                <FiPhone className="w-4 h-4 shrink-0" />
                +91 *** **** ***
              </a>
              <a
                href="mailto:hello@civicpulse.in"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors"
              >
                <FiMail className="w-4 h-4 shrink-0" />
                hello@civicpulse.in
              </a>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50">
              © 2026 CivicPulse. Built with <FiHeart className="w-3.5 h-3.5 inline text-red-400" /> for a better India.
            </p>
            <Link href="/admin" className="text-[10px] text-white/30 hover:text-white/60 transition-colors">
              Admin
            </Link>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/70 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <FiArrowUp className="w-4 h-4" />
              Back to top
            </button>
          </div>
        </div>
      </footer>

      {activeModal && (
        <FooterModal
          label={activeModal}
          open={!!activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}
