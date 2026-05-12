import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Crown,
  Database,
  Flame,
  Gauge,
  Gem,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Medal,
  Menu,
  Plus,
  Radio,
  RefreshCcw,
  Rocket,
  Save,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Swords,
  Target,
  TrendingUp,
  UserCog,
  UserPlus,
  Users,
  X,
  Zap,
  Trophy,
  Eye,
  Filter,
  Layers,
  PieChart,
  Compass,
} from "lucide-react";

// ===================== SUPABASE SETUP =====================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null;
// ===================== PUSH NOTIFICATIONS =====================
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

async function registerPushNotification(userId) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Browser นี้ไม่รองรับ Push Notification");
  }
  if (!VAPID_PUBLIC_KEY) {
    throw new Error("ยังไม่ได้ใส่ VITE_VAPID_PUBLIC_KEY ใน .env.local");
  }
  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("ผู้ใช้ปฏิเสธสิทธิ์ Notification");
  }
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }
  const json = subscription.toJSON();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      user_agent: navigator.userAgent,
    },
    { onConflict: "endpoint" }
  );
  if (error) throw error;
  return subscription;
}

async function unregisterPushNotification() {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!registration) return;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
    await subscription.unsubscribe();
  }
}

// ===================== CONSTANTS =====================
const roleOptions = [
  { value: "viewer", label: "Viewer", color: "slate" },
  { value: "staff", label: "Operator", color: "cyan" },
  { value: "battalion_admin", label: "Manager", color: "violet" },
  { value: "super_admin", label: "Super Admin", color: "amber" },
  { value: "override", label: "Override", color: "rose" },
];

const achievementCatalog = [
  { code: "FIRST_BLOOD", title: "First Blood", detail: "รับงานแรกในระบบ", icon: "⚡", tier: "Bronze" },
  { code: "TASK_CLOSER", title: "Task Closer", detail: "ปิดงานสำเร็จอย่างน้อย 1 งาน", icon: "✅", tier: "Bronze" },
  { code: "FIVE_STREAK", title: "Five Mission Streak", detail: "ปิดงานสำเร็จ 5 งาน", icon: "🔥", tier: "Silver" },
  { code: "TEN_STREAK", title: "Ten Mission Streak", detail: "ปิดงานสำเร็จ 10 งาน", icon: "🚀", tier: "Gold" },
  { code: "MISSION_HUNTER", title: "Mission Hunter", detail: "รับมอบหมายงานรวม 10 งาน", icon: "🎯", tier: "Silver" },
  { code: "HEAVY_LIFTER", title: "Heavy Lifter", detail: "รับมอบหมายงานรวม 25 งาน", icon: "🏋️", tier: "Gold" },
  { code: "URGENT_RESPONDER", title: "Urgent Responder", detail: "รับงานความสำคัญสูง/วิกฤต", icon: "🚨", tier: "Silver" },
  { code: "CRISIS_HANDLER", title: "Crisis Handler", detail: "ปิดงานวิกฤตอย่างน้อย 1 งาน", icon: "🛡️", tier: "Gold" },
  { code: "EARLY_BIRD", title: "Early Bird", detail: "มีงานกำหนดส่งก่อน 09:00", icon: "🌅", tier: "Bronze" },
  { code: "NIGHT_OPS", title: "Night Ops", detail: "มีงานกำหนดส่งหลัง 18:00", icon: "🌙", tier: "Bronze" },
  { code: "DOC_MASTER", title: "Document Master", detail: "มีงานหมวดเอกสาร/รายงาน", icon: "📄", tier: "Silver" },
  { code: "MEDIA_OPERATOR", title: "Media Operator", detail: "มีงานหมวดสื่อ/กราฟิก/ตัดต่อ", icon: "🎬", tier: "Silver" },
  { code: "COORDINATOR", title: "Coordinator", detail: "มีงานหมวดประสานงาน/ธุรการ", icon: "🤝", tier: "Bronze" },
  { code: "FIELD_READY", title: "Field Ready", detail: "มีงานหมวดภาคสนาม/สนับสนุน", icon: "🪖", tier: "Bronze" },
  { code: "POINT_COLLECTOR", title: "Point Collector", detail: "สะสมแต้มจากงานอย่างน้อย 500", icon: "💎", tier: "Silver" },
  { code: "ELITE_CONTRIBUTOR", title: "Elite Contributor", detail: "สะสมแต้มจากงานอย่างน้อย 1,500", icon: "🏆", tier: "Gold" },
  { code: "RELIABLE", title: "Reliable Asset", detail: "Reliability ตั้งแต่ 90% ขึ้นไป", icon: "⭐", tier: "Silver" },
  { code: "NO_EXEMPT", title: "Always Available", detail: "สถานะ Active และไม่ Exempt", icon: "🟢", tier: "Bronze" },
  { code: "RAPID_STATUS", title: "Rapid Status", detail: "มีการเปลี่ยนสถานะงานอย่างน้อย 1 ครั้ง", icon: "🔄", tier: "Silver" },
  { code: "DMS_LEGEND", title: "DMS Legend", detail: "ปลดล็อก Achievement ครบ 19 อันแรก", icon: "👑", tier: "Mythic" },
];

const priorityStyle = {
  "ต่ำ": "border-sky-400/30 bg-sky-400/10 text-sky-200",
  "กลาง": "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  "สูง": "border-rose-400/40 bg-rose-500/15 text-rose-200",
  "วิกฤต": "border-red-400/50 bg-red-500/25 text-red-100 shadow-[0_0_18px_rgba(239,68,68,0.35)]",
};

const priorityWeight = { "วิกฤต": 4, "สูง": 3, "กลาง": 2, "ต่ำ": 1 };

const statusStyle = {
  "ยังไม่เริ่ม": "border-slate-500/30 bg-slate-500/15 text-slate-200",
  "กำลังทำ": "border-cyan-400/30 bg-cyan-500/15 text-cyan-200",
  "รอตรวจ": "border-amber-400/30 bg-amber-500/15 text-amber-200",
  "เสร็จแล้ว": "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
};

const statusOrder = ["ยังไม่เริ่ม", "กำลังทำ", "รอตรวจ", "เสร็จแล้ว"];

// ===================== HELPERS =====================
function getRoleLabel(value) {
  return roleOptions.find((role) => role.value === value)?.label || "Viewer";
}

function getRoleColor(value) {
  return roleOptions.find((role) => role.value === value)?.color || "slate";
}

function getAchievement(code) {
  return (
    achievementCatalog.find((item) => item.code === code) || {
      code,
      title: code || "Achievement",
      detail: "Achievement unlocked",
      icon: "🏅",
      tier: "Bronze",
    }
  );
}

