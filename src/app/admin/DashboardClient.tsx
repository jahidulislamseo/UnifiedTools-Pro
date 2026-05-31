'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { getCountryFlag, CATEGORY_COLORS, TOOL_INFO } from '@/lib/analytics';
import {
  LayoutDashboard, Wrench, Globe2, Users, Activity,
  UserCheck, LogOut, Eye, MousePointerClick,
  ChevronRight, Shield, Menu, X, Ban, Trash2, Download,
  Megaphone, Plus, CheckCircle2, Settings, Power, AlertTriangle,
  History, Crown, Lock, ShieldAlert, TrendingUp, Clock,
} from 'lucide-react';

/* ── Types ── */
interface ToolStat    { _id: string; toolName: string; category: string; count: number; uniqueUsers: number; lastUsed: string; }
interface CountryStat { _id: string; countryName: string; count: number; }
interface DailyTrend  { date: string; count: number; uniqueUsers: number; }
interface RecentEvent { path: string; toolName: string; category: string; country: string; countryName: string; city: string; sessionId: string; timestamp: string; }
interface UserStat    { _id: string; totalEvents: number; tools: string[]; country: string; countryName: string; city: string; ip: string; firstSeen: string; lastSeen: string; }
interface Stats {
  totalEvents: number; uniqueUsers: number;
  registeredUsers: number; activeSessions: number;
  conversionRate: number;
  byTool: ToolStat[]; byCountry: CountryStat[];
  dailyTrend: DailyTrend[]; recentEvents: RecentEvent[];
}
interface TopUser      { email: string; name: string; totalUses: number; uniqueTools: number; lastUsed: string; }
interface LoginLog     { _id: string; success: boolean; ip: string; userAgent: string; timestamp: string; }
interface HistoryEntry { toolName: string; toolPath: string; category: string; usedAt: string; }

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

