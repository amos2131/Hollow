import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, Check, Flame, Trophy, Calendar, BarChart3, Settings as SettingsIcon,
  Search, Archive, Trash2, Edit2, X, Moon, Sun, Download, Upload,
  ChevronLeft, ChevronRight, Award, Target, TrendingUp, Zap,
  ArrowLeft, RotateCcw, Sparkles, Swords, Crown, Info
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

/* ============================== THEME ============================== */
const THEMES = {
  dark: {
    bg: "#0a0a0f", bgSoft: "#0e0e14", card: "#15151c", cardHover: "#191921",
    border: "rgba(255,255,255,0.08)", borderStrong: "rgba(255,255,255,0.16)",
    text: "#e9e7e0", textMuted: "#8d8d97", textFaint: "#54545e",
    accent: "#bfe9ff", accentSoft: "rgba(191,233,255,0.14)", accentStrong: "#7fd0f5",
    danger: "#e8a3a3", dangerSoft: "rgba(232,163,163,0.12)",
    gold: "#e8d29a",
    shadow: "0 10px 40px rgba(0,0,0,0.5)",
  },
  light: {
    bg: "#f1efe8", bgSoft: "#e9e6dc", card: "#fbfaf6", cardHover: "#f3f1ea",
    border: "rgba(20,20,25,0.09)", borderStrong: "rgba(20,20,25,0.18)",
    text: "#17171c", textMuted: "#666670", textFaint: "#9b9ba3",
    accent: "#1f6a86", accentSoft: "rgba(31,106,134,0.10)", accentStrong: "#155066",
    danger: "#a83e3e", dangerSoft: "rgba(168,62,62,0.10)",
    gold: "#96702a",
    shadow: "0 10px 30px rgba(20,20,25,0.10)",
  },
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');`;

/* ============================== CONSTANTS ============================== */
const CATEGORIES = [
  { name: "Health", emoji: "🩺" }, { name: "Fitness", emoji: "💪" },
  { name: "Study", emoji: "📚" }, { name: "Work", emoji: "💼" },
  { name: "Finance", emoji: "💰" }, { name: "Personal", emoji: "🌿" },
  { name: "Mindfulness", emoji: "🧘" }, { name: "Creativity", emoji: "🎨" },
  { name: "Social", emoji: "🤝" }, { name: "Other", emoji: "✨" },
];

const COLOR_SWATCHES = ["#bfe9ff", "#c9e8c0", "#e8c9a0", "#e0b3c9", "#c9b8e8", "#e8d29a", "#b8c9d8", "#e0a3a3", "#a9d8c9", "#d8d0c0"];

const EMOJIS = ["🔥","💧","🏃","🧘","📖","💊","🛌","🥗","💰","✍️","🎯","🧹","🌱","🎸","🧑‍💻","☀️","🌙","🚭","🚫","🧠","❤️","🦷","🚴","🏋️","🎨","📞","🙏","😴","🥤","📵"];

const RANKS = [
  { name: "Beginner", min: 1, icon: "◇" }, { name: "Apprentice", min: 5, icon: "◈" },
  { name: "Warrior", min: 10, icon: "⚔" }, { name: "Elite", min: 15, icon: "✦" },
  { name: "Master", min: 20, icon: "☆" }, { name: "Legend", min: 25, icon: "✪" },
  { name: "Mythic", min: 30, icon: "❖" }, { name: "Transcendent", min: 35, icon: "✵" },
];

const ACHIEVEMENT_DEFS = [
  { id: "first_step", name: "First Step", desc: "Complete your first habit", icon: "◇", check: s => s.totalCompletions >= 1 },
  { id: "ten_deeds", name: "Ten Deeds", desc: "Complete 10 total check-ins", icon: "◈", check: s => s.totalCompletions >= 10 },
  { id: "century", name: "Centurion", desc: "Complete 100 total check-ins", icon: "⚔", check: s => s.totalCompletions >= 100 },
  { id: "half_k", name: "Ascendant", desc: "Complete 500 total check-ins", icon: "✦", check: s => s.totalCompletions >= 500 },
  { id: "week_streak", name: "Kindled Flame", desc: "Reach a 7-day streak", icon: "🔥", check: s => s.bestStreak >= 7 },
  { id: "month_streak", name: "Unwavering", desc: "Reach a 30-day streak", icon: "☆", check: s => s.bestStreak >= 30 },
  { id: "hundred_streak", name: "Eternal Flame", desc: "Reach a 100-day streak", icon: "✪", check: s => s.bestStreak >= 100 },
  { id: "perfect_day", name: "Flawless Day", desc: "Complete every habit due in one day", icon: "✵", check: s => s.perfectDays >= 1 },
  { id: "perfect_week", name: "Flawless Week", desc: "7 perfect days total", icon: "❖", check: s => s.perfectDays >= 7 },
  { id: "collector", name: "Collector", desc: "Create 10 or more habits", icon: "◇", check: s => s.habitCount >= 10 },
  { id: "well_rounded", name: "Well Rounded", desc: "Habits in 5+ categories", icon: "◈", check: s => s.categoriesUsed >= 5 },
  { id: "high_five_lvl", name: "Rising Star", desc: "Reach character level 5", icon: "⚔", check: s => s.level >= 5 },
];

const QUEST_POOL = [
  { id: "q_complete3", text: "Complete 3 habits today", target: 3, type: "count" },
  { id: "q_complete5", text: "Complete 5 habits today", target: 5, type: "count" },
  { id: "q_perfect", text: "Achieve a flawless day", target: 1, type: "perfect" },
  { id: "q_streak5", text: "Push any streak to 5+", target: 5, type: "streak" },
  { id: "q_earlybird", text: "Check in on 2 different habits", target: 2, type: "count" },
];

const CHALLENGE_POOL = [
  { id: "c_week20", text: "Complete 20 check-ins this week", target: 20, type: "weekcount" },
  { id: "c_noskip", text: "Miss zero due habits this week", target: 0, type: "noskip" },
  { id: "c_threehabits", text: "Keep 3+ active streaks alive", target: 3, type: "activestreaks" },
];

const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const WEEKDAYS_SHORT = ["S","M","T","W","T","F","S"];

const MOTIVATIONAL_QUOTES = [
  "Small steps, kept daily, become an unbreakable path.",
  "The flame you tend today lights tomorrow.",
  "Discipline is the quiet armor of the disciplined.",
  "One check-in at a time. That's the whole secret.",
  "Consistency carves stone; motivation only sketches it.",
  "Your streak is a story you're writing with today.",
  "Rest is earned, not skipped. Show up anyway.",
  "The vessel who returns each day becomes unstoppable.",
  "Progress hides inside repetition.",
  "Every habit completed is a vote for who you're becoming.",
];
const quoteForDate = ds => MOTIVATIONAL_QUOTES[Math.abs(hashStr(ds)) % MOTIVATIONAL_QUOTES.length];
function hashStr(s) { let h = 0; for (let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i))|0; return h; }

const FREEZE_START = 3;
const DEFAULT_NOTIF_SETTINGS = {
  morning: true, morningTime: "08:00",
  afternoon: true, afternoonTime: "13:00",
  evening: true, eveningTime: "19:30",
  missed: true, streakWarning: true, dailySummary: true,
};

/* ============================== DATE HELPERS ============================== */
const fmt = d => {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0"), day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
};
const todayStr = () => fmt(new Date());
const addDays = (d, n) => { const nd = new Date(d); nd.setDate(nd.getDate()+n); return nd; };
const parseD = s => new Date(s + "T00:00:00");
const daysBetween = (a,b) => Math.round((parseD(b) - parseD(a)) / 86400000);

function isDue(habit, dateStr) {
  const d = parseD(dateStr);
  if (d < parseD(fmt(new Date(habit.createdAt)))) return false;
  if (habit.type === "daily") return true;
  if (habit.type === "weekly" || habit.type === "custom") return (habit.days || []).includes(d.getDay());
  if (habit.type === "monthly") return d.getDate() === (habit.dayOfMonth || 1);
  return true;
}

function habitStats(habit, completions, freezes) {
  const done = completions[habit.id] || new Set();
  const frozen = (freezes && freezes[habit.id] && freezes[habit.id].used) || new Set();
  const created = fmt(new Date(habit.createdAt));
  const today = todayStr();
  // current streak: walk backward from today
  let cur = 0;
  let cursor = today;
  // if today is due and not yet done, start checking from yesterday for "current" streak continuity
  if (isDue(habit, today) && !done.has(today)) {
    cursor = fmt(addDays(new Date(), -1));
  }
  let guard = 0;
  while (guard < 3650 && daysBetween(created, cursor) >= 0) {
    if (isDue(habit, cursor)) {
      if (done.has(cursor) || frozen.has(cursor)) { cur++; } else break;
    }
    cursor = fmt(addDays(parseD(cursor), -1));
    guard++;
  }
  // longest streak
  let longest = 0, run = 0;
  let d = created;
  guard = 0;
  while (daysBetween(d, today) >= 0 && guard < 3650) {
    if (isDue(habit, d)) {
      if (done.has(d) || frozen.has(d)) { run++; longest = Math.max(longest, run); }
      else run = 0;
    }
    d = fmt(addDays(parseD(d), 1));
    guard++;
  }
  // completion rate last 30 days
  let dueCount = 0, doneCount = 0;
  for (let i = 0; i < 30; i++) {
    const ds = fmt(addDays(new Date(), -i));
    if (daysBetween(created, ds) < 0) continue;
    if (isDue(habit, ds)) { dueCount++; if (done.has(ds)) doneCount++; }
  }
  const rate = dueCount ? Math.round((doneCount / dueCount) * 100) : 0;
  const missed = dueCount - doneCount;
  return { current: cur, longest, rate, dueCount, doneCount, missed, totalDone: done.size };
}

function dueDoneForDate(habits, completions, ds) {
  const active = habits.filter(h => !h.archived && h.active);
  const due = active.filter(h => isDue(h, ds));
  const done = due.filter(h => (completions[h.id]||new Set()).has(ds));
  return { due, done };
}

function isPerfectDay(habits, completions, ds) {
  const { due, done } = dueDoneForDate(habits, completions, ds);
  return due.length > 0 && done.length === due.length;
}

function dailyXP(habits, completions, ds, freezes) {
  const { due, done } = dueDoneForDate(habits, completions, ds);
  let xp = done.length * 10;
  if (due.length > 0 && done.length === due.length) xp += 25;
  const active = habits.filter(h => !h.archived && h.active);
  const anyReached7 = active.some(h => {
    const s = habitStats(h, completions, freezes);
    // approximate "reached today": current streak is exactly 7 and today counts as done
    return (completions[h.id]||new Set()).has(ds) && s.current === 7;
  });
  if (anyReached7) xp += 50;
  // perfect week ending on ds
  let perfectWeek = true, sawDue = false;
  for (let i=0;i<7;i++) {
    const day = fmt(addDays(parseD(ds), -i));
    const { due: d2 } = dueDoneForDate(habits, completions, day);
    if (d2.length) sawDue = true;
    if (!isPerfectDay(habits, completions, day)) { perfectWeek = false; break; }
  }
  if (sawDue && perfectWeek) xp += 100;
  return xp;
}

