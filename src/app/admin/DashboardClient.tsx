'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { getCountryFlag, CATEGORY_COLORS } from '@/lib/analytics';
import {
  LayoutDashboard, Wrench, Globe2, Users, Activity,
  UserCheck, LogOut, TrendingUp, Eye, MousePointerClick,
  Clock, MapPin, ChevronRight, Layers, Shield,
  ArrowUpRight, Menu, X, Ban, Trash2, Download,
  Megaphone, Plus, CheckCircle2,
} from 'lucide-react';

/* ── Types ── */
interface ToolStat   { _id: string; toolName: string; category: string; count: number; uniqueUsers: number; lastUsed: string; }
interface CountryStat{ _id: string; countryName: string; count: number; }
interface DailyTrend { date: string; count: number; uniqueUsers: number; }
interface RecentEvent{ path: string; toolName: string; category: string; country: string; countryName: string; city: string; sessionId: string; timestamp: string; }
interface UserStat   { _id: string; totalEvents: number; tools: string[]; country: string; countryName: string; city: string; ip: string; firstSeen: string; lastSeen: string; }
interface Stats {
  totalEvents: number; uniqueUsers: number;
  registeredUsers: number; activeSessions: number;
  byTool: ToolStat[]; byCountry: CountryStat[];
  dailyTrend: DailyTrend[]; recentEvents: RecentEvent[];
}

/* ── Helpers ── */
function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
const shortId = (id: string) => id.slice(0, 8) + '…';

