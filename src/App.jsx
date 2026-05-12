import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  Award,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Crown,
  Database,
  Expand,
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
  RefreshCcw,
  Save,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null;

const roleOptions = [
  { value: "viewer", label: "Viewer" },
  { value: "staff", label: "Operator" },
  { value: "battalion_admin", label: "Manager" },
  { value: "super_admin", label: "Super Admin" },
  { value: "override", label: "Override" },
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
  ต่ำ: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  กลาง: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
  สูง: "border-rose-400/25 bg-rose-500/15 text-rose-200",
  วิกฤต: "border-red-400/30 bg-red-500/20 text-red-200",
};

const statusStyle = {
  "ยังไม่เริ่ม": "border-slate-500/30 bg-slate-500/15 text-slate-200",
  "กำลังทำ": "border-cyan-400/25 bg-cyan-500/15 text-cyan-200",
  "รอตรวจ": "border-amber-400/25 bg-amber-500/15 text-amber-200",
  "เสร็จแล้ว": "border-emerald-400/25 bg-emerald-500/15 text-emerald-200",
};

function getRoleLabel(value) {
  return roleOptions.find((role) => role.value === value)?.label || "Viewer";
}

function getAchievement(code) {
  return achievementCatalog.find((item) => item.code === code) || {
    code,
    title: code || "Achievement",
    detail: "Achievement unlocked",
    icon: "🏅",
    tier: "Bronze",
  };
}

