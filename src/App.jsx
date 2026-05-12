import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Edit3,
  Flame,
  LogOut,
  Plus,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  X,
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

    if (signUpError?.message?.toLowerCase().includes("already registered")) {
      setMessage("อีเมลนี้มีบัญชีอยู่แล้ว แต่รหัสผ่านไม่ถูกต้อง ลองใส่รหัสเดิม หรือให้แอดมินลบ user แล้วสมัครใหม่");
    } else if (signUpError) {
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
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-slate-950 outline-none focus:ring-2 focus:ring-white/40"
            />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="รหัสผ่าน อย่างน้อย 8 ตัว"
              className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-slate-950 outline-none focus:ring-2 focus:ring-white/40"
            />
            <Button disabled={loading} className="w-full bg-white text-slate-950 hover:bg-slate-100">
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ / สมัครบัญชี"}
            </Button>
          </form>
          {message && <p className="mt-4 rounded-2xl bg-white/10 p-4 text-sm text-slate-200">{message}</p>}
        </Card>
      </div>
    </main>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const [staffQuery, setStaffQuery] = useState("");
  const [role, setRole] = useState("Super Admin");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStaff, setSavingStaff] = useState(false);
  const [notice, setNotice] = useState("");
  const [editingStaffId, setEditingStaffId] = useState(null);

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

  const blankStaff = {
    rank: "",
    name: "",
    section: "",
    role: "",
    active: true,
    exempt: false,
    points: 0,
    reliability: 80,
  };

  const [staffForm, setStaffForm] = useState(blankStaff);

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
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, fetchLogs)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchStaff(), fetchTasks(), fetchLogs()]);
    setLoading(false);
  }

  async function fetchStaff() {
    if (!supabase) return;

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
    if (!supabase) return;

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

  async function fetchLogs() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      setNotice(error.message);
      return;
    }

    setLogs(data || []);
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

    if (error) {
      console.error("Activity log error:", error.message);
    }
  }

  const validation = useMemo(() => {
    if (!newTask.title.trim()) return { ok: false, message: "กรอกชื่องานก่อน" };

    const owner = staff.find((person) => person.id === newTask.owner_id);
    if (!owner) return { ok: false, message: "เลือกผู้รับผิดชอบก่อน" };
    if (!owner.active) return { ok: false, message: "เจ้าหน้าที่ inactive รับงานไม่ได้" };
    if (owner.exempt) return { ok: false, message: "เจ้าหน้าที่ exempt รับงานไม่ได้" };

    const duplicate = tasks.some(
      (task) =>
        task.task_date === newTask.task_date &&
        task.title.trim().toLowerCase() === newTask.title.trim().toLowerCase()
    );
    if (duplicate) return { ok: false, message: "พบงานชื่อซ้ำในวันเดียวกัน" };

    const overlap = tasks.some(
      (task) =>
        task.task_date === newTask.task_date &&
        task.owner_id === newTask.owner_id &&
        task.status !== "เสร็จแล้ว"
    );

    if (overlap && role !== "Override") {
      return { ok: false, message: "คนนี้มีงานค้างในวันเดียวกัน ต้องใช้ Override" };
    }

    return { ok: true, message: "ผ่าน Rule Engine พร้อมบันทึก" };
  }, [newTask, staff, tasks, role]);

  const staffValidation = useMemo(() => {
    if (!staffForm.name.trim()) return { ok: false, message: "กรอกชื่อเจ้าหน้าที่ก่อน" };
    if (!staffForm.rank.trim()) return { ok: false, message: "กรอกยศก่อน" };
    if (!staffForm.section.trim()) return { ok: false, message: "กรอกฝ่าย/ตอนก่อน" };
    if (!staffForm.role.trim()) return { ok: false, message: "กรอกหน้าที่/ความถนัดก่อน" };
    return { ok: true, message: editingStaffId ? "พร้อมบันทึกการแก้ไข" : "พร้อมเพิ่มเจ้าหน้าที่" };
  }, [staffForm, editingStaffId]);

  const filteredTasks = useMemo(() => {
    const keyword = query.toLowerCase();

    return tasks.filter((task) => {
      return (
        task.title?.toLowerCase().includes(keyword) ||
        task.category?.toLowerCase().includes(keyword) ||
        task.priority?.toLowerCase().includes(keyword) ||
        task.status?.toLowerCase().includes(keyword) ||
        task.staff?.name?.toLowerCase().includes(keyword)
      );
    });
  }, [query, tasks]);

  const filteredStaff = useMemo(() => {
    const keyword = staffQuery.toLowerCase();
    return staff.filter((person) => {
      return (
        person.name?.toLowerCase().includes(keyword) ||
        person.rank?.toLowerCase().includes(keyword) ||
        person.section?.toLowerCase().includes(keyword) ||
        person.role?.toLowerCase().includes(keyword)
      );
    });
  }, [staffQuery, staff]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const active = tasks.filter((task) => task.status !== "เสร็จแล้ว").length;
    const done = tasks.filter((task) => task.status === "เสร็จแล้ว").length;
    const urgent = tasks.filter((task) => task.priority === "สูง" || task.priority === "วิกฤต").length;
    const filled = total ? Math.round((tasks.filter((task) => task.owner_id).length / total) * 100) : 0;
    const activeStaff = staff.filter((person) => person.active && !person.exempt).length;

    return { total, active, done, urgent, filled, activeStaff };
  }, [tasks, staff]);

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

    if (error) {
      setNotice(error.message);
    } else {
      setNotice("บันทึกงานสำเร็จ ทุกเครื่องจะเห็นข้อมูลนี้แบบ realtime");
      await writeLog("CREATE_TASK", "tasks", data.id, `สร้างงาน: ${data.title}`);
      setNewTask((prev) => ({ ...prev, title: "", priority: "กลาง", status: "ยังไม่เริ่ม", category: "ทั่วไป", points: 60 }));
    }

    setSaving(false);
  }

  async function updateStatus(id, status) {
    if (!supabase) return;

    const task = tasks.find((item) => item.id === id);
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);

    if (error) {
      setNotice(error.message);
      return;
    }

    await writeLog("UPDATE_STATUS", "tasks", id, `เปลี่ยนสถานะงาน "${task?.title || id}" เป็น "${status}"`);
  }

  async function deleteTask(id) {
    if (!supabase) return;

    const confirmed = window.confirm("ยืนยันลบงานนี้?");
    if (!confirmed) return;

    const task = tasks.find((item) => item.id === id);
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      setNotice(error.message);
      return;
    }

    await writeLog("DELETE_TASK", "tasks", id, `ลบงาน: ${task?.title || id}`);
  }

  function startEditStaff(person) {
    setEditingStaffId(person.id);
    setStaffForm({
      rank: person.rank || "",
      name: person.name || "",
      section: person.section || "",
      role: person.role || "",
      active: Boolean(person.active),
      exempt: Boolean(person.exempt),
      points: Number(person.points) || 0,
      reliability: Number(person.reliability) || 80,
    });
  }

  function cancelEditStaff() {
    setEditingStaffId(null);
    setStaffForm(blankStaff);
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
      const { data, error } = await supabase
        .from("staff")
        .update(payload)
        .eq("id", editingStaffId)
        .select()
        .single();

      if (error) {
        setNotice(error.message);
      } else {
        setNotice("แก้ไขเจ้าหน้าที่สำเร็จ");
        await writeLog("UPDATE_STAFF", "staff", data.id, `แก้ไขเจ้าหน้าที่: ${data.rank} ${data.name}`);
        cancelEditStaff();
      }
    } else {
      const { data, error } = await supabase
        .from("staff")
        .insert(payload)
        .select()
        .single();

      if (error) {
        setNotice(error.message);
      } else {
        setNotice("เพิ่มเจ้าหน้าที่สำเร็จ");
        await writeLog("CREATE_STAFF", "staff", data.id, `เพิ่มเจ้าหน้าที่: ${data.rank} ${data.name}`);
        setStaffForm(blankStaff);
      }
    }

    setSavingStaff(false);
  }

  async function toggleStaffFlag(person, field) {
    if (!supabase) return;

    const nextValue = !person[field];
    const { error } = await supabase.from("staff").update({ [field]: nextValue }).eq("id", person.id);

    if (error) {
      setNotice(error.message);
      return;
    }

    await writeLog(
      field === "active" ? "TOGGLE_ACTIVE" : "TOGGLE_EXEMPT",
      "staff",
      person.id,
      `${field === "active" ? "เปลี่ยนสถานะ Active" : "เปลี่ยนสถานะ Exempt"}: ${person.rank} ${person.name} = ${nextValue}`
    );
  }

  async function deleteStaff(id) {
    if (!supabase) return;

    const person = staff.find((item) => item.id === id);
    const assignedTasks = tasks.filter((task) => task.owner_id === id);

    if (assignedTasks.length > 0) {
      const confirmed = window.confirm(
        `เจ้าหน้าที่คนนี้มีงานที่เกี่ยวข้อง ${assignedTasks.length} งาน ถ้าลบ งานเหล่านั้นจะไม่มีผู้รับผิดชอบ ยืนยันลบ?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm("ยืนยันลบเจ้าหน้าที่นี้?");
      if (!confirmed) return;
    }

    const { error } = await supabase.from("staff").delete().eq("id", id);

    if (error) {
      setNotice(error.message);
      return;
    }

    await writeLog("DELETE_STAFF", "staff", id, `ลบเจ้าหน้าที่: ${person?.rank || ""} ${person?.name || id}`);

    if (newTask.owner_id === id) {
      setNewTask((prev) => ({ ...prev, owner_id: "" }));
    }
  }

  async function signOut() {
    if (!supabase) return;
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
              <p className="mt-2 text-xl font-bold text-slate-200">Duty / Mission / Staff Assignment</p>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                ระบบจัดงานและเวรทีมแบบ realtime พร้อม Staff Management, Rule Engine, Activity Log และการควบคุมสถานะเจ้าหน้าที่
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
                      role === item ? "bg-white text-slate-950" : "bg-white/10 text-slate-300 hover:bg-white/20"
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
          <Stat icon={Users} label="Available Staff" value={stats.activeStaff} sub="พร้อมรับงาน" />
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
                <p className="text-sm text-slate-500">เพิ่มงานจริง บันทึกลง Supabase และ sync ทุกเครื่องทันที</p>
              </div>
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ค้นหางาน / คน / สถานะ"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>

            <form onSubmit={addTask} className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 lg:grid-cols-[1.6fr_0.9fr_0.95fr_0.8fr]">
                <input
                  value={newTask.title}
                  onChange={(event) => setNewTask({ ...newTask, title: event.target.value })}
                  placeholder="พิมพ์ชื่องาน เช่น ทำสไลด์เสนอผู้บังคับบัญชา"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />
                <input
                  type="date"
                  value={newTask.task_date}
                  onChange={(event) => setNewTask({ ...newTask, task_date: event.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />
                <select
                  value={newTask.owner_id}
                  onChange={(event) => setNewTask({ ...newTask, owner_id: event.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <option value="">เลือกผู้รับผิดชอบ</option>
                  {staff.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.rank} {person.name} • {person.section}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={newTask.due_time}
                  onChange={(event) => setNewTask({ ...newTask, due_time: event.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-[0.8fr_0.8fr_0.9fr_0.7fr_auto]">
                <select
                  value={newTask.priority}
                  onChange={(event) => setNewTask({ ...newTask, priority: event.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <option>ต่ำ</option>
                  <option>กลาง</option>
                  <option>สูง</option>
                  <option>วิกฤต</option>
                </select>
                <select
                  value={newTask.status}
                  onChange={(event) => setNewTask({ ...newTask, status: event.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <option>ยังไม่เริ่ม</option>
                  <option>กำลังทำ</option>
                  <option>รอตรวจ</option>
                  <option>เสร็จแล้ว</option>
                </select>
                <input
                  value={newTask.category}
                  onChange={(event) => setNewTask({ ...newTask, category: event.target.value })}
                  placeholder="หมวดงาน"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />
                <input
                  type="number"
                  value={newTask.points}
                  onChange={(event) => setNewTask({ ...newTask, points: event.target.value })}
                  placeholder="แต้ม"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />
                <Button disabled={!validation.ok || saving || role === "Viewer"} className="bg-slate-950 text-white hover:bg-slate-800">
                  <Plus size={16} /> {saving ? "Saving" : "Save"}
                </Button>
              </div>

              <div className={`mt-3 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black ${validation.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
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
                    <div key={task.id} className="grid gap-3 px-4 py-4 hover:bg-slate-50 lg:grid-cols-[1fr_125px_120px_115px_115px_110px] lg:items-center">
                      <div>
                        <p className="font-black text-slate-950">{task.title}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {task.category} • +{task.points} pts • created {new Date(task.created_at).toLocaleString()}
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
                          onChange={(event) => updateStatus(task.id, event.target.value)}
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
                  <h2 className="text-2xl font-black">Staff Management</h2>
                  <p className="text-sm text-slate-500">เพิ่ม / แก้ / ลบ / ปิดสถานะเจ้าหน้าที่</p>
                </div>
                <UserPlus className="text-slate-400" />
              </div>

              <form onSubmit={saveStaff} className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={staffForm.rank}
                    onChange={(event) => setStaffForm({ ...staffForm, rank: event.target.value })}
                    placeholder="ยศ เช่น ร.ท. / ส.อ. / พลฯ"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  />
                  <input
                    value={staffForm.name}
                    onChange={(event) => setStaffForm({ ...staffForm, name: event.target.value })}
                    placeholder="ชื่อเจ้าหน้าที่"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  />
                  <input
                    value={staffForm.section}
                    onChange={(event) => setStaffForm({ ...staffForm, section: event.target.value })}
                    placeholder="ฝ่าย/ตอน เช่น ฝกม. / ICT"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  />
                  <input
                    value={staffForm.role}
                    onChange={(event) => setStaffForm({ ...staffForm, role: event.target.value })}
                    placeholder="หน้าที่/ความถนัด"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  />
                  <input
                    type="number"
                    value={staffForm.points}
                    onChange={(event) => setStaffForm({ ...staffForm, points: event.target.value })}
                    placeholder="คะแนน"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={staffForm.reliability}
                    onChange={(event) => setStaffForm({ ...staffForm, reliability: event.target.value })}
                    placeholder="Reliability 0-100"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={staffForm.active}
                      onChange={(event) => setStaffForm({ ...staffForm, active: event.target.checked })}
                    />
                    Active พร้อมรับงาน
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={staffForm.exempt}
                      onChange={(event) => setStaffForm({ ...staffForm, exempt: event.target.checked })}
                    />
                    Exempt ยกเว้นงาน
                  </label>
                </div>

                <div className={`mt-3 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black ${staffValidation.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {staffValidation.ok ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
                  {staffValidation.message}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button disabled={!staffValidation.ok || savingStaff || role === "Viewer"} className="bg-slate-950 text-white hover:bg-slate-800">
                    {editingStaffId ? <Save size={16} /> : <Plus size={16} />}
                    {savingStaff ? "Saving" : editingStaffId ? "บันทึกการแก้ไข" : "เพิ่มเจ้าหน้าที่"}
                  </Button>

                  {editingStaffId && (
                    <Button type="button" onClick={cancelEditStaff} className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                      <X size={16} /> ยกเลิกแก้ไข
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            <Card className="p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">Staff Board</h2>
                  <p className="text-sm text-slate-500">คะแนนและสถานะเจ้าหน้าที่</p>
                </div>
                <Trophy className="text-amber-500" />
              </div>

              <div className="relative mt-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  value={staffQuery}
                  onChange={(event) => setStaffQuery(event.target.value)}
                  placeholder="ค้นหาเจ้าหน้าที่"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div className="mt-5 space-y-3">
                {filteredStaff.map((person, index) => (
                  <div key={person.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black">#{index + 1} {person.rank} {person.name}</p>
                        <p className="text-sm text-slate-500">{person.section} • {person.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black">{person.points}</p>
                        <p className="text-xs text-slate-400">pts</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        disabled={role === "Viewer"}
                        onClick={() => toggleStaffFlag(person, "active")}
                        className={`rounded-full px-2.5 py-1 text-xs font-black ${person.active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                      >
                        {person.active ? "Active" : "Inactive"}
                      </button>

                      <button
                        disabled={role === "Viewer"}
                        onClick={() => toggleStaffFlag(person, "exempt")}
                        className={person.exempt ? "rounded-full bg-slate-800 px-2.5 py-1 text-xs font-black text-white" : "rounded-full bg-slate-200 px-2.5 py-1 text-xs font-black text-slate-700"}
                      >
                        {person.exempt ? "Exempt" : "Not exempt"}
                      </button>

                      <Badge className="bg-indigo-50 text-indigo-700">Reliability {person.reliability}%</Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        disabled={role === "Viewer"}
                        onClick={() => startEditStaff(person)}
                        className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 disabled:opacity-40"
                      >
                        <Edit3 size={13} /> แก้ไข
                      </button>
                      <button
                        disabled={role === "Viewer"}
                        onClick={() => deleteStaff(person.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 disabled:opacity-40"
                      >
                        <Trash2 size={13} /> ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Activity Log</h2>
                  <p className="text-sm text-slate-500">ประวัติการเพิ่ม / แก้ / ลบงานและเจ้าหน้าที่ล่าสุด</p>
                </div>
                <Database className="text-slate-400" />
              </div>

              <div className="mt-5 space-y-3">
                {logs.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">ยังไม่มีประวัติการทำงาน</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-900">{log.action}</p>
                          <p className="mt-1 text-sm text-slate-500">{log.description}</p>
                        </div>
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-black text-slate-700">{log.target_table}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="bg-slate-950 p-5 text-white md:p-6">
              <h2 className="text-2xl font-black">Rule Engine</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <p><b className="text-white">1.</b> ห้ามงานชื่อซ้ำในวันเดียวกัน</p>
                <p><b className="text-white">2.</b> ห้ามมอบหมายคน inactive/exempt</p>
                <p><b className="text-white">3.</b> ห้ามคนเดียวรับงานค้างซ้อนในวันเดียวกัน ยกเว้น Override</p>
                <p><b className="text-white">4.</b> Viewer ดูได้อย่างเดียว</p>
                <p><b className="text-white">5.</b> บันทึก Activity Log เมื่อสร้าง / แก้ / ลบงานและเจ้าหน้าที่</p>
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