function consistencyScore(habits, completions, days = 30) {
  const active = habits.filter(h => !h.archived && h.active);
  let sum = 0, n = 0;
  for (let i=0;i<days;i++) {
    const ds = fmt(addDays(new Date(), -i));
    const { due, done } = dueDoneForDate(active, completions, ds);
    if (due.length) { sum += done.length/due.length; n++; }
  }
  return n ? Math.round((sum/n)*100) : 0;
}

function productivityScore(habits, completions, ds, freezes) {
  const { due, done } = dueDoneForDate(habits, completions, ds);
  const pct = due.length ? done.length/due.length : 0;
  const active = habits.filter(h => !h.archived && h.active);
  const maxStreak = Math.max(0, ...active.map(h => habitStats(h, completions, freezes).current));
  const streakNorm = Math.min(1, maxStreak/30);
  const xpNorm = Math.min(1, dailyXP(habits, completions, ds, freezes)/150);
  return Math.round((pct*0.55 + streakNorm*0.25 + xpNorm*0.20) * 100);
}

function goalProgress(goal, completions) {
  if (goal.linkedHabitId) {
    const set = completions[goal.linkedHabitId] || new Set();
    let count = 0;
    const start = fmt(new Date(goal.createdAt));
    set.forEach(ds => { if (daysBetween(start, ds) >= 0) count++; });
    return count;
  }
  return goal.manualProgress || 0;
}

function seedHabits() {
  const now = Date.now() - 40 * 86400000;
  const base = [
    { name: "Drink Water", emoji: "💧", color: COLOR_SWATCHES[0], category: "Health", type: "daily" },
    { name: "Morning Run", emoji: "🏃", color: COLOR_SWATCHES[1], category: "Fitness", type: "daily" },
    { name: "Read 20 Pages", emoji: "📖", color: COLOR_SWATCHES[2], category: "Study", type: "daily" },
    { name: "Meditate", emoji: "🧘", color: COLOR_SWATCHES[3], category: "Mindfulness", type: "daily" },
    { name: "Weekly Budget Review", emoji: "💰", color: COLOR_SWATCHES[4], category: "Finance", type: "weekly", days: [1] },
    { name: "Deep Clean", emoji: "🧹", color: COLOR_SWATCHES[5], category: "Personal", type: "weekly", days: [6] },
  ];
  const habits = base.map((h, i) => ({
    id: "h_" + i, notes: "", reminder: "", active: true, archived: false, estimatedMinutes: 10,
    dayOfMonth: 1, days: h.days || [1,2,3,4,5,6,0], createdAt: now - i * 86400000, ...h,
  }));
  const completions = {};
  const logs = {};
  habits.forEach(h => {
    const set = new Set();
    const log = {};
    for (let i = 1; i < 35; i++) {
      const ds = fmt(addDays(new Date(), -i));
      if (isDue(h, ds) && Math.random() < 0.72) {
        set.add(ds);
        const hr = 6 + Math.floor(Math.random()*15);
        const mn = Math.floor(Math.random()*60);
        log[ds] = { time: `${String(hr).padStart(2,"0")}:${String(mn).padStart(2,"0")}`, note: "" };
      }
    }
    completions[h.id] = set;
    logs[h.id] = log;
  });
  return { habits, completions, logs };
}

/* ============================== SMALL UI ATOMS ============================== */
function ProgressBar({ pct, theme, height = 8, color }) {
  return (
    <div style={{ height, borderRadius: 999, background: theme.border, overflow: "hidden", width: "100%" }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0,pct))}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ height: "100%", borderRadius: 999, background: color || theme.accent }} />
    </div>
  );
}

function Card({ children, theme, style, onClick, className }) {
  return (
    <div className={className} onClick={onClick} style={{
      background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18,
      boxShadow: theme.shadow, ...style,
    }}>{children}</div>
  );
}

function Pill({ children, theme, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap",
      border: `1px solid ${active ? theme.accent : theme.border}`,
      background: active ? theme.accentSoft : "transparent",
      color: active ? theme.accent : theme.textMuted, transition: "all .2s",
    }}>{children}</button>
  );
}

function IconBtn({ icon: Icon, theme, onClick, size = 18, style, title }) {
  return (
    <button title={title} onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
      border: `1px solid ${theme.border}`, background: theme.bgSoft, color: theme.text, ...style,
    }}>
      <Icon size={size} strokeWidth={1.8} />
    </button>
  );
}

function Modal({ theme, onClose, children, title, wide }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <motion.div onClick={e => e.stopPropagation()}
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}
          style={{
            width: "100%", maxWidth: wide ? 640 : 480, maxHeight: "88vh", overflowY: "auto",
            background: theme.bgSoft, borderTop: `1px solid ${theme.borderStrong}`,
            borderLeft: `1px solid ${theme.borderStrong}`, borderRight: `1px solid ${theme.borderStrong}`,
            borderRadius: "24px 24px 0 0", padding: "20px 20px 32px",
          }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ fontFamily: "Cinzel", fontSize: 19, letterSpacing: 0.5, color: theme.text }}>{title}</h2>
            <IconBtn icon={X} theme={theme} onClick={onClose} />
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, theme, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: theme.textMuted, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = theme => ({
  width: "100%", padding: "11px 14px", borderRadius: 12, border: `1px solid ${theme.border}`,
  background: theme.card, color: theme.text, fontSize: 14.5, outline: "none", fontFamily: "Inter",
});

/* ============================== HEATMAP ============================== */
function Heatmap({ habits, completions, theme, weeks = 20 }) {
  const days = weeks * 7;
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const ds = fmt(addDays(new Date(), -i));
    let due = 0, done = 0;
    habits.forEach(h => {
      if (!h.archived && isDue(h, ds)) { due++; if ((completions[h.id] || new Set()).has(ds)) done++; }
    });
    const ratio = due ? done / due : -1;
    cells.push({ ds, ratio });
  }
  const cols = [];
  for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7));
  const colorFor = ratio => {
    if (ratio < 0) return theme.border;
    if (ratio === 0) return theme.dangerSoft;
    const alpha = 0.18 + ratio * 0.7;
    return theme.accent.startsWith("#") ? hexAlpha(theme.accent, alpha) : theme.accent;
  };
  return (
    <div style={{ display: "flex", gap: 4, overflowX: "auto", padding: "4px 2px" }}>
      {cols.map((col, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {col.map((c, j) => (
            <div key={j} title={`${c.ds} · ${c.ratio < 0 ? "no habits due" : Math.round(c.ratio*100)+"%"}`}
              style={{ width: 12, height: 12, borderRadius: 3, background: colorFor(c.ratio) }} />
          ))}
        </div>
      ))}
    </div>
  );
}
function hexAlpha(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ============================== HABIT CARD (with swipe) ============================== */
function HabitRow({ habit, completions, theme, onToggle, onOpen }) {
  const stats = habitStats(habit, completions);
  const done = (completions[habit.id] || new Set()).has(todayStr());
  const due = isDue(habit, todayStr());
  const x = useRef(0);

  return (
    <motion.div
      drag={due ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.35}
      onDragEnd={(e, info) => { if (Math.abs(info.offset.x) > 90) onToggle(habit.id); }}
      whileTap={{ scale: 0.99 }}
      layout
      style={{ position: "relative" }}
    >
      <Card theme={theme} style={{ padding: 14, marginBottom: 10, opacity: due ? 1 : 0.55 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => due && onToggle(habit.id)} disabled={!due} style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 21, border: `1.5px solid ${done ? habit.color : theme.border}`,
            background: done ? hexAlpha(habit.color, 0.22) : theme.bgSoft,
            transition: "all .25s",
          }}>
            {done ? <Check size={20} color={habit.color} strokeWidth={3} /> : habit.emoji}
          </button>
          <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onOpen(habit)}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}>{habit.name}</div>
            <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Flame size={12} color={theme.gold} /> {stats.current}</span>
              <span>{stats.rate}% · 30d</span>
              <span style={{ color: theme.textFaint }}>{habit.category}</span>
            </div>
          </div>
          <ChevronRight size={16} color={theme.textFaint} onClick={() => onOpen(habit)} style={{ cursor: "pointer" }}/>
        </div>
      </Card>
    </motion.div>
  );
}

