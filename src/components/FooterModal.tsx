'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const content: Record<string, { title: string; body: string }> = {
  'Community Guidelines': {
    title: 'Community Guidelines',
    body: 'Help us keep the platform respectful and safe for everyone. Do not spread hate, harassment, fake information, or personal attacks. Uploaded videos and discussions should follow community rules and must not contain harmful or illegal content. Respect other users and use public chats responsibly.',
  },
  'Privacy Policy': {
    title: 'Privacy Policy',
    body: 'We value user privacy and work to protect your data. Basic account information, uploaded content, and platform activity may be stored securely to improve the service and maintain platform safety. We do not encourage sharing sensitive personal information publicly.',
  },
  'Terms of Service': {
    title: 'Terms of Service',
    body: 'By using this platform, users agree to follow all community rules and take responsibility for the content they upload or share. The platform reserves the right to remove harmful content, suspend accounts, or restrict access if rules are violated.',
  },
  'Safety Tips': {
    title: 'Safety Tips',
    body: 'Avoid sharing personal details publicly. Verify information before posting and avoid false accusations. Stay respectful during discussions and report harmful or abusive content using the reporting tools available on the platform.',
  },
  'FAQ': {
    title: 'FAQ',
    body: 'Find answers to common questions about public chats, video uploads, moderation, account safety, and platform features. This section helps users understand how the platform works and how content is reviewed.',
  },
};

export default function FooterModal({
  label,
  open,
  onClose,
}: {
  label: string;
  open: boolean;
  onClose: () => void;
}) {
  const data = content[label];
  if (!data) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-lg rounded-2xl bg-[#0c0c14] border border-white/5 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white">{data.title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm text-zinc-300 leading-relaxed">{data.body}</p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