function ShellCard({ children, className = "" }) {
  return (
    <div className={`rounded-[1.35rem] border border-white/10 bg-slate-900/55 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-black ${className}`}>{children}</span>;
}

function Field({ className = "", ...props }) {
  return (
    <input
      className={`h-11 rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-slate-950/70 ${className}`}
      {...props}
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`h-11 rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm font-bold text-slate-100 outline-none focus:border-cyan-400/50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

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
    <main className="min-h-screen bg-[#050b12] p-4 text-white md:p-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-[90vh] max-w-xl items-center">
        <ShellCard className="w-full p-7 md:p-9">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-sm font-black text-cyan-100">
            <Sparkles size={16} /> TEAM-DMS Realtime
          </div>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">เข้าสู่ระบบ</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">เข้าสู่ระบบเพื่อใช้งานศูนย์ควบคุมงานและกำลังพลแบบ Realtime</p>
          <form onSubmit={signIn} className="mt-7 space-y-3">
            <Field type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full" />
            <Field type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน อย่างน้อย 8 ตัว" className="w-full" />
            <Button disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_30px_rgba(14,165,233,0.32)] hover:from-cyan-400 hover:to-blue-500">
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ / สมัครบัญชี"}
            </Button>
          </form>
          {message && <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">{message}</p>}
        </ShellCard>
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, title, value, sub, tone = "cyan" }) {
  const tones = {
    cyan: "from-cyan-500/25 to-blue-500/5 text-cyan-200",
    emerald: "from-emerald-500/25 to-emerald-500/5 text-emerald-200",
    amber: "from-amber-500/25 to-amber-500/5 text-amber-200",
    violet: "from-violet-500/25 to-purple-500/5 text-violet-200",
  };

  return (
    <ShellCard className={`overflow-hidden bg-gradient-to-br p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3 shadow-lg"><Icon size={23} /></div>
        <div>
          <p className="text-xs font-bold text-slate-400">{title}</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{sub}</p>
        </div>
      </div>
    </ShellCard>
  );
}

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

  const appRole = profile?.app_role || "viewer";
  const canManageTasks = ["battalion_admin", "super_admin", "override"].includes(appRole);
  const canOverride = ["super_admin", "override"].includes(appRole);
  const canManageStaff = appRole === "super_admin";
  const canManageRoles = appRole === "super_admin";

  const blankStaff = { rank: "", name: "", section: "", role: "", active: true, exempt: false, points: 0, reliability: 80 };
  const [staffForm, setStaffForm] = useState(blankStaff);
  const [newTask, setNewTask] = useState({
    title: "",
    task_date: new Date().toISOString().slice(0, 10),
    owner_id: "",
    priority: "กลาง",
    status: "ยังไม่เริ่ม",
    category: "ทั่วไป",
    due_time: "17:00",
    points: 60,
  });

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => listener.subscription.unsubscribe();
  }, []);

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
  }, [session]);

  useEffect(() => {
    if (!supabase || !profile?.staff_id || !session?.user?.id) return;
    if (staffAchievements.length === 0) return;

    const myNewAchievement = staffAchievements.find((item) => item.staff_id === profile.staff_id && !seenAchievementIds.includes(item.id));
    if (!myNewAchievement) return;

    setAchievementPopup(myNewAchievement);
    supabase
      .from("user_seen_achievements")
      .insert({ user_id: session.user.id, staff_achievement_id: myNewAchievement.id })
      .then(() => fetchSeenAchievements());
  }, [staffAchievements, seenAchievementIds, profile?.staff_id, session?.user?.id]);

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
    const { data, error } = await supabase.from("user_profiles").select("*, staff:staff_id(rank,name,section)").order("created_at", { ascending: false });
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
    const { data, error } = await supabase.from("tasks").select("*, staff:owner_id(name, rank, section)").order("created_at", { ascending: false });
    if (error) setNotice(error.message);
    else setTasks(data || []);
  }

  async function fetchLogs() {
    if (!supabase) return;
    const { data, error } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(40);
    if (error) setNotice(error.message);
    else setLogs(data || []);
  }

  async function fetchStaffAchievements() {
    if (!supabase) return;
    const { data, error } = await supabase.from("staff_achievements").select("*").order("earned_at", { ascending: false });
    if (error) {
      console.error("fetchStaffAchievements error:", error.message);
      setStaffAchievements([]);
      return;
    }
    setStaffAchievements(data || []);
  }

  async function fetchSeenAchievements() {
    if (!supabase || !session?.user?.id) return;
    const { data, error } = await supabase.from("user_seen_achievements").select("staff_achievement_id").eq("user_id", session.user.id);
    if (error) {
      console.error("fetchSeenAchievements error:", error.message);
      return;
    }
    setSeenAchievementIds((data || []).map((item) => item.staff_achievement_id));
  }

  async function writeLog(action, targetTable, targetId, description) {
    if (!supabase || !session?.user?.id) return;
    const { error } = await supabase.from("activity_logs").insert({ user_id: session.user.id, action, target_table: targetTable, target_id: targetId, description });
    if (error) console.error("Activity log error:", error.message);
  }

  async function recalculateAchievements(staffId) {
    if (!supabase || !staffId) return;
    const { error } = await supabase.rpc("recalculate_staff_achievements", { target_staff_id: staffId });
    if (error) {
      setNotice(`Achievement error: ${error.message}`);
      console.error("Achievement recalculation error:", error.message);
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

  const validation = useMemo(() => {
    if (!newTask.title.trim()) return { ok: false, message: "กรอกชื่องานก่อน" };
    if (!canManageTasks) return { ok: false, message: "Role นี้ไม่มีสิทธิ์สร้างงาน" };
    const owner = staff.find((p) => p.id === newTask.owner_id);
    if (!owner) return { ok: false, message: "เลือกผู้รับผิดชอบก่อน" };
    if (!owner.active) return { ok: false, message: "เจ้าหน้าที่ inactive รับงานไม่ได้" };
    if (owner.exempt) return { ok: false, message: "เจ้าหน้าที่ exempt รับงานไม่ได้" };
    const duplicate = tasks.some((t) => t.task_date === newTask.task_date && t.title.trim().toLowerCase() === newTask.title.trim().toLowerCase());
    if (duplicate) return { ok: false, message: "พบงานชื่อซ้ำในวันเดียวกัน" };
    const overlap = tasks.some((t) => t.task_date === newTask.task_date && t.owner_id === newTask.owner_id && t.status !== "เสร็จแล้ว");
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

  const filteredTasks = useMemo(() => {
    const keyword = query.toLowerCase();
    return tasks.filter((task) => task.title?.toLowerCase().includes(keyword) || task.category?.toLowerCase().includes(keyword) || task.priority?.toLowerCase().includes(keyword) || task.status?.toLowerCase().includes(keyword) || task.staff?.name?.toLowerCase().includes(keyword));
  }, [query, tasks]);

  const filteredStaff = useMemo(() => {
    const keyword = staffQuery.toLowerCase();
    return staff.filter((person) => person.name?.toLowerCase().includes(keyword) || person.rank?.toLowerCase().includes(keyword) || person.section?.toLowerCase().includes(keyword) || person.role?.toLowerCase().includes(keyword));
  }, [staffQuery, staff]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const active = tasks.filter((t) => t.status !== "เสร็จแล้ว").length;
    const done = tasks.filter((t) => t.status === "เสร็จแล้ว").length;
    const urgent = tasks.filter((t) => t.priority === "สูง" || t.priority === "วิกฤต").length;
    const filled = total ? Math.round((tasks.filter((t) => t.owner_id).length / total) * 100) : 0;
    return { total, active, done, urgent, filled };
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
  const heatLevel = heatScore >= 18
    ? { label: "BLACK", className: "border-red-500/40 bg-red-500/20 text-red-100", detail: "งานวิกฤต / คนไม่พอ" }
    : heatScore >= 12
    ? { label: "RED", className: "border-rose-500/40 bg-rose-500/20 text-rose-100", detail: "งานแน่น ต้องคุมใกล้ชิด" }
    : heatScore >= 7
    ? { label: "YELLOW", className: "border-amber-500/40 bg-amber-500/20 text-amber-100", detail: "งานปานกลาง" }
    : { label: "GREEN", className: "border-emerald-500/40 bg-emerald-500/20 text-emerald-100", detail: "สถานการณ์ควบคุมได้" };

  const workloadBoard = staff
    .map((person) => {
      const assigned = tasks.filter((task) => task.owner_id === person.id && task.status !== "เสร็จแล้ว");
      const urgent = assigned.filter((task) => task.priority === "สูง" || task.priority === "วิกฤต");
      const loadScore = assigned.length + urgent.length * 2;
      const workloadStatus = loadScore >= 8 ? "Overloaded" : loadScore >= 4 ? "Balanced" : person.active && !person.exempt ? "Available" : "Unavailable";
      return { ...person, assignedCount: assigned.length, urgentCount: urgent.length, loadScore, workloadStatus };
    })
    .sort((a, b) => b.loadScore - a.loadScore);

  const suggestedAssignee = workloadBoard.filter((person) => person.workloadStatus === "Available").sort((a, b) => b.reliability - a.reliability)[0];

  const focusTasks = tasks
    .filter((task) => {
      const isUrgent = task.priority === "สูง" || task.priority === "วิกฤต";
      const isPending = task.status !== "เสร็จแล้ว";
      const isMine = profile?.staff_id && task.owner_id === profile.staff_id;
      return isPending && (isUrgent || isMine || task.task_date === today);
    })
    .sort((a, b) => ({ วิกฤต: 4, สูง: 3, กลาง: 2, ต่ำ: 1 }[b.priority] || 0) - ({ วิกฤต: 4, สูง: 3, กลาง: 2, ต่ำ: 1 }[a.priority] || 0));

  const visibleTasks = focusMode ? focusTasks : filteredTasks;
  const kanbanColumns = ["ยังไม่เริ่ม", "กำลังทำ", "รอตรวจ", "เสร็จแล้ว"].map((status) => ({ status, tasks: visibleTasks.filter((task) => task.status === status) }));

  const commanderBriefText = [
    "เรียน ผู้บังคับบัญชา",
    `รายงานสถานการณ์ TEAM-DMS ประจำวันที่ ${today}`,
    `งานทั้งหมดในระบบ ${stats.total} รายการ / งานวันนี้ ${todayTasks.length} รายการ`,
    `ดำเนินการแล้วเสร็จวันนี้ ${todayDone.length} รายการ / คงค้างวันนี้ ${todayPending.length} รายการ`,
    `งานเร่งด่วนวันนี้ ${todayUrgent.length} รายการ / Heat Level: ${heatLevel.label} (${heatLevel.detail})`,
    suggestedAssignee
      ? `ข้อเสนอแนะ: มอบหมายงานใหม่ให้ ${suggestedAssignee.rank} ${suggestedAssignee.name} ได้ เนื่องจากภาระงานยังต่ำ`
      : "ข้อเสนอแนะ: ยังไม่มีเจ้าหน้าที่ว่างที่เหมาะสมสำหรับรับงานเพิ่ม",
  ].join(String.fromCharCode(10));

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

  async function updateUserProfile(userId, patch) {
    if (!supabase || !canManageRoles) return;
    const { data, error } = await supabase.from("user_profiles").update(patch).eq("id", userId).select().single();
    if (error) setNotice(error.message);
    else {
      setNotice("อัปเดตสิทธิ์ผู้ใช้สำเร็จ");
      await writeLog("UPDATE_USER_ROLE", "user_profiles", userId, `อัปเดตผู้ใช้ ${data.email}: role=${data.app_role}`);
    }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  const navItems = [
    [LayoutDashboard, "Dashboard"],
    [Gauge, "Operations"],
    [Users, "Staff"],
    [Award, "Achievements"],
    [Lock, "User Role"],
    [ShieldCheck, "Rule Engine"],
    [Database, "Activity Log"],
    [Settings, "Settings"],
  ];

  if (!hasSupabaseConfig) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <ShellCard className="max-w-xl p-6">
          <h1 className="text-2xl font-black">ยังไม่ได้ตั้งค่า Supabase</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">ต้องสร้างไฟล์ .env.local แล้วใส่ VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ก่อน</p>
        </ShellCard>
      </main>
    );
  }

  if (!session) return <Login />;

  return (
    <main className="min-h-screen bg-[#050b12] text-slate-100">
      {achievementPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-amber-400/30 bg-slate-950 p-7 text-center shadow-[0_0_80px_rgba(245,158,11,0.28)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.25),transparent_45%)]" />
            <div className="relative">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-amber-300/30 bg-amber-400/15 text-5xl shadow-[0_0_45px_rgba(245,158,11,0.35)]">
                {getAchievement(achievementPopup.achievement_code).icon}
              </div>
              <p className="mt-5 text-sm font-black uppercase tracking-[0.28em] text-amber-300">Achievement Unlocked</p>
              <h2 className="mt-2 text-3xl font-black text-white">{getAchievement(achievementPopup.achievement_code).title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{getAchievement(achievementPopup.achievement_code).detail}</p>
              <Badge className="mt-4 border-amber-400/30 bg-amber-500/20 text-amber-100">{getAchievement(achievementPopup.achievement_code).tier}</Badge>
              <Button onClick={() => setAchievementPopup(null)} className="mt-6 w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white">รับทราบ</Button>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_75%_30%,rgba(139,92,246,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.92),#050b12)]" />
      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[250px_1fr]">
        <aside className="hidden border-r border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-2 shadow-[0_0_28px_rgba(14,165,233,0.45)]"><Shield className="text-white" size={24} /></div>
            <div><p className="text-xl font-black tracking-wide">TEAM-DMS</p><p className="text-xs text-slate-500">Secure Assign Achieve</p></div>
          </div>
          <nav className="mt-10 space-y-2">
            {navItems.map(([Icon, label], index) => (
              <a key={label} className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${index === 0 ? "bg-cyan-400/10 text-cyan-200 shadow-[inset_3px_0_0_rgba(34,211,238,0.9)]" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}>
                <Icon size={18} /> {label}
              </a>
            ))}
          </nav>
          <div className="mt-auto rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 shadow-[0_0_32px_rgba(14,165,233,0.14)]">
            <div className="flex items-center gap-3"><ShieldCheck className="text-cyan-300" /><div><p className="font-black">TEAM-DMS v2.8</p><p className="text-xs text-slate-400">EPIC Set 2 Stable</p></div></div>
          </div>
        </aside>

        <section className="min-w-0 p-4 md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3"><Menu className="text-slate-400" /><span className="text-sm font-bold text-slate-500">Command Dashboard</span></div>
            <div className="flex items-center gap-4 text-slate-400"><Search size={20} /><Bell size={20} /><Expand size={19} /></div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">
            <div className="space-y-5">
              <ShellCard className="relative overflow-hidden p-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(14,165,233,0.22),transparent_25%),linear-gradient(90deg,rgba(15,23,42,0.2),transparent)]" />
                <div className="relative">
                  <h1 className="text-5xl font-black tracking-[0.12em] text-white md:text-6xl">TEAM-DMS</h1>
                  <p className="mt-3 text-lg font-black text-cyan-300">ระบบบริหารจัดการมอบหมายงานและทรัพยากรบุคคล</p>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">ศูนย์ปฏิบัติการดิจิทัล พร้อม Role, Staff, Achievement, Kanban, Commander View และ Realtime Sync</p>
                </div>
              </ShellCard>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={ClipboardList} title="งานทั้งหมด" value={stats.total} sub="ภารกิจในระบบ" tone="cyan" />
                <StatCard icon={CheckCircle2} title="งานที่เสร็จสิ้น" value={stats.done} sub={`${stats.filled}% มีผู้รับผิดชอบ`} tone="emerald" />
                <StatCard icon={Clock3} title="กำลังดำเนินการ" value={stats.active} sub="งานที่ยังไม่ปิด" tone="amber" />
                <StatCard icon={Flame} title="งานเร่งด่วน" value={stats.urgent} sub="สูง / วิกฤต" tone="violet" />
              </div>

              <ShellCard className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div><h2 className="text-xl font-black text-white">Daily Situation Board</h2><p className="text-xs text-slate-500">ภาพรวมสถานการณ์วันนี้</p></div>
                  <Badge className={heatLevel.className}>HEAT LEVEL: {heatLevel.label}</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"><p className="text-xs font-bold text-slate-500">งานวันนี้</p><p className="mt-1 text-3xl font-black text-white">{todayTasks.length}</p></div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"><p className="text-xs font-bold text-slate-500">เสร็จแล้ว</p><p className="mt-1 text-3xl font-black text-emerald-300">{todayDone.length}</p></div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"><p className="text-xs font-bold text-slate-500">ค้างอยู่</p><p className="mt-1 text-3xl font-black text-amber-300">{todayPending.length}</p></div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"><p className="text-xs font-bold text-slate-500">พร้อมรับงาน</p><p className="mt-1 text-3xl font-black text-cyan-300">{availableStaff.length}</p></div>
                </div>
                <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4"><p className="text-sm font-black text-cyan-100">Command Insight</p><p className="mt-1 text-sm leading-6 text-slate-400">สถานการณ์วันนี้: {heatLevel.detail}{suggestedAssignee ? ` · แนะนำ Assign งานใหม่ให้ ${suggestedAssignee.rank} ${suggestedAssignee.name} เพราะภาระงานยังต่ำ` : " · ยังไม่มีเจ้าหน้าที่ว่างที่เหมาะสม"}</p></div>
              </ShellCard>

              {notice && <div className="flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm font-bold text-amber-100"><AlertTriangle size={17} /> {notice}</div>}

              <ShellCard className="p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div><h2 className="text-xl font-black text-white">EPIC Control Panel</h2><p className="text-xs text-slate-500">Kanban Board · Focus Mode · Commander View</p></div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={() => setFocusMode((value) => !value)} className={focusMode ? "bg-cyan-500 text-white" : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"}><Gauge size={15} /> {focusMode ? "Focus ON" : "Focus Mode"}</Button>
                    <Button type="button" onClick={() => setShowKanban((value) => !value)} className={showKanban ? "bg-violet-500 text-white" : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"}><ClipboardList size={15} /> Kanban</Button>
                    <Button type="button" onClick={() => setShowCommanderView((value) => !value)} className={showCommanderView ? "bg-emerald-500 text-white" : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"}><Shield size={15} /> Commander</Button>
                  </div>
                </div>
                {focusMode && <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">Focus Mode เปิดอยู่: แสดงเฉพาะงานของฉัน / งานวันนี้ / งานเร่งด่วนที่ยังไม่ปิด รวม {focusTasks.length} รายการ</div>}
              </ShellCard>

              {showCommanderView && (
                <ShellCard className="p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div><h2 className="text-xl font-black text-white">Commander View</h2><p className="text-xs text-slate-500">มุมมองสำหรับบรีฟผู้บังคับบัญชา</p></div>
                    <Button type="button" onClick={copyCommanderBrief} className="border border-emerald-400/20 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15"><ShieldCheck size={15} /> Copy Brief</Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"><p className="text-xs font-bold text-slate-500">Mission Completion</p><p className="mt-1 text-3xl font-black text-emerald-300">{stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%</p></div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"><p className="text-xs font-bold text-slate-500">Critical Today</p><p className="mt-1 text-3xl font-black text-rose-300">{todayUrgent.length}</p></div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"><p className="text-xs font-bold text-slate-500">Recommended Assignee</p><p className="mt-2 text-base font-black text-cyan-200">{suggestedAssignee ? `${suggestedAssignee.rank} ${suggestedAssignee.name}` : "ไม่มี"}</p></div>
                  </div>
                  <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/5 bg-slate-950/50 p-4 text-sm leading-6 text-slate-300">{commanderBriefText}</pre>
                </ShellCard>
              )}

              <ShellCard className="p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div><h2 className="text-xl font-black text-white">Operations Room</h2><p className="text-sm text-slate-500">สร้างงานใหม่และติดตามภารกิจล่าสุด</p></div>
                  <div className="relative hidden w-72 md:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} /><Field value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหางาน / คน / สถานะ" className="w-full pl-10" /></div>
                </div>
                <div className="grid gap-4 xl:grid-cols-[0.95fr_1.35fr]">
                  <form onSubmit={addTask} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="mb-3 text-sm font-black text-slate-200">สร้างงานใหม่</p>
                    <div className="space-y-3">
                      <Field value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="ระบุชื่องาน" className="w-full" />
                      <Field value={newTask.category} onChange={(e) => setNewTask({ ...newTask, category: e.target.value })} placeholder="ระบุประเภท/หมวดงาน" className="w-full" />
                      <div className="grid gap-3 md:grid-cols-2"><Select value={newTask.owner_id} onChange={(e) => setNewTask({ ...newTask, owner_id: e.target.value })}><option value="">เลือกผู้รับผิดชอบ</option>{staff.map((p) => <option key={p.id} value={p.id}>{p.rank} {p.name}</option>)}</Select><Field type="date" value={newTask.task_date} onChange={(e) => setNewTask({ ...newTask, task_date: e.target.value })} /></div>
                      <div className="grid gap-3 md:grid-cols-3"><Select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}><option>ต่ำ</option><option>กลาง</option><option>สูง</option><option>วิกฤต</option></Select><Select value={newTask.status} onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}><option>ยังไม่เริ่ม</option><option>กำลังทำ</option><option>รอตรวจ</option><option>เสร็จแล้ว</option></Select><Field type="time" value={newTask.due_time} onChange={(e) => setNewTask({ ...newTask, due_time: e.target.value })} /></div>
                      <div className={`rounded-xl border px-3 py-2 text-xs font-black ${validation.ok ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200" : "border-rose-400/20 bg-rose-500/10 text-rose-200"}`}>{validation.message}</div>
                      <div className="grid grid-cols-2 gap-3"><Button type="button" onClick={() => setNewTask((p) => ({ ...p, title: "", category: "ทั่วไป" }))} className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">รีเซ็ต</Button><Button disabled={!validation.ok || saving} className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_24px_rgba(14,165,233,0.35)]">{saving ? "Saving" : "บันทึกงาน"}</Button></div>
                    </div>
                  </form>
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/25">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><p className="font-black text-white">งานล่าสุด</p><Badge className="border-cyan-400/20 bg-cyan-500/10 text-cyan-200">{visibleTasks.length} tasks</Badge></div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[680px] text-left text-sm">
                        <thead className="text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">#</th><th>ชื่องาน</th><th>ผู้รับผิดชอบ</th><th>กำหนดเสร็จ</th><th>สถานะ</th><th className="pr-4">ความสำคัญ</th></tr></thead>
                        <tbody className="divide-y divide-white/5">
                          {loading ? <tr><td colSpan="6" className="px-4 py-6 text-slate-500">กำลังโหลดข้อมูล...</td></tr> : visibleTasks.length === 0 ? <tr><td colSpan="6" className="px-4 py-6 text-slate-500">ยังไม่มีงาน หรือไม่พบรายการที่ค้นหา</td></tr> : visibleTasks.slice(0, 8).map((task, index) => (
                            <tr key={task.id} className="text-slate-300 hover:bg-white/[0.03]"><td className="px-4 py-3 text-slate-500">{index + 1}</td><td className="font-bold text-slate-100">{task.title}</td><td>{task.staff?.rank} {task.staff?.name}</td><td>{task.task_date}</td><td><Select value={task.status} onChange={(e) => updateStatus(task.id, e.target.value)} disabled={!canUpdateTask(task)} className={`h-8 w-32 border ${statusStyle[task.status]}`}><option>ยังไม่เริ่ม</option><option>กำลังทำ</option><option>รอตรวจ</option><option>เสร็จแล้ว</option></Select></td><td className="pr-4"><Badge className={priorityStyle[task.priority]}>{task.priority}</Badge></td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </ShellCard>

              {showKanban && (
                <ShellCard className="p-5">
                  <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-xl font-black text-white">Kanban Board</h2><p className="text-xs text-slate-500">มุมมองงานแบบสถานะ ใช้ปุ่มย้ายสถานะได้ทันที</p></div><Badge className="border-violet-400/20 bg-violet-500/10 text-violet-200">{visibleTasks.length} Tasks</Badge></div>
                  <div className="grid gap-3 xl:grid-cols-4">
                    {kanbanColumns.map((column) => (
                      <div key={column.status} className="rounded-2xl border border-white/5 bg-slate-950/35 p-3">
                        <div className="mb-3 flex items-center justify-between"><p className="font-black text-white">{column.status}</p><Badge className={statusStyle[column.status]}>{column.tasks.length}</Badge></div>
                        <div className="space-y-2">
                          {column.tasks.length === 0 ? <p className="rounded-xl bg-white/[0.03] p-3 text-xs text-slate-600">ไม่มีงาน</p> : column.tasks.slice(0, 10).map((task) => (
                            <div key={task.id} className="rounded-2xl border border-white/5 bg-white/[0.04] p-3"><div className="flex items-start justify-between gap-2"><div><p className="font-black text-slate-100">{task.title}</p><p className="mt-1 text-xs text-slate-500">{task.staff?.rank} {task.staff?.name} · {task.task_date}</p></div><Badge className={priorityStyle[task.priority]}>{task.priority}</Badge></div><div className="mt-3 grid grid-cols-2 gap-2">{["ยังไม่เริ่ม", "กำลังทำ", "รอตรวจ", "เสร็จแล้ว"].filter((status) => status !== task.status).slice(0, 2).map((status) => <Button key={status} type="button" disabled={!canUpdateTask(task)} onClick={() => updateStatus(task.id, status)} className="border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] text-slate-200 hover:bg-white/10">{status}</Button>)}</div></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ShellCard>
              )}

              <ShellCard className="p-5">
                <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-black text-white">Workload Balance</h2><p className="text-xs text-slate-500">วิเคราะห์ภาระงานเจ้าหน้าที่</p></div><Gauge className="text-cyan-300" /></div>
                <div className="grid gap-3 md:grid-cols-2">
                  {workloadBoard.slice(0, 8).map((person) => <div key={person.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-3"><div className="flex items-center justify-between gap-3"><div><p className="font-black text-white">{person.rank} {person.name}</p><p className="text-xs text-slate-500">งานค้าง {person.assignedCount} · งานเร่ง {person.urgentCount}</p></div><Badge className={person.workloadStatus === "Overloaded" ? "border-rose-400/20 bg-rose-500/10 text-rose-200" : person.workloadStatus === "Balanced" ? "border-amber-400/20 bg-amber-500/10 text-amber-200" : person.workloadStatus === "Available" ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200" : "border-slate-500/20 bg-slate-500/10 text-slate-400"}>{person.workloadStatus}</Badge></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-rose-500" style={{ width: `${Math.min(person.loadScore * 12, 100)}%` }} /></div></div>)}
                </div>
              </ShellCard>

              <ShellCard className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-xl font-black text-white">Achievement Center</h2><p className="text-xs text-slate-500">รางวัลการทำงาน 20 แบบ · เก็บครบทั้งหมดได้ Super Admin</p></div><Button type="button" onClick={recalculateAllAchievements} className="border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-400/15"><Award size={14} /> Sync</Button></div>
                <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4"><div className="flex items-center gap-3"><div className="rounded-2xl bg-violet-400/15 p-3 text-violet-200"><Crown size={23} /></div><div className="min-w-0 flex-1"><p className="truncate font-black text-white">{topAchievementStaff ? `${topAchievementStaff.rank} ${topAchievementStaff.name}` : "ยังไม่มีอันดับ"}</p><p className="text-xs text-slate-500">Leader: {topAchievementStaff?.count || 0}/{achievementCatalog.length} achievements</p></div><Badge className="border-amber-400/30 bg-amber-500/20 text-amber-100">SUPER ADMIN PATH</Badge></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400" style={{ width: `${topAchievementStaff?.percent || 0}%` }} /></div></div>
                <div className="mt-4 space-y-2">{achievementStats.slice(0, 5).map((person) => <div key={person.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-3"><div className="flex items-center justify-between gap-3"><div><p className="font-black text-white">{person.rank} {person.name}</p><p className="text-xs text-slate-500">{person.count}/{achievementCatalog.length} achievements</p></div><Badge className={person.count === achievementCatalog.length ? "border-amber-400/30 bg-amber-500/20 text-amber-100" : "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"}>{person.percent}%</Badge></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${person.percent}%` }} /></div><div className="mt-2 flex flex-wrap gap-1.5">{person.earned.slice(0, 10).map((item) => <span key={item.id} className="rounded-lg bg-white/5 px-2 py-1 text-xs" title={getAchievement(item.achievement_code).title}>{getAchievement(item.achievement_code).icon}</span>)}</div></div>)}</div>
                <Button type="button" onClick={() => setShowAllAchievements((value) => !value)} className="mt-4 w-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"><Gem size={15} /> {showAllAchievements ? "ซ่อน Achievement ทั้งหมด" : "ดู Achievement ทั้งหมด"}</Button>
                {showAllAchievements && <div className="mt-4 grid gap-2 md:grid-cols-2">{achievementCatalog.map((achievement) => <div key={achievement.code} className="rounded-2xl border border-white/5 bg-slate-950/35 p-3"><div className="flex items-start gap-3"><div className="text-2xl">{achievement.icon}</div><div><div className="flex flex-wrap items-center gap-2"><p className="font-black text-white">{achievement.title}</p><Badge className={achievement.tier === "Mythic" ? "border-amber-400/30 bg-amber-500/20 text-amber-100" : "border-white/10 bg-white/5 text-slate-300"}>{achievement.tier}</Badge></div><p className="mt-1 text-xs leading-5 text-slate-500">{achievement.detail}</p></div></div></div>)}</div>}
              </ShellCard>
            </div>

            <div className="space-y-5">
              <ShellCard className="p-5"><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 text-xl font-black text-white">{session.user.email?.slice(0, 1).toUpperCase()}</div><div><p className="font-black text-white">สวัสดี, Admin</p><p className="text-sm text-slate-500">Database Role</p><Badge className="mt-2 border-violet-400/20 bg-violet-500/15 text-violet-200">{getRoleLabel(appRole)}</Badge></div></div></ShellCard>

              <ShellCard className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-xl font-black text-white">My Achievements</h2><p className="text-xs text-slate-500">เหรียญของฉัน / ความคืบหน้าส่วนตัว</p></div><Medal className="text-amber-300" /></div>
                {!profile?.staff_id ? (
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">ยังไม่ได้ผูก User นี้กับ Staff — ให้ Super Admin ไปที่ User Role Management แล้วเลือก Staff ให้บัญชีนี้ก่อน</div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/15 to-violet-500/10 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-black text-white">{profile.staff?.rank} {profile.staff?.name}</p><p className="text-xs text-slate-400">ได้รับแล้ว {myEarnedAchievements.length}/{achievementCatalog.length} achievements</p></div><Badge className={myEarnedAchievements.length === achievementCatalog.length ? "border-amber-400/30 bg-amber-500/20 text-amber-100" : "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"}>{myAchievementPercent}%</Badge></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400" style={{ width: `${myAchievementPercent}%` }} /></div>{myEarnedAchievements.length === achievementCatalog.length && <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs font-black text-amber-100"><Crown size={15} /> ปลดล็อกครบแล้ว — สิทธิ์ Super Admin จะถูกมอบให้อัตโนมัติ</div>}</div>
                    <Button type="button" onClick={() => setShowMyAchievements((value) => !value)} className="mt-4 w-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"><Star size={15} /> {showMyAchievements ? "ซ่อนรายการของฉัน" : "ดูรายการของฉัน"}</Button>
                    {showMyAchievements && <div className="mt-4 grid max-h-[520px] gap-2 overflow-y-auto pr-1">{myAchievementCards.map((achievement) => <div key={achievement.code} className={`rounded-2xl border p-3 transition ${achievement.earned ? "border-emerald-400/20 bg-emerald-500/10" : "border-white/5 bg-slate-950/35 opacity-65"}`}><div className="flex items-start gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl ${achievement.earned ? "bg-emerald-400/15" : "bg-white/5 grayscale"}`}>{achievement.icon}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-black text-white">{achievement.title}</p><Badge className={achievement.tier === "Mythic" ? "border-amber-400/30 bg-amber-500/20 text-amber-100" : "border-white/10 bg-white/5 text-slate-300"}>{achievement.tier}</Badge>{achievement.earned ? <Badge className="border-emerald-400/20 bg-emerald-500/10 text-emerald-200">Unlocked</Badge> : <Badge className="border-slate-500/20 bg-slate-500/10 text-slate-400">Locked</Badge>}</div><p className="mt-1 text-xs leading-5 text-slate-500">{achievement.detail}</p>{achievement.earnedAt && <p className="mt-1 text-[11px] text-emerald-300">ได้รับเมื่อ {new Date(achievement.earnedAt).toLocaleString()}</p>}</div></div></div>)}</div>}
                  </>
                )}
              </ShellCard>

              {canManageRoles && <ShellCard className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black text-white">User Role Management</h2><KeyRound className="text-cyan-300" /></div><div className="space-y-3">{profiles.map((userProfile) => <div key={userProfile.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-3"><p className="truncate text-sm font-black text-slate-100">{userProfile.email}</p><p className="mt-1 text-xs text-slate-500">{userProfile.staff ? `${userProfile.staff.rank} ${userProfile.staff.name}` : "ยังไม่ผูก Staff"}</p><div className="mt-3 grid gap-2 md:grid-cols-2"><Select value={userProfile.app_role || "viewer"} onChange={(e) => updateUserProfile(userProfile.id, { app_role: e.target.value })}>{roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</Select><Select value={userProfile.staff_id || ""} onChange={(e) => updateUserProfile(userProfile.id, { staff_id: e.target.value || null })}><option value="">ไม่ผูก Staff</option>{staff.map((p) => <option key={p.id} value={p.id}>{p.rank} {p.name}</option>)}</Select></div></div>)}</div></ShellCard>}

              <ShellCard className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black text-white">Staff Management</h2><UserPlus className="text-cyan-300" /></div><form onSubmit={saveStaff} className="space-y-3"><div className="grid gap-3 md:grid-cols-2"><Field value={staffForm.rank} onChange={(e) => setStaffForm({ ...staffForm, rank: e.target.value })} placeholder="ยศ" /><Field value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} placeholder="ชื่อ-นามสกุล" /></div><div className="grid gap-3 md:grid-cols-2"><Field value={staffForm.section} onChange={(e) => setStaffForm({ ...staffForm, section: e.target.value })} placeholder="แผนก" /><Field value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} placeholder="ตำแหน่ง/หน้าที่" /></div><div className="grid gap-3 md:grid-cols-2"><Field type="number" value={staffForm.points} onChange={(e) => setStaffForm({ ...staffForm, points: e.target.value })} placeholder="คะแนน" /><Field type="number" min="0" max="100" value={staffForm.reliability} onChange={(e) => setStaffForm({ ...staffForm, reliability: e.target.value })} placeholder="Reliability" /></div><div className="grid gap-3 md:grid-cols-2"><label className="flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm font-bold text-slate-300"><input type="checkbox" checked={staffForm.active} onChange={(e) => setStaffForm({ ...staffForm, active: e.target.checked })} />Active</label><label className="flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm font-bold text-slate-300"><input type="checkbox" checked={staffForm.exempt} onChange={(e) => setStaffForm({ ...staffForm, exempt: e.target.checked })} />Exempt</label></div><div className="grid grid-cols-2 gap-3"><Button type="button" onClick={() => { setEditingStaffId(null); setStaffForm(blankStaff); }} className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"><X size={15} /> รีเซ็ต</Button><Button disabled={!staffValidation.ok || savingStaff} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"><Save size={15} /> {editingStaffId ? "บันทึกข้อมูล" : "เพิ่มพนักงาน"}</Button></div><p className={`rounded-xl border px-3 py-2 text-xs font-black ${staffValidation.ok ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200" : "border-rose-400/20 bg-rose-500/10 text-rose-200"}`}>{staffValidation.message}</p></form></ShellCard>

              <ShellCard className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black text-white">Rule Engine</h2><ShieldCheck className="text-cyan-300" /></div><div className="space-y-3">{["Role มาจาก Database เท่านั้น", "Viewer ดูอย่างเดียว", "Staff เปลี่ยนสถานะงานตัวเองได้", "Admin/Override จัดงานได้", "Super Admin จัดการ Staff และ Role ได้"].map((rule) => <div key={rule} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-3"><p className="text-sm font-bold text-slate-300">{rule}</p><div className="h-6 w-11 rounded-full bg-emerald-500"><div className="m-1 h-4 w-4 translate-x-5 rounded-full bg-white" /></div></div>)}</div><Button onClick={fetchAll} className="mt-4 w-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"><RefreshCcw size={16} /> Refresh</Button></ShellCard>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