/* ============================== ADD / EDIT HABIT MODAL ============================== */
function HabitFormModal({ theme, initial, onSave, onClose, onDelete }) {
  const [name, setName] = useState(initial?.name || "");
  const [emoji, setEmoji] = useState(initial?.emoji || "🔥");
  const [color, setColor] = useState(initial?.color || COLOR_SWATCHES[0]);
  const [category, setCategory] = useState(initial?.category || "Health");
  const [type, setType] = useState(initial?.type || "daily");
  const [days, setDays] = useState(initial?.days || [1,2,3,4,5]);
  const [dayOfMonth, setDayOfMonth] = useState(initial?.dayOfMonth || 1);
  const [notes, setNotes] = useState(initial?.notes || "");
  const [reminder, setReminder] = useState(initial?.reminder || "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(initial?.estimatedMinutes ?? 10);
  const [showEmoji, setShowEmoji] = useState(false);

  const toggleDay = d => setDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d].sort());

  const submit = () => {
    if (!name.trim()) return;
    onSave({
      id: initial?.id || ("h_" + Date.now()),
      name: name.trim(), emoji, color, category, type, days, dayOfMonth: Number(dayOfMonth),
      notes, reminder, estimatedMinutes: Number(estimatedMinutes) || 5,
      active: initial?.active ?? true, archived: initial?.archived ?? false,
      createdAt: initial?.createdAt || Date.now(),
    });
  };

  return (
    <Modal theme={theme} onClose={onClose} title={initial ? "Edit Habit" : "New Habit"}>
      <Field label="Icon & Name" theme={theme}>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowEmoji(s => !s)} style={{
            width: 46, height: 46, borderRadius: 12, fontSize: 22, flexShrink: 0,
            border: `1px solid ${theme.border}`, background: theme.card,
          }}>{emoji}</button>
          <input style={inputStyle(theme)} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Drink Water" maxLength={40} />
        </div>
        <AnimatePresence>
          {showEmoji && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, padding: 10, background: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
                {EMOJIS.map(em => (
                  <button key={em} onClick={() => { setEmoji(em); setShowEmoji(false); }}
                    style={{ fontSize: 20, width: 34, height: 34, borderRadius: 8, background: em===emoji?theme.accentSoft:"transparent" }}>{em}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Field>

      <Field label="Color" theme={theme}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {COLOR_SWATCHES.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{
              width: 30, height: 30, borderRadius: "50%", background: c,
              border: c === color ? `2.5px solid ${theme.text}` : `2px solid transparent`,
            }} />
          ))}
        </div>
      </Field>

      <Field label="Category" theme={theme}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <Pill key={c.name} theme={theme} active={category===c.name} onClick={() => setCategory(c.name)}>{c.emoji} {c.name}</Pill>
          ))}
        </div>
      </Field>

      <Field label="Frequency" theme={theme}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {["daily","weekly","monthly","custom"].map(t => (
            <Pill key={t} theme={theme} active={type===t} onClick={() => setType(t)}>{t[0].toUpperCase()+t.slice(1)}</Pill>
          ))}
        </div>
        {(type === "weekly" || type === "custom") && (
          <div style={{ display: "flex", gap: 6 }}>
            {WEEKDAYS_SHORT.map((w, i) => (
              <button key={i} onClick={() => toggleDay(i)} style={{
                width: 34, height: 34, borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: `1px solid ${days.includes(i) ? theme.accent : theme.border}`,
                background: days.includes(i) ? theme.accentSoft : "transparent",
                color: days.includes(i) ? theme.accent : theme.textMuted,
              }}>{w}</button>
            ))}
          </div>
        )}
        {type === "monthly" && (
          <input type="number" min={1} max={31} style={{ ...inputStyle(theme), width: 100 }} value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} />
        )}
      </Field>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Reminder Time (optional)" theme={theme}>
            <input type="time" style={inputStyle(theme)} value={reminder} onChange={e => setReminder(e.target.value)} />
          </Field>
        </div>
        <div style={{ width: 110 }}>
          <Field label="Est. Minutes" theme={theme}>
            <input type="number" min={1} max={240} style={inputStyle(theme)} value={estimatedMinutes} onChange={e => setEstimatedMinutes(e.target.value)} />
          </Field>
        </div>
      </div>

      <Field label="Notes" theme={theme}>
        <textarea style={{ ...inputStyle(theme), minHeight: 70, resize: "vertical" }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." />
      </Field>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        {initial && (
          <button onClick={() => onDelete(initial.id)} style={{
            padding: "13px 18px", borderRadius: 14, border: `1px solid ${theme.dangerSoft}`, background: theme.dangerSoft, color: theme.danger, fontWeight: 700, fontSize: 14,
          }}><Trash2 size={16} style={{ verticalAlign: -3, marginRight: 6 }} />Delete</button>
        )}
        <button onClick={submit} style={{
          flex: 1, padding: "13px 18px", borderRadius: 14, border: "none", background: theme.accent, color: "#0a0a0f", fontWeight: 800, fontSize: 14.5,
        }}>{initial ? "Save Changes" : "Create Habit"}</button>
      </div>
    </Modal>
  );
}

/* ============================== HABIT DETAIL ============================== */
function HabitDetail({ habit, completions, theme, onBack, onEdit, onToggleDate }) {
  const stats = habitStats(habit, completions);
  const done = completions[habit.id] || new Set();
  const [monthOffset, setMonthOffset] = useState(0);

  const monthGrid = useMemo(() => {
    const base = new Date();
    base.setDate(1); base.setMonth(base.getMonth() + monthOffset);
    const first = new Date(base);
    const startPad = first.getDay();
    const daysInMonth = new Date(base.getFullYear(), base.getMonth()+1, 0).getDate();
    const cells = [];
    for (let i=0;i<startPad;i++) cells.push(null);
    for (let d=1; d<=daysInMonth; d++) cells.push(new Date(base.getFullYear(), base.getMonth(), d));
    return { cells, label: base.toLocaleString("default",{ month:"long", year:"numeric" }) };
  }, [monthOffset]);

  const trendData = useMemo(() => {
    const arr = [];
    for (let i = 13; i >= 0; i--) {
      const ds = fmt(addDays(new Date(), -i));
      arr.push({ day: ds.slice(5), done: done.has(ds) && isDue(habit, ds) ? 1 : 0 });
    }
    return arr;
  }, [done, habit]);

  const milestones = [7, 30, 100, 365];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <IconBtn icon={ArrowLeft} theme={theme} onClick={onBack} />
        <div style={{ fontSize: 28 }}>{habit.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Cinzel", fontSize: 18, color: theme.text }}>{habit.name}</div>
          <div style={{ fontSize: 12, color: theme.textMuted }}>{habit.category} · {habit.type}</div>
        </div>
        <IconBtn icon={Edit2} theme={theme} onClick={() => onEdit(habit)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Current", val: stats.current, icon: Flame },
          { label: "Longest", val: stats.longest, icon: Trophy },
          { label: "Rate 30d", val: stats.rate + "%", icon: TrendingUp },
        ].map((s,i) => (
          <Card key={i} theme={theme} style={{ padding: 14, textAlign: "center" }}>
            <s.icon size={16} color={habit.color} style={{ marginBottom: 6 }} />
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 20, fontWeight: 700, color: theme.text }}>{s.val}</div>
            <div style={{ fontSize: 10.5, color: theme.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <Card theme={theme} style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.textMuted, marginBottom: 10, textTransform:"uppercase", letterSpacing:0.6 }}>14-Day Trend</div>
        <ResponsiveContainer width="100%" height={90}>
          <LineChart data={trendData}>
            <Line type="monotone" dataKey="done" stroke={habit.color} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card theme={theme} style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <IconBtn icon={ChevronLeft} theme={theme} onClick={() => setMonthOffset(m => m-1)} size={15} />
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{monthGrid.label}</div>
          <IconBtn icon={ChevronRight} theme={theme} onClick={() => setMonthOffset(m => m+1)} size={15} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 6 }}>
          {WEEKDAYS_SHORT.map((w,i) => <div key={i} style={{ textAlign:"center", fontSize: 10, color: theme.textFaint }}>{w}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
          {monthGrid.cells.map((d,i) => {
            if (!d) return <div key={i} />;
            const ds = fmt(d);
            const due = isDue(habit, ds);
            const isDone = done.has(ds);
            const isFuture = ds > todayStr();
            return (
              <button key={i} disabled={isFuture || !due} onClick={() => onToggleDate(habit.id, ds)} style={{
                aspectRatio: "1", borderRadius: 9, fontSize: 11, fontWeight: 600,
                background: isDone ? hexAlpha(habit.color,0.28) : due ? theme.bgSoft : "transparent",
                border: `1px solid ${isDone ? habit.color : due ? theme.border : "transparent"}`,
                color: isDone ? theme.text : due ? theme.textMuted : theme.textFaint,
                opacity: isFuture ? 0.35 : 1,
              }}>{d.getDate()}</button>
            );
          })}
        </div>
      </Card>

      <Card theme={theme} style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.textMuted, marginBottom: 10, textTransform:"uppercase", letterSpacing:0.6 }}>Milestones</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {milestones.map(m => (
            <div key={m}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: theme.textMuted, marginBottom: 4 }}>
                <span>{m}-day streak</span><span>{Math.min(stats.longest, m)}/{m}</span>
              </div>
              <ProgressBar pct={(Math.min(stats.longest,m)/m)*100} theme={theme} color={habit.color} height={6} />
            </div>
          ))}
        </div>
      </Card>

      {habit.notes && (
        <Card theme={theme} style={{ padding: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.textMuted, marginBottom: 6, textTransform:"uppercase", letterSpacing:0.6 }}>Notes</div>
          <div style={{ fontSize: 13.5, color: theme.text, lineHeight: 1.6 }}>{habit.notes}</div>
        </Card>
      )}
    </div>
  );
}

/* ============================== DAILY CHECK-IN ROW (note + time + undo) ============================== */
function DailyRow({ habit, completions, logs, theme, onToggle, onNote, onOpen }) {
  const today = todayStr();
  const done = (completions[habit.id] || new Set()).has(today);
  const due = isDue(habit, today);
  const log = (logs[habit.id] || {})[today];
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteVal, setNoteVal] = useState(log?.note || "");

  useEffect(() => { setNoteVal(log?.note || ""); }, [log?.note]);

  return (
    <Card theme={theme} style={{ padding: 14, marginBottom: 10, opacity: due ? 1 : 0.5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => due && onToggle(habit.id)} disabled={!due} style={{
          width: 46, height: 46, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 21, border: `1.5px solid ${done ? habit.color : theme.border}`,
          background: done ? hexAlpha(habit.color, 0.22) : theme.bgSoft, transition: "all .25s",
        }}>
          {done ? <Check size={20} color={habit.color} strokeWidth={3} /> : habit.emoji}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span onClick={() => onOpen(habit)} style={{ fontSize: 15, fontWeight: 600, color: theme.text, cursor: "pointer", textDecoration: done ? "line-through" : "none", opacity: done?0.65:1 }}>{habit.name}</span>
            {done && log?.time && <span style={{ fontSize: 10.5, fontFamily: "JetBrains Mono", color: theme.accent, background: theme.accentSoft, padding: "1px 7px", borderRadius: 999 }}>{log.time}</span>}
          </div>
          <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 3 }}>{habit.category} · +10 XP</div>
          {log?.note && !noteOpen && <div style={{ fontSize: 11.5, color: theme.textMuted, marginTop: 4, fontStyle: "italic" }}>"{log.note}"</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          {done && (
            <button onClick={() => onToggle(habit.id)} title="Undo" style={{ fontSize: 9.5, fontWeight: 700, color: theme.textFaint, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "3px 7px" }}>
              <RotateCcw size={11} style={{ verticalAlign: -1, marginRight: 3 }} />UNDO
            </button>
          )}
          <button onClick={() => setNoteOpen(o => !o)} title="Add note" style={{ color: log?.note ? theme.accent : theme.textFaint }}>
            <Edit2 size={13} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {noteOpen && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} style={{ overflow:"hidden" }}>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input style={{ ...inputStyle(theme), padding: "8px 12px", fontSize: 13 }} value={noteVal} placeholder="Add a note for today..."
                onChange={e => setNoteVal(e.target.value)} />
              <button onClick={() => { onNote(habit.id, today, noteVal); setNoteOpen(false); }} style={{
                padding: "0 14px", borderRadius: 10, background: theme.accent, color: "#0a0a0f", fontWeight: 700, fontSize: 12.5,
              }}>Save</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ============================== DAILY TIMELINE ============================== */
function DailyTimeline({ habits, completions, logs, theme, date }) {
  const items = habits.filter(h => (completions[h.id]||new Set()).has(date)).map(h => {
    const log = (logs[h.id]||{})[date] || {};
    return { habit: h, time: log.time || "--:--", note: log.note || "" };
  }).sort((a,b) => a.time.localeCompare(b.time));

  if (items.length === 0) return <EmptyState theme={theme} text="No check-ins logged for this day yet." />;

  return (
    <div style={{ position: "relative", paddingLeft: 18 }}>
      <div style={{ position: "absolute", left: 5, top: 4, bottom: 4, width: 1.5, background: theme.border }} />
      {items.map((it, i) => (
        <div key={i} style={{ position: "relative", marginBottom: 16 }}>
          <div style={{ position: "absolute", left: -18, top: 2, width: 11, height: 11, borderRadius: "50%", background: it.habit.color, border: `2px solid ${theme.bgSoft}` }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: theme.text }}>
            <span>{it.habit.emoji}</span><span style={{ fontWeight: 600 }}>{it.habit.name}</span>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 10.5, color: theme.textMuted, marginLeft: "auto" }}>{it.time}</span>
          </div>
          <div style={{ fontSize: 11, color: theme.accent, marginTop: 2 }}>+10 XP</div>
          {it.note && <div style={{ fontSize: 11.5, color: theme.textMuted, marginTop: 3, fontStyle: "italic" }}>"{it.note}"</div>}
        </div>
      ))}
    </div>
  );
}

