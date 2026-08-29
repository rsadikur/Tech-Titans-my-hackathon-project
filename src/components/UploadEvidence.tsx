'use client';

import { motion } from 'framer-motion';
import { FiUpload, FiShield, FiLock, FiCheckCircle, FiArrowRight, FiEye } from 'react-icons/fi';
import Link from 'next/link';

export default function UploadEvidence() {
  return (
    <section id="evidence" className="py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border dark:border-border-dark text-sm font-medium">
              <FiUpload className="w-4 h-4 text-primary dark:text-blue-400" />
              Upload Evidence
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary dark:text-white">
              Report with Evidence
            </h2>
            <p className="text-muted dark:text-muted-dark text-lg leading-relaxed">
              Strengthen your report with photos and videos. Every piece of evidence 
              is encrypted and handled with strict privacy protocols.
            </p>

            <div className="space-y-4">
              {[
                { icon: FiShield, title: 'End-to-End Encryption', desc: 'Your data is protected with military-grade encryption' },
                { icon: FiLock, title: 'Anonymous Option Available', desc: 'Choose to report anonymously to protect your identity' },
                { icon: FiCheckCircle, title: 'Verified Submission', desc: 'Each evidence piece is authenticated via blockchain timestamp' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg gradient-bg/10 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-primary dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary dark:text-white">{item.title}</h4>
                    <p className="text-xs text-muted dark:text-muted-dark">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative space-y-4"
          >
            <div className="p-8 rounded-3xl border border-border dark:border-border-dark glass text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                <FiUpload className="w-7 h-7 text-primary dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-primary dark:text-white mb-2">
                Upload Your Evidence
              </h3>
              <p className="text-sm text-muted dark:text-muted-dark mb-6">
                Go to the evidence upload page to submit photos and videos securely.
              </p>
              <Link
                href="/evidence"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/25"
              >
                <FiUpload className="w-4 h-4" />
                Upload Evidence
                <FiArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted dark:text-muted-dark">
                Supports photos and videos up to 100MB each
              </div>
            </div>

            <Link
              href="/videos"
              className="flex items-center justify-center gap-2 w-full p-4 rounded-3xl border border-border dark:border-border-dark glass text-sm font-medium text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white hover:border-primary/30 dark:hover:border-blue-400/30 transition-all"
            >
              <FiEye className="w-4 h-4" />
              View Approved Evidence Videos
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