/* ── Stat Card ── */
function KPI({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string;
  icon: any; accent: string;
}) {
  return (
    <div className={`bg-[#0d1526] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-white/10 transition-all`}>
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 ${accent}`} />
      <div className="relative z-10">
        <div className={`inline-flex p-2.5 rounded-xl mb-3 ${accent} bg-opacity-15`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <p className="text-2xl font-black text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-slate-600 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-black text-white">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

/* ── Nav items ── */
const NAV = [
  { key: 'overview',      label: 'Overview',         icon: LayoutDashboard },
  { key: 'tools',         label: 'Tool Analytics',   icon: Wrench },
  { key: 'countries',     label: 'Countries',        icon: Globe2 },
  { key: 'sessions',      label: 'Visitor Sessions', icon: Users },
  { key: 'activity',      label: 'Live Activity',    icon: Activity },
  { key: 'members',       label: 'Registered Users', icon: UserCheck },
  { key: 'announcements', label: 'Announcements',    icon: Megaphone },
] as const;
type NavKey = typeof NAV[number]['key'];

/* ══════════════════════════════════════════════════════════════ */
export default function DashboardClient({ stats, days: initialDays }: { stats: Stats; days: number }) {
  const router = useRouter();
  const [nav, setNav]           = useState<NavKey>('overview');
  const [days, setDays]         = useState(initialDays);
  const [sessions, setSessions] = useState<UserStat[] | null>(null);
  const [loadingSess, setLoadingSess] = useState(false);
  const [members, setMembers]   = useState<any[] | null>(null);
  const [loadingMem, setLoadingMem]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[] | null>(null);
  const [loadingAnn, setLoadingAnn] = useState(false);
  const [newAnnMsg, setNewAnnMsg] = useState('');
  const [newAnnType, setNewAnnType] = useState('info');
  const [annPosting, setAnnPosting] = useState(false);

  const totalViews = stats.totalEvents;
  const topTool    = stats.byTool[0]?.toolName || '—';
  const topCountry = stats.byCountry[0]?.countryName || '—';

  function changeDays(d: number) { setDays(d); router.push(`/admin?days=${d}`); }
  async function logout() { await fetch('/api/admin/auth', { method: 'DELETE' }); router.push('/admin/login'); }

  async function goTo(key: NavKey) {
    setNav(key);
    setSidebarOpen(false);
    if (key === 'sessions' && !sessions) {
      setLoadingSess(true);
      const data = await fetch(`/api/admin/users?days=${days}`).then(r => r.json()).catch(() => ({ users: [] }));
      setSessions(data.users || []);
      setLoadingSess(false);
    }
    if (key === 'members' && !members) {
      setLoadingMem(true);
      const data = await fetch(`/api/admin/members`).then(r => r.json()).catch(() => ({ members: [] }));
      setMembers(data.members || []);
      setLoadingMem(false);
    }
    if (key === 'announcements' && !announcements) {
      setLoadingAnn(true);
      const data = await fetch('/api/admin/announcements').then(r => r.json()).catch(() => ({ announcements: [] }));
      setAnnouncements(data.announcements || []);
      setLoadingAnn(false);
    }
  }

  /* ── Sidebar ── */
  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600/20 p-1.5 rounded-lg border border-indigo-500/20">
            <Shield className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-black text-sm tracking-tight">Admin Panel</p>
            <p className="text-slate-500 text-[10px]">UnifiedTools Pro</p>
          </div>
        </div>
      </div>

      {/* Period filter */}
      <div className="px-4 py-3 border-b border-white/5">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Data Period</p>
        <select value={days} onChange={e => changeDays(Number(e.target.value))}
          className="w-full bg-white/5 border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last 1 year</option>
        </select>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3 mb-2">Navigation</p>
        {NAV.map(item => (
          <button key={item.key} onClick={() => goTo(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left group ${
              nav === item.key
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
            {nav === item.key && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060c1a] flex">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#090f1e] border-r border-white/5 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 inset-y-0 w-64 bg-[#090f1e] border-r border-white/5 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <span className="text-white font-black text-sm">Admin Panel</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto"><Sidebar /></div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-[#090f1e]/90 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white/5">
              <Menu className="h-5 w-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-sm font-black text-white">{NAV.find(n => n.key === nav)?.label || 'Overview'}</h1>
              <p className="text-[10px] text-slate-500">Last {days} days • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-3 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-indigo-300">Admin</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 space-y-6">

          {/* ════════ OVERVIEW ════════ */}
          {nav === 'overview' && (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <KPI label="Total Page Views"    value={totalViews}             icon={Eye}            accent="bg-indigo-500"  sub={`In last ${days} days`} />
                <KPI label="Unique Visitors"     value={stats.uniqueUsers}      icon={Users}          accent="bg-blue-500"    sub="Distinct sessions" />
                <KPI label="Registered Users"    value={stats.registeredUsers}  icon={UserCheck}      accent="bg-emerald-500" sub="All time signups" />
                <KPI label="Active Sessions"     value={stats.activeSessions}   icon={MousePointerClick} accent="bg-violet-500" sub="Currently logged in" />
                <KPI label="Tools Available"     value={stats.byTool.length}    icon={Wrench}         accent="bg-pink-500"    sub="Being tracked" />
                <KPI label="Top Country"         value={topCountry}             icon={Globe2}         accent="bg-amber-500"   sub="Most visitors from" />
              </div>

              {/* Daily Trend Chart */}
              <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-6">
                <SectionHeader title="📈 Daily Traffic Trend" subtitle="Page views and unique visitors per day" />
                {stats.dailyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={stats.dailyTrend} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #ffffff15', borderRadius: 12 }}
                        labelStyle={{ color: '#e2e8f0' }} itemStyle={{ color: '#94a3b8' }} />
                      <Legend wrapperStyle={{ color: '#64748b', fontSize: 12 }} />
                      <Area type="monotone" dataKey="count"       name="Page Views"     stroke="#6366f1" strokeWidth={2} fill="url(#gViews)" dot={false} />
                      <Area type="monotone" dataKey="uniqueUsers" name="Unique Visitors" stroke="#10b981" strokeWidth={2} fill="url(#gUsers)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No data for this period yet</div>
                )}
              </div>

              {/* Top tools + Top countries */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Top 5 tools */}
                <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-6">
                  <SectionHeader title="🏆 Top 5 Tools" subtitle="Most used tools this period" />
                  <div className="space-y-3">
                    {stats.byTool.slice(0, 5).map((tool, i) => {
                      const pct = stats.totalEvents > 0 ? Math.round((tool.count / stats.totalEvents) * 100) : 0;
                      return (
                        <div key={tool._id}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-600 w-4">#{i+1}</span>
                              <span className="text-sm font-bold text-slate-200">{tool.toolName}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${CATEGORY_COLORS[tool.category] || 'bg-slate-800 text-slate-400'}`}>
                                {tool.category}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-indigo-400">{tool.count.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-600 ml-1">views</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {stats.byTool.length === 0 && <p className="text-slate-600 text-sm text-center py-6">No tool usage data yet</p>}
                  </div>
                </div>

                {/* Top countries */}
                <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-6">
                  <SectionHeader title="🌍 Top Countries" subtitle="Where your visitors come from" />
                  <div className="space-y-3">
                    {stats.byCountry.slice(0, 6).map(c => {
                      const pct = stats.totalEvents > 0 ? Math.round((c.count / stats.totalEvents) * 100) : 0;
                      return (
                        <div key={c._id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-300 flex items-center gap-2">
                              <span className="text-base">{getCountryFlag(c._id)}</span>
                              <span>{c.countryName || c._id || 'Unknown'}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-indigo-400">{c.count.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded-md">{pct}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {stats.byCountry.length === 0 && <p className="text-slate-600 text-sm text-center py-6">No country data yet</p>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════════ TOOLS ════════ */}
          {nav === 'tools' && (
            <>
              <SectionHeader title="🔧 Tool Usage Leaderboard" subtitle={`All tools ranked by page views in last ${days} days`} />
              <div className="bg-[#0d1526] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">#</th>
                        <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Tool Name</th>
                        <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Category</th>
                        <th className="px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Usage Bar</th>
                        <th className="text-right px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Page Views</th>
                        <th className="text-right px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Unique Users</th>
                        <th className="text-right px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Last Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.byTool.length === 0
                        ? <tr><td colSpan={7} className="text-center text-slate-600 py-16">No tool usage data yet</td></tr>
                        : stats.byTool.map((tool, i) => {
                          const pct = stats.byTool[0]?.count > 0 ? Math.round((tool.count / stats.byTool[0].count) * 100) : 0;
                          return (
                            <tr key={tool._id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition">
                              <td className="px-5 py-3.5">
                                <span className={`text-xs font-black w-6 h-6 rounded-lg flex items-center justify-center ${i < 3 ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-600'}`}>{i+1}</span>
                              </td>
                              <td className="px-5 py-3.5 font-bold text-slate-200">{tool.toolName}</td>
                              <td className="px-5 py-3.5">
                                <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${CATEGORY_COLORS[tool.category] || 'bg-slate-800 text-slate-400'}`}>{tool.category}</span>
                              </td>
                              <td className="px-5 py-3.5 w-32">
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-right font-black text-indigo-400">{tool.count.toLocaleString()}</td>
                              <td className="px-5 py-3.5 text-right text-emerald-400 font-bold">{tool.uniqueUsers.toLocaleString()}</td>
                              <td className="px-5 py-3.5 text-right text-slate-600 text-xs">{timeAgo(tool.lastUsed)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ════════ COUNTRIES ════════ */}
          {nav === 'countries' && (
            <>
              <SectionHeader title="🌍 Traffic by Country" subtitle="All countries sorted by number of visits" />
              <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-6">
                <div className="space-y-4">
                  {stats.byCountry.length === 0
                    ? <p className="text-slate-600 text-sm text-center py-12">No country data yet</p>
                    : stats.byCountry.map((c, i) => {
                      const pct = stats.totalEvents > 0 ? ((c.count / stats.totalEvents) * 100) : 0;
                      return (
                        <div key={c._id} className="flex items-center gap-4">
                          <span className="text-slate-600 text-xs w-5 text-right">{i+1}</span>
                          <span className="text-2xl w-8 text-center">{getCountryFlag(c._id)}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-bold text-slate-200">{c.countryName || c._id || 'Unknown'}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-white">{c.count.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-md font-bold">{pct.toFixed(1)}%</span>
                              </div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}

          {/* ════════ SESSIONS ════════ */}
          {nav === 'sessions' && (
            <>
              <SectionHeader title="👥 Visitor Sessions" subtitle={`Anonymous visitor sessions in last ${days} days (max 200)`} />
              <div className="bg-[#0d1526] border border-white/5 rounded-2xl overflow-hidden">
                {loadingSess
                  ? <div className="text-center text-slate-600 py-16 text-sm">Loading visitor sessions…</div>
                  : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Session ID</th>
                          <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Country</th>
                          <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">City</th>
                          <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Tools Used</th>
                          <th className="text-right px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Views</th>
                          <th className="text-right px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">First Visit</th>
                          <th className="text-right px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Last Visit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(sessions || []).length === 0
                          ? <tr><td colSpan={7} className="text-center text-slate-600 py-14">No sessions yet</td></tr>
                          : (sessions || []).map(u => (
                          <tr key={u._id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition">
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-500 bg-white/[0.02]">{shortId(u._id)}</td>
                            <td className="px-5 py-3.5 text-slate-300">
                              <span className="flex items-center gap-2">
                                <span className="text-base">{getCountryFlag(u.country)}</span>
                                <span className="text-xs">{u.countryName || u.country || '—'}</span>
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 text-xs">{u.city || '—'}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-wrap gap-1">
                                {u.tools.slice(0, 3).map(t => (
                                  <span key={t} className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-md">{t}</span>
                                ))}
                                {u.tools.length > 3 && <span className="text-[10px] text-slate-600">+{u.tools.length - 3} more</span>}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right font-black text-indigo-400">{u.totalEvents}</td>
                            <td className="px-5 py-3.5 text-right text-slate-600 text-xs">{timeAgo(u.firstSeen)}</td>
                            <td className="px-5 py-3.5 text-right text-slate-400 text-xs">{timeAgo(u.lastSeen)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ════════ ACTIVITY ════════ */}
          {nav === 'activity' && (
            <>
              <SectionHeader title="📋 Live Activity Feed" subtitle="Latest 100 page visits in real-time order" />
              <div className="bg-[#0d1526] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Time</th>
                        <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Tool Used</th>
                        <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Category</th>
                        <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Country</th>
                        <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">City</th>
                        <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Session</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentEvents.length === 0
                        ? <tr><td colSpan={6} className="text-center text-slate-600 py-14">No activity yet</td></tr>
                        : stats.recentEvents.map((ev, i) => (
                        <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition">
                          <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                              {timeAgo(ev.timestamp)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-200">{ev.toolName}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${CATEGORY_COLORS[ev.category] || 'bg-slate-800 text-slate-400'}`}>{ev.category}</span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">
                            <span className="flex items-center gap-2">
                              <span className="text-base">{getCountryFlag(ev.country)}</span>
                              <span className="text-xs">{ev.countryName || ev.country || '—'}</span>
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs">{ev.city || '—'}</td>
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{shortId(ev.sessionId)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ════════ MEMBERS ════════ */}
          {nav === 'members' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <SectionHeader title="👤 Registered Members" subtitle="Users who created an account on this platform" />
                <div className="flex items-center gap-2">
                  {/* CSV Export */}
                  <button
                    onClick={() => {
                      if (!members || members.length === 0) return;
                      const rows = ['#,Name,Email,Joined,Status',
                        ...members.map((m, i) => `${i+1},"${m.name}",${m.email},${m.createdAt},${m.isBanned ? 'Banned' : 'Active'}`)
                      ];
                      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
                      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                      a.download = `members-${Date.now()}.csv`; a.click();
                    }}
                    className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 transition-all">
                    <Download className="h-3.5 w-3.5" /> Export CSV
                  </button>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black px-3 py-1.5 rounded-xl">
                    {stats.registeredUsers} total members
                  </div>
                </div>
              </div>
              <div className="bg-[#0d1526] border border-white/5 rounded-2xl overflow-hidden">
                {loadingMem
                  ? <div className="text-center text-slate-600 py-16 text-sm">Loading members…</div>
                  : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">#</th>
                          <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Name</th>
                          <th className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Email</th>
                          <th className="text-right px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Joined</th>
                          <th className="text-right px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Status</th>
                          <th className="text-right px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(members || []).length === 0
                          ? <tr><td colSpan={6} className="text-center text-slate-600 py-14">No registered users yet</td></tr>
                          : (members || []).map((m, i) => (
                          <tr key={m._id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition">
                            <td className="px-5 py-3.5 text-slate-600 text-xs">{i + 1}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0 ${m.isBanned ? 'bg-red-600/30' : 'bg-gradient-to-br from-indigo-600 to-violet-600'}`}>
                                  {m.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                  <span className={`font-bold text-sm ${m.isBanned ? 'text-red-400 line-through' : 'text-slate-200'}`}>{m.name}</span>
                                  {m.isBanned && <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-md font-bold">BANNED</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-400 text-xs">{m.email}</td>
                            <td className="px-5 py-3.5 text-right text-slate-500 text-xs">{timeAgo(m.createdAt)}</td>
                            <td className="px-5 py-3.5 text-right">
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${m.isBanned ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {m.isBanned ? 'Banned' : 'Active'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  title={m.isBanned ? 'Unban user' : 'Ban user'}
                                  onClick={async () => {
                                    const action = m.isBanned ? 'unban' : 'ban';
                                    if (!confirm(`${action === 'ban' ? 'Ban' : 'Unban'} ${m.name}?`)) return;
                                    const res = await fetch('/api/admin/members', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: m._id, action }) });
                                    if (res.ok) setMembers(prev => prev!.map(u => u._id === m._id ? {...u, isBanned: action === 'ban'} : u));
                                  }}
                                  className={`p-1.5 rounded-lg transition-all ${m.isBanned ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-amber-400 hover:bg-amber-500/10'}`}>
                                  <Ban className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  title="Delete user"
                                  onClick={async () => {
                                    if (!confirm(`Permanently delete ${m.name}? This cannot be undone.`)) return;
                                    const res = await fetch('/api/admin/members', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: m._id }) });
                                    if (res.ok) setMembers(prev => prev!.filter(u => u._id !== m._id));
                                  }}
                                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ════════ ANNOUNCEMENTS ════════ */}
          {nav === 'announcements' && (
            <>
              <SectionHeader title="📢 Announcements" subtitle="Create site-wide banners visible to all visitors" />

              {/* Create new */}
              <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-6 space-y-4">
                <p className="text-sm font-black text-white">New Announcement</p>
                <textarea
                  value={newAnnMsg}
                  onChange={e => setNewAnnMsg(e.target.value)}
                  placeholder="Enter announcement message…"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 resize-none transition-colors"
                />
                <div className="flex items-center gap-3">
                  <select value={newAnnType} onChange={e => setNewAnnType(e.target.value)}
                    className="bg-white/5 border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none">
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="success">Success (Green)</option>
                    <option value="promo">Promo (Purple)</option>
                  </select>
                  <button
                    disabled={!newAnnMsg.trim() || annPosting}
                    onClick={async () => {
                      setAnnPosting(true);
                      const res = await fetch('/api/admin/announcements', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ message: newAnnMsg, type: newAnnType }) });
                      const data = await res.json();
                      if (res.ok) {
                        setAnnouncements(prev => [{ _id: data._id, message: newAnnMsg, type: newAnnType, createdAt: new Date().toISOString() }, ...(prev || [])]);
                        setNewAnnMsg('');
                      }
                      setAnnPosting(false);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black px-4 py-2 rounded-xl transition-all">
                    <Plus className="h-3.5 w-3.5" /> Publish
                  </button>
                </div>
              </div>

              {/* List */}
              {loadingAnn ? (
                <div className="text-center text-slate-600 py-12 text-sm">Loading…</div>
              ) : (announcements || []).length === 0 ? (
                <div className="text-center text-slate-600 py-12 text-sm">No active announcements</div>
              ) : (
                <div className="space-y-3">
                  {(announcements || []).map(a => (
                    <div key={a._id} className="bg-[#0d1526] border border-white/5 rounded-2xl px-5 py-4 flex items-center gap-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider flex-shrink-0 ${
                        a.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                        a.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                        a.type === 'promo'   ? 'bg-violet-500/20 text-violet-400' :
                                              'bg-indigo-500/20 text-indigo-400'
                      }`}>{a.type}</span>
                      <p className="flex-1 text-sm text-slate-300">{a.message}</p>
                      <span className="text-[10px] text-slate-600 flex-shrink-0">{timeAgo(a.createdAt)}</span>
                      <button
                        onClick={async () => {
                          if (!confirm('Dismiss this announcement?')) return;
                          const res = await fetch('/api/admin/announcements', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: a._id }) });
                          if (res.ok) setAnnouncements(prev => prev!.filter(x => x._id !== a._id));
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}