/* ============================== DAILY CALENDAR (tap a day) ============================== */
function DailyCalendarPanel({ habits, completions, logs, theme, onClose }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState(todayStr());

  const grid = useMemo(() => {
    const base = new Date(); base.setDate(1); base.setMonth(base.getMonth()+monthOffset);
    const startPad = base.getDay();
    const daysInMonth = new Date(base.getFullYear(), base.getMonth()+1, 0).getDate();
    const cells = [];
    for (let i=0;i<startPad;i++) cells.push(null);
    for (let d=1; d<=daysInMonth; d++) cells.push(new Date(base.getFullYear(), base.getMonth(), d));
    return { cells, label: base.toLocaleString("default",{ month:"long", year:"numeric" }) };
  }, [monthOffset]);

  const colorForDay = ds => {
    if (ds > todayStr()) return null;
    const { due, done } = dueDoneForDate(habits, completions, ds);
    if (!due.length) return "none";
    if (done.length === due.length) return "full";
    if (done.length > 0) return "partial";
    return "missed";
  };

  const selDue = dueDoneForDate(habits, completions, selected);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <IconBtn icon={ChevronLeft} theme={theme} onClick={() => setMonthOffset(m=>m-1)} size={15} />
        <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{grid.label}</div>
        <IconBtn icon={ChevronRight} theme={theme} onClick={() => setMonthOffset(m=>m+1)} size={15} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 6 }}>
        {WEEKDAYS_SHORT.map((w,i) => <div key={i} style={{ textAlign:"center", fontSize: 10, color: theme.textFaint }}>{w}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 16 }}>
        {grid.cells.map((d,i) => {
          if (!d) return <div key={i} />;
          const ds = fmt(d);
          const state = colorForDay(ds);
          const bg = state==="full" ? hexAlpha(theme.accent,0.32) : state==="partial" ? hexAlpha(theme.gold,0.28) : state==="missed" ? theme.dangerSoft : "transparent";
          const border = ds===selected ? theme.text : theme.border;
          return (
            <button key={i} onClick={() => setSelected(ds)} style={{
              aspectRatio:"1", borderRadius: 9, fontSize: 11, fontWeight: 600, background: bg,
              border: `1.5px solid ${border}`, color: theme.text, opacity: ds>todayStr()?0.35:1,
            }}>{d.getDate()}</button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 14, fontSize: 10.5, color: theme.textMuted, marginBottom: 18 }}>
        <LegendDot theme={theme} color={hexAlpha(theme.accent,0.6)} label="Full" />
        <LegendDot theme={theme} color={hexAlpha(theme.gold,0.6)} label="Partial" />
        <LegendDot theme={theme} color={theme.danger} label="Missed" />
      </div>

      <SectionTitle theme={theme}>{selected === todayStr() ? "Today" : new Date(selected+"T00:00:00").toLocaleDateString("default",{ weekday:"long", month:"short", day:"numeric" })}</SectionTitle>
      <Card theme={theme} style={{ padding: 8 }}>
        {selDue.due.length === 0 && <div style={{ padding: 16 }}><EmptyState theme={theme} text="No habits were due this day." /></div>}
        {selDue.due.map((h,i) => {
          const isDone = selDue.done.includes(h);
          const log = (logs[h.id]||{})[selected];
          return (
            <div key={h.id} style={{ display:"flex", alignItems:"center", gap: 10, padding: "10px 10px", borderBottom: i<selDue.due.length-1?`1px solid ${theme.border}`:"none" }}>
              <span style={{ fontSize: 16 }}>{h.emoji}</span>
              <span style={{ flex: 1, fontSize: 13, color: theme.text }}>{h.name}</span>
              {isDone ? <Check size={15} color={h.color} /> : <X size={15} color={theme.textFaint} />}
              {log?.time && <span style={{ fontFamily:"JetBrains Mono", fontSize: 10.5, color: theme.textMuted }}>{log.time}</span>}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
function LegendDot({ theme, color, label }) {
  return <div style={{ display:"flex", alignItems:"center", gap: 5 }}><div style={{ width:8, height:8, borderRadius:"50%", background: color }} />{label}</div>;
}

/* ============================== DAILY TRACKING SCREEN ============================== */
function DailyScreen({ habits, completions, logs, freezes, theme, onToggle, onNote, onOpen, onUseFreeze, stats, goals }) {
  const [view, setView] = useState("checklist");
  const today = todayStr();
  const active = habits.filter(h => !h.archived && h.active);
  const dueToday = active.filter(h => isDue(h, today));
  const doneToday = dueToday.filter(h => (completions[h.id]||new Set()).has(today));
  const remaining = dueToday.length - doneToday.length;
  const pct = dueToday.length ? Math.round((doneToday.length/dueToday.length)*100) : 0;
  const xpToday = dailyXP(habits, completions, today, freezes);
  const maxCurStreak = Math.max(0, ...active.map(h => habitStats(h, completions, freezes).current));
  const maxLongStreak = Math.max(0, ...active.map(h => habitStats(h, completions, freezes).longest));
  const missedToday = dueToday.length - doneToday.length;
  const consistency = consistencyScore(active, completions);
  const productivity = productivityScore(active, completions, today, freezes);
  const totalMinutes = doneToday.reduce((a,h) => a + (h.estimatedMinutes||10), 0);
  const times = doneToday.map(h => (logs[h.id]||{})[today]?.time).filter(Boolean);
  const avgTime = times.length ? (() => {
    const mins = times.map(t => { const [h,m] = t.split(":").map(Number); return h*60+m; });
    const avg = Math.round(mins.reduce((a,b)=>a+b,0)/mins.length);
    return `${String(Math.floor(avg/60)).padStart(2,"0")}:${String(avg%60).padStart(2,"0")}`;
  })() : "—";

  const nextRank = [...RANKS].find(r => stats.level < r.min);
  const rankPct = nextRank ? Math.round((stats.level / nextRank.min) * 100) : 100;

  // habits at risk of losing their streak (due yesterday, missed, freeze available)
  const yesterday = fmt(addDays(new Date(), -1));
  const atRisk = active.filter(h => {
    if (!isDue(h, yesterday)) return false;
    const done = (completions[h.id]||new Set()).has(yesterday);
    if (done) return false;
    const bal = (freezes[h.id]?.available ?? FREEZE_START);
    return bal > 0 && habitStats(h, completions, freezes).current === 0 && habitStats(h, completions).longest > 0;
  });

  return (
    <div>
      <Card theme={theme} style={{ padding: 20, marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:140, height:140, borderRadius:"50%", background: theme.accentSoft, filter:"blur(10px)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, color: theme.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>
                {new Date().toLocaleDateString("default",{ weekday: "long", month: "long", day:"numeric" })}
              </div>
              <div style={{ fontFamily: "Cinzel", fontSize: 28, color: theme.text, margin: "6px 0 4px" }}>
                {doneToday.length}/{dueToday.length} <span style={{ fontSize: 14, color: theme.textMuted, fontFamily:"Inter" }}>complete</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily:"JetBrains Mono", fontSize: 18, color: theme.accent, fontWeight: 700 }}>+{xpToday} XP</div>
              <div style={{ fontSize: 10, color: theme.textFaint }}>earned today</div>
            </div>
          </div>
          <div style={{ margin: "12px 0 6px" }}><ProgressBar pct={pct} theme={theme} height={10} /></div>
          <div style={{ fontSize: 11, color: theme.textFaint, fontStyle: "italic", marginTop: 10 }}>"{quoteForDate(today)}"</div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Pill theme={theme} active={view==="checklist"} onClick={()=>setView("checklist")}>Checklist</Pill>
        <Pill theme={theme} active={view==="timeline"} onClick={()=>setView("timeline")}>Timeline</Pill>
        <Pill theme={theme} active={view==="calendar"} onClick={()=>setView("calendar")}><Calendar size={12} style={{verticalAlign:-2, marginRight:3}}/>Calendar</Pill>
      </div>

      {view === "calendar" ? (
        <DailyCalendarPanel habits={active} completions={completions} logs={logs} theme={theme} />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9, marginBottom: 10 }}>
            <StatChip theme={theme} label="Total Habits" value={dueToday.length} icon={Target} />
            <StatChip theme={theme} label="Completed" value={doneToday.length} icon={Check} />
            <StatChip theme={theme} label="Remaining" value={remaining} icon={X} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9, marginBottom: 16 }}>
            <StatChip theme={theme} label="Current Streak" value={maxCurStreak} icon={Flame} />
            <StatChip theme={theme} label="Longest Streak" value={maxLongStreak} icon={Trophy} />
            <StatChip theme={theme} label="Rank Progress" value={rankPct+"%"} icon={Crown} />
          </div>

          <Card theme={theme} style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize: 12.5, color: theme.textMuted, marginBottom: 8 }}>
              <span>Daily Goal</span><span style={{ fontFamily:"JetBrains Mono" }}>{pct}% / {goals.daily}%</span>
            </div>
            <ProgressBar pct={Math.min(100,(pct/goals.daily)*100)} theme={theme} color={pct>=goals.daily?theme.accent:theme.gold} />
          </Card>

          {atRisk.length > 0 && (
            <Card theme={theme} style={{ padding: 14, marginBottom: 16, border: `1px solid ${theme.dangerSoft}` }}>
              <div style={{ display:"flex", alignItems:"center", gap: 8, marginBottom: 8, color: theme.danger, fontSize: 12.5, fontWeight: 700 }}>
                <Flame size={14} /> Streak Warning
              </div>
              {atRisk.map(h => (
                <div key={h.id} style={{ display:"flex", alignItems:"center", gap: 8, padding: "6px 0", fontSize: 12.5, color: theme.text }}>
                  <span>{h.emoji}</span><span style={{ flex: 1 }}>{h.name} missed yesterday</span>
                  <button onClick={() => onUseFreeze(h.id, yesterday)} style={{
                    fontSize: 10.5, fontWeight: 700, padding: "5px 10px", borderRadius: 8, background: theme.accentSoft, color: theme.accent,
                  }}>Use Freeze ({freezes[h.id]?.available ?? FREEZE_START})</button>
                </div>
              ))}
            </Card>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 9, marginBottom: 18 }}>
            <StatChip theme={theme} label="Consistency Score" value={consistency+"%"} icon={TrendingUp} />
            <StatChip theme={theme} label="Productivity Score" value={productivity+"%"} icon={Zap} />
            <StatChip theme={theme} label="Avg Completion Time" value={avgTime} icon={Calendar} />
            <StatChip theme={theme} label="Time Spent Today" value={totalMinutes+"m"} icon={Target} />
          </div>

          {view === "timeline" ? (
            <>
              <SectionTitle theme={theme}>Today's Timeline</SectionTitle>
              <Card theme={theme} style={{ padding: 16, marginBottom: 16 }}>
                <DailyTimeline habits={active} completions={completions} logs={logs} theme={theme} date={today} />
              </Card>
            </>
          ) : (
            <>
              <SectionTitle theme={theme}>Check In</SectionTitle>
              {dueToday.length === 0 && <EmptyState theme={theme} text="Nothing due today. Enjoy the rest." />}
              {dueToday.slice().sort((a,b)=> (completions[a.id]||new Set()).has(today) - (completions[b.id]||new Set()).has(today))
                .map(h => <DailyRow key={h.id} habit={h} completions={completions} logs={logs} theme={theme} onToggle={onToggle} onNote={onNote} onOpen={onOpen} />)}
            </>
          )}
        </>
      )}
    </div>
  );
}