function formatRelativeTime(date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ===================== UI PRIMITIVES =====================
function ShellCard({ children, className = "", glow = false }) {
  return (
    <div
      className={`relative rounded-[1.5rem] border border-white/10 bg-slate-900/55 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl ${
        glow ? "before:absolute before:inset-0 before:rounded-[1.5rem] before:bg-gradient-to-br before:from-cyan-500/10 before:via-transparent before:to-violet-500/10 before:pointer-events-none" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-black ${className}`}>
      {children}
    </span>
  );
}

function Field({ className = "", ...props }) {
  return (
    <input
      className={`h-11 rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-slate-950/70 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)] ${className}`}
      {...props}
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`h-11 rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm font-bold text-slate-100 outline-none transition focus:border-cyan-400/50 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

// ===================== ANIMATED COUNTER =====================
function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const previousRef = useRef(0);

  useEffect(() => {
    const start = previousRef.current;
    const end = Number(value) || 0;
    const startTime = performance.now();

    let raf;
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else previousRef.current = end;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

// ===================== LIVE CLOCK =====================
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2">
      <Radio className="h-4 w-4 animate-pulse text-emerald-400" />
      <div className="flex flex-col">
        <span className="text-xs font-bold text-slate-400">LIVE OPERATIONS</span>
        <span className="font-mono text-sm font-black text-cyan-200">{now.toLocaleTimeString("th-TH")}</span>
      </div>
    </div>
  );
}

// ===================== PARTICLE BACKGROUND =====================
function ParticleField() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.18),transparent_35%),radial-gradient(circle_at_75%_30%,rgba(139,92,246,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.10),transparent_35%),linear-gradient(180deg,rgba(8,15,28,0.95),#03070f)]" />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />
      <div className="absolute -top-40 left-1/4 h-96 w-96 animate-pulse rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute -bottom-40 right-1/4 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[120px]" style={{ animationDelay: "1.5s" }} />
    </div>
  );
}

// ===================== LOGIN =====================
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("12345678");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!supabase) {
      setMessage("ยังไม่ได้ตั้งค่า Supabase");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInError) {
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError?.message?.toLowerCase().includes("already registered")) {
      setMessage("อีเมลนี้มีบัญชีอยู่แล้ว แต่รหัสผ่านไม่ถูกต้อง");
    } else if (signUpError) {
      setMessage(signUpError.message);
    } else {
      setMessage("สร้างบัญชีแล้ว กดเข้าสู่ระบบอีกครั้งได้เลย");
    }

    setLoading(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03070f] p-4 text-white md:p-8">
      <ParticleField />
      <div className="relative mx-auto flex min-h-[90vh] max-w-xl items-center">
        <ShellCard glow className="w-full p-8 md:p-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-sm font-black text-cyan-100">
              <Sparkles size={16} /> TEAM-DMS Realtime
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_32px_rgba(14,165,233,0.55)]">
              <Shield className="text-white" size={24} />
            </div>
          </div>
          <h1 className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-6xl">
            COMMAND
            <br />
            CENTER
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            ระบบบริหารจัดการมอบหมายงานและทรัพยากรบุคคลแบบ Realtime · Built for Elite Operations
          </p>
          <form onSubmit={signIn} className="mt-8 space-y-3">
            <Field
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full"
            />
            <Field
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน อย่างน้อย 8 ตัว"
              className="w-full"
            />
            <Button
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-white shadow-[0_0_36px_rgba(14,165,233,0.42)] hover:from-cyan-400 hover:to-blue-500"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <Rocket size={16} /> เข้าสู่ระบบ / สมัครบัญชี
                </>
              )}
            </Button>
          </form>
          {message && (
            <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">{message}</p>
          )}
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-emerald-400" />
            Secure Sign-In · End-to-End Encrypted via Supabase Auth
          </div>
        </ShellCard>
      </div>
    </main>
  );
}

// ===================== EPIC STAT CARD =====================
function StatCard({ icon: Icon, title, value, sub, tone = "cyan", trend = null }) {
  const tones = {
    cyan: { grad: "from-cyan-500/30 via-cyan-500/5 to-transparent", icon: "text-cyan-200 bg-cyan-400/15", glow: "shadow-[0_0_40px_rgba(34,211,238,0.18)]" },
    emerald: { grad: "from-emerald-500/30 via-emerald-500/5 to-transparent", icon: "text-emerald-200 bg-emerald-400/15", glow: "shadow-[0_0_40px_rgba(16,185,129,0.18)]" },
    amber: { grad: "from-amber-500/30 via-amber-500/5 to-transparent", icon: "text-amber-200 bg-amber-400/15", glow: "shadow-[0_0_40px_rgba(245,158,11,0.18)]" },
    violet: { grad: "from-violet-500/30 via-violet-500/5 to-transparent", icon: "text-violet-200 bg-violet-400/15", glow: "shadow-[0_0_40px_rgba(139,92,246,0.18)]" },
    rose: { grad: "from-rose-500/30 via-rose-500/5 to-transparent", icon: "text-rose-200 bg-rose-400/15", glow: "shadow-[0_0_40px_rgba(244,63,94,0.18)]" },
  };
  const config = tones[tone];

  return (
    <ShellCard className={`group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 ${config.glow}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${config.grad} opacity-80`} />
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/[0.02] blur-2xl transition group-hover:bg-white/[0.05]" />
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-2 text-4xl font-black tracking-tight text-white">
            <AnimatedNumber value={value} />
          </p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-xs text-slate-400">{sub}</p>
            {trend !== null && (
              <span className={`flex items-center gap-0.5 text-xs font-black ${trend >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                <TrendingUp size={11} className={trend < 0 ? "rotate-180" : ""} />
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
        <div className={`rounded-2xl border border-white/10 p-3 shadow-lg ${config.icon}`}>
          <Icon size={22} />
        </div>
      </div>
    </ShellCard>
  );
}

// ===================== SVG SPARKLINE =====================
function Sparkline({ data, color = "#22d3ee", height = 60 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 280;
  const step = width / Math.max(data.length - 1, 1);

  const points = data.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / range) * height * 0.85 - height * 0.075;
    return [x, y];
  });

  const path = points.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(" ");
  const areaPath = `${path} L ${width},${height} L 0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill={color} className="opacity-70" />
      ))}
    </svg>
  );
}

// ===================== MAIN APP =====================
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [logs, setLogs] = useState([]);
  const [staffAchievements, setStaffAchievements] = useState([]);
  const [achievementPopup, setAchievementPopup] = useState(null);
  const [seenAchievementIds, setSeenAchievementIds] = useState([]);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [showMyAchievements, setShowMyAchievements] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [showKanban, setShowKanban] = useState(true);
  const [showCommanderView, setShowCommanderView] = useState(true);
  const [query, setQuery] = useState("");
  const [staffQuery, setStaffQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStaff, setSavingStaff] = useState(false);
  const [notice, setNotice] = useState("");
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  const appRole = profile?.app_role || "viewer";
  const canManageTasks = ["battalion_admin", "super_admin", "override"].includes(appRole);
  const canOverride = ["super_admin", "override"].includes(appRole);
  const canManageStaff = appRole === "super_admin";
  const canManageRoles = appRole === "super_admin";

  const blankStaff = { rank: "", name: "", section: "", role: "", active: true, exempt: false, points: 0, reliability: 80 };
  const [staffForm, setStaffForm] = useState(blankStaff);
  const [newTask,      setNewTask] = useState({
    title: "",
    task_date: new Date().toISOString().slice(0, 10),
    owner_id: "",
    priority: "กลาง",
    status: "ยังไม่เริ่ม",
    category: "ทั่วไป",
    due_time: "17:00",
    points: 60,
  });

  // Auth subscription
  useEffect(() => {
  if (!("serviceWorker" in navigator) || !session?.user?.id) return;
  navigator.serviceWorker.getRegistration("/sw.js").then(async (reg) => {
    if (!reg) return setPushEnabled(false);
    const sub = await reg.pushManager.getSubscription();
    setPushEnabled(Boolean(sub) && Notification.permission === "granted");
  });
}, [session?.user?.id]);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Realtime channel
  useEffect(() => {
    if (!supabase || !session) return;

    fetchAll();

    const channel = supabase
      .channel("team-dms-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchTasks)
      .on("postgres_changes", { event: "*", schema: "public", table: "staff" }, fetchStaff)
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, fetchLogs)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_profiles" }, () => {
        fetchProfile();
        fetchProfiles();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_achievements" }, fetchStaffAchievements)
      .subscribe();

    return () => supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Achievement popup detection
  useEffect(() => {
    if (!supabase || !profile?.staff_id || !session?.user?.id) return;
    if (staffAchievements.length === 0) return;

    const myNewAchievement = staffAchievements.find(
      (item) => item.staff_id === profile.staff_id && !seenAchievementIds.includes(item.id)
    );
    if (!myNewAchievement) return;

    setAchievementPopup(myNewAchievement);
    supabase
      .from("user_seen_achievements")
      .insert({ user_id: session.user.id, staff_achievement_id: myNewAchievement.id })
      .then(() => fetchSeenAchievements());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffAchievements, seenAchievementIds, profile?.staff_id, session?.user?.id]);

  // Auto-dismiss notice
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  // ===================== DATA FETCHERS =====================
  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchProfiles(), fetchStaff(), fetchTasks(), fetchLogs(), fetchStaffAchievements(), fetchSeenAchievements()]);
    setLoading(false);
  }

  async function fetchProfile() {
    if (!supabase || !session?.user?.id) return;
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*, staff:staff_id(rank,name,section)")
      .eq("id", session.user.id)
      .maybeSingle();
    if (error) setNotice(error.message);
    else setProfile(data || { id: session.user.id, email: session.user.email, app_role: "viewer", staff_id: null });
  }

  async function fetchProfiles() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*, staff:staff_id(rank,name,section)")
      .order("created_at", { ascending: false });
    if (error) setNotice(error.message);
    else setProfiles(data || []);
  }

  async function fetchStaff() {
    if (!supabase) return;
    const { data, error } = await supabase.from("staff").select("*").order("points", { ascending: false });
    if (error) {
      setNotice(error.message);
      return;
    }
    setStaff(data || []);
    if (!newTask.owner_id && data?.[0]?.id) setNewTask((prev) => ({ ...prev, owner_id: data[0].id }));
  }

  async function fetchTasks() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*, staff:owner_id(name, rank, section)")
      .order("created_at", { ascending: false });
    if (error) setNotice(error.message);
    else setTasks(data || []);
  }

  async function fetchLogs() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) setNotice(error.message);
    else setLogs(data || []);
  }

  async function fetchStaffAchievements() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("staff_achievements")
      .select("*")
      .order("earned_at", { ascending: false });
    if (error) {
      console.error("fetchStaffAchievements error:", error.message);
      setStaffAchievements([]);
      return;
    }
    setStaffAchievements(data || []);
  }

  async function fetchSeenAchievements() {
    if (!supabase || !session?.user?.id) return;
    const { data, error } = await supabase
      .from("user_seen_achievements")
      .select("staff_achievement_id")
      .eq("user_id", session.user.id);
    if (error) {
      console.error("fetchSeenAchievements error:", error.message);
      return;
    }
    setSeenAchievementIds((data || []).map((item) => item.staff_achievement_id));
  }

  async function writeLog(action, targetTable, targetId, description) {
    if (!supabase || !session?.user?.id) return;
    const { error } = await supabase.from("activity_logs").insert({
      user_id: session.user.id,
      action,
      target_table: targetTable,
      target_id: targetId,
      description,
    });
    if (error) console.error("Activity log error:", error.message);
  }

  async function recalculateAchievements(staffId) {
    if (!supabase || !staffId) return;
    const { error } = await supabase.rpc("recalculate_staff_achievements", { target_staff_id: staffId });
    if (error) {
      setNotice(`Achievement error: ${error.message}`);
      return;
    }
    await fetchStaffAchievements();
    await fetchProfiles();
    await fetchLogs();
  }

  async function recalculateAllAchievements() {
    if (!supabase || staff.length === 0) return;
    setNotice("กำลัง Sync Achievement...");
    for (const person of staff) await recalculateAchievements(person.id);
    setNotice("Sync Achievement สำเร็จ");
    await fetchAll();
  }

  // ===================== VALIDATIONS =====================
  const validation = useMemo(() => {
    if (!newTask.title.trim()) return { ok: false, message: "กรอกชื่องานก่อน" };
    if (!canManageTasks) return { ok: false, message: "Role นี้ไม่มีสิทธิ์สร้างงาน" };
    const owner = staff.find((p) => p.id === newTask.owner_id);
    if (!owner) return { ok: false, message: "เลือกผู้รับผิดชอบก่อน" };
    if (!owner.active) return { ok: false, message: "เจ้าหน้าที่ inactive รับงานไม่ได้" };
    if (owner.exempt) return { ok: false, message: "เจ้าหน้าที่ exempt รับงานไม่ได้" };
    const duplicate = tasks.some(
      (t) => t.task_date === newTask.task_date && t.title.trim().toLowerCase() === newTask.title.trim().toLowerCase()
    );
    if (duplicate) return { ok: false, message: "พบงานชื่อซ้ำในวันเดียวกัน" };
    const overlap = tasks.some(
      (t) => t.task_date === newTask.task_date && t.owner_id === newTask.owner_id && t.status !== "เสร็จแล้ว"
    );
    if (overlap && !canOverride) return { ok: false, message: "คนนี้มีงานค้างในวันเดียวกัน ต้องใช้สิทธิ์ Override" };
    return { ok: true, message: "ผ่าน Rule Engine พร้อมบันทึก" };
  }, [newTask, staff, tasks, canManageTasks, canOverride]);

  const staffValidation = useMemo(() => {
    if (!staffForm.name.trim()) return { ok: false, message: "กรอกชื่อเจ้าหน้าที่ก่อน" };
    if (!staffForm.rank.trim()) return { ok: false, message: "กรอกยศก่อน" };
    if (!staffForm.section.trim()) return { ok: false, message: "กรอกฝ่าย/ตอนก่อน" };
    if (!staffForm.role.trim()) return { ok: false, message: "กรอกหน้าที่/ความถนัดก่อน" };
    if (!canManageStaff) return { ok: false, message: "Role นี้ไม่มีสิทธิ์จัดการ Staff" };
    return { ok: true, message: editingStaffId ? "พร้อมบันทึกการแก้ไข" : "พร้อมเพิ่มเจ้าหน้าที่" };
  }, [staffForm, editingStaffId, canManageStaff]);

  // ===================== DERIVED STATE =====================
  const filteredTasks = useMemo(() => {
    const keyword = query.toLowerCase();
    return tasks.filter((task) => {
      const matchKeyword =
        task.title?.toLowerCase().includes(keyword) ||
        task.category?.toLowerCase().includes(keyword) ||
        task.priority?.toLowerCase().includes(keyword) ||
        task.status?.toLowerCase().includes(keyword) ||
        task.staff?.name?.toLowerCase().includes(keyword);
      const matchPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
      const matchStatus = statusFilter === "ALL" || task.status === statusFilter;
      return matchKeyword && matchPriority && matchStatus;
    });
  }, [query, tasks, priorityFilter, statusFilter]);

  const filteredStaff = useMemo(() => {
    const keyword = staffQuery.toLowerCase();
    return staff.filter(
      (person) =>
        person.name?.toLowerCase().includes(keyword) ||
        person.rank?.toLowerCase().includes(keyword) ||
        person.section?.toLowerCase().includes(keyword) ||
        person.role?.toLowerCase().includes(keyword)
    );
  }, [staffQuery, staff]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const active = tasks.filter((t) => t.status !== "เสร็จแล้ว").length;
    const done = tasks.filter((t) => t.status === "เสร็จแล้ว").length;
    const urgent = tasks.filter((t) => t.priority === "สูง" || t.priority === "วิกฤต").length;
    const filled = total ? Math.round((tasks.filter((t) => t.owner_id).length / total) * 100) : 0;
    return { total, active, done, urgent, filled };
  }, [tasks]);

  // 7-day trend for sparkline
  const last7DaysTrend = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const count = tasks.filter((t) => t.task_date === key).length;
      days.push(count);
    }
    return days;
  }, [tasks]);

  const completionTrend = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const count = tasks.filter((t) => t.task_date === key && t.status === "เสร็จแล้ว").length;
      days.push(count);
    }
    return days;
  }, [tasks]);

  const achievementStats = useMemo(() => {
    return staff
      .map((person) => {
        const earned = staffAchievements.filter((item) => item.staff_id === person.id);
        const count = earned.length;
        const percent = Math.round((count / achievementCatalog.length) * 100);
        return { ...person, earned, count, percent };
      })
      .sort((a, b) => b.count - a.count || b.points - a.points);
  }, [staff, staffAchievements]);

  const topAchievementStaff = achievementStats[0];

  const myEarnedAchievements = useMemo(() => {
    if (!profile?.staff_id) return [];
    return staffAchievements.filter((item) => item.staff_id === profile.staff_id);
  }, [profile?.staff_id, staffAchievements]);

  const myAchievementCards = useMemo(() => {
    return achievementCatalog.map((achievement) => {
      const earnedItem = myEarnedAchievements.find((item) => item.achievement_code === achievement.code);
      return { ...achievement, earned: Boolean(earnedItem), earnedAt: earnedItem?.earned_at || null };
    });
  }, [myEarnedAchievements]);

  const myAchievementPercent = Math.round((myEarnedAchievements.length / achievementCatalog.length) * 100);

  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((task) => task.task_date === today);
  const todayDone = todayTasks.filter((task) => task.status === "เสร็จแล้ว");
  const todayPending = todayTasks.filter((task) => task.status !== "เสร็จแล้ว");
  const todayUrgent = todayTasks.filter((task) => task.priority === "สูง" || task.priority === "วิกฤต");
  const availableStaff = staff.filter((person) => person.active && !person.exempt);
  const heatScore = todayTasks.length + todayUrgent.length * 2 + Math.max(0, todayPending.length - availableStaff.length);

  const heatLevel =
    heatScore >= 18
      ? { label: "BLACK", className: "border-red-500/50 bg-red-500/25 text-red-100", detail: "งานวิกฤต / คนไม่พอ", pulse: true, color: "#ef4444" }
      : heatScore >= 12
      ? { label: "RED", className: "border-rose-500/45 bg-rose-500/25 text-rose-100", detail: "งานแน่น ต้องคุมใกล้ชิด", pulse: true, color: "#f43f5e" }
      : heatScore >= 7
      ? { label: "YELLOW", className: "border-amber-500/45 bg-amber-500/25 text-amber-100", detail: "งานปานกลาง", pulse: false, color: "#f59e0b" }
      : { label: "GREEN", className: "border-emerald-500/45 bg-emerald-500/25 text-emerald-100", detail: "สถานการณ์ควบคุมได้", pulse: false, color: "#10b981" };

  const workloadBoard = staff
    .map((person) => {
      const assigned = tasks.filter((task) => task.owner_id === person.id && task.status !== "เสร็จแล้ว");
      const urgent = assigned.filter((task) => task.priority === "สูง" || task.priority === "วิกฤต");
      const loadScore = assigned.length + urgent.length * 2;
      const workloadStatus =
        loadScore >= 8 ? "Overloaded" : loadScore >= 4 ? "Balanced" : person.active && !person.exempt ? "Available" : "Unavailable";
      return { ...person, assignedCount: assigned.length, urgentCount: urgent.length, loadScore, workloadStatus };
    })
    .sort((a, b) => b.loadScore - a.loadScore);

  const suggestedAssignee = workloadBoard
    .filter((person) => person.workloadStatus === "Available")
    .sort((a, b) => b.reliability - a.reliability)[0];

  const focusTasks = tasks
    .filter((task) => {
      const isUrgent = task.priority === "สูง" || task.priority === "วิกฤต";
      const isPending = task.status !== "เสร็จแล้ว";
      const isMine = profile?.staff_id && task.owner_id === profile.staff_id;
      return isPending && (isUrgent || isMine || task.task_date === today);
    })
    .sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));

  const visibleTasks = focusMode ? focusTasks : filteredTasks;
  const kanbanColumns = statusOrder.map((status) => ({
    status,
    tasks: visibleTasks.filter((task) => task.status === status),
  }));

  const commanderBriefText = [
    "เรียน ผู้บังคับบัญชา",
    `รายงานสถานการณ์ TEAM-DMS ประจำวันที่ ${today}`,
    `งานทั้งหมดในระบบ ${stats.total} รายการ / งานวันนี้ ${todayTasks.length} รายการ`,
    `ดำเนินการแล้วเสร็จวันนี้ ${todayDone.length} รายการ / คงค้างวันนี้ ${todayPending.length} รายการ`,
    `งานเร่งด่วนวันนี้ ${todayUrgent.length} รายการ / Heat Level: ${heatLevel.label} (${heatLevel.detail})`,
    suggestedAssignee
      ? `ข้อเสนอแนะ: มอบหมายงานใหม่ให้ ${suggestedAssignee.rank} ${suggestedAssignee.name} ได้ เนื่องจากภาระงานยังต่ำ`
      : "ข้อเสนอแนะ: ยังไม่มีเจ้าหน้าที่ว่างที่เหมาะสมสำหรับรับงานเพิ่ม",
  ].join("\n");

  async function copyCommanderBrief() {
    try {
      await navigator.clipboard.writeText(commanderBriefText);
      setNotice("คัดลอก Commander Brief แล้ว");
    } catch {
      setNotice("คัดลอกไม่สำเร็จ: browser ไม่อนุญาต clipboard");
    }
  }

  function canUpdateTask(task) {
    return canManageTasks || (appRole === "staff" && profile?.staff_id && task.owner_id === profile.staff_id);
  }

  // ===================== ACTIONS =====================
  async function addTask(event) {
    event.preventDefault();
    if (!supabase || !validation.ok) return;
    setSaving(true);
    setNotice("");

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: newTask.title.trim(),
        task_date: newTask.task_date,
        owner_id: newTask.owner_id,
        priority: newTask.priority,
        status: newTask.status,
        category: newTask.category.trim() || "ทั่วไป",
        due_time: newTask.due_time || null,
        points: Number(newTask.points) || 0,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (error) setNotice(error.message);
    else {
      setNotice("บันทึกงานสำเร็จ ทุกเครื่องจะเห็นข้อมูลนี้แบบ realtime");
      await writeLog("CREATE_TASK", "tasks", data.id, `สร้างงาน: ${data.title}`);
      await recalculateAchievements(data.owner_id);
      setNewTask((prev) => ({ ...prev, title: "", priority: "กลาง", status: "ยังไม่เริ่ม", category: "ทั่วไป", points: 60 }));
    }
    setSaving(false);
  }

  async function updateStatus(id, status) {
    if (!supabase) return;
    const task = tasks.find((item) => item.id === id);
    if (!task || !canUpdateTask(task)) {
      setNotice("ไม่มีสิทธิ์เปลี่ยนสถานะงานนี้");
      return;
    }
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (error) setNotice(error.message);
    else {
      await writeLog("UPDATE_STATUS", "tasks", id, `เปลี่ยนสถานะงาน "${task?.title || id}" เป็น "${status}"`);
      await recalculateAchievements(task.owner_id);
    }
  }

  async function saveStaff(event) {
    event.preventDefault();
    if (!supabase || !staffValidation.ok) return;
    setSavingStaff(true);
    setNotice("");

    const payload = {
      rank: staffForm.rank.trim(),
      name: staffForm.name.trim(),
      section: staffForm.section.trim(),
      role: staffForm.role.trim(),
      active: Boolean(staffForm.active),
      exempt: Boolean(staffForm.exempt),
      points: Number(staffForm.points) || 0,
      reliability: Number(staffForm.reliability) || 0,
    };

    if (editingStaffId) {
      const { data, error } = await supabase.from("staff").update(payload).eq("id", editingStaffId).select().single();
      if (error) setNotice(error.message);
      else {
        setNotice("แก้ไขเจ้าหน้าที่สำเร็จ");
        await writeLog("UPDATE_STAFF", "staff", data.id, `แก้ไขเจ้าหน้าที่: ${data.rank} ${data.name}`);
        await recalculateAchievements(data.id);
        setEditingStaffId(null);
        setStaffForm(blankStaff);
      }
    } else {
      const { data, error } = await supabase.from("staff").insert(payload).select().single();
      if (error) setNotice(error.message);
      else {
        setNotice("เพิ่มเจ้าหน้าที่สำเร็จ");
        await writeLog("CREATE_STAFF", "staff", data.id, `เพิ่มเจ้าหน้าที่: ${data.rank} ${data.name}`);
        await recalculateAchievements(data.id);
        setStaffForm(blankStaff);
      }
    }

    setSavingStaff(false);
  }

  function editStaff(person) {
    setEditingStaffId(person.id);
    setStaffForm({
      rank: person.rank || "",
      name: person.name || "",
      section: person.section || "",
      role: person.role || "",
      active: person.active,
      exempt: person.exempt,
      points: person.points || 0,
      reliability: person.reliability || 80,
    });
    setActiveView("staff");
  }

  async function updateUserProfile(userId, patch) {
    if (!supabase || !canManageRoles) return;
    const { data, error } = await supabase.from("user_profiles").update(patch).eq("id", userId).select().single();
    if (error) setNotice(error.message);
    else {
      setNotice("อัปเดตสิทธิ์ผู้ใช้สำเร็จ");
      await writeLog("UPDATE_USER_ROLE", "user_profiles", userId, `อัปเดตผู้ใช้ ${data.email}: role=${data.app_role}`);
    }
  }
  async function togglePush() {
  if (!session?.user?.id) return;
  setPushBusy(true);
  setNotice("");
  try {
    if (pushEnabled) {
      await unregisterPushNotification();
      setPushEnabled(false);
      setNotice("ปิด Push Notification แล้ว");
    } else {
      await registerPushNotification(session.user.id);
      setPushEnabled(true);
      setNotice("✅ เปิด Push Notification สำเร็จ!");
      new Notification("TEAM-DMS", {
        body: "Push Notification พร้อมใช้งานแล้ว 🚀",
        icon: "/icon-192.png",
      });
    }
  } catch (err) {
    setNotice(`Error: ${err.message}`);
  }
  setPushBusy(false);
}
  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  // ===================== NAV ITEMS =====================
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "operations", icon: Gauge, label: "Operations" },
    { id: "kanban", icon: Layers, label: "Kanban Board" },
    { id: "staff", icon: Users, label: "Staff" },
    { id: "achievements", icon: Award, label: "Achievements" },
    { id: "roles", icon: Lock, label: "User Roles" },
    { id: "rules", icon: ShieldCheck, label: "Rule Engine" },
    { id: "logs", icon: Database, label: "Activity Log" },
  ];

  if (!hasSupabaseConfig) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <ShellCard className="max-w-xl p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
            <AlertTriangle size={26} />
          </div>
          <h1 className="text-2xl font-black">ยังไม่ได้ตั้งค่า Supabase</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            ต้องสร้างไฟล์ <code className="rounded bg-white/10 px-1.5 py-0.5">.env.local</code> แล้วใส่{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">VITE_SUPABASE_URL</code> และ{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">VITE_SUPABASE_ANON_KEY</code> ก่อน
          </p>
        </ShellCard>
      </main>
    );
  }

  if (!session) return <Login />;

  // ===================== RENDER =====================
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#03070f] text-slate-100">
      <ParticleField />

      {/* Achievement Popup */}
      {achievementPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-amber-400/40 bg-slate-950 p-8 text-center shadow-[0_0_120px_rgba(245,158,11,0.45)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.3),transparent_50%)]" />
            <div className="absolute -top-32 -right-32 h-64 w-64 animate-spin rounded-full bg-gradient-to-tr from-amber-500/20 via-transparent to-violet-500/20 blur-2xl" style={{ animationDuration: "8s" }} />
            <div className="relative">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] border border-amber-300/40 bg-amber-400/15 text-6xl shadow-[0_0_60px_rgba(245,158,11,0.55)]">
                <span className="animate-bounce" style={{ animationDuration: "1.2s" }}>{getAchievement(achievementPopup.achievement_code).icon}</span>
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-[0.4em] text-amber-300">⭐ Achievement Unlocked ⭐</p>
              <h2 className="mt-3 text-3xl font-black text-white">{getAchievement(achievementPopup.achievement_code).title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{getAchievement(achievementPopup.achievement_code).detail}</p>
              <Badge className="mt-4 border-amber-400/30 bg-amber-500/20 text-amber-100">
                {getAchievement(achievementPopup.achievement_code).tier} Tier
              </Badge>
              <Button
                onClick={() => setAchievementPopup(null)}
                className="mt-8 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 py-3 text-white shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:brightness-110"
              >
                <Trophy size={16} /> รับทราบ
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[270px_1fr]">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-white/10 bg-slate-950/85 p-5 backdrop-blur-2xl transition-transform lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } flex flex-col`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-2.5 shadow-[0_0_28px_rgba(14,165,233,0.55)]">
                  <Shield className="text-white" size={24} />
                </div>
                <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              <div>
                <p className="text-xl font-black tracking-wide">TEAM-DMS</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Command Center</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 lg:hidden">
              <X size={20} />
            </button>
          </div>

          <nav className="mt-8 flex-1 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 text-cyan-100 shadow-[inset_3px_0_0_rgba(34,211,238,0.9)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  }`}
                >
                  <Icon size={18} className={isActive ? "" : "transition group-hover:scale-110"} />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto text-cyan-300" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-3">
              <div className="flex items-center gap-2 text-emerald-300">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-xs font-black">REALTIME ACTIVE</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">เชื่อมต่อ Supabase WebSocket อยู่</p>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-300" />
                <p className="text-xs font-black text-cyan-100">TEAM-DMS v3.0</p>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">EPIC Edition · Stable</p>
            </div>

            <Button
              onClick={signOut}
              className="w-full border border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15"
            >
              <LogOut size={15} /> ออกจากระบบ
            </Button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="min-w-0 p-4 md:p-6 lg:p-8">
          {/* Top Bar */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  {navItems.find((i) => i.id === activeView)?.label || "Dashboard"}
                </p>
                <p className="text-lg font-black text-white">
                  สวัสดี, {profile?.staff?.name || session.user.email?.split("@")[0]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LiveClock />
              <button
  onClick={togglePush}
  disabled={pushBusy}
  title={pushEnabled ? "ปิด Push Notification" : "เปิด Push Notification"}
  className={`hidden rounded-xl border p-2.5 transition  ${
    pushEnabled
      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
  }`}
>
  {pushBusy
    ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
    : <Bell size={18} className={pushEnabled ? "animate-pulse" : ""} />
  }
</button>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-base font-black text-white shadow-lg">
                {session.user.email?.slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Notice */}
          {notice && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm font-bold text-amber-100 shadow-[0_0_24px_rgba(245,158,11,0.15)]">
              <AlertTriangle size={17} />
              <span className="flex-1">{notice}</span>
              <button onClick={() => setNotice("")} className="text-amber-200 hover:text-amber-50">
                <X size={16} />
              </button>
            </div>
          )}

          {/* ===================== DASHBOARD VIEW ===================== */}
          {activeView === "dashboard" && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <ShellCard glow className="relative overflow-hidden p-7 md:p-9">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(14,165,233,0.28),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(139,92,246,0.18),transparent_28%)]" />
                <div className="absolute right-6 top-6 hidden md:block">
                  <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${heatLevel.className} ${heatLevel.pulse ? "animate-pulse" : ""}`}>
                    <Flame size={22} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider opacity-70">Heat Level</p>
                      <p className="text-xl font-black">{heatLevel.label}</p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-200">
                    <Sparkles size={12} /> EPIC EDITION
                  </div>
                  <h1 className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-5xl font-black tracking-[0.08em] text-transparent md:text-7xl">
                    TEAM-DMS
                  </h1>
                  <p className="mt-3 text-base font-black text-cyan-300 md:text-lg">
                    ระบบบริหารจัดการมอบหมายงานและทรัพยากรบุคคล
                  </p>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                    ศูนย์ปฏิบัติการดิจิทัล · Role-Based Access · Realtime Sync · Achievement System · Kanban · Commander Brief
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Badge className="border-violet-400/30 bg-violet-500/15 text-violet-200">
                      <UserCog size={12} /> {getRoleLabel(appRole)}
                    </Badge>
                    <Badge className="border-emerald-400/30 bg-emerald-500/15 text-emerald-200">
                      <Activity size={12} /> {tasks.length} Total Tasks
                    </Badge>
                    <Badge className="border-cyan-400/30 bg-cyan-500/15 text-cyan-200">
                      <Users size={12} /> {staff.length} Staff
                    </Badge>
                    <Badge className="border-amber-400/30 bg-amber-500/15 text-amber-100">
                      <Trophy size={12} /> {staffAchievements.length} Achievements
                    </Badge>
                  </div>
                </div>
              </ShellCard>

              {/* Stat Cards */}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={ClipboardList} title="งานทั้งหมด" value={stats.total} sub="ภารกิจในระบบ" tone="cyan" />
                <StatCard
                  icon={CheckCircle2}
                  title="งานที่เสร็จสิ้น"
                  value={stats.done}
                  sub={`${stats.filled}% มีผู้รับผิดชอบ`}
                  tone="emerald"
                />
                <StatCard icon={Clock3} title="กำลังดำเนินการ" value={stats.active} sub="งานที่ยังไม่ปิด" tone="amber" />
                <StatCard icon={Flame} title="งานเร่งด่วน" value={stats.urgent} sub="สูง / วิกฤต" tone="rose" />
              </div>

              {/* Sparkline Trend */}
              <div className="grid gap-4 lg:grid-cols-2">
                <ShellCard className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-white">งานต่อวัน · 7 วันล่าสุด</h3>
                      <p className="text-xs text-slate-500">Mission Distribution Trend</p>
                    </div>
                    <BarChart3 className="text-cyan-300" size={20} />
                  </div>
                  <div className="h-24">
                    <Sparkline data={last7DaysTrend} color="#22d3ee" />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (6 - i));
                      return <span key={i}>{d.getDate()}/{d.getMonth() + 1}</span>;
                    })}
                  </div>
                </ShellCard>
                <ShellCard className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-white">งานสำเร็จต่อวัน · 7 วันล่าสุด</h3>
                      <p className="text-xs text-slate-500">Completion Velocity</p>
                    </div>
                    <Zap className="text-emerald-300" size={20} />
                  </div>
                  <div className="h-24">
                    <Sparkline data={completionTrend} color="#10b981" />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (6 - i));
                      return <span key={i}>{d.getDate()}/{d.getMonth() + 1}</span>;
                    })}
                  </div>
                </ShellCard>
              </div>

              {/* Daily Situation Board */}
              <ShellCard className="p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-white">Daily Situation Board</h2>
                    <p className="text-xs text-slate-500">ภาพรวมสถานการณ์วันนี้ · {today}</p>
                  </div>
                  <Badge className={`${heatLevel.className} ${heatLevel.pulse ? "animate-pulse" : ""}`}>
                    <Flame size={12} /> HEAT: {heatLevel.label}
                  </Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    { label: "งานวันนี้", value: todayTasks.length, color: "text-white" },
                    { label: "เสร็จแล้ว", value: todayDone.length, color: "text-emerald-300" },
                    { label: "ค้างอยู่", value: todayPending.length, color: "text-amber-300" },
                    { label: "พร้อมรับงาน", value: availableStaff.length, color: "text-cyan-300" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-white/10 hover:bg-white/[0.05]">
                      <p className="text-xs font-bold text-slate-500">{item.label}</p>
                      <p className={`mt-1 text-3xl font-black ${item.color}`}>
                        <AnimatedNumber value={item.value} />
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-4">
                  <Compass className="mt-0.5 shrink-0 text-cyan-300" size={20} />
                  <div>
                    <p className="text-sm font-black text-cyan-100">Command Insight</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      สถานการณ์วันนี้: <span className="font-bold text-white">{heatLevel.detail}</span>
                      {suggestedAssignee
                        ? ` · แนะนำมอบหมายงานใหม่ให้ ${suggestedAssignee.rank} ${suggestedAssignee.name} (ภาระงานยังต่ำ)`
                        : " · ยังไม่มีเจ้าหน้าที่ว่างที่เหมาะสม"}
                    </p>
                  </div>
                </div>
              </ShellCard>

              {/* Commander View */}
              {showCommanderView && (
                <ShellCard className="p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white">Commander View</h2>
                      <p className="text-xs text-slate-500">มุมมองสำหรับบรีฟผู้บังคับบัญชา</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowCommanderView(false)}
                        className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                      >
                        <Eye size={14} /> ซ่อน
                      </Button>
                      <Button
                        onClick={copyCommanderBrief}
                        className="border border-emerald-400/30 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15"
                      >
                        <ShieldCheck size={14} /> Copy Brief
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                      <p className="text-xs font-bold text-slate-500">Mission Completion</p>
                      <p className="mt-1 text-3xl font-black text-emerald-300">
                        <AnimatedNumber value={stats.total ? Math.round((stats.done / stats.total) * 100) : 0} />%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-500/5 p-4">
                      <p className="text-xs font-bold text-slate-500">Critical Today</p>
                      <p className="mt-1 text-3xl font-black text-rose-300">
                        <AnimatedNumber value={todayUrgent.length} />
                      </p>
                    </div>
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
                      <p className="text-xs font-bold text-slate-500">Recommended Assignee</p>
                      <p className="mt-2 text-base font-black text-cyan-200">
                        {suggestedAssignee ? `${suggestedAssignee.rank} ${suggestedAssignee.name}` : "ไม่มี"}
                      </p>
                    </div>
                  </div>
                  <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/5 bg-slate-950/60 p-4 font-mono text-sm leading-6 text-slate-300">
                    {commanderBriefText}
                  </pre>
                </ShellCard>
              )}

              {/* Achievement Center */}
              <ShellCard className="p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-white">Achievement Leaderboard</h2>
                    <p className="text-xs text-slate-500">รางวัลการทำงาน 20 แบบ · เก็บครบทั้งหมดได้ Super Admin</p>
                  </div>
                  <Button
                    onClick={recalculateAllAchievements}
                    className="border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15"
                  >
                    <RefreshCcw size={14} /> Sync All
                  </Button>
                </div>

                {topAchievementStaff && (
                  <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-violet-500/10 to-amber-500/5 p-5 shadow-[0_0_40px_rgba(245,158,11,0.18)]">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-3 text-white shadow-[0_0_24px_rgba(245,158,11,0.5)]">
                          <Crown size={28} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-950 bg-amber-400 text-[10px] font-black text-amber-950">
                          #1
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-lg font-black text-white">
                          {topAchievementStaff.rank} {topAchievementStaff.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Leader · {topAchievementStaff.count}/{achievementCatalog.length} achievements
                        </p>
                      </div>
                      <Badge className="border-amber-400/40 bg-amber-500/25 text-amber-100">
                        <Crown size={11} /> SUPER ADMIN PATH
                      </Badge>
                    </div>
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-violet-400 to-cyan-400 transition-all duration-1000"
                        style={{ width: `${topAchievementStaff.percent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  {achievementStats.slice(0, 5).map((person, index) => (
                    <div key={person.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-white/10">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${
                            index === 0 ? "bg-amber-500/20 text-amber-200" :
                            index === 1 ? "bg-slate-400/20 text-slate-200" :
                            index === 2 ? "bg-orange-700/30 text-orange-200" :
                            "bg-white/5 text-slate-400"
                          }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-black text-white">{person.rank} {person.name}</p>
                            <p className="text-xs text-slate-500">
                              {person.count}/{achievementCatalog.length} achievements · {person.points} pts
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={
                            person.count === achievementCatalog.length
                              ? "border-amber-400/30 bg-amber-500/20 text-amber-100"
                              : "border-cyan-400/30 bg-cyan-500/15 text-cyan-200"
                          }
                        >
                          {person.percent}%
                        </Badge>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-700"
                          style={{ width: `${person.percent}%` }}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {person.earned.slice(0, 12).map((item) => (
                          <span
                            key={item.id}
                            className="rounded-lg bg-white/5 px-2 py-1 text-sm transition hover:scale-110"
                            title={getAchievement(item.achievement_code).title}
                          >
                            {getAchievement(item.achievement_code).icon}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ShellCard>

              {/* My Achievements */}
              {profile?.staff_id && (
                <ShellCard className="p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white">My Achievements</h2>
                      <p className="text-xs text-slate-500">เหรียญของฉัน · ความคืบหน้าส่วนตัว</p>
                    </div>
                    <Medal className="text-amber-300" size={22} />
                  </div>
                  <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/15 to-violet-500/10 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-white">{profile.staff?.rank} {profile.staff?.name}</p>
                        <p className="text-xs text-slate-400">
                          ได้รับแล้ว {myEarnedAchievements.length}/{achievementCatalog.length} achievements
                        </p>
                      </div>
                      <Badge
                        className={
                          myEarnedAchievements.length === achievementCatalog.length
                            ? "border-amber-400/30 bg-amber-500/20 text-amber-100"
                            : "border-cyan-400/30 bg-cyan-500/15 text-cyan-200"
                        }
                      >
                        {myAchievementPercent}%
                      </Badge>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 transition-all duration-1000"
                        style={{ width: `${myAchievementPercent}%` }}
                      />
                    </div>
                    {myEarnedAchievements.length === achievementCatalog.length && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs font-black text-amber-100">
                        <Crown size={14} /> ปลดล็อกครบแล้ว — สิทธิ์ Super Admin จะถูกมอบให้อัตโนมัติ
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => setShowMyAchievements((v) => !v)}
                    className="mt-4 w-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  >
                    <Star size={15} /> {showMyAchievements ? "ซ่อนรายการของฉัน" : "ดูรายการของฉัน"}
                  </Button>
                  {showMyAchievements && (
                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                      {myAchievementCards.map((a) => (
                        <div
                          key={a.code}
                          className={`rounded-2xl border p-3 transition ${
                            a.earned
                              ? "border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/15"
                              : "border-white/5 bg-slate-950/35 opacity-60"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl ${
                                a.earned ? "bg-emerald-400/15" : "bg-white/5 grayscale"
                              }`}
                            >
                              {a.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="font-black text-white">{a.title}</p>
                                <Badge
                                  className={
                                    a.tier === "Mythic"
                                      ? "border-amber-400/30 bg-amber-500/20 text-amber-100"
                                      : "border-white/10 bg-white/5 text-slate-300"
                                  }
                                >
                                  {a.tier}
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs leading-5 text-slate-400">{a.detail}</p>
                              {a.earnedAt && (
                                <p className="mt-1 text-[11px] font-bold text-emerald-300">
                                  ✓ {new Date(a.earnedAt).toLocaleString("th-TH")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ShellCard>
              )}
            </div>
          )}

          {/* ===================== OPERATIONS VIEW ===================== */}
          {activeView === "operations" && (
            <div className="space-y-6">
              <ShellCard className="p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-white">Operations Room</h2>
                    <p className="text-xs text-slate-500">สร้างงานใหม่และติดตามภารกิจล่าสุด</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setFocusMode((v) => !v)}
                      className={focusMode ? "bg-cyan-500 text-white shadow-[0_0_18px_rgba(34,211,238,0.45)]" : "border border-white/10 bg-white/5 text-slate-200"}
                    >
                      <Target size={14} /> {focusMode ? "Focus ON" : "Focus Mode"}
                    </Button>
                  </div>
                </div>

                {focusMode && (
                  <div className="mb-4 flex items-center gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                    <Target size={18} className="shrink-0" />
                    <p>Focus Mode เปิดอยู่: แสดงเฉพาะงานของฉัน / งานวันนี้ / งานเร่งด่วน รวม {focusTasks.length} รายการ</p>
                  </div>
                )}

                <div className="grid gap-5 xl:grid-cols-[0.95fr_1.35fr]">
                  {/* Create Task Form */}
                  <form onSubmit={addTask} className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Plus size={18} className="text-cyan-300" />
                      <p className="text-sm font-black text-white">สร้างงานใหม่</p>
                    </div>
                    <div className="space-y-3">
                      <Field
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="ระบุชื่องาน"
                        className="w-full"
                      />
                      <Field
                        value={newTask.category}
                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                        placeholder="หมวด/ประเภทงาน"
                        className="w-full"
                      />
                      <div className="grid gap-3 md:grid-cols-2">
                        <Select
                          value={newTask.owner_id}
                          onChange={(e) => setNewTask({ ...newTask, owner_id: e.target.value })}
                        >
                          <option value="">เลือกผู้รับผิดชอบ</option>
                          {staff.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.rank} {p.name}
                            </option>
                          ))}
                        </Select>
                        <Field
                          type="date"
                          value={newTask.task_date}
                          onChange={(e) => setNewTask({ ...newTask, task_date: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <Select
                          value={newTask.priority}
                          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        >
                          <option>ต่ำ</option>
                          <option>กลาง</option>
                          <option>สูง</option>
                          <option>วิกฤต</option>
                        </Select>
                        <Select
                          value={newTask.status}
                          onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                        >
                          <option>ยังไม่เริ่ม</option>
                          <option>กำลังทำ</option>
                          <option>รอตรวจ</option>
                          <option>เสร็จแล้ว</option>
                        </Select>
                        <Field
                          type="time"
                          value={newTask.due_time}
                          onChange={(e) => setNewTask({ ...newTask, due_time: e.target.value })}
                        />
                      </div>
                      <Field
                        type="number"
                        value={newTask.points}
                        onChange={(e) => setNewTask({ ...newTask, points: e.target.value })}
                        placeholder="คะแนน"
                      />
                      <div
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black ${
                          validation.ok
                            ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                            : "border-rose-400/30 bg-rose-500/10 text-rose-200"
                        }`}
                      >
                        {validation.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                        {validation.message}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          onClick={() => setNewTask((p) => ({ ...p, title: "", category: "ทั่วไป" }))}
                          className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                        >
                          <X size={15} /> รีเซ็ต
                        </Button>
                        <Button
                          disabled={!validation.ok || saving}
                          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_24px_rgba(14,165,233,0.4)]"
                        >
                          {saving ? (
                            <>
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              Saving
                            </>
                          ) : (
                            <>
                              <Save size={15} /> บันทึกงาน
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>

                  {/* Task Table */}
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-white">งานล่าสุด</p>
                        <Badge className="border-cyan-400/30 bg-cyan-500/15 text-cyan-200">
                          {visibleTasks.length}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Select
                          value={priorityFilter}
                          onChange={(e) => setPriorityFilter(e.target.value)}
                          className="h-9 text-xs"
                        >
                          <option value="ALL">All Priority</option>
                          <option>ต่ำ</option>
                          <option>กลาง</option>
                          <option>สูง</option>
                          <option>วิกฤต</option>
                        </Select>
                        <Select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="h-9 text-xs"
                        >
                          <option value="ALL">All Status</option>
                          {statusOrder.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </Select>
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                      <Field
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="ค้นหางาน / คน / สถานะ"
                        className="w-full rounded-none border-0 border-b border-white/5 bg-transparent pl-10"
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[680px] text-left text-sm">
                        <thead className="text-xs uppercase text-slate-500">
                          <tr>
                            <th className="px-4 py-3">#</th>
                            <th>ชื่องาน</th>
                            <th>ผู้รับผิดชอบ</th>
                            <th>กำหนดเสร็จ</th>
                            <th>สถานะ</th>
                            <th className="pr-4">ความสำคัญ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {loading ? (
                            <tr>
                              <td colSpan="6" className="px-4 py-8 text-center">
                                <div className="inline-flex items-center gap-2 text-slate-500">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                                  กำลังโหลด...
                                </div>
                              </td>
                            </tr>
                          ) : visibleTasks.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                                ไม่พบรายการ
                              </td>
                            </tr>
                          ) : (
                            visibleTasks.slice(0, 12).map((task, index) => (
                              <tr key={task.id} className="text-slate-300 transition hover:bg-white/[0.03]">
                                <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                                <td className="font-bold text-slate-100">{task.title}</td>
                                <td className="text-slate-300">
                                  {task.staff?.rank} {task.staff?.name}
                                </td>
                                <td className="text-slate-400">{task.task_date}</td>
                                <td>
                                  <Select
                                    value={task.status}
                                    onChange={(e) => updateStatus(task.id, e.target.value)}
                                    disabled={!canUpdateTask(task)}
                                    className={`h-8 w-32 border text-xs ${statusStyle[task.status]}`}
                                  >
                                    {statusOrder.map((s) => (
                                      <option key={s}>{s}</option>
                                    ))}
                                  </Select>
                                </td>
                                <td className="pr-4">
                                  <Badge className={priorityStyle[task.priority]}>{task.priority}</Badge>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </ShellCard>

              {/* Workload Balance */}
              <ShellCard className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white">Workload Balance</h2>
                    <p className="text-xs text-slate-500">วิเคราะห์ภาระงานเจ้าหน้าที่</p>
                  </div>
                  <Gauge className="text-cyan-300" size={22} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {workloadBoard.slice(0, 10).map((person) => (
                    <div key={person.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-white/10">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-black text-white">
                            {person.rank} {person.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            งานค้าง {person.assignedCount} · งานเร่ง {person.urgentCount}
                          </p>
                        </div>
                        <Badge
                          className={
                            person.workloadStatus === "Overloaded"
                              ? "border-rose-400/30 bg-rose-500/15 text-rose-200"
                              : person.workloadStatus === "Balanced"
                              ? "border-amber-400/30 bg-amber-500/15 text-amber-200"
                              : person.workloadStatus === "Available"
                              ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                              : "border-slate-500/30 bg-slate-500/15 text-slate-400"
                          }
                        >
                          {person.workloadStatus}
                        </Badge>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            person.workloadStatus === "Overloaded"
                              ? "bg-gradient-to-r from-rose-500 to-red-500"
                              : person.workloadStatus === "Balanced"
                              ? "bg-gradient-to-r from-amber-500 to-orange-500"
                              : "bg-gradient-to-r from-cyan-500 to-emerald-400"
                          }`}
                          style={{ width: `${Math.min(person.loadScore * 12, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ShellCard>
            </div>
          )}

          {/* ===================== KANBAN VIEW ===================== */}
          {activeView === "kanban" && (
            <ShellCard className="p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">Kanban Board</h2>
                  <p className="text-xs text-slate-500">มุมมองงานแบบสถานะ · เปลี่ยนสถานะได้ทันที</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setFocusMode((v) => !v)}
                    className={focusMode ? "bg-cyan-500 text-white" : "border border-white/10 bg-white/5 text-slate-200"}
                  >
                    <Target size={14} /> Focus
                  </Button>
                  <Badge className="border-violet-400/30 bg-violet-500/15 text-violet-200">
                    <Layers size={11} /> {visibleTasks.length} Tasks
                  </Badge>
                </div>
              </div>
              <div className="grid gap-3 xl:grid-cols-4">
                {kanbanColumns.map((column) => (
                  <div key={column.status} className="rounded-2xl border border-white/5 bg-slate-950/40 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-black text-white">{column.status}</p>
                      <Badge className={statusStyle[column.status]}>{column.tasks.length}</Badge>
                    </div>
                    <div className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
                      {column.tasks.length === 0 ? (
                        <p className="rounded-xl bg-white/[0.02] p-3 text-center text-xs text-slate-600">
                          ไม่มีงาน
                        </p>
                      ) : (
                        column.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="rounded-2xl border border-white/5 bg-white/[0.04] p-3 transition hover:border-white/15 hover:bg-white/[0.07]"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-black text-slate-100">{task.title}</p>
                                <p className="mt-1 text-[11px] text-slate-500">
                                  {task.staff?.rank} {task.staff?.name}
                                </p>
                                <p className="text-[11px] text-slate-600">{task.task_date}</p>
                              </div>
                              <Badge className={priorityStyle[task.priority]}>{task.priority}</Badge>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-1.5">
                              {statusOrder
                                .filter((status) => status !== task.status)
                                .slice(0, 2)
                                .map((status) => (
                                  <Button
                                    key={status}
                                    type="button"
                                    disabled={!canUpdateTask(task)}
                                    onClick={() => updateStatus(task.id, status)}
                                    className="border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] text-slate-200 hover:bg-white/10"
                                  >
                                    {status}
                                  </Button>
                                ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ShellCard>
          )}

          {/* ===================== STAFF VIEW ===================== */}
          {activeView === "staff" && (
            <div className="space-y-5">
              <ShellCard className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white">Staff Management</h2>
                    <p className="text-xs text-slate-500">เพิ่ม/แก้ไขข้อมูลเจ้าหน้าที่</p>
                  </div>
                  <UserPlus className="text-cyan-300" size={22} />
                </div>
                <form onSubmit={saveStaff} className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field
                      value={staffForm.rank}
                      onChange={(e) => setStaffForm({ ...staffForm, rank: e.target.value })}
                      placeholder="ยศ"
                    />
                    <Field
                      value={staffForm.name}
                      onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                      placeholder="ชื่อ-นามสกุล"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field
                      value={staffForm.section}
                      onChange={(e) => setStaffForm({ ...staffForm, section: e.target.value })}
                      placeholder="แผนก / ฝ่าย"
                    />
                    <Field
                      value={staffForm.role}
                      onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                      placeholder="ตำแหน่ง / หน้าที่"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field
                      type="number"
                      value={staffForm.points}
                      onChange={(e) => setStaffForm({ ...staffForm, points: e.target.value })}
                      placeholder="คะแนน"
                    />
                    <Field
                      type="number"
                      min="0"
                      max="100"
                      value={staffForm.reliability}
                      onChange={(e) => setStaffForm({ ...staffForm, reliability: e.target.value })}
                      placeholder="Reliability (0-100)"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm font-bold text-slate-300">
                      <input
                        type="checkbox"
                        checked={staffForm.active}
                        onChange={(e) => setStaffForm({ ...staffForm, active: e.target.checked })}
                        className="h-4 w-4 accent-emerald-500"
                      />
                      Active
                    </label>
                    <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm font-bold text-slate-300">
                      <input
                        type="checkbox"
                        checked={staffForm.exempt}
                        onChange={(e) => setStaffForm({ ...staffForm, exempt: e.target.checked })}
                        className="h-4 w-4 accent-amber-500"
                      />
                      Exempt (ไม่รับงาน)
                    </label>
                  </div>
                  <div
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black ${
                      staffValidation.ok
                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                        : "border-rose-400/30 bg-rose-500/10 text-rose-200"
                    }`}
                  >
                    {staffValidation.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    {staffValidation.message}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      onClick={() => {
                        setEditingStaffId(null);
                        setStaffForm(blankStaff);
                      }}
                      className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                    >
                      <X size={15} /> รีเซ็ต
                    </Button>
                    <Button
                      disabled={!staffValidation.ok || savingStaff}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_18px_rgba(14,165,233,0.4)]"
                    >
                      <Save size={15} /> {editingStaffId ? "บันทึกการแก้ไข" : "เพิ่มเจ้าหน้าที่"}
                    </Button>
                  </div>
                </form>
              </ShellCard>

              <ShellCard className="p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-white">Staff Directory</h2>
                    <p className="text-xs text-slate-500">รายชื่อเจ้าหน้าที่ทั้งหมด · {staff.length} คน</p>
                  </div>
                  <div className="relative w-72 max-w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                    <Field
                      value={staffQuery}
                      onChange={(e) => setStaffQuery(e.target.value)}
                      placeholder="ค้นหาเจ้าหน้าที่"
                      className="w-full pl-10"
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filteredStaff.map((person) => {
                    const earned = staffAchievements.filter((item) => item.staff_id === person.id).length;
                    return (
                      <div key={person.id} className="group rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-white/15 hover:bg-white/[0.05]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 text-base font-black text-white">
                              {person.name?.slice(0, 1)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-black text-white">
                                {person.rank} {person.name}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {person.section} · {person.role}
                              </p>
                            </div>
                          </div>
                          {canManageStaff && (
                            <button
                              onClick={() => editStaff(person)}
                              className="opacity-0 transition group-hover:opacity-100"
                            >
                              <UserCog className="text-cyan-300 hover:text-cyan-200" size={16} />
                            </button>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-xl bg-white/[0.04] p-2">
                            <p className="text-[10px] font-bold text-slate-500">Points</p>
                            <p className="text-sm font-black text-cyan-300">{person.points}</p>
                          </div>
                          <div className="rounded-xl bg-white/[0.04] p-2">
                            <p className="text-[10px] font-bold text-slate-500">Reliab.</p>
                            <p className="text-sm font-black text-emerald-300">{person.reliability}%</p>
                          </div>
                          <div className="rounded-xl bg-white/[0.04] p-2">
                            <p className="text-[10px] font-bold text-slate-500">Awards</p>
                            <p className="text-sm font-black text-amber-300">{earned}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-1.5">
                          {person.active ? (
                            <Badge className="border-emerald-400/30 bg-emerald-500/15 text-emerald-200">Active</Badge>
                          ) : (
                            <Badge className="border-slate-500/30 bg-slate-500/15 text-slate-400">Inactive</Badge>
                          )}
                          {person.exempt && (
                            <Badge className="border-amber-400/30 bg-amber-500/15 text-amber-200">Exempt</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ShellCard>
            </div>
          )}

          {/* ===================== ACHIEVEMENTS VIEW ===================== */}
          {activeView === "achievements" && (
            <ShellCard className="p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">Achievement Catalog</h2>
                  <p className="text-xs text-slate-500">รางวัลทั้งหมด 20 แบบ</p>
                </div>
                <Button
                  onClick={recalculateAllAchievements}
                  className="border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15"
                >
                  <RefreshCcw size={14} /> Sync All
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {achievementCatalog.map((a) => {
                  const earnedCount = staffAchievements.filter((item) => item.achievement_code === a.code).length;
                  return (
                    <div key={a.code} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-white/15">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                          {a.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="font-black text-white">{a.title}</p>
                            <Badge
                              className={
                                a.tier === "Mythic"
                                  ? "border-amber-400/30 bg-amber-500/20 text-amber-100"
                                  : a.tier === "Gold"
                                  ? "border-amber-400/25 bg-amber-500/15 text-amber-200"
                                  : a.tier === "Silver"
                                  ? "border-slate-400/25 bg-slate-400/15 text-slate-200"
                                  : "border-orange-400/25 bg-orange-500/15 text-orange-200"
                              }
                            >
                              {a.tier}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-400">{a.detail}</p>
                          <p className="mt-2 text-[11px] font-bold text-cyan-300">
                            {earnedCount} คนได้รับแล้ว
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ShellCard>
          )}

          {/* ===================== ROLES VIEW ===================== */}
          {activeView === "roles" && (
            <ShellCard className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">User Role Management</h2>
                  <p className="text-xs text-slate-500">{canManageRoles ? "จัดการสิทธิ์ผู้ใช้และผูกกับ Staff" : "ดูเฉพาะ (ต้องเป็น Super Admin)"}</p>
                </div>
                <KeyRound className="text-cyan-300" size={22} />
              </div>
              {!canManageRoles ? (
                <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  คุณไม่มีสิทธิ์เข้าถึงส่วนนี้
                </div>
              ) : (
                <div className="space-y-3">
                  {profiles.map((u) => (
                    <div key={u.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-slate-100">{u.email}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {u.staff ? `${u.staff.rank} ${u.staff.name}` : "ยังไม่ผูก Staff"}
                          </p>
                        </div>
                        <Badge
                          className={
                            getRoleColor(u.app_role) === "amber"
                              ? "border-amber-400/30 bg-amber-500/15 text-amber-200"
                              : getRoleColor(u.app_role) === "rose"
                              ? "border-rose-400/30 bg-rose-500/15 text-rose-200"
                              : getRoleColor(u.app_role) === "violet"
                              ? "border-violet-400/30 bg-violet-500/15 text-violet-200"
                              : getRoleColor(u.app_role) === "cyan"
                              ? "border-cyan-400/30 bg-cyan-500/15 text-cyan-200"
                              : "border-slate-400/30 bg-slate-500/15 text-slate-300"
                          }
                        >
                          {getRoleLabel(u.app_role)}
                        </Badge>
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        <Select
                          value={u.app_role || "viewer"}
                          onChange={(e) => updateUserProfile(u.id, { app_role: e.target.value })}
                        >
                          {roleOptions.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </Select>
                        <Select
                          value={u.staff_id || ""}
                          onChange={(e) => updateUserProfile(u.id, { staff_id: e.target.value || null })}
                        >
                          <option value="">ไม่ผูก Staff</option>
                          {staff.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.rank} {p.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ShellCard>
          )}

          {/* ===================== RULES VIEW ===================== */}
          {activeView === "rules" && (
            <ShellCard className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Rule Engine</h2>
                  <p className="text-xs text-slate-500">กฎและสิทธิ์ของระบบทั้งหมด</p>
                </div>
                <ShieldCheck className="text-cyan-300" size={22} />
              </div>
              <div className="space-y-3">
                {[
                  { rule: "Role มาจาก Database เท่านั้น", icon: Database },
                  { rule: "Viewer ดูอย่างเดียว", icon: Eye },
                  { rule: "Staff เปลี่ยนสถานะงานตัวเองได้", icon: UserCog },
                  { rule: "Manager/Override จัดการงานได้ทั้งระบบ", icon: Swords },
                  { rule: "Super Admin จัดการ Staff และ Role ได้", icon: Crown },
                  { rule: "Override ข้ามกฎ Overlap ของงานในวันเดียวกันได้", icon: Zap },
                  { rule: "Achievement ปลดล็อกอัตโนมัติเมื่อเข้าเงื่อนไข", icon: Trophy },
                  { rule: "Activity Logs บันทึกทุกการเปลี่ยนแปลง", icon: Activity },
                ].map(({ rule, icon: Icon }) => (
                  <div
                    key={rule}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="text-cyan-300" />
                      <p className="text-sm font-bold text-slate-200">{rule}</p>
                    </div>
                    <div className="flex h-6 w-11 items-center rounded-full bg-emerald-500 p-1">
                      <div className="ml-auto h-4 w-4 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={fetchAll} className="mt-5 w-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
                <RefreshCcw size={16} /> Refresh ข้อมูลทั้งหมด
              </Button>
            </ShellCard>
          )}

          {/* ===================== LOGS VIEW ===================== */}
          {activeView === "logs" && (
            <ShellCard className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Activity Log</h2>
                  <p className="text-xs text-slate-500">บันทึกการเปลี่ยนแปลงทั้งหมดในระบบ · 40 รายการล่าสุด</p>
                </div>
                <Database className="text-cyan-300" size={22} />
              </div>
              <div className="max-h-[600px] space-y-2 overflow-y-auto pr-2">
                {logs.length === 0 ? (
                  <p className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 text-center text-sm text-slate-500">
                    ยังไม่มีข้อมูล Activity Log
                  </p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className="border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
                              {log.action}
                            </Badge>
                            <span className="text-[11px] text-slate-500">{log.target_table}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-300">{log.description}</p>
                        </div>
                        <span className="shrink-0 text-[11px] text-slate-500">
                          {formatRelativeTime(log.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ShellCard>
          )}
        </section>
      </div>
    </main>
  );
}