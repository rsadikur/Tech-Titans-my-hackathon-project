'use client';

import { motion } from 'framer-motion';
import {
  FiUpload, FiUsers, FiCheckCircle, FiTrendingUp,
  FiCalendar, FiDownload
} from 'react-icons/fi';

const stats = [
  { label: 'Total Reports', value: '1,245', change: '+12.5%', icon: FiUpload, color: 'from-blue-500 to-blue-600' },
  { label: 'Active Citizens', value: '4,823', change: '+8.2%', icon: FiUsers, color: 'from-emerald-500 to-emerald-600' },
  { label: 'Issues Solved', value: '812', change: '+23.1%', icon: FiCheckCircle, color: 'from-green-500 to-green-600' },
  { label: 'Resolution Rate', value: '65.2%', change: '+5.3%', icon: FiTrendingUp, color: 'from-purple-500 to-purple-600' },
];

const recentReports = [
  { id: 1, title: 'Potholes on MG Road', category: 'Roads', status: 'In Progress', priority: 'High', date: '2h ago', upvotes: 234 },
  { id: 2, title: 'PDS Corruption Allegations', category: 'Corruption', status: 'Under Review', priority: 'Critical', date: '5h ago', upvotes: 189 },
  { id: 3, title: 'School Infrastructure Upgrade', category: 'Education', status: 'Open', priority: 'Medium', date: '1d ago', upvotes: 156 },
  { id: 4, title: 'Water Supply Crisis', category: 'Infrastructure', status: 'Urgent', priority: 'Critical', date: '12h ago', upvotes: 215 },
  { id: 5, title: 'Smart Traffic Management', category: 'Technology', status: 'Proposed', priority: 'Medium', date: '3d ago', upvotes: 98 },
];

const categoryData = [
  { name: 'Roads', count: 312, color: 'bg-orange-500' },
  { name: 'Corruption', count: 289, color: 'bg-red-500' },
  { name: 'Education', count: 234, color: 'bg-blue-500' },
  { name: 'Technology', count: 198, color: 'bg-purple-500' },
  { name: 'Healthcare', count: 167, color: 'bg-green-500' },
];

const activityData = [
  { day: 'Mon', reports: 45, resolved: 12 },
  { day: 'Tue', reports: 52, resolved: 18 },
  { day: 'Wed', reports: 38, resolved: 24 },
  { day: 'Thu', reports: 61, resolved: 15 },
  { day: 'Fri', reports: 47, resolved: 22 },
  { day: 'Sat', reports: 29, resolved: 19 },
  { day: 'Sun', reports: 35, resolved: 14 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white">Dashboard</h1>
            <p className="text-muted dark:text-muted-dark text-sm mt-1">
              Real-time overview of civic engagement activity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-border dark:border-border-dark text-sm font-medium text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-all duration-200">
              <FiCalendar className="w-4 h-4" />
              Last 7 days
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold shadow-lg shadow-primary/25">
              <FiDownload className="w-4 h-4" />
              Export
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-5 rounded-2xl glass border border-border dark:border-border-dark card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-primary dark:text-white">{stat.value}</div>
              <div className="text-sm text-muted dark:text-muted-dark">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2 p-6 rounded-2xl glass border border-border dark:border-border-dark"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-primary dark:text-white">Weekly Activity</h3>
              <div className="flex items-center gap-4 text-xs text-muted dark:text-muted-dark">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary dark:bg-blue-400" />
                  Reports
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-green" />
                  Resolved
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2 h-40">
              {activityData.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5">
                    <div
                      className="w-full max-w-[32px] rounded-t-lg bg-primary/80 dark:bg-blue-500/80 transition-all duration-300 hover:bg-primary dark:hover:bg-blue-400"
                      style={{ height: `${(day.reports / 61) * 140}px` }}
                    />
                    <div
                      className="w-full max-w-[32px] rounded-t-lg bg-accent-green/80 transition-all duration-300 hover:bg-accent-green"
                      style={{ height: `${(day.resolved / 61) * 140}px` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted dark:text-muted-dark mt-1">{day.day}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="p-6 rounded-2xl glass border border-border dark:border-border-dark"
          >
            <h3 className="font-semibold text-primary dark:text-white mb-4">By Category</h3>
            <div className="space-y-4">
              {categoryData.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted dark:text-muted-dark">{cat.name}</span>
                    <span className="font-semibold text-primary dark:text-white">{cat.count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-border dark:bg-border-dark overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(cat.count / 312) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-full rounded-full ${cat.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Reports Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl glass border border-border dark:border-border-dark overflow-hidden"
        >
          <div className="p-6 flex items-center justify-between border-b border-border dark:border-border-dark">
            <h3 className="font-semibold text-primary dark:text-white">Recent Reports</h3>
            <button className="text-sm text-primary dark:text-blue-400 font-medium hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted dark:text-muted-dark border-b border-border dark:border-border-dark">
                  <th className="text-left px-6 py-4 font-medium">Issue</th>
                  <th className="text-left px-6 py-4 font-medium">Category</th>
                  <th className="text-left px-6 py-4 font-medium">Status</th>
                  <th className="text-left px-6 py-4 font-medium">Priority</th>
                  <th className="text-left px-6 py-4 font-medium">Date</th>
                  <th className="text-right px-6 py-4 font-medium">Upvotes</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-border dark:border-border-dark last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-primary dark:text-white">{report.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-muted dark:text-muted-dark">{report.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        report.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500' :
                        report.status === 'Under Review' ? 'bg-blue-500/10 text-blue-500' :
                        report.status === 'Open' ? 'bg-green-500/10 text-green-500' :
                        report.status === 'Urgent' ? 'bg-red-500/10 text-red-500' :
                        'bg-purple-500/10 text-purple-500'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold ${
                        report.priority === 'Critical' ? 'text-red-500' :
                        report.priority === 'High' ? 'text-orange-500' :
                        'text-green-500'
                      }`}>
                        {report.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted dark:text-muted-dark">{report.date}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-primary dark:text-white">{report.upvotes}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
