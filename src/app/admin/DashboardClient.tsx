'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getCountryFlag, CATEGORY_COLORS } from '@/lib/analytics';

interface ToolStat {
  _id: string;
  toolName: string;
  category: string;
  count: number;
  uniqueUsers: number;
  lastUsed: string;
}

interface CountryStat {
  _id: string;
  countryName: string;
  count: number;
}

interface DailyTrend {
  date: string;
  count: number;
  uniqueUsers: number;
}

interface RecentEvent {
  path: string;
  toolName: string;
  category: string;
  country: string;
  countryName: string;
  city: string;
  sessionId: string;
  timestamp: string;
}

interface UserStat {
  _id: string;
  totalEvents: number;
  tools: string[];
  country: string;
  countryName: string;
  city: string;
  ip: string;
  firstSeen: string;
  lastSeen: string;
}

interface Stats {
  totalEvents: number;
  uniqueUsers: number;
  byTool: ToolStat[];
  byCountry: CountryStat[];
  dailyTrend: DailyTrend[];
  recentEvents: RecentEvent[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function shortSession(id: string): string {
  return id.slice(0, 8) + '…';
}

export default function DashboardClient({
  stats,
  days: initialDays,
}: {
  stats: Stats;
  days: number;
}) {
  const [tab, setTab] = useState<'tools' | 'users' | 'events'>('tools');
  const [days, setDays] = useState(initialDays);
  const [users, setUsers] = useState<UserStat[] | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const router = useRouter();

  const topCountry =
    stats.byCountry[0]?.countryName || '—';

  async function loadUsers() {
    if (users) { setTab('users'); return; }
    setLoadingUsers(true);
    setTab('users');
    try {
      const res = await fetch(`/api/admin/users?days=${days}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  }

  function changeDays(d: number) {
    setDays(d);
    router.push(`/admin?days=${d}`);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛠️</span>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">UnifiedTools Pro Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={e => changeDays(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 1 year</option>
            </select>
            <button
              onClick={logout}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm px-3 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Views" value={stats.totalEvents.toLocaleString()} icon="👁️" color="indigo" />
          <StatCard label="Unique Users" value={stats.uniqueUsers.toLocaleString()} icon="👤" color="emerald" />
          <StatCard label="Tools Used" value={stats.byTool.length.toString()} icon="🔧" color="violet" />
          <StatCard label="Top Country" value={topCountry} icon="🌍" color="amber" />
        </div>

        {/* Daily Trend Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">
            📈 Daily Usage — Last {days} Days
          </h2>
          {stats.dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.dailyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickFormatter={d => d.slice(5)}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} name="Page Views" />
                <Bar dataKey="uniqueUsers" fill="#10b981" radius={[3, 3, 0, 0]} name="Unique Users" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-12">No data yet</p>
          )}
        </div>

        {/* Tabs */}
        <div>
          <div className="flex gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
            {(['tools', 'users', 'events'] as const).map(t => (
              <button
                key={t}
                onClick={() => t === 'users' ? loadUsers() : setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tab === t
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t === 'tools' ? '🔧 Tools' : t === 'users' ? '👥 Users' : '📋 Recent'}
              </button>
            ))}
          </div>

          {/* Tools Tab */}
          {tab === 'tools' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h2 className="text-sm font-semibold text-gray-300">Tool Usage Leaderboard</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">#</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Tool</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Category</th>
                        <th className="text-right px-6 py-3 text-gray-500 font-medium">Views</th>
                        <th className="text-right px-6 py-3 text-gray-500 font-medium">Users</th>
                        <th className="text-right px-6 py-3 text-gray-500 font-medium">Last Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.byTool.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-gray-500 py-12">No data yet</td>
                        </tr>
                      )}
                      {stats.byTool.map((tool, i) => (
                        <tr key={tool._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                          <td className="px-6 py-3 text-gray-500">{i + 1}</td>
                          <td className="px-6 py-3 font-medium text-gray-200">{tool.toolName}</td>
                          <td className="px-6 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[tool.category] || 'bg-gray-800 text-gray-400'}`}>
                              {tool.category}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right text-indigo-400 font-semibold">{tool.count.toLocaleString()}</td>
                          <td className="px-6 py-3 text-right text-emerald-400">{tool.uniqueUsers.toLocaleString()}</td>
                          <td className="px-6 py-3 text-right text-gray-500 text-xs">{timeAgo(tool.lastUsed)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Country Distribution */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h2 className="text-sm font-semibold text-gray-300">🌍 By Country</h2>
                </div>
                <div className="divide-y divide-gray-800">
                  {stats.byCountry.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-12">No data yet</p>
                  )}
                  {stats.byCountry.map(c => {
                    const pct = stats.totalEvents > 0
                      ? Math.round((c.count / stats.totalEvents) * 100)
                      : 0;
                    return (
                      <div key={c._id} className="px-6 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-300 flex items-center gap-2">
                            <span>{getCountryFlag(c._id)}</span>
                            <span>{c.countryName || c._id || 'Unknown'}</span>
                          </span>
                          <span className="text-sm font-semibold text-indigo-400">{c.count.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-gray-300">
                  👥 User Sessions — {days} Days
                </h2>
              </div>
              {loadingUsers ? (
                <div className="text-center text-gray-500 py-16">Loading users…</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Session</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Country</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">City</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">Tools Used</th>
                        <th className="text-right px-6 py-3 text-gray-500 font-medium">Views</th>
                        <th className="text-right px-6 py-3 text-gray-500 font-medium">First Seen</th>
                        <th className="text-right px-6 py-3 text-gray-500 font-medium">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(users || []).length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center text-gray-500 py-12">No users yet</td>
                        </tr>
                      )}
                      {(users || []).map(u => (
                        <tr key={u._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                          <td className="px-6 py-3 font-mono text-xs text-gray-400">{shortSession(u._id)}</td>
                          <td className="px-6 py-3 text-gray-300 flex items-center gap-2">
                            <span>{getCountryFlag(u.country)}</span>
                            <span>{u.countryName || u.country || '—'}</span>
                          </td>
                          <td className="px-6 py-3 text-gray-400 text-xs">{u.city || '—'}</td>
                          <td className="px-6 py-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {u.tools.slice(0, 4).map(t => (
                                <span key={t} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{t}</span>
                              ))}
                              {u.tools.length > 4 && (
                                <span className="text-xs text-gray-500">+{u.tools.length - 4}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right text-indigo-400 font-semibold">{u.totalEvents}</td>
                          <td className="px-6 py-3 text-right text-gray-500 text-xs">{timeAgo(u.firstSeen)}</td>
                          <td className="px-6 py-3 text-right text-gray-400 text-xs">{timeAgo(u.lastSeen)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Events Tab */}
          {tab === 'events' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-gray-300">📋 Recent Activity (last 100)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Time</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Tool</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Category</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Country</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">City</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentEvents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-gray-500 py-12">No activity yet</td>
                      </tr>
                    )}
                    {stats.recentEvents.map((ev, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                        <td className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">{timeAgo(ev.timestamp)}</td>
                        <td className="px-6 py-3 font-medium text-gray-200">{ev.toolName}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[ev.category] || 'bg-gray-800 text-gray-400'}`}>
                            {ev.category}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-300 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <span>{getCountryFlag(ev.country)}</span>
                            <span className="text-xs">{ev.countryName || ev.country || '—'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500 text-xs">{ev.city || '—'}</td>
                        <td className="px-6 py-3 font-mono text-xs text-gray-600">{shortSession(ev.sessionId)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: 'indigo' | 'emerald' | 'violet' | 'amber';
}) {
  const colors = {
    indigo: 'border-indigo-900/50 bg-indigo-950/30',
    emerald: 'border-emerald-900/50 bg-emerald-950/30',
    violet: 'border-violet-900/50 bg-violet-950/30',
    amber: 'border-amber-900/50 bg-amber-950/30',
  };
  return (
    <div className={`bg-gray-900 border rounded-2xl p-5 ${colors[color]}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}