/* ── KPI Card ── */
function KPI({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string; icon: any; accent: string;
}) {
  return (
    <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-5 relative overflow-hidden hover:border-white/10 transition-all">
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

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-black text-white">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

/* ── Toggle ── */
function Toggle({ enabled, onChange, loading }: { enabled: boolean; onChange: () => void; loading?: boolean }) {
  return (
    <button onClick={onChange} disabled={loading}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex items-center ${enabled ? 'bg-emerald-500' : 'bg-white/10'} ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );
}

/* ── Nav ── */
const NAV = [
  { key: 'overview',      label: 'Overview',         icon: LayoutDashboard },
  { key: 'tools',         label: 'Tool Analytics',   icon: Wrench },
  { key: 'countries',     label: 'Countries',        icon: Globe2 },
  { key: 'sessions',      label: 'Visitor Sessions', icon: Users },
  { key: 'activity',      label: 'Live Activity',    icon: Activity },
  { key: 'members',       label: 'Registered Users', icon: UserCheck },
  { key: 'top_users',     label: 'Top Users',        icon: Crown },
  { key: 'announcements', label: 'Announcements',    icon: Megaphone },
  { key: 'tool_manage',   label: 'Tool Management',  icon: Settings },
  { key: 'security',      label: 'Security',         icon: ShieldAlert },
] as const;
type NavKey = typeof NAV[number]['key'];

/* ══════════════════════════════════════════════════════════════ */
export default function DashboardClient({ stats, days: initialDays }: { stats: Stats; days: number }) {
  const router = useRouter();
  const [nav, setNav]           = useState<NavKey>('overview');
  const [days, setDays]         = useState(initialDays);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Section data ── */
  const [sessions, setSessions] = useState<UserStat[] | null>(null);
  const [loadingSess, setLoadingSess] = useState(false);
  const [members, setMembers]   = useState<any[] | null>(null);
  const [loadingMem, setLoadingMem] = useState(false);
  const [announcements, setAnnouncements] = useState<any[] | null>(null);
  const [loadingAnn, setLoadingAnn] = useState(false);
  const [newAnnMsg, setNewAnnMsg] = useState('');
  const [newAnnType, setNewAnnType] = useState('info');
  const [annPosting, setAnnPosting] = useState(false);
  const [topUsers, setTopUsers] = useState<TopUser[] | null>(null);
  const [loadingTopUsers, setLoadingTopUsers] = useState(false);
  const [loginLog, setLoginLog] = useState<LoginLog[] | null>(null);
  const [loadingLoginLog, setLoadingLoginLog] = useState(false);

  /* ── Tool management ── */
  const [disabledPaths, setDisabledPaths] = useState<string[]>([]);
  const [loadingToolConfig, setLoadingToolConfig] = useState(false);
  const [savingToolConfig, setSavingToolConfig] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState<boolean | null>(null);
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  /* ── Members: bulk + history ── */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [userHistoryTarget, setUserHistoryTarget] = useState<{ name: string; email: string } | null>(null);
  const [userHistory, setUserHistory] = useState<HistoryEntry[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  /* ── Session timeout (30 min inactivity) ── */
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
    }, 30 * 60 * 1000);
  }, [router]);

  useEffect(() => {
    resetTimeout();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimeout));
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(e => window.removeEventListener(e, resetTimeout));
    };
  }, [resetTimeout]);

  const topCountry = stats.byCountry[0]?.countryName || '—';

  function changeDays(d: number) { setDays(d); router.push(`/admin?days=${d}`); }
  async function logout() { await fetch('/api/admin/auth', { method: 'DELETE' }); router.push('/admin/login'); }

  async function goTo(key: NavKey) {
    setNav(key); setSidebarOpen(false); setSelectedIds([]);
    if (key === 'sessions' && !sessions) {
      setLoadingSess(true);
      const data = await fetch(`/api/admin/users?days=${days}`).then(r => r.json()).catch(() => ({ users: [] }));
      setSessions(data.users || []); setLoadingSess(false);
    }
    if (key === 'members' && !members) {
      setLoadingMem(true);
      const data = await fetch('/api/admin/members').then(r => r.json()).catch(() => ({ members: [] }));
      setMembers(data.members || []); setLoadingMem(false);
    }
    if (key === 'announcements' && !announcements) {
      setLoadingAnn(true);
      const data = await fetch('/api/admin/announcements').then(r => r.json()).catch(() => ({ announcements: [] }));
      setAnnouncements(data.announcements || []); setLoadingAnn(false);
    }
    if (key === 'top_users' && !topUsers) {
      setLoadingTopUsers(true);
      const data = await fetch('/api/admin/top-users').then(r => r.json()).catch(() => ({ users: [] }));
      setTopUsers(data.users || []); setLoadingTopUsers(false);
    }
    if (key === 'tool_manage' && maintenanceEnabled === null) {
      setLoadingToolConfig(true);
      const [tData, mData] = await Promise.all([
        fetch('/api/admin/tools-config').then(r => r.json()).catch(() => ({ disabledPaths: [] })),
        fetch('/api/admin/maintenance').then(r => r.json()).catch(() => ({ enabled: false })),
      ]);
      setDisabledPaths(tData.disabledPaths || []);
      setMaintenanceEnabled(mData.enabled === true);
      setLoadingToolConfig(false);
    }
    if (key === 'security' && !loginLog) {
      setLoadingLoginLog(true);
      const data = await fetch('/api/admin/login-log').then(r => r.json()).catch(() => ({ logs: [] }));
      setLoginLog(data.logs || []); setLoadingLoginLog(false);
    }
  }

  async function openHistory(name: string, email: string) {
    setUserHistoryTarget({ name, email });
    setUserHistory(null); setLoadingHistory(true);
    const data = await fetch(`/api/admin/user-history?email=${encodeURIComponent(email)}`)
      .then(r => r.json()).catch(() => ({ history: [] }));
    setUserHistory(data.history || []); setLoadingHistory(false);
  }

  async function toggleTool(path: string) {
    const next = disabledPaths.includes(path) ? disabledPaths.filter(p => p !== path) : [...disabledPaths, path];
    setDisabledPaths(next); setSavingToolConfig(true);
    await fetch('/api/admin/tools-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ disabledPaths: next }) }).catch(() => {});
    setSavingToolConfig(false);
  }

  async function toggleMaintenance() {
    const next = !maintenanceEnabled;
    setSavingMaintenance(true);
    const res = await fetch('/api/admin/maintenance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: next }) }).catch(() => null);
    if (res?.ok) setMaintenanceEnabled(next);
    setSavingMaintenance(false);
  }

  async function bulkAction(action: 'ban' | 'unban') {
    if (!selectedIds.length) return;
    if (!confirm(`${action === 'ban' ? 'Ban' : 'Unban'} ${selectedIds.length} users?`)) return;
    await fetch('/api/admin/members', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userIds: selectedIds, action }) });
    setMembers(prev => prev!.map(m => selectedIds.includes(m._id) ? { ...m, isBanned: action === 'ban' } : m));
    setSelectedIds([]);
  }

  function exportCSV() {
    if (!members?.length) return;
    const rows = ['#,Name,Email,Joined,Status', ...members.map((m, i) => `${i+1},"${m.name}",${m.email},${m.createdAt},${m.isBanned ? 'Banned' : 'Active'}`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `members-${Date.now()}.csv`; a.click();
  }

  /* ── Sidebar ── */
  const Sidebar = () => (
    <div className="flex flex-col h-full">
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
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3 mb-2">Navigation</p>
        {NAV.map(item => (
          <button key={item.key} onClick={() => goTo(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${nav === item.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
            {nav === item.key && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
          </button>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/5">
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all">
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
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto"><Sidebar /></div>
          </aside>
        </div>
      )}

      {/* User history modal */}
      {userHistoryTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setUserHistoryTarget(null)} />
          <div className="relative bg-[#0d1526] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div>
                <p className="text-white font-black text-sm">{userHistoryTarget.name}</p>
                <p className="text-slate-500 text-xs">{userHistoryTarget.email} — Tool History</p>
              </div>
              <button onClick={() => setUserHistoryTarget(null)} className="p-1.5 rounded-lg hover:bg-white/5"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingHistory ? (
                <p className="text-center text-slate-600 py-8 text-sm">Loading history…</p>
              ) : !userHistory?.length ? (
                <p className="text-center text-slate-600 py-8 text-sm">No tool usage recorded yet</p>
              ) : (
                <div className="space-y-2">
                  {userHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-2.5">
                      <div>
                        <p className="text-sm font-bold text-slate-200">{h.toolName}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${CATEGORY_COLORS[h.category] || 'bg-slate-800 text-slate-400'}`}>{h.category}</span>
                      </div>
                      <span className="text-xs text-slate-600">{timeAgo(h.usedAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
          <div className="flex items-center gap-2">
            {maintenanceEnabled === true && (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5">
                <AlertTriangle className="h-3 w-3 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 hidden sm:block">Maintenance ON</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-indigo-300">Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6">

          {/* ════════ OVERVIEW ════════ */}
          {nav === 'overview' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <KPI label="Total Page Views"   value={stats.totalEvents}          icon={Eye}               accent="bg-indigo-500"  sub={`In last ${days} days`} />
                <KPI label="Unique Visitors"    value={stats.uniqueUsers}          icon={Users}             accent="bg-blue-500"    sub="Distinct sessions" />
                <KPI label="Registered Users"   value={stats.registeredUsers}      icon={UserCheck}         accent="bg-emerald-500" sub="All time signups" />
                <KPI label="Active Sessions"    value={stats.activeSessions}       icon={MousePointerClick} accent="bg-violet-500"  sub="Currently logged in" />
                <KPI label="Conversion Rate"    value={`${stats.conversionRate}%`} icon={TrendingUp}        accent="bg-pink-500"    sub="Visitors → registered" />
                <KPI label="Top Country"        value={topCountry}                 icon={Globe2}            accent="bg-amber-500"   sub="Most visitors from" />
              </div>

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
                      <Area type="monotone" dataKey="count"       name="Page Views"      stroke="#6366f1" strokeWidth={2} fill="url(#gViews)" dot={false} />
                      <Area type="monotone" dataKey="uniqueUsers" name="Unique Visitors" stroke="#10b981" strokeWidth={2} fill="url(#gUsers)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No data for this period yet</div>
                )}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
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
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${CATEGORY_COLORS[tool.category] || 'bg-slate-800 text-slate-400'}`}>{tool.category}</span>
                            </div>
                            <span className="text-sm font-black text-indigo-400">{tool.count.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {stats.byTool.length === 0 && <p className="text-slate-600 text-sm text-center py-6">No tool usage data yet</p>}
                  </div>
                </div>

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
                        {['#','Tool Name','Category','Usage Bar','Page Views','Unique Users','Last Used'].map(h => (
                          <th key={h} className={`${h === 'Tool Name' || h === 'Category' ? 'text-left' : h === '#' ? 'text-left' : 'text-right'} px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider`}>{h}</th>
                        ))}
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
                          {['Session ID','Country','City','Tools Used','Views','First Visit','Last Visit'].map(h => (
                            <th key={h} className={`${['Session ID','Country','City','Tools Used'].includes(h) ? 'text-left' : 'text-right'} px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(sessions || []).length === 0
                          ? <tr><td colSpan={7} className="text-center text-slate-600 py-14">No sessions yet</td></tr>
                          : (sessions || []).map(u => (
                          <tr key={u._id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition">
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{shortId(u._id)}</td>
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
                        {['Time','Tool Used','Category','Country','City','Session'].map(h => (
                          <th key={h} className="text-left px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider">{h}</th>
                        ))}
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
                <SectionHeader title="👤 Registered Members" subtitle="Click a name to see tool history" />
                <div className="flex items-center gap-2">
                  <button onClick={exportCSV}
                    className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 transition-all">
                    <Download className="h-3.5 w-3.5" /> Export CSV
                  </button>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black px-3 py-1.5 rounded-xl">
                    {stats.registeredUsers} total
                  </div>
                </div>
              </div>

              {selectedIds.length > 0 && (
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl px-5 py-3 flex items-center gap-3 mb-2">
                  <span className="text-indigo-300 text-sm font-bold">{selectedIds.length} selected</span>
                  <button onClick={() => bulkAction('ban')}
                    className="flex items-center gap-1.5 bg-red-500/20 text-red-400 text-xs font-black px-3 py-1.5 rounded-xl hover:bg-red-500/30 transition-all">
                    <Ban className="h-3.5 w-3.5" /> Ban All
                  </button>
                  <button onClick={() => bulkAction('unban')}
                    className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-black px-3 py-1.5 rounded-xl hover:bg-emerald-500/30 transition-all">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Unban All
                  </button>
                  <button onClick={() => setSelectedIds([])} className="ml-auto text-slate-500 hover:text-slate-300 text-xs font-bold">Clear</button>
                </div>
              )}

              <div className="bg-[#0d1526] border border-white/5 rounded-2xl overflow-hidden">
                {loadingMem
                  ? <div className="text-center text-slate-600 py-16 text-sm">Loading members…</div>
                  : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          <th className="px-5 py-3.5">
                            <input type="checkbox"
                              checked={selectedIds.length === (members?.length || 0) && (members?.length || 0) > 0}
                              onChange={e => setSelectedIds(e.target.checked ? (members || []).map(m => m._id) : [])}
                              className="rounded" />
                          </th>
                          {['#','Name','Email','Joined','Status','Actions'].map(h => (
                            <th key={h} className={`${['#','Name','Email'].includes(h) ? 'text-left' : 'text-right'} px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(members || []).length === 0
                          ? <tr><td colSpan={7} className="text-center text-slate-600 py-14">No registered users yet</td></tr>
                          : (members || []).map((m, i) => (
                          <tr key={m._id} className={`border-b border-white/[0.03] hover:bg-white/[0.03] transition ${selectedIds.includes(m._id) ? 'bg-indigo-600/5' : ''}`}>
                            <td className="px-5 py-3.5 text-center">
                              <input type="checkbox"
                                checked={selectedIds.includes(m._id)}
                                onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, m._id] : prev.filter(id => id !== m._id))}
                                className="rounded" />
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 text-xs">{i + 1}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0 ${m.isBanned ? 'bg-red-600/30' : 'bg-gradient-to-br from-indigo-600 to-violet-600'}`}>
                                  {m.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                  <button onClick={() => openHistory(m.name, m.email)}
                                    className={`font-bold text-sm hover:text-indigo-400 transition-colors flex items-center gap-1 ${m.isBanned ? 'text-red-400 line-through' : 'text-slate-200'}`}>
                                    {m.name} <History className="h-3 w-3 opacity-40" />
                                  </button>
                                  {m.isBanned && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-md font-bold">BANNED</span>}
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
                                <button title={m.isBanned ? 'Unban' : 'Ban'}
                                  onClick={async () => {
                                    const action = m.isBanned ? 'unban' : 'ban';
                                    if (!confirm(`${action === 'ban' ? 'Ban' : 'Unban'} ${m.name}?`)) return;
                                    const res = await fetch('/api/admin/members', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userIds: [m._id], action }) });
                                    if (res.ok) setMembers(prev => prev!.map(u => u._id === m._id ? {...u, isBanned: action === 'ban'} : u));
                                  }}
                                  className={`p-1.5 rounded-lg transition-all ${m.isBanned ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-amber-400 hover:bg-amber-500/10'}`}>
                                  <Ban className="h-3.5 w-3.5" />
                                </button>
                                <button title="Delete user"
                                  onClick={async () => {
                                    if (!confirm(`Permanently delete ${m.name}?`)) return;
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

          {/* ════════ TOP USERS ════════ */}
          {nav === 'top_users' && (
            <>
              <SectionHeader title="👑 Top Users by Usage" subtitle="Registered users ranked by total tool uses (all time)" />
              <div className="bg-[#0d1526] border border-white/5 rounded-2xl overflow-hidden">
                {loadingTopUsers
                  ? <div className="text-center text-slate-600 py-16 text-sm">Loading…</div>
                  : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          {['Rank','User','Email','Total Uses','Unique Tools','Last Active'].map(h => (
                            <th key={h} className={`${['Rank','User','Email'].includes(h) ? 'text-left' : 'text-right'} px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(topUsers || []).length === 0
                          ? <tr><td colSpan={6} className="text-center text-slate-600 py-14">No usage data yet</td></tr>
                          : (topUsers || []).map((u, i) => (
                          <tr key={u.email} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition">
                            <td className="px-5 py-3.5">
                              <span className={`text-sm font-black w-7 h-7 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-400/20 text-slate-300' : i === 2 ? 'bg-orange-600/20 text-orange-400' : 'text-slate-600'}`}>
                                {i < 3 ? ['🥇','🥈','🥉'][i] : i+1}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-xs font-black">
                                  {u.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'}
                                </div>
                                <span className="font-bold text-slate-200">{u.name || '—'}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-400 text-xs">{u.email}</td>
                            <td className="px-5 py-3.5 text-right font-black text-indigo-400">{u.totalUses.toLocaleString()}</td>
                            <td className="px-5 py-3.5 text-right text-emerald-400 font-bold">{u.uniqueTools}</td>
                            <td className="px-5 py-3.5 text-right text-slate-600 text-xs">{u.lastUsed ? timeAgo(u.lastUsed) : '—'}</td>
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
              <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-6 space-y-4">
                <p className="text-sm font-black text-white">New Announcement</p>
                <textarea value={newAnnMsg} onChange={e => setNewAnnMsg(e.target.value)}
                  placeholder="Enter announcement message…" rows={3}
                  className="w-full bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 resize-none transition-colors" />
                <div className="flex items-center gap-3">
                  <select value={newAnnType} onChange={e => setNewAnnType(e.target.value)}
                    className="bg-white/5 border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none">
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="success">Success (Green)</option>
                    <option value="promo">Promo (Purple)</option>
                  </select>
                  <button disabled={!newAnnMsg.trim() || annPosting}
                    onClick={async () => {
                      setAnnPosting(true);
                      const res = await fetch('/api/admin/announcements', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ message: newAnnMsg, type: newAnnType }) });
                      const data = await res.json();
                      if (res.ok) { setAnnouncements(prev => [{ _id: data._id, message: newAnnMsg, type: newAnnType, createdAt: new Date().toISOString() }, ...(prev || [])]); setNewAnnMsg(''); }
                      setAnnPosting(false);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black px-4 py-2 rounded-xl transition-all">
                    <Plus className="h-3.5 w-3.5" /> Publish
                  </button>
                </div>
              </div>
              {loadingAnn ? (
                <div className="text-center text-slate-600 py-12 text-sm">Loading…</div>
              ) : (announcements || []).length === 0 ? (
                <div className="text-center text-slate-600 py-12 text-sm">No active announcements</div>
              ) : (
                <div className="space-y-3">
                  {(announcements || []).map(a => (
                    <div key={a._id} className="bg-[#0d1526] border border-white/5 rounded-2xl px-5 py-4 flex items-center gap-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider flex-shrink-0 ${
                        a.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : a.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : a.type === 'promo' ? 'bg-violet-500/20 text-violet-400' : 'bg-indigo-500/20 text-indigo-400'
                      }`}>{a.type}</span>
                      <p className="flex-1 text-sm text-slate-300">{a.message}</p>
                      <span className="text-[10px] text-slate-600 flex-shrink-0">{timeAgo(a.createdAt)}</span>
                      <button onClick={async () => {
                        if (!confirm('Dismiss this announcement?')) return;
                        const res = await fetch('/api/admin/announcements', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: a._id }) });
                        if (res.ok) setAnnouncements(prev => prev!.filter(x => x._id !== a._id));
                      }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ════════ TOOL MANAGEMENT ════════ */}
          {nav === 'tool_manage' && (
            <>
              {/* Maintenance Mode */}
              <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2">
                      <Power className="h-5 w-5 text-amber-400" /> Maintenance Mode
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">When ON — all visitors see a maintenance page. Admin access is unaffected.</p>
                  </div>
                  {loadingToolConfig
                    ? <div className="h-6 w-12 bg-white/5 rounded-full animate-pulse" />
                    : <Toggle enabled={maintenanceEnabled === true} onChange={toggleMaintenance} loading={savingMaintenance} />
                  }
                </div>
                {maintenanceEnabled === true && (
                  <div className="mt-4 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                    <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <p className="text-xs text-amber-300 font-bold">Site is currently in maintenance mode. Visitors cannot access any pages.</p>
                  </div>
                )}
              </div>

              <SectionHeader title="🔧 Tool Enable / Disable" subtitle="Toggle individual tools on or off for all visitors" />
              {loadingToolConfig ? (
                <div className="text-center text-slate-600 py-12 text-sm">Loading tool config…</div>
              ) : (
                <>
                  {savingToolConfig && <p className="text-xs text-indigo-400 font-bold mb-2">Saving changes…</p>}
                  <div className="space-y-2">
                    {Object.entries(TOOL_INFO)
                      .filter(([path]) => path !== '/tools/all')
                      .map(([path, info]) => {
                        const enabled = !disabledPaths.includes(path);
                        return (
                          <div key={path} className={`bg-[#0d1526] border rounded-2xl px-5 py-3.5 flex items-center justify-between transition-all ${enabled ? 'border-white/5' : 'border-red-500/20 bg-red-500/[0.03]'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold flex-shrink-0 ${CATEGORY_COLORS[info.category] || 'bg-slate-800 text-slate-400'}`}>{info.category}</span>
                              <div className="min-w-0">
                                <p className={`text-sm font-bold ${enabled ? 'text-slate-200' : 'text-slate-500 line-through'}`}>{info.name}</p>
                                <p className="text-[10px] text-slate-600 font-mono truncate">{path}</p>
                              </div>
                            </div>
                            <Toggle enabled={enabled} onChange={() => toggleTool(path)} />
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </>
          )}

          {/* ════════ SECURITY ════════ */}
          {nav === 'security' && (
            <>
              <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-black text-sm">Auto Session Timeout</p>
                    <p className="text-slate-500 text-xs">Admin session auto-expires after 30 minutes of inactivity</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black px-3 py-1.5 rounded-xl">Active</div>
                </div>
              </div>

              <SectionHeader title="🔐 Admin Login Log" subtitle="Last 100 login attempts to the admin panel" />
              <div className="bg-[#0d1526] border border-white/5 rounded-2xl overflow-hidden">
                {loadingLoginLog
                  ? <div className="text-center text-slate-600 py-16 text-sm">Loading login log…</div>
                  : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          {['Status','IP Address','Browser / UA','Time'].map((h, i) => (
                            <th key={h} className={`${i < 3 ? 'text-left' : 'text-right'} px-5 py-3.5 text-slate-500 font-black text-xs uppercase tracking-wider`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(loginLog || []).length === 0
                          ? <tr><td colSpan={4} className="text-center text-slate-600 py-14">No login attempts yet</td></tr>
                          : (loginLog || []).map(log => (
                          <tr key={log._id} className={`border-b border-white/[0.03] hover:bg-white/[0.03] transition ${!log.success ? 'bg-red-500/[0.02]' : ''}`}>
                            <td className="px-5 py-3.5">
                              <span className={`flex items-center gap-1.5 text-xs font-black ${log.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                {log.success ? <><CheckCircle2 className="h-3.5 w-3.5" /> Success</> : <><Lock className="h-3.5 w-3.5" /> Failed</>}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{log.ip}</td>
                            <td className="px-5 py-3.5 text-slate-500 text-xs max-w-xs truncate">{log.userAgent || '—'}</td>
                            <td className="px-5 py-3.5 text-right text-slate-600 text-xs">{timeAgo(log.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}