function StatChip({ theme, label, value, icon: Icon }) {
  return (
    <Card theme={theme} style={{ padding: 14 }}>
      <Icon size={15} color={theme.accent} />
      <div style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 19, color: theme.text, marginTop: 6 }}>{value}</div>
      <div style={{ fontSize: 11, color: theme.textMuted }}>{label}</div>
    </Card>
  );
}

function EmptyState({ theme, text, icon: Icon = Sparkles }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: theme.textFaint }}>
      <Icon size={26} style={{ marginBottom: 10, opacity: 0.5 }} />
      <div style={{ fontSize: 13.5 }}>{text}</div>
    </div>
  );
}

/* ============================== HABITS LIST SCREEN ============================== */
function HabitsScreen({ habits, completions, theme, onOpen, onArchive, onRestore, showArchived, setShowArchived }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("newest");

  const list = habits.filter(h => h.archived === showArchived)
    .filter(h => h.name.toLowerCase().includes(q.toLowerCase()))
    .filter(h => cat==="All" || h.category===cat)
    .sort((a,b) => {
      const sa = habitStats(a, completions), sb = habitStats(b, completions);
      if (sort === "streak") return sb.current - sa.current;
      if (sort === "completion") return sb.rate - sa.rate;
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "category") return a.category.localeCompare(b.category);
      return b.createdAt - a.createdAt;
    });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={16} color={theme.textFaint} style={{ position: "absolute", left: 13, top: 13 }} />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search habits..." style={{ ...inputStyle(theme), paddingLeft: 38 }} />
        </div>
        <Pill theme={theme} active={showArchived} onClick={()=>setShowArchived(s=>!s)}><Archive size={13} style={{verticalAlign:-2}}/> {showArchived?"Archived":"Active"}</Pill>
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 10, paddingBottom: 4 }}>
        {["All", ...CATEGORIES.map(c=>c.name)].map(c => <Pill key={c} theme={theme} active={cat===c} onClick={()=>setCat(c)}>{c}</Pill>)}
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
        {[["newest","Newest"],["streak","Streak"],["completion","Completion"],["name","Name"],["category","Category"]].map(([k,l]) =>
          <Pill key={k} theme={theme} active={sort===k} onClick={()=>setSort(k)}>{l}</Pill>)}
      </div>

      {list.length === 0 && <EmptyState theme={theme} text={showArchived ? "No archived habits." : "No habits match your filters."} />}
      {list.map(h => (
        <div key={h.id} style={{ position: "relative" }}>
          <HabitRow habit={h} completions={completions} theme={theme} onToggle={()=>{}} onOpen={onOpen} />
          <button onClick={() => showArchived ? onRestore(h.id) : onArchive(h.id)} style={{
            position: "absolute", top: 14, right: 44, fontSize: 10.5, padding: "4px 8px", borderRadius: 8,
            background: theme.bgSoft, border: `1px solid ${theme.border}`, color: theme.textMuted,
          }}>{showArchived ? "Restore" : "Archive"}</button>
        </div>
      ))}
    </div>
  );
}

/* ============================== ANALYTICS SCREEN ============================== */
function AnalyticsScreen({ habits, completions, theme }) {
  const active = habits.filter(h => !h.archived);
  const weeklyData = useMemo(() => {
    const buckets = WEEKDAYS.map(d => ({ day: d.slice(0,3), completed: 0 }));
    for (let i=0;i<28;i++) {
      const ds = fmt(addDays(new Date(), -i));
      const dow = parseD(ds).getDay();
      active.forEach(h => { if (isDue(h,ds) && (completions[h.id]||new Set()).has(ds)) buckets[dow].completed++; });
    }
    return buckets;
  }, [active, completions]);

  const trendData = useMemo(() => {
    const arr = [];
    for (let i=29;i>=0;i--) {
      const ds = fmt(addDays(new Date(), -i));
      let due=0, done=0;
      active.forEach(h => { if (isDue(h,ds)) { due++; if((completions[h.id]||new Set()).has(ds)) done++; }});
      arr.push({ day: ds.slice(5), rate: due? Math.round((done/due)*100):0 });
    }
    return arr;
  }, [active, completions]);

  const categoryData = useMemo(() => {
    const map = {};
    active.forEach(h => { map[h.category] = (map[h.category]||0)+1; });
    return Object.entries(map).map(([name,value]) => ({ name, value }));
  }, [active]);

  const ranking = active.map(h => ({ h, s: habitStats(h, completions) })).sort((a,b)=>b.s.rate-a.s.rate);
  const monthlyData = useMemo(() => {
    const arr = [];
    for (let m=5;m>=0;m--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth()-m);
      const label = d.toLocaleString("default",{month:"short"});
      const daysInMonth = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
      let due=0, done=0;
      for (let day=1; day<=daysInMonth; day++) {
        const ds = fmt(new Date(d.getFullYear(), d.getMonth(), day));
        if (parseD(ds) > new Date()) continue;
        active.forEach(h => { if (isDue(h,ds)) { due++; if((completions[h.id]||new Set()).has(ds)) done++; }});
      }
      arr.push({ month: label, rate: due? Math.round((done/due)*100):0 });
    }
    return arr;
  }, [active, completions]);

  const avgRate = ranking.length ? Math.round(ranking.reduce((a,r)=>a+r.s.rate,0)/ranking.length) : 0;
  const pieColors = COLOR_SWATCHES;

  return (
    <div>
      <SectionTitle theme={theme}>Yearly Heatmap</SectionTitle>
      <Card theme={theme} style={{ padding: 16, marginBottom: 18 }}>
        <Heatmap habits={active} completions={completions} theme={theme} />
        <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 8 }}>Last 20 weeks of activity across all habits</div>
      </Card>

      <SectionTitle theme={theme}>Completion Trend (30d)</SectionTitle>
      <Card theme={theme} style={{ padding: 16, marginBottom: 18 }}>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={trendData}>
            <CartesianGrid stroke={theme.border} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: theme.textFaint }} interval={4} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: theme.textFaint }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, fontSize: 12 }} />
            <Line type="monotone" dataKey="rate" stroke={theme.accent} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <SectionTitle theme={theme}>Weekly Pattern</SectionTitle>
      <Card theme={theme} style={{ padding: 16, marginBottom: 18 }}>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeklyData}>
            <CartesianGrid stroke={theme.border} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: theme.textFaint }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: theme.textFaint }} axisLine={false} tickLine={false} width={24} />
            <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, fontSize: 12 }} />
            <Bar dataKey="completed" fill={theme.accent} radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <SectionTitle theme={theme}>Monthly Progress (6mo)</SectionTitle>
      <Card theme={theme} style={{ padding: 16, marginBottom: 18 }}>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={monthlyData}>
            <CartesianGrid stroke={theme.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: theme.textFaint }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: theme.textFaint }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, fontSize: 12 }} />
            <Bar dataKey="rate" fill={theme.gold} radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <SectionTitle theme={theme}>Category Breakdown</SectionTitle>
      <Card theme={theme} style={{ padding: 16, marginBottom: 18, display:"flex", alignItems:"center", gap: 14 }}>
        <ResponsiveContainer width="45%" height={130}>
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={55} paddingAngle={3}>
              {categoryData.map((e,i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          {categoryData.map((e,i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: theme.textMuted }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: pieColors[i%pieColors.length] }} />
              {e.name} · {e.value}
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle theme={theme}>Habit Ranking</SectionTitle>
      <Card theme={theme} style={{ padding: 8, marginBottom: 18 }}>
        {ranking.map((r,i) => (
          <div key={r.h.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderBottom: i<ranking.length-1?`1px solid ${theme.border}`:"none" }}>
            <div style={{ fontFamily:"JetBrains Mono", fontSize: 12, color: theme.textFaint, width: 18 }}>{i+1}</div>
            <div style={{ fontSize: 17 }}>{r.h.emoji}</div>
            <div style={{ flex: 1, fontSize: 13.5, color: theme.text }}>{r.h.name}</div>
            <div style={{ fontSize: 12.5, fontFamily:"JetBrains Mono", color: r.s.rate>=70?theme.accent:theme.textMuted }}>{r.s.rate}%</div>
          </div>
        ))}
        {ranking.length===0 && <EmptyState theme={theme} text="No data yet." />}
      </Card>

      <SectionTitle theme={theme}>Streak History (30d)</SectionTitle>
      <Card theme={theme} style={{ padding: 16, marginBottom: 18 }}>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={useMemo(() => {
            const arr = [];
            for (let i=29;i>=0;i--) {
              const ds = fmt(addDays(new Date(), -i));
              let maxStreak = 0;
              active.forEach(h => {
                // approximate streak-on-that-day by counting consecutive done due-dates ending at ds
                let run = 0, cursor = ds, guard = 0;
                while (guard < 400) {
                  if (isDue(h, cursor)) { if ((completions[h.id]||new Set()).has(cursor)) run++; else break; }
                  cursor = fmt(addDays(parseD(cursor), -1)); guard++;
                  if (daysBetween(fmt(new Date(h.createdAt)), cursor) < 0) break;
                }
                maxStreak = Math.max(maxStreak, run);
              });
              arr.push({ day: ds.slice(5), streak: maxStreak });
            }
            return arr;
          }, [active, completions])}>
            <CartesianGrid stroke={theme.border} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: theme.textFaint }} interval={4} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: theme.textFaint }} axisLine={false} tickLine={false} width={24} />
            <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, fontSize: 12 }} />
            <Line type="monotone" dataKey="streak" stroke={theme.gold} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <SectionTitle theme={theme}>Habit Consistency</SectionTitle>
      <Card theme={theme} style={{ padding: 16, marginBottom: 18 }}>
        <ResponsiveContainer width="100%" height={Math.max(120, ranking.length*30)}>
          <BarChart data={ranking.map(r => ({ name: r.h.name.length>12?r.h.name.slice(0,12)+"…":r.h.name, rate: r.s.rate }))} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid stroke={theme.border} horizontal={false} />
            <XAxis type="number" domain={[0,100]} tick={{ fontSize: 9, fill: theme.textFaint }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: theme.textMuted }} axisLine={false} tickLine={false} width={90} />
            <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, fontSize: 12 }} />
            <Bar dataKey="rate" fill={theme.accent} radius={[0,6,6,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <StatChip theme={theme} label="Most Consistent" value={ranking[0]?.h.emoji || "—"} icon={Award} />
        <StatChip theme={theme} label="Needs Focus" value={ranking[ranking.length-1]?.h.emoji || "—"} icon={Target} />
        <StatChip theme={theme} label="Average Rate" value={avgRate+"%"} icon={TrendingUp} />
        <StatChip theme={theme} label="Habits Tracked" value={active.length} icon={BarChart3} />
      </div>
    </div>
  );
}

