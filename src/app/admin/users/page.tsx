'use client';

import { useQuery, api } from '@/lib/convexDisconnected';
import { useEffect, useState } from 'react';
import { FiUsers, FiCircle } from 'react-icons/fi';
import { getRegisteredUsers, USERS_EVENT, AdminUser } from '@/lib/adminData';

export default function AdminUsersPage() {
  const users = useQuery(api.admin.getAllUsers);
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    const refresh = () => setUsers(getRegisteredUsers());
    refresh();
    window.addEventListener(USERS_EVENT, refresh);
    return () => window.removeEventListener(USERS_EVENT, refresh);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FiUsers className="w-5 h-5 text-blue-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-sm text-zinc-400">{users?.length ?? 0} registered users</p>
        </div>
      </div>

      {!users || users.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-sm">No users yet</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0f0f1a] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-zinc-500">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Username</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.username} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-zinc-400">@{user.username}</td>
                    <td className="px-4 py-3 text-zinc-400 hidden sm:table-cell">{user.email || '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-xs ${user.isOnline ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        <FiCircle className="w-2 h-2 fill-current" />
                        {user.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
