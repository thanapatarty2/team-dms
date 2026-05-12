import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Flame,
  LogOut,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
const priorityStyle = {
  ต่ำ: "bg-slate-100 text-slate-700",
  กลาง: "bg-blue-100 text-blue-700",
  สูง: "bg-orange-100 text-orange-700",
  วิกฤต: "bg-rose-100 text-rose-700",
};

const statusStyle = {
  "ยังไม่เริ่ม": "bg-slate-100 text-slate-700 border-slate-200",
  "กำลังทำ": "bg-amber-100 text-amber-800 border-amber-200",
  "รอตรวจ": "bg-sky-100 text-sky-800 border-sky-200",
  "เสร็จแล้ว": "bg-emerald-100 text-emerald-800 border-emerald-200",
};

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Badge({ children, className = "" }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${className}`}>{children}</span>;
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{sub}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 p-3 text-white">
          <Icon size={22} />
        </div>
      </div>
    </Card>
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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError) {
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setMessage(signUpError.message);
    } else {
      setMessage("สร้างบัญชีแล้ว กดเข้าสู่ระบบอีกครั้งได้เลย");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
      <div className="mx-auto flex min-h-[90vh] max-w-xl items-center">
        <Card className="w-full border-white/10 bg-white/10 p-6 text-white backdrop-blur md:p-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-black">
            <Sparkles size={16} /> TEAM-DMS Realtime
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-5xl">เข้าสู่ระบบ</h1>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            ใช้ Email + Password สำหรับทดสอบระบบ จะได้ไม่ติด rate limit จาก Magic Link
          </p>

          <form onSubmit={signIn} className="mt-6 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-slate-950 outline-none focus:ring-2 focus:ring-white/40"
            />

            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน อย่างน้อย 8 ตัว"
              className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-slate-950 outline-none focus:ring-2 focus:ring-white/40"
            />

            <Button disabled={loading} className="w-full bg-white text-slate-950 hover:bg-slate-100">
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ / สมัครบัญชี"}
            </Button>
          </form>

          {message && (
            <p className="mt-4 rounded-2xl bg-white/10 p-4 text-sm text-slate-200">
              {message}
            </p>
          )}
        </Card>
      </div>
    </main>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("Super Admin");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

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

  supabase.auth.getSession().then(({ data }) => {
    setSession(data.session);
  });

  const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
    setSession(newSession);
  });

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);

  useEffect(() => {
  if (!supabase || !session) return;

  fetchAll();

  const channel = supabase
    .channel("team-dms-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchTasks)
    .on("postgres_changes", { event: "*", schema: "public", table: "staff" }, fetchStaff)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [session]);
  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchStaff(), fetchTasks()]);
    setLoading(false);
  }

  async function fetchStaff() {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("points", { ascending: false });

    if (error) {
      setNotice(error.message);
      return;
    }

    setStaff(data || []);

    if (!newTask.owner_id && data?.[0]?.id) {
      setNewTask((prev) => ({ ...prev, owner_id: data[0].id }));
    }
  }

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, staff:owner_id(name, rank, section)")
      .order("created_at", { ascending: false });

    if (error) {
      setNotice(error.message);
      return;
    }

    setTasks(data || []);
  }

  const validation = useMemo(() => {
    if (!newTask.title.trim()) return { ok: false, message: "กรอกชื่องานก่อน" };

    const owner = staff.find((s) => s.id === newTask.owner_id);
    if (!owner) return { ok: false, message: "เลือกผู้รับผิดชอบก่อน" };
    if (!owner.active) return { ok: false, message: "เจ้าหน้าที่ inactive รับงานไม่ได้" };
    if (owner.exempt) return { ok: false, message: "เจ้าหน้าที่ exempt รับงานไม่ได้" };

    const duplicate = tasks.some(
      (t) =>
        t.task_date === newTask.task_date &&
        t.title.trim().toLowerCase() === newTask.title.trim().toLowerCase()
    );
    if (duplicate) return { ok: false, message: "พบงานชื่อซ้ำในวันเดียวกัน" };

    const overlap = tasks.some(
      (t) =>
        t.task_date === newTask.task_date &&
        t.owner_id === newTask.owner_id &&
        t.status !== "เสร็จแล้ว"
    );
    if (overlap && role !== "Override") {
      return { ok: false, message: "คนนี้มีงานค้างในวันเดียวกัน ต้องใช้ Override" };
    }

    return { ok: true, message: "ผ่าน Rule Engine พร้อมบันทึก" };
  }, [newTask, staff, tasks, role]);

  const filteredTasks = useMemo(() => {
    const q = query.toLowerCase();

    return tasks.filter((task) => {
      return (
        task.title?.toLowerCase().includes(q) ||
        task.category?.toLowerCase().includes(q) ||
        task.priority?.toLowerCase().includes(q) ||
        task.status?.toLowerCase().includes(q) ||
        task.staff?.name?.toLowerCase().includes(q)
      );
    });
  }, [query, tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const active = tasks.filter((t) => t.status !== "เสร็จแล้ว").length;
    const done = tasks.filter((t) => t.status === "เสร็จแล้ว").length;
    const urgent = tasks.filter((t) => t.priority === "สูง" || t.priority === "วิกฤต").length;
    const filled = total ? Math.round((tasks.filter((t) => t.owner_id).length / total) * 100) : 0;

    return { total, active, done, urgent, filled };
  }, [tasks]);

  async function addTask(event) {
    event.preventDefault();
    if (!validation.ok) return;

    setSaving(true);
    setNotice("");

    const { error } = await supabase.from("tasks").insert({
      title: newTask.title.trim(),
      task_date: newTask.task_date,
      owner_id: newTask.owner_id,
      priority: newTask.priority,
      status: newTask.status,
      category: newTask.category.trim() || "ทั่วไป",
      due_time: newTask.due_time || null,
      points: Number(newTask.points) || 0,
      created_by: session.user.id,
    });

    if (error) {
      setNotice(error.message);
    } else {
      setNotice("บันทึกงานสำเร็จ ทุกเครื่องจะเห็นข้อมูลนี้แบบ realtime");
      setNewTask((prev) => ({
        ...prev,
        title: "",
        priority: "กลาง",
        status: "ยังไม่เริ่ม",
        category: "ทั่วไป",
        points: 60,
      }));
    }

    setSaving(false);
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);

    if (error) {
      setNotice(error.message);
    }
  }

  async function deleteTask(id) {
    const confirmed = window.confirm("ยืนยันลบงานนี้?");
    if (!confirmed) return;

    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      setNotice(error.message);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (!hasSupabaseConfig) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="max-w-xl rounded-3xl bg-white/10 p-6">
          <h1 className="text-2xl font-black">ยังไม่ได้ตั้งค่า Supabase</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            ต้องสร้างไฟล์ <b>.env.local</b> แล้วใส่ VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ก่อน
          </p>
        </div>
      </main>
    );
  }

  if (!session) return <Login />;

  return (
    <main className="min-h-screen bg-[#f5f7fb] p-4 text-slate-950 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 text-white shadow-xl">
          <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_0.8fr] md:p-8">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-black text-slate-200">
                <Sparkles size={16} /> TEAM-DMS Realtime Command System
              </div>

              <h1 className="text-4xl font-black tracking-tight md:text-6xl">TEAM-DMS</h1>

              <p className="mt-2 text-xl font-bold text-slate-200">
                Duty / Mission / Staff Assignment
              </p>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                ระบบจัดงานและเวรทีมแบบ realtime: เพิ่มงานจากเครื่องหนึ่ง อีกเครื่องเห็นทันที
                พร้อม Rule Engine กันงานชน คน inactive งานซ้ำ และระบบคะแนน Achievement
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-300">Signed in as</p>
                  <p className="mt-1 break-all text-sm font-black">{session.user.email}</p>
                </div>

                <Button onClick={signOut} className="bg-white/10 text-white hover:bg-white/20">
                  <LogOut size={16} /> ออก
                </Button>
              </div>

              <p className="mt-5 text-sm font-bold text-slate-300">Permission mode</p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {["Viewer", "Battalion Admin", "Super Admin", "Override"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setRole(item)}
                    className={`rounded-2xl px-3 py-2 text-sm font-bold transition ${
                      role === item
                        ? "bg-white text-slate-950"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-300">
                <ShieldCheck size={17} /> Realtime connected
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Stat icon={Database} label="Missions" value={stats.total} sub="งาน/เวรทั้งหมด" />
          <Stat icon={Clock3} label="Active" value={stats.active} sub="ยังไม่ปิดงาน" />
          <Stat icon={Flame} label="Urgent" value={stats.urgent} sub="สูง/วิกฤต" />
          <Stat icon={Users} label="Staff" value={staff.length} sub="ในทะเบียน" />
          <Stat icon={CheckCircle2} label="Filled" value={`${stats.filled}%`} sub="มีผู้รับผิดชอบแล้ว" />
        </section>

        {notice && (
          <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">
            <AlertTriangle size={17} /> {notice}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <Card className="p-5 md:p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black">Operations Room</h2>
                <p className="text-sm text-slate-500">
                  เพิ่มงานจริง บันทึกลง Supabase และ sync ทุกเครื่องทันที
                </p>
              </div>

              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ค้นหางาน / คน / สถานะ"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>

            <form onSubmit={addTask} className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 lg:grid-cols-[1.6fr_0.9fr_0.95fr_0.8fr]">
                <input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="พิมพ์ชื่องาน เช่น ทำสไลด์เสนอผู้บังคับบัญชา"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />

                <input
                  type="date"
                  value={newTask.task_date}
                  onChange={(e) => setNewTask({ ...newTask, task_date: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />

                <select
                  value={newTask.owner_id}
                  onChange={(e) => setNewTask({ ...newTask, owner_id: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.rank} {s.name} • {s.section}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={newTask.due_time}
                  onChange={(e) => setNewTask({ ...newTask, due_time: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-[0.8fr_0.8fr_0.9fr_0.7fr_auto]">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <option>ต่ำ</option>
                  <option>กลาง</option>
                  <option>สูง</option>
                  <option>วิกฤต</option>
                </select>

                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <option>ยังไม่เริ่ม</option>
                  <option>กำลังทำ</option>
                  <option>รอตรวจ</option>
                  <option>เสร็จแล้ว</option>
                </select>

                <input
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  placeholder="หมวดงาน"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />

                <input
                  type="number"
                  value={newTask.points}
                  onChange={(e) => setNewTask({ ...newTask, points: e.target.value })}
                  placeholder="แต้ม"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />

                <Button
                  disabled={!validation.ok || saving || role === "Viewer"}
                  className="bg-slate-950 text-white hover:bg-slate-800"
                >
                  <Plus size={16} /> {saving ? "Saving" : "Save"}
                </Button>
              </div>

              <div
                className={`mt-3 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black ${
                  validation.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {validation.ok ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
                {validation.message}
              </div>
            </form>

            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
              <div className="grid grid-cols-[1fr_125px_120px_115px_115px_110px] bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-wide text-white max-lg:hidden">
                <span>Mission</span>
                <span>Owner</span>
                <span>Date</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              <div className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <div className="p-6 text-sm text-slate-500">กำลังโหลดข้อมูล...</div>
                ) : filteredTasks.length === 0 ? (
                  <div className="p-6 text-sm text-slate-500">ยังไม่มีงาน หรือไม่พบรายการที่ค้นหา</div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="grid gap-3 px-4 py-4 hover:bg-slate-50 lg:grid-cols-[1fr_125px_120px_115px_115px_110px] lg:items-center"
                    >
                      <div>
                        <p className="font-black text-slate-950">{task.title}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {task.category} • +{task.points} pts • created{" "}
                          {new Date(task.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-sm font-bold text-slate-700">
                        {task.staff?.rank} {task.staff?.name}
                      </div>

                      <div className="text-sm font-bold text-slate-500">
                        {task.task_date} {task.due_time?.slice(0, 5)}
                      </div>

                      <div>
                        <Badge className={priorityStyle[task.priority]}>{task.priority}</Badge>
                      </div>

                      <div>
                        <select
                          value={task.status}
                          onChange={(e) => updateStatus(task.id, e.target.value)}
                          disabled={role === "Viewer"}
                          className={`rounded-full border px-2.5 py-1 text-xs font-black outline-none ${statusStyle[task.status]}`}
                        >
                          <option>ยังไม่เริ่ม</option>
                          <option>กำลังทำ</option>
                          <option>รอตรวจ</option>
                          <option>เสร็จแล้ว</option>
                        </select>
                      </div>

                      <div>
                        <button
                          disabled={role === "Viewer"}
                          onClick={() => deleteTask(task.id)}
                          className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 disabled:opacity-40"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Staff Board</h2>
                  <p className="text-sm text-slate-500">คะแนนและสถานะเจ้าหน้าที่</p>
                </div>
                <Trophy className="text-amber-500" />
              </div>

              <div className="mt-5 space-y-3">
                {staff.map((person, index) => (
                  <div key={person.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black">
                          #{index + 1} {person.rank} {person.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {person.section} • {person.role}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-black">{person.points}</p>
                        <p className="text-xs text-slate-400">pts</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className={person.active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}>
                        {person.active ? "Active" : "Inactive"}
                      </Badge>

                      {person.exempt && <Badge className="bg-slate-200 text-slate-700">Exempt</Badge>}

                      <Badge className="bg-indigo-50 text-indigo-700">
                        Reliability {person.reliability}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-slate-950 p-5 text-white md:p-6">
              <h2 className="text-2xl font-black">Rule Engine</h2>

              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <p>
                  <b className="text-white">1.</b> ห้ามงานชื่อซ้ำในวันเดียวกัน
                </p>
                <p>
                  <b className="text-white">2.</b> ห้ามมอบหมายคน inactive/exempt
                </p>
                <p>
                  <b className="text-white">3.</b> ห้ามคนเดียวรับงานค้างซ้อนในวันเดียวกัน ยกเว้น Override
                </p>
                <p>
                  <b className="text-white">4.</b> Viewer ดูได้อย่างเดียว
                </p>
              </div>

              <Button onClick={fetchAll} className="mt-5 bg-white text-slate-950 hover:bg-slate-100">
                <RefreshCcw size={16} /> Refresh
              </Button>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}