function SectionTitle({ theme, children }) {
  return <div style={{ fontFamily: "Cinzel", fontSize: 13, letterSpacing: 0.8, color: theme.textMuted, marginBottom: 10, textTransform: "uppercase" }}>{children}</div>;
}

/* ============================== GAMIFICATION SCREEN ============================== */
/* ============================== LONG-TERM GOALS (open-ended, target + optional deadline) ============================== */
function LongGoalCard({ goal, theme, habits, completions, onIncrement, onDelete }) {
  const progress = goalProgress(goal, completions);
  const pct = Math.min(100, Math.round((progress/Math.max(1,goal.target))*100));
  const reached = progress >= goal.target;
  const daysLeft = goal.deadline ? daysBetween(todayStr(), goal.deadline) : null;
  const overdue = daysLeft !== null && daysLeft < 0 && !reached;
  const linkedHabit = habits.find(h => h.id === goal.linkedHabitId);
  const smallBtn = { width: 26, height: 26, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bgSoft, color: theme.text, fontSize: 15, lineHeight: 1 };

  return (
    <Card theme={theme} style={{ padding: 14, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 22 }}>{goal.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{goal.title}</div>
          <div style={{ fontSize: 11, color: theme.textMuted }}>{linkedHabit ? `Auto-tracked via ${linkedHabit.name}` : "Manual tracking"}</div>
        </div>
        {!linkedHabit && !reached && (
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => onIncrement(goal.id, -1)} style={smallBtn}>−</button>
            <button onClick={() => onIncrement(goal.id, 1)} style={smallBtn}>+</button>
          </div>
        )}
        <button onClick={() => onDelete(goal.id)} title="Delete goal"><Trash2 size={14} color={theme.textFaint} /></button>
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: theme.textMuted, marginBottom: 5 }}>
          <span style={{ fontFamily: "JetBrains Mono" }}>{progress}/{goal.target} {goal.unit}</span>
          <span style={{ color: reached ? theme.accent : overdue ? theme.danger : theme.textMuted, fontWeight: 600 }}>
            {reached ? "✓ Reached" : overdue ? "Overdue" : daysLeft !== null ? `${daysLeft}d left` : "Ongoing · no deadline"}
          </span>
        </div>
        <ProgressBar pct={pct} theme={theme} color={reached ? theme.accent : overdue ? theme.danger : theme.gold} height={7} />
      </div>
    </Card>
  );
}

function LongGoalFormModal({ theme, habits, onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [target, setTarget] = useState(30);
  const [unit, setUnit] = useState("sessions");
  const [linkedHabitId, setLinkedHabitId] = useState("");
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState(fmt(addDays(new Date(), 30)));
  const [showEmoji, setShowEmoji] = useState(false);

  const submit = () => {
    if (!title.trim() || !target) return;
    onSave({
      id: "g_" + Date.now(), title: title.trim(), emoji, target: Number(target),
      unit: unit.trim() || "reps", linkedHabitId: linkedHabitId || null,
      deadline: hasDeadline ? deadline : null, manualProgress: 0, createdAt: Date.now(),
    });
  };

  return (
    <Modal theme={theme} onClose={onClose} title="New Long-Term Goal">
      <Field label="Icon & Title" theme={theme}>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowEmoji(s => !s)} style={{ width: 46, height: 46, borderRadius: 12, fontSize: 22, flexShrink: 0, border: `1px solid ${theme.border}`, background: theme.card }}>{emoji}</button>
          <input style={inputStyle(theme)} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Run 500km this year" maxLength={60} />
        </div>
        {showEmoji && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, padding: 10, background: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
            {EMOJIS.concat(["🎯","🏆","📈","🗻","🚀"]).map(em => (
              <button key={em} onClick={() => { setEmoji(em); setShowEmoji(false); }}
                style={{ fontSize: 20, width: 34, height: 34, borderRadius: 8, background: em===emoji?theme.accentSoft:"transparent" }}>{em}</button>
            ))}
          </div>
        )}
      </Field>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Target (the weight you must reach)" theme={theme}>
            <input type="number" min={1} style={inputStyle(theme)} value={target} onChange={e => setTarget(e.target.value)} />
          </Field>
        </div>
        <div style={{ width: 130 }}>
          <Field label="Unit" theme={theme}>
            <input style={inputStyle(theme)} value={unit} onChange={e => setUnit(e.target.value)} placeholder="km, reps..." />
          </Field>
        </div>
      </div>

      <Field label="Track Progress From" theme={theme}>
        <select style={inputStyle(theme)} value={linkedHabitId} onChange={e => setLinkedHabitId(e.target.value)}>
          <option value="">Manual (tap +/- yourself)</option>
          {habits.filter(h=>!h.archived).map(h => <option key={h.id} value={h.id}>Auto-count check-ins: {h.name}</option>)}
        </select>
      </Field>

      <Field label="Time Limit" theme={theme}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: hasDeadline ? 10 : 0 }}>
          <span style={{ fontSize: 13, color: theme.text }}>Set a deadline (otherwise the goal stretches indefinitely)</span>
          <button onClick={() => setHasDeadline(v => !v)} style={{ width: 44, height: 25, borderRadius: 999, background: hasDeadline ? theme.accent : theme.border, position: "relative", flexShrink: 0 }}>
            <motion.div animate={{ x: hasDeadline ? 21 : 2 }} style={{ width: 19, height: 19, borderRadius: "50%", background: theme.bg, position: "absolute", top: 3 }} />
          </button>
        </div>
        {hasDeadline && <input type="date" style={inputStyle(theme)} value={deadline} onChange={e => setDeadline(e.target.value)} min={todayStr()} />}
      </Field>

      <button onClick={submit} style={{ width: "100%", padding: "13px 18px", borderRadius: 14, border: "none", background: theme.accent, color: "#0a0a0f", fontWeight: 800, fontSize: 14.5, marginTop: 6 }}>Create Goal</button>
    </Modal>
  );
}

