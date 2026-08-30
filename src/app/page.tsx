'use client';

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";

// Skeleton shimmer used as fallback while lazy sections load
function SectionSkeleton() {
  return (
    <div className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl w-48 mx-auto" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-xl w-80 mx-auto" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Below-the-fold sections are lazy loaded — zero JS cost on initial page load
const TrendingIssues = dynamic(() => import("@/components/TrendingIssues"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const UploadEvidence = dynamic(() => import("@/components/UploadEvidence"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const SuggestReforms = dynamic(() => import("@/components/SuggestReforms"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const CommunityStats = dynamic(() => import("@/components/CommunityStats"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const Leaderboard = dynamic(() => import("@/components/Leaderboard"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <TrendingIssues />
      <UploadEvidence />
      <SuggestReforms />
      <CommunityStats />
      <Leaderboard />
    </div>
  );
}