function QuestScreen({ habits, completions, theme, stats, goals, setGoals, longGoals, onAddGoal, onDeleteGoal, onIncrementGoal }) {
  const today = todayStr();
  const active = habits.filter(h => !h.archived);
  const dueToday = active.filter(h => isDue(h, today));
  const doneToday = dueToday.filter(h => (completions[h.id]||new Set()).has(today));
  const perfectToday = dueToday.length>0 && doneToday.length === dueToday.length;
  const maxStreakToday = Math.max(0, ...active.map(h => habitStats(h,completions).current));

  const seed = today.split("-").join("");
  const quests = [0,1,2].map(i => QUEST_POOL[(parseInt(seed)+i*7) % QUEST_POOL.length]);
  const questProgress = q => {
    if (q.type === "count") return Math.min(doneToday.length, q.target);
    if (q.type === "perfect") return perfectToday ? 1 : 0;
    if (q.type === "streak") return Math.min(maxStreakToday, q.target);
    return 0;
  };

  const weekAgo = fmt(addDays(new Date(), -6));
  let weekCount = 0, activeStreaks = 0, missedDue = 0;
  active.forEach(h => {
    const s = habitStats(h, completions);
    if (s.current > 0) activeStreaks++;
    for (let i=0;i<7;i++) {
      const ds = fmt(addDays(new Date(), -i));
      if (isDue(h, ds)) { if ((completions[h.id]||new Set()).has(ds)) weekCount++; else missedDue++; }
    }
  });
  const challenges = [
    { ...CHALLENGE_POOL[0], progress: Math.min(weekCount, 20) },
    { ...CHALLENGE_POOL[1], progress: missedDue === 0 ? 0 : 1, target: 0, reverse: true },
    { ...CHALLENGE_POOL[2], progress: Math.min(activeStreaks, 3) },
  ];

  const achievements = ACHIEVEMENT_DEFS.map(a => ({ ...a, unlocked: a.check(stats) }));
  const unlockedCount = achievements.filter(a=>a.unlocked).length;

  const rank = [...RANKS].reverse().find(r => stats.level >= r.min) || RANKS[0];
  const rankIdx = RANKS.findIndex(r => r.name === rank.name);
  const nextRank = RANKS[rankIdx+1];
  const levelBase = Math.pow(stats.level-1, 2) * 25;
  const nextLevelXp = Math.pow(stats.level, 2) * 25;
  const levelPct = Math.max(2, Math.min(100, Math.round(((stats.totalXp - levelBase) / (nextLevelXp-levelBase))*100)));

  return (
    <div>
      <Card theme={theme} style={{ padding: 22, marginBottom: 18, textAlign: "center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background: `radial-gradient(circle at 50% 0%, ${theme.accentSoft}, transparent 65%)` }} />
        <div style={{ position: "relative" }}>
          <div style={{
            width: 84, height: 84, borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, border: `2px solid ${theme.accent}`, background: theme.accentSoft, color: theme.accent, fontFamily: "Cinzel",
          }}>{rank.icon}</div>
          <div style={{ fontFamily: "Cinzel", fontSize: 20, color: theme.text, letterSpacing: 1 }}>{rank.name}</div>
          <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 14 }}>Level {stats.level} {nextRank ? `· ${nextRank.min - stats.level} levels to ${nextRank.name}` : "· Max Rank"}</div>
          <ProgressBar pct={levelPct} theme={theme} height={9} />
          <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 6, fontFamily:"JetBrains Mono" }}>{stats.totalXp} XP</div>
        </div>
      </Card>

      <SectionTitle theme={theme}>Daily Quests</SectionTitle>
      <Card theme={theme} style={{ padding: 6, marginBottom: 18 }}>
        {quests.map((q,i) => {
          const p = questProgress(q); const complete = p >= q.target;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 12px", borderBottom: i<2?`1px solid ${theme.border}`:"none" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, display:"flex", alignItems:"center", justifyContent:"center", background: complete?theme.accentSoft:theme.bgSoft, border:`1px solid ${complete?theme.accent:theme.border}` }}>
                {complete ? <Check size={14} color={theme.accent} /> : <Target size={13} color={theme.textFaint} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: theme.text }}>{q.text}</div>
                <div style={{ marginTop: 5 }}><ProgressBar pct={(p/q.target)*100} theme={theme} height={5} /></div>
              </div>
              <div style={{ fontSize: 11, fontFamily:"JetBrains Mono", color: theme.textMuted }}>{p}/{q.target}</div>
            </div>
          );
        })}
      </Card>

      <SectionTitle theme={theme}>Weekly Challenges</SectionTitle>
      <Card theme={theme} style={{ padding: 6, marginBottom: 18 }}>
        {challenges.map((c,i) => {
          const complete = c.reverse ? c.progress === 0 : c.progress >= c.target;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 12px", borderBottom: i<2?`1px solid ${theme.border}`:"none" }}>
              <Swords size={16} color={complete?theme.gold:theme.textFaint} />
              <div style={{ flex: 1, fontSize: 13, color: theme.text }}>{c.text}</div>
              <div style={{ fontSize: 11, fontFamily:"JetBrains Mono", color: complete?theme.gold:theme.textMuted }}>{complete ? "✓" : `${c.progress}/${c.target || 7}`}</div>
            </div>
          );
        })}
      </Card>

      <SectionTitle theme={theme}>Achievements — {unlockedCount}/{achievements.length}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
        {achievements.map(a => (
          <Card key={a.id} theme={theme} style={{ padding: 12, textAlign: "center", opacity: a.unlocked?1:0.4 }}>
            <div style={{ fontSize: 22, marginBottom: 4, filter: a.unlocked?"none":"grayscale(1)" }}>{a.icon}</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: theme.text }}>{a.name}</div>
            <div style={{ fontSize: 9, color: theme.textFaint, marginTop: 2 }}>{a.desc}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <SectionTitle theme={theme}>Long-Term Goals</SectionTitle>
        <button onClick={onAddGoal} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: theme.accent, padding: "5px 10px", borderRadius: 8, border: `1px solid ${theme.accentSoft}`, background: theme.accentSoft }}>
          <Plus size={13} /> Add Goal
        </button>
      </div>
      {longGoals.length === 0 && (
        <Card theme={theme} style={{ padding: 16, marginBottom: 18 }}>
          <EmptyState theme={theme} text="No long-term goals yet. Set a target and, optionally, a deadline — it stretches until you reach it." icon={Target} />
        </Card>
      )}
      {longGoals.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          {longGoals.map(g => (
            <LongGoalCard key={g.id} goal={g} theme={theme} habits={habits} completions={completions} onIncrement={onIncrementGoal} onDelete={onDeleteGoal} />
          ))}
        </div>
      )}

      <SectionTitle theme={theme}>Recurring Goals</SectionTitle>
      <Card theme={theme} style={{ padding: 16, marginBottom: 18 }}>
        {["daily","weekly","monthly","yearly"].map(period => (
          <div key={period} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: theme.textMuted, marginBottom: 6, textTransform:"capitalize" }}>
              <span>{period} target</span><span style={{ fontFamily:"JetBrains Mono" }}>{goals[period]}%</span>
            </div>
            <input type="range" min={10} max={100} step={5} value={goals[period]}
              onChange={e => setGoals(g => ({...g, [period]: Number(e.target.value)}))}
              style={{ width: "100%", accentColor: theme.accent }} />
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ============================== SETTINGS SCREEN ============================== */
function ToggleRow({ theme, label, sub, value, onChange, timeValue, onTimeChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap: 10, padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, color: theme.text }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 2 }}>{sub}</div>}
      </div>
      {onTimeChange && value && (
        <input type="time" value={timeValue} onChange={e=>onTimeChange(e.target.value)} style={{
          background: theme.card, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 8, fontSize: 12, padding: "4px 6px",
        }} />
      )}
      <button onClick={()=>onChange(!value)} style={{
        width: 44, height: 25, borderRadius: 999, background: value ? theme.accent : theme.border, position:"relative", flexShrink: 0,
      }}>
        <motion.div animate={{ x: value ? 21 : 2 }} style={{ width: 19, height: 19, borderRadius: "50%", background: theme.bg, position:"absolute", top: 3 }} />
      </button>
    </div>
  );
}

function SettingsScreen({ theme, dark, setDark, onExportCSV, onImportCSV, onBackup, onRestore, notif, setNotif }) {
  const fileRef = useRef(); const backupRef = useRef();
  const set = (k,v) => setNotif(n => ({ ...n, [k]: v }));
  return (
    <div>
      <SectionTitle theme={theme}>Appearance</SectionTitle>
      <Card theme={theme} style={{ padding: 16, marginBottom: 18, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
          {dark ? <Moon size={18} color={theme.accent} /> : <Sun size={18} color={theme.accent} />}
          <div style={{ fontSize: 14, color: theme.text }}>{dark ? "Dark Mode" : "Light Mode"}</div>
        </div>
        <button onClick={()=>setDark(d=>!d)} style={{
          width: 50, height: 28, borderRadius: 999, background: dark ? theme.accent : theme.border, position:"relative", transition:"all .2s",
        }}>
          <motion.div animate={{ x: dark ? 24 : 2 }} style={{ width: 22, height: 22, borderRadius: "50%", background: theme.bg, position:"absolute", top: 3 }} />
        </button>
      </Card>

      <SectionTitle theme={theme}>Notifications</SectionTitle>
      <Card theme={theme} style={{ padding: "4px 16px", marginBottom: 8 }}>
        <ToggleRow theme={theme} label="Morning reminder" value={notif.morning} onChange={v=>set("morning",v)} timeValue={notif.morningTime} onTimeChange={v=>set("morningTime",v)} />
        <ToggleRow theme={theme} label="Afternoon reminder" value={notif.afternoon} onChange={v=>set("afternoon",v)} timeValue={notif.afternoonTime} onTimeChange={v=>set("afternoonTime",v)} />
        <ToggleRow theme={theme} label="Evening reminder" value={notif.evening} onChange={v=>set("evening",v)} timeValue={notif.eveningTime} onTimeChange={v=>set("eveningTime",v)} />
        <ToggleRow theme={theme} label="Missed habit reminder" sub="Nudges you about undone habits due today" value={notif.missed} onChange={v=>set("missed",v)} />
        <ToggleRow theme={theme} label="Streak warning" sub="Alerts before a streak breaks" value={notif.streakWarning} onChange={v=>set("streakWarning",v)} />
        <ToggleRow theme={theme} label="Daily summary" sub="End-of-day recap notification" value={notif.dailySummary} onChange={v=>set("dailySummary",v)} />
      </Card>
      <div style={{ fontSize: 11, color: theme.textFaint, marginBottom: 18, padding: "0 4px", display:"flex", gap: 6 }}>
        <Info size={13} style={{ flexShrink:0, marginTop: 1 }} /> Preferences are saved, but actual push delivery needs the app installed via a deployed backend.
      </div>

      <SectionTitle theme={theme}>Data</SectionTitle>
      <Card theme={theme} style={{ padding: 8, marginBottom: 18 }}>
        <SettingsRow theme={theme} icon={Download} label="Export CSV" onClick={onExportCSV} />
        <SettingsRow theme={theme} icon={Upload} label="Import CSV" onClick={()=>fileRef.current.click()} />
        <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={e => e.target.files[0] && onImportCSV(e.target.files[0])} />
        <SettingsRow theme={theme} icon={Download} label="Backup (JSON)" onClick={onBackup} />
        <SettingsRow theme={theme} icon={Upload} label="Restore Backup" onClick={()=>backupRef.current.click()} last />
        <input ref={backupRef} type="file" accept=".json" style={{ display:"none" }} onChange={e => e.target.files[0] && onRestore(e.target.files[0])} />
      </Card>

      <SectionTitle theme={theme}>About</SectionTitle>
      <Card theme={theme} style={{ padding: 16, marginBottom: 18 }}>
        <div style={{ display:"flex", gap: 10, color: theme.textMuted, fontSize: 12.5, lineHeight: 1.7 }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            This build runs fully client-side in your browser session. Sync accounts (Firebase),
            push notifications, and Google Sheets export require a deployed backend and are not
            available in this in-chat preview — use Backup (JSON) to save your data between sessions,
            and reminder times are stored on each habit even though notifications aren't sent here.
          </div>
        </div>
      </Card>
    </div>
  );
}
function SettingsRow({ theme, icon: Icon, label, onClick, last }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display:"flex", alignItems:"center", gap: 12, padding: "13px 10px",
      borderBottom: last?"none":`1px solid ${theme.border}`, color: theme.text,
    }}>
      <Icon size={17} color={theme.accent} /><span style={{ fontSize: 13.5 }}>{label}</span>
      <ChevronRight size={15} color={theme.textFaint} style={{ marginLeft:"auto" }} />
    </button>
  );
}

/* ============================== APP ROOT ============================== */
export default function App() {
  const [dark, setDark] = useState(true);
  const theme = dark ? THEMES.dark : THEMES.light;
  const seeded = useRef(seedHabits()).current;
  const [habits, setHabits] = useState(seeded.habits);
  const [completions, setCompletions] = useState(seeded.completions);
  const [logs, setLogs] = useState(seeded.logs || {});
  const [freezes, setFreezes] = useState({});
  const [notifSettings, setNotifSettings] = useState(DEFAULT_NOTIF_SETTINGS);
  const [tab, setTab] = useState("today");
  const [openHabit, setOpenHabit] = useState(null);
  const [editHabit, setEditHabit] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [goals, setGoals] = useState({ daily: 80, weekly: 75, monthly: 70, yearly: 65 });
  const [longGoals, setLongGoals] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null), 1800); };

  const addLongGoal = g => { setLongGoals(prev => [...prev, g]); setShowGoalForm(false); showToast("Goal created"); };
  const deleteLongGoal = id => setLongGoals(prev => prev.filter(g => g.id !== id));
  const incrementLongGoal = (id, amount) => setLongGoals(prev => prev.map(g => {
    if (g.id !== id) return g;
    const next = Math.max(0, (g.manualProgress||0) + amount);
    if (next >= g.target && (g.manualProgress||0) < g.target) showToast(`Goal reached: ${g.title}`);
    return { ...g, manualProgress: next };
  }));

  const toggleDate = (habitId, ds) => {
    setCompletions(prev => {
      const next = { ...prev };
      const set = new Set(next[habitId] || []);
      if (set.has(ds)) {
        set.delete(ds);
        setLogs(l => { const nl = { ...l, [habitId]: { ...(l[habitId]||{}) } }; delete nl[habitId][ds]; return nl; });
      } else {
        set.add(ds);
        if (ds === todayStr()) {
          const now = new Date();
          const time = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
          setLogs(l => ({ ...l, [habitId]: { ...(l[habitId]||{}), [ds]: { time, note: (l[habitId]||{})[ds]?.note || "" } } }));
          showToast("Habit complete +10 XP");
        }
      }
      next[habitId] = set;
      return next;
    });
  };
  const toggleToday = habitId => toggleDate(habitId, todayStr());
  const addNote = (habitId, ds, note) => {
    setLogs(l => ({ ...l, [habitId]: { ...(l[habitId]||{}), [ds]: { time: (l[habitId]||{})[ds]?.time || "", note } } }));
    showToast("Note saved");
  };
  const useFreeze = (habitId, ds) => {
    setFreezes(f => {
      const cur = f[habitId] || { available: FREEZE_START, used: new Set() };
      if (cur.available <= 0) return f;
      const used = new Set(cur.used); used.add(ds);
      return { ...f, [habitId]: { available: cur.available - 1, used } };
    });
    showToast("Streak freeze applied");
  };

  const saveHabit = h => {
    setHabits(prev => {
      const exists = prev.some(p => p.id === h.id);
      return exists ? prev.map(p => p.id === h.id ? h : p) : [...prev, h];
    });
    setShowForm(false); setEditHabit(null); setOpenHabit(null);
  };
  const deleteHabit = id => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setCompletions(prev => { const n = {...prev}; delete n[id]; return n; });
    setShowForm(false); setEditHabit(null); setOpenHabit(null);
  };
  const archiveHabit = id => setHabits(prev => prev.map(h => h.id===id ? {...h, archived:true} : h));
  const restoreHabit = id => setHabits(prev => prev.map(h => h.id===id ? {...h, archived:false} : h));

  const stats = useMemo(() => {
    const active = habits.filter(h => !h.archived);
    let totalCompletions = 0, bestStreak = 0, perfectDays = 0;
    active.forEach(h => { const s = habitStats(h, completions, freezes); totalCompletions += s.totalDone; bestStreak = Math.max(bestStreak, s.current, s.longest); });
    for (let i=0;i<365;i++) {
      const ds = fmt(addDays(new Date(), -i));
      const due = active.filter(h => isDue(h, ds));
      if (due.length && due.every(h => (completions[h.id]||new Set()).has(ds))) perfectDays++;
    }
    const categoriesUsed = new Set(active.map(h=>h.category)).size;
    const perfectWeeks = Math.floor(perfectDays/7);
    const streakBonusUnits = Math.floor(bestStreak/7);
    const totalXp = totalCompletions*10 + perfectDays*25 + streakBonusUnits*50 + perfectWeeks*100;
    const level = Math.floor(Math.sqrt(totalXp/25)) + 1;
    const avgRate = active.length ? Math.round(active.reduce((a,h)=>a+habitStats(h,completions,freezes).rate,0)/active.length) : 0;
    return { totalCompletions, bestStreak, perfectDays, categoriesUsed, habitCount: active.length, totalXp, level, avgRate };
  }, [habits, completions, freezes]);

  const exportCSV = () => {
    const rows = [["habit","category","type","date","completed"]];
    habits.forEach(h => {
      const set = completions[h.id] || new Set();
      set.forEach(ds => rows.push([h.name, h.category, h.type, ds, "1"]));
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    downloadFile(csv, "habit-tracker-export.csv", "text/csv");
    showToast("CSV exported");
  };
  const importCSV = file => {
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result).split("\n").slice(1).filter(Boolean);
      setHabits(prev => {
        const byName = Object.fromEntries(prev.map(h=>[h.name,h]));
        const newHabits = [...prev];
        setCompletions(pc => {
          const nc = { ...pc };
          lines.forEach(line => {
            const cols = line.match(/(".*?"|[^,]+)/g)?.map(c=>c.replace(/^"|"$/g,"").replace(/""/g,'"')) || [];
            const [name, category, type, ds] = cols;
            if (!name) return;
            let h = byName[name];
            if (!h) {
              h = { id: "h_"+Date.now()+Math.random(), name, category: category||"Other", type: type||"daily",
                emoji: "✨", color: COLOR_SWATCHES[Math.floor(Math.random()*COLOR_SWATCHES.length)],
                days:[0,1,2,3,4,5,6], dayOfMonth:1, notes:"", reminder:"", active:true, archived:false, createdAt: Date.now() };
              byName[name] = h; newHabits.push(h);
            }
            const set = new Set(nc[h.id] || []);
            if (ds) set.add(ds);
            nc[h.id] = set;
          });
          return nc;
        });
        return newHabits;
      });
      showToast("CSV imported");
    };
    reader.readAsText(file);
  };
  const backup = () => {
    const data = JSON.stringify({
      habits, completions: Object.fromEntries(Object.entries(completions).map(([k,v])=>[k,[...v]])),
      logs, goals, longGoals,
    }, null, 2);
    downloadFile(data, "habit-tracker-backup.json", "application/json");
    showToast("Backup saved");
  };
  const restore = file => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        setHabits(data.habits || []);
        setCompletions(Object.fromEntries(Object.entries(data.completions||{}).map(([k,v])=>[k,new Set(v)])));
        if (data.logs) setLogs(data.logs);
        if (data.goals) setGoals(data.goals);
        if (data.longGoals) setLongGoals(data.longGoals);
        showToast("Backup restored");
      } catch { showToast("Invalid backup file"); }
    };
    reader.readAsText(file);
  };

  const NAV = [
    { id: "today", label: "Daily", icon: Zap },
    { id: "habits", label: "Habits", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "quests", label: "Quests", icon: Crown },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "Inter, sans-serif", color: theme.text, transition:"background .3s" }}>
      <style>{FONT_IMPORT}{`
        * { box-sizing: border-box; }
        body { margin:0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 4px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:${theme.accent}; cursor:pointer; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 100px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: "Cinzel", fontSize: 21, letterSpacing: 1, color: theme.text }}>HOLLOW<span style={{color:theme.accent}}>·</span>HABITS</div>
            <div style={{ fontSize: 10.5, color: theme.textFaint, letterSpacing: 0.5, textTransform:"uppercase" }}>Rank: {[...RANKS].reverse().find(r=>stats.level>=r.min)?.name}</div>
          </div>
          <IconBtn icon={dark?Sun:Moon} theme={theme} onClick={()=>setDark(d=>!d)} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={openHabit ? "detail" : tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            {openHabit ? (
              <HabitDetail habit={habits.find(h=>h.id===openHabit.id) || openHabit} completions={completions} theme={theme}
                onBack={()=>setOpenHabit(null)} onEdit={h=>{setEditHabit(h); setShowForm(true);}} onToggleDate={toggleDate} />
            ) : tab === "today" ? (
              <DailyScreen habits={habits} completions={completions} logs={logs} freezes={freezes} theme={theme}
                onToggle={toggleToday} onNote={addNote} onOpen={setOpenHabit} onUseFreeze={useFreeze} stats={stats} goals={goals} />
            ) : tab === "habits" ? (
              <HabitsScreen habits={habits} completions={completions} theme={theme} onOpen={setOpenHabit}
                onArchive={archiveHabit} onRestore={restoreHabit} showArchived={showArchived} setShowArchived={setShowArchived} />
            ) : tab === "analytics" ? (
              <AnalyticsScreen habits={habits} completions={completions} theme={theme} />
            ) : tab === "quests" ? (
              <QuestScreen habits={habits} completions={completions} theme={theme} stats={stats} goals={goals} setGoals={setGoals}
                longGoals={longGoals} onAddGoal={()=>setShowGoalForm(true)} onDeleteGoal={deleteLongGoal} onIncrementGoal={incrementLongGoal} />
            ) : (
              <SettingsScreen theme={theme} dark={dark} setDark={setDark} onExportCSV={exportCSV} onImportCSV={importCSV} onBackup={backup} onRestore={restore}
                notif={notifSettings} setNotif={setNotifSettings} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!openHabit && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 0, zIndex: 40, pointerEvents: "none" }}>
          <div style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
            <button onClick={()=>{setEditHabit(null); setShowForm(true);}} style={{
              position: "absolute", bottom: 92, right: 16, pointerEvents: "auto",
              width: 56, height: 56, borderRadius: "50%", background: theme.accent, color: "#0a0a0f",
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${hexAlpha(theme.accent,0.4)}`, border: "none",
            }}><Plus size={26} strokeWidth={2.5} /></button>
          </div>
        </div>
      )}

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: theme.bgSoft,
        borderTop: `1px solid ${theme.border}`, backdropFilter: "blur(12px)", zIndex: 30,
      }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", padding: "10px 4px 18px" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={()=>{setTab(n.id); setOpenHabit(null);}} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 0",
              color: tab===n.id && !openHabit ? theme.accent : theme.textFaint,
            }}>
              <n.icon size={19} strokeWidth={tab===n.id?2.2:1.8} />
              <span style={{ fontSize: 9.5, fontWeight: 600 }}>{n.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y: 20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }} style={{
            position: "fixed", bottom: 110, left: "50%", transform: "translateX(-50%)", zIndex: 70,
            background: theme.card, border: `1px solid ${theme.accent}`, color: theme.text, padding: "10px 18px",
            borderRadius: 999, fontSize: 12.5, boxShadow: theme.shadow,
          }}>{toast}</motion.div>
        )}
      </AnimatePresence>

      {showForm && (
        <HabitFormModal theme={theme} initial={editHabit} onSave={saveHabit} onClose={()=>{setShowForm(false); setEditHabit(null);}} onDelete={deleteHabit} />
      )}
      {showGoalForm && (
        <LongGoalFormModal theme={theme} habits={habits} onSave={addLongGoal} onClose={()=>setShowGoalForm(false)} />
      )}
    </div>
  );
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
