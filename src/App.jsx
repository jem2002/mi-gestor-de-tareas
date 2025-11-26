import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, AlertTriangle,
  Hourglass, Edit2, X, ChevronDown, ChevronRight, Save, Filter, CheckSquare, Tag,
  Layout, Moon, Sun, Zap, AlertOctagon, Coffee, Play, ListTodo, Timer,
  PanelLeftClose, PanelLeftOpen, RotateCcw, Settings2, ArrowLeft, Pause,
  ChevronLeft, LayoutGrid, List, CalendarDays
} from 'lucide-react';

export default function App() {
  // --- ESTADO GLOBAL ---
  const [currentView, setCurrentView] = useState('tasks');
  const [taskViewMode, setTaskViewMode] = useState('list');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // --- ESTADO DE TAREAS ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('visualTasks');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        title: 'Bienvenido a tu Gestor Local',
        date: new Date().toISOString().split('T')[0],
        time: '',
        tag: 'General',
        completed: false,
        isEvent: false, // Nueva propiedad por defecto
        subtasks: []
      }
    ];
  });

  // --- CONFIGURACIÓN DE TIEMPO ---
  const [workMinutes, setWorkMinutes] = useState(() => {
    const saved = localStorage.getItem('userWorkMinutes');
    return saved ? Number(saved) : 40;
  });

  // --- ESTADO DEL CALENDARIO ---
  const [calendarCursor, setCalendarCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // --- ESTADO DEL FOCUS TIMER ---
  const [focusState, setFocusState] = useState(() => {
    const saved = localStorage.getItem('focusState_v6');
    return saved ? JSON.parse(saved) : {
      workLeft: 40 * 60, restLeft: 10 * 60, initialWork: 40 * 60, initialRest: 10 * 60, mode: 'work', isRunning: false, isSessionActive: false, activeTaskId: null
    };
  });

  // --- ESTADO COMÚN (UI) ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('visualDarkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [isStopSessionModalOpen, setIsStopSessionModalOpen] = useState(false);

  // --- PERSISTENCIA ---
  useEffect(() => { localStorage.setItem('visualTasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('visualDarkMode', JSON.stringify(isDarkMode)); }, [isDarkMode]);
  useEffect(() => { localStorage.setItem('focusState_v6', JSON.stringify(focusState)); }, [focusState]);
  useEffect(() => { localStorage.setItem('userWorkMinutes', String(workMinutes)); }, [workMinutes]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // --- LOGICA DEL TEMPORIZADOR ---
  useEffect(() => {
    let interval = null;
    if (focusState.isRunning && focusState.isSessionActive) {
      interval = setInterval(() => {
        setFocusState(prev => {
          const targetKey = prev.mode === 'work' ? 'workLeft' : 'restLeft';
          const newValue = prev[targetKey] - 1;
          if (newValue < 0) {
            clearInterval(interval);
            return { ...prev, [targetKey]: 0, isRunning: false };
          }
          return { ...prev, [targetKey]: newValue };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusState.isRunning, focusState.mode, focusState.isSessionActive]);

  // --- HELPERS ---
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  const getProgress = (current, total) => total === 0 ? 0 : ((total - current) / total) * 100;

  // --- LÓGICA DE FECHAS ---
  const getCalendarDaysDiff = (dateString) => {
    if (!dateString) return 0;
    try {
      const parts = dateString.split('-');
      const [year, month, day] = parts.map(Number);
      const target = new Date(year, month - 1, day);
      target.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return Math.round((target - today) / (1000 * 60 * 60 * 24));
    } catch { return 0; }
  };

  const getTaskStatus = (task) => {
    if (!task.date) return { statusText: 'Sin fecha', isOverdue: false, days: 0 };
    const days = getCalendarDaysDiff(task.date);
    const now = new Date();
    if (days < 0) return { statusText: `Vencida (${Math.abs(days)}d)`, isOverdue: true, days: days };
    if (days === 0) {
      if (task.time) {
        const [h, m] = task.time.split(':').map(Number);
        const taskDate = new Date();
        taskDate.setHours(h, m, 0, 0);
        taskDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
        if (now > taskDate) return { statusText: `Venció a las ${task.time}`, isOverdue: true, days: 0 };
        return { statusText: `Vence a las ${task.time}`, isOverdue: false, days: 0 };
      }
      return { statusText: 'Vence HOY', isOverdue: false, days: 0 };
    }
    return { statusText: `${days} días restantes`, isOverdue: false, days: days };
  };

  const getUrgencyConfig = (days, isOverdue, isCompleted = false, isEvent = false) => {
    // Lógica especial para Eventos Completados
    if (isCompleted && isEvent) {
      return { type: 'event-done', bgColor: 'bg-slate-100 dark:bg-slate-700', textColor: 'text-slate-400 dark:text-slate-500', icon: <CalendarDays size={18} />, borderColor: 'border-slate-200 dark:border-slate-700' };
    }

    if (isCompleted) return { type: 'completed', bgColor: 'bg-slate-300', textColor: 'text-slate-500', icon: <CheckCircle2 size={18} />, borderColor: 'border-slate-300' };
    if (isOverdue) return { type: 'overdue', bgColor: 'bg-red-700', textColor: 'text-red-800 dark:text-red-400', icon: <AlertOctagon size={18} className="text-red-700 dark:text-red-400" />, borderColor: 'border-red-700' };
    if (days === 0) return { type: 'today', bgColor: 'bg-purple-600', textColor: 'text-purple-700 dark:text-purple-300', icon: <Zap size={18} className="text-purple-600 dark:text-purple-300" />, borderColor: 'border-purple-600' };
    if (days <= 3) return { type: 'critical', bgColor: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400', icon: <AlertCircle size={18} className="text-red-500" />, borderColor: 'border-red-500' };
    if (days <= 9) return { type: 'warning', bgColor: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400', icon: <AlertTriangle size={18} className="text-amber-500" />, borderColor: 'border-amber-500' };
    if (days >= 10 && days <= 21) return { type: 'safe', bgColor: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', icon: <Hourglass size={18} className="text-emerald-500" />, borderColor: 'border-emerald-500' };
    return { type: 'distant', bgColor: 'bg-slate-400', textColor: 'text-slate-500 dark:text-slate-400', icon: <Coffee size={18} className="text-slate-400" />, borderColor: 'border-slate-400' };
  };

  // --- LÓGICA CALENDARIO ---
  const getMonthData = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    return { year, month, daysInMonth, startDayOfWeek };
  };
  const navigateCalendar = (dir) => { setCalendarCursor(p => { const n = new Date(p); n.setMonth(p.getMonth() + dir); return n; }); setSelectedDate(null); };

  // --- HANDLERS CRUD ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('');
  const [newTaskIsEvent, setNewTaskIsEvent] = useState(false); // Nuevo estado para el checkbox

  const [activeFilter, setActiveFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editTag, setEditTag] = useState('');
  const [editIsEvent, setEditIsEvent] = useState(false); // Nuevo estado edición

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [activeTaskIdForSubtask, setActiveTaskIdForSubtask] = useState(null);

  const openCreateModal = () => {
    const d = new Date();
    const l = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    setNewTaskDate(l); setNewTaskTime(''); setNewTaskTitle(''); setNewTaskTag(''); setNewTaskIsEvent(false); setIsModalOpen(true);
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskDate) return;
    setTasks([...tasks, {
      id: Date.now(),
      title: newTaskTitle,
      date: newTaskDate,
      time: newTaskTime,
      tag: newTaskTag,
      isEvent: newTaskIsEvent, // Guardamos si es evento
      completed: false,
      subtasks: []
    }]);
    setIsModalOpen(false);
  };

  const startEditing = (t) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDate(t.date);
    setEditTime(t.time || '');
    setEditTag(t.tag || '');
    setEditIsEvent(t.isEvent || false);
  };

  const saveEdit = (id) => {
    setTasks(tasks.map(t => t.id === id ? {
      ...t, title: editTitle, date: editDate, time: editTime, tag: editTag, isEvent: editIsEvent
    } : t));
    setEditingId(null);
  };

  const initiateDelete = (id) => setTaskToDelete(id);
  const confirmDelete = () => { if (taskToDelete) { setTasks(tasks.filter(t => t.id !== taskToDelete)); setTaskToDelete(null); } };
  const toggleComplete = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const addSubtask = (tid) => { if (!newSubtaskTitle) return; setTasks(tasks.map(t => t.id === tid ? { ...t, subtasks: [...(t.subtasks || []), { id: Date.now(), title: newSubtaskTitle, completed: false }] } : t)); setNewSubtaskTitle(''); setActiveTaskIdForSubtask(null); };
  const toggleSubtask = (tid, sid) => setTasks(tasks.map(t => t.id === tid ? { ...t, subtasks: t.subtasks.map(s => s.id === sid ? { ...s, completed: !s.completed } : s) } : t));
  const deleteSubtask = (tid, sid) => setTasks(tasks.map(t => t.id === tid ? { ...t, subtasks: t.subtasks.filter(s => s.id !== sid) } : t));

  // --- CONTROLES FOCUS ---
  const startSession = () => { if (!focusState.activeTaskId && tasks.length > 0) { const ft = tasks.find(t => !t.completed); if (ft) setFocusState(p => ({ ...p, activeTaskId: ft.id })); } const w = workMinutes * 60, r = (workMinutes / 4) * 60; setFocusState(p => ({ ...p, isSessionActive: true, workLeft: w, restLeft: r, initialWork: w, initialRest: r, mode: 'work', isRunning: true })); };
  const stopSession = () => setIsStopSessionModalOpen(true);
  const confirmStopSession = () => { setFocusState(p => ({ ...p, isSessionActive: false, isRunning: false, mode: 'work' })); setIsStopSessionModalOpen(false); };
  const switchMode = () => setFocusState(p => ({ ...p, mode: p.mode === 'work' ? 'rest' : 'work', isRunning: true }));
  const toggleRun = () => setFocusState(p => ({ ...p, isRunning: !p.isRunning }));

  // --- CALCULOS ---
  const availableTags = [...new Set(tasks.map(t => t.tag).filter(tag => tag && tag.trim() !== ''))];
  const filteredTasks = tasks.filter(t => !t.completed && (activeFilter === 'all' || t.tag === activeFilter));
  const completedTasks = tasks.filter(t => t.completed);
  const sortedActiveTasks = [...filteredTasks].sort((a, b) => {
    const dA = new Date(`${a.date}T${a.time || '23:59:59'}`), dB = new Date(`${b.date}T${b.time || '23:59:59'}`);
    return dA - dB;
  });

  // --- COMPONENTE CALENDARIO ---
  const CalendarMonth = ({ date }) => {
    const { year, month, daysInMonth, startDayOfWeek } = getMonthData(date);
    const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 h-fit">
        <div className="text-center font-bold text-slate-700 dark:text-slate-200 mb-3 capitalize">{monthName} {year}</div>
        <div className="grid grid-cols-7 mb-1">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (<div key={d} className="text-center text-[10px] font-bold text-slate-400">{d}</div>))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(startDayOfWeek).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)].map((day, i) => {
            if (!day) return <div key={`b-${i}`} className="aspect-square"></div>;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // FILTRADO INTELIGENTE EN CALENDARIO:
            // 1. Respeta el filtro de etiqueta activo (activeFilter)
            // 2. Oculta tareas completadas EXCEPTO si son eventos (isEvent = true)
            const dayTasks = tasks.filter(t => {
              const matchesTag = activeFilter === 'all' || t.tag === activeFilter;
              const matchesDate = t.date === dateStr;
              const isVisible = !t.completed || t.isEvent; // Aquí está la magia de "evento persiste"
              return matchesDate && matchesTag && isVisible;
            });

            let dotColor = "", dayTextColor = "text-slate-600 dark:text-slate-400", fontWeight = "font-medium";
            if (dayTasks.length > 0) {
              // Si todas son eventos completados, el color es sutil
              const allEventsDone = dayTasks.every(t => t.completed && t.isEvent);
              const hasPending = dayTasks.some(t => !t.completed);

              if (allEventsDone) {
                dotColor = "bg-slate-300 dark:bg-slate-600"; // Gris para eventos pasados
              } else if (hasPending) {
                const diff = getCalendarDaysDiff(dateStr);
                const config = getUrgencyConfig(diff, diff < 0, false);
                dotColor = config.bgColor;
                if (config.type === 'critical' || config.type === 'overdue') { dayTextColor = "text-red-600 dark:text-red-400"; fontWeight = "font-bold"; }
              }
            }
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            return (
              <button key={day} onClick={() => setSelectedDate(dateStr)} className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-500 z-10' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'} ${isToday && !isSelected ? 'bg-slate-50 dark:bg-slate-700/30 ring-1 ring-slate-300 dark:ring-slate-600' : ''}`}>
                <span className={`text-xs ${isToday ? 'font-black text-indigo-600 dark:text-indigo-400' : dayTextColor} ${fontWeight}`}>{day}</span>
                {dayTasks.length > 0 && <div className={`absolute bottom-1 w-1 h-1 rounded-full ${dotColor}`}></div>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-300">

        <aside className={`bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col justify-between flex-shrink-0 transition-all duration-300 z-50 ${isSidebarCollapsed ? 'w-20' : 'w-20 md:w-64'}`}>
          <div className="p-4">
            <div className={`flex items-center mb-8 text-indigo-600 dark:text-indigo-400 font-bold text-xl overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
              <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'hidden' : 'flex'}`}><div className="min-w-[32px] h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><CheckCircle2 size={20} strokeWidth={3} /></div><span>Mi Gestor</span></div>
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">{isSidebarCollapsed ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}</button>
            </div>
            <nav className="space-y-2">
              <button onClick={() => setCurrentView('tasks')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentView === 'tasks' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}><ListTodo size={24} /><span className={`font-medium ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Tareas</span></button>
              <button onClick={() => setCurrentView('focus')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentView === 'focus' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}><Timer size={24} /><span className={`font-medium ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Enfoque</span></button>
            </nav>
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-700">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}>{isDarkMode ? <Sun size={22} /> : <Moon size={22} />}<span className={`font-medium ${isSidebarCollapsed ? 'hidden' : 'block'}`}>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span></button>
          </div>
        </aside>

        <main className="flex-grow h-screen overflow-y-auto p-4 md:p-8 relative">

          {/* VISTA 1: TAREAS UNIFICADA */}
          {currentView === 'tasks' && (
            <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-300 h-full flex flex-col">
              <header className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Mis Tareas</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Organiza tu día con urgencia visual</p>
                </div>

                {/* TOGGLE LISTA / CALENDARIO */}
                <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex">
                  <button onClick={() => setTaskViewMode('list')} className={`p-2 rounded-lg transition-all ${taskViewMode === 'list' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-600'}`} title="Vista Lista">
                    <List size={20} />
                  </button>
                  <button onClick={() => setTaskViewMode('calendar')} className={`p-2 rounded-lg transition-all ${taskViewMode === 'calendar' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-600'}`} title="Vista Calendario">
                    <CalendarIcon size={20} />
                  </button>
                </div>
              </header>

              {/* BARRA DE FILTROS (Común para ambas vistas) */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 pl-2"><Filter size={16} /> Filtros:</div>
                <div className="flex flex-wrap gap-2 justify-center flex-grow md:justify-start">
                  <button onClick={() => setActiveFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${activeFilter === 'all' ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700 shadow-md' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`}>Todas</button>
                  {availableTags.map(tag => (
                    <button key={tag} onClick={() => setActiveFilter(tag)} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${activeFilter === tag ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700 shadow-sm' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`}>
                      <Tag size={12} /> {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* CONTENIDO SEGÚN MODO */}
              {taskViewMode === 'list' ? (
                <>
                  <div className="space-y-3">
                    {sortedActiveTasks.map(task => {
                      const { statusText, isOverdue, days } = getTaskStatus(task);
                      const style = getUrgencyConfig(days, isOverdue, task.completed, task.isEvent);
                      const isEditing = editingId === task.id;
                      const totalSub = task.subtasks?.length || 0;
                      const completedSub = task.subtasks?.filter(st => st.completed).length || 0;
                      const progress = totalSub === 0 ? 0 : Math.round((completedSub / totalSub) * 100);

                      if (isEditing) {
                        return (
                          <div key={task.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border-2 border-indigo-500 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex flex-col gap-3">
                              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="font-semibold text-lg border-b border-indigo-200 dark:border-indigo-700 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none bg-transparent text-slate-900 dark:text-white" />
                              <div className="flex gap-2 items-center">
                                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="text-sm bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white p-2 rounded border dark:border-slate-600" />
                                <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="text-sm bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white p-2 rounded border dark:border-slate-600" />
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-2 cursor-pointer">
                                  <input type="checkbox" checked={editIsEvent} onChange={(e) => setEditIsEvent(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                                  Evento Fijo
                                </label>
                              </div>
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingId(null)} className="px-3 py-1 text-sm text-slate-500">Cancelar</button>
                                <button onClick={() => saveEdit(task.id)} className="px-4 py-1 text-sm bg-indigo-600 text-white rounded">Guardar</button>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div key={task.id} className="group relative flex flex-col p-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all overflow-hidden">
                          <div className="flex flex-col md:flex-row items-start md:items-center p-3 md:p-4 gap-3 md:gap-4 relative pl-5">
                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${style.bgColor}`}></div>
                            <button onClick={() => toggleComplete(task.id)} className="mt-1 md:mt-0 p-1 rounded-full text-slate-300 dark:text-slate-600 hover:text-indigo-500 transition-colors"><div className="w-5 h-5 border-2 border-current rounded-full"></div></button>
                            <div className="flex-grow min-w-0 w-full">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-base md:text-lg text-slate-800 dark:text-slate-100 break-words leading-tight">{task.title}</h3>
                                    {task.tag && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1 text-slate-600 dark:text-slate-300"><Tag size={10} /> {task.tag}</span>}
                                    {task.isEvent && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"><CalendarIcon size={10} /> Evento</span>}
                                  </div>
                                </div>
                                <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEditing(task)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={16} /></button>
                                  <button onClick={() => setActiveTaskIdForSubtask(activeTaskIdForSubtask === task.id ? null : task.id)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><CheckSquare size={16} /></button>
                                  <button onClick={() => initiateDelete(task.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 size={16} /></button>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs md:text-sm">
                                <span className={`font-medium ${style.textColor} flex items-center gap-1`}>{style.icon} {statusText}</span>
                                <span className="text-slate-400">|</span>
                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><CalendarIcon size={12} /> {new Date(task.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} {task.time && <span>{task.time}</span>}</span>
                                {totalSub > 0 && (
                                  <div className="flex items-center gap-2 ml-auto md:ml-0 md:pl-2 border-l-0 md:border-l border-slate-200 dark:border-slate-600">
                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
                                    <span className="text-[10px] text-slate-400">{completedSub}/{totalSub}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex md:hidden gap-3 w-full justify-end border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                              <button onClick={() => startEditing(task)} className="text-slate-500 dark:text-slate-400"><Edit2 size={16} /></button>
                              <button onClick={() => setActiveTaskIdForSubtask(activeTaskIdForSubtask === task.id ? null : task.id)} className="text-slate-500 dark:text-slate-400"><CheckSquare size={16} /></button>
                              <button onClick={() => initiateDelete(task.id)} className="text-red-500 dark:text-red-400"><Trash2 size={16} /></button>
                            </div>
                          </div>
                          {(totalSub > 0 || activeTaskIdForSubtask === task.id) && (
                            <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 px-4 py-2 pl-12">
                              <div className="space-y-1">
                                {task.subtasks?.map(sub => (
                                  <div key={sub.id} className="flex items-center gap-2 group/sub py-1">
                                    <button onClick={() => toggleSubtask(task.id, sub.id)} className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${sub.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>{sub.completed && <CheckCircle2 size={10} className="text-white" />}</button>
                                    <span className={`text-sm ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{sub.title}</span>
                                    <button onClick={() => deleteSubtask(task.id, sub.id)} className="ml-auto opacity-0 group-hover/sub:opacity-100 text-slate-400 hover:text-red-500"><X size={14} /></button>
                                  </div>
                                ))}
                              </div>
                              {activeTaskIdForSubtask === task.id && (
                                <div className="flex gap-2 mt-2 items-center animate-in slide-in-from-top-2">
                                  <input type="text" className="flex-grow text-xs px-2 py-1.5 rounded border dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white" placeholder="Nueva subtarea..." value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSubtask(task.id)} autoFocus />
                                  <button onClick={() => addSubtask(task.id)} className="text-xs bg-indigo-600 text-white px-2 py-1.5 rounded">Ok</button>
                                </div>
                              )}
                              {!activeTaskIdForSubtask === task.id && totalSub > 0 && <button onClick={() => setActiveTaskIdForSubtask(task.id)} className="text-xs text-indigo-500 hover:underline mt-1 flex items-center gap-1"><Plus size={10} /> Añadir paso</button>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* COMPLETADAS */}
                  {completedTasks.length > 0 && (
                    <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                      <button onClick={() => setShowCompleted(!showCompleted)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium hover:text-indigo-600 text-sm mb-4">
                        {showCompleted ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        Tareas Completadas ({completedTasks.length})
                      </button>
                      {showCompleted && (
                        <div className="space-y-2 animate-in slide-in-from-top-4">
                          {completedTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 opacity-60">
                              <button onClick={() => toggleComplete(task.id)} className="text-indigo-500"><CheckCircle2 size={20} className="fill-current bg-white dark:bg-slate-800 rounded-full" /></button>
                              <div className="flex-grow flex flex-col">
                                <span className="text-slate-500 line-through text-sm">{task.title}</span>
                                {task.isEvent && <span className="text-[10px] text-slate-400 flex items-center gap-1"><CalendarIcon size={10} /> Evento pasado</span>}
                              </div>
                              <button onClick={() => initiateDelete(task.id)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                // --- MODO CALENDARIO INTEGRADO ---
                <div className="flex flex-col md:flex-row gap-6 h-full animate-in fade-in duration-300">
                  {/* COLUMNA IZQUIERDA: CALENDARIO */}
                  <div className="md:w-1/2 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <button onClick={() => navigateCalendar(-1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" /></button>
                        <div className="px-3 py-1.5 font-bold text-slate-700 dark:text-slate-200 text-center text-sm capitalize w-28">{calendarCursor.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</div>
                        <button onClick={() => navigateCalendar(1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><ChevronRight size={18} className="text-slate-600 dark:text-slate-300" /></button>
                      </div>
                    </div>
                    <CalendarMonth date={calendarCursor} />
                  </div>

                  {/* COLUMNA DERECHA: TAREAS DEL DÍA SELECCIONADO */}
                  <div className="md:w-1/2 flex flex-col h-full">
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                      {selectedDate ? (
                        <>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <span>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                            <span className="text-xs font-normal bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                              {tasks.filter(t => {
                                const matchesFilter = activeFilter === 'all' || t.tag === activeFilter;
                                const matchesDate = t.date === selectedDate;
                                // Aquí mostramos TODO lo del día, incluso completadas si son eventos
                                // O si es una tarea completada, ¿queremos verla en la lista lateral?
                                // El usuario dijo: "solo se muestre la tarea de esa etiqueta en ese día".
                                // Asumimos que quiere ver todas las tareas relevantes de ese día (pendientes o eventos completados).
                                return matchesDate && matchesFilter && (!t.completed || t.isEvent);
                              }).length} tareas
                            </span>
                          </h3>
                          <div className="space-y-2 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                            {tasks.filter(t => t.date === selectedDate && (activeFilter === 'all' || t.tag === activeFilter) && (!t.completed || t.isEvent)).length === 0 && (
                              <div className="text-center py-12 text-slate-400 italic">No hay tareas activas o eventos para este filtro.</div>
                            )}
                            {tasks.filter(t => t.date === selectedDate && (activeFilter === 'all' || t.tag === activeFilter) && (!t.completed || t.isEvent)).map(task => {
                              const { statusText, isOverdue, days } = getTaskStatus(task);
                              const style = getUrgencyConfig(days, isOverdue, task.completed, task.isEvent);
                              return (
                                <div key={task.id} className={`group flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border transition-all hover:shadow-sm ${task.completed ? 'border-slate-200 dark:border-slate-700 opacity-60' : 'border-slate-200 dark:border-slate-600'}`}>
                                  <button onClick={() => toggleComplete(task.id)} className={`${task.completed ? 'text-indigo-500' : 'text-slate-300 hover:text-indigo-500'}`}>
                                    <CheckCircle2 size={20} className={task.completed ? "fill-current bg-white dark:bg-slate-800 rounded-full" : ""} />
                                  </button>
                                  <div className="flex-grow min-w-0">
                                    <div className={`font-medium truncate ${task.completed ? 'text-slate-500' : 'text-slate-800 dark:text-white'} ${task.completed && !task.isEvent ? 'line-through' : ''}`}>{task.title}</div>
                                    <div className="flex items-center gap-2 text-xs mt-0.5">
                                      <span className={`font-bold ${style.textColor} flex items-center gap-1`}>{(!task.completed || task.isEvent) && style.icon} {task.completed ? (task.isEvent ? 'Evento Pasado' : 'Listo') : statusText}</span>
                                      {task.time && <span className="text-slate-400 flex items-center gap-0.5">| {task.time}</span>}
                                    </div>
                                  </div>
                                  <button onClick={() => initiateDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-2 transition-opacity"><Trash2 size={16} /></button>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <CalendarIcon size={48} className="mb-4 opacity-20" />
                          <p>Selecciona un día en el calendario</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button onClick={openCreateModal} className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-400 dark:shadow-indigo-900/50 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-40 group"><Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" /></button>
            </div>
          )}

          {/* VISTA 2: ENFOQUE (IGUAL) */}
          {currentView === 'focus' && (
            <div className="max-w-2xl mx-auto pb-24 h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
              {!focusState.isSessionActive ? (
                <div className="flex flex-col justify-center h-full max-h-[80vh] p-4">
                  {/* SETUP VIEW */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                      <Timer size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Configura tu Sesión</h1>
                    <p className="text-slate-500 dark:text-slate-400">Define tu objetivo y tiempo de enfoque.</p>
                  </div>
                  <div className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">1. ¿En qué vas a trabajar?</label>
                      <div className="relative">
                        <select value={focusState.activeTaskId || ''} onChange={(e) => setFocusState({ ...focusState, activeTaskId: Number(e.target.value) })} className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border-none outline-none text-slate-800 dark:text-white font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500">
                          <option value="" disabled>Selecciona una tarea...</option>
                          {(() => {
                            const pending = tasks.filter(t => !t.completed);
                            const groups = { overdue: [], today: [], critical: [], warning: [], safe: [], distant: [] };
                            pending.forEach(task => {
                              const { isOverdue, days } = getTaskStatus(task);
                              const label = `${task.title} (${isOverdue ? `Vencida ${Math.abs(days)}d` : days === 0 ? 'HOY' : `${days}d`})`;
                              const item = { ...task, label };
                              if (isOverdue) groups.overdue.push(item);
                              else if (days === 0) groups.today.push(item);
                              else if (days <= 3) groups.critical.push(item);
                              else if (days <= 9) groups.warning.push(item);
                              else if (days <= 21) groups.safe.push(item);
                              else groups.distant.push(item);
                            });
                            return (
                              <>
                                {groups.overdue.length > 0 && <optgroup label="🔴 Vencidas">{groups.overdue.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</optgroup>}
                                {groups.today.length > 0 && <optgroup label="🟣 Para Hoy">{groups.today.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</optgroup>}
                                {groups.critical.length > 0 && <optgroup label="🔴 Crítico (1-3 días)">{groups.critical.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</optgroup>}
                                {groups.warning.length > 0 && <optgroup label="🟠 Atención (4-9 días)">{groups.warning.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</optgroup>}
                                {groups.safe.length > 0 && <optgroup label="🟢 A tiempo (10+ días)">{groups.safe.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</optgroup>}
                                {groups.distant.length > 0 && <optgroup label="⚪ Futuro">{groups.distant.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</optgroup>}
                              </>
                            );
                          })()}
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={20} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">2. Tiempo de Enfoque (Minutos)</label>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-grow">
                          <input type="number" min="1" value={workMinutes} onChange={(e) => setWorkMinutes(Math.max(1, Number(e.target.value)))} className="w-full p-4 text-2xl font-bold bg-slate-50 dark:bg-slate-700 rounded-xl border-none outline-none text-slate-800 dark:text-white text-center focus:ring-2 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                          <span className="absolute right-4 top-5 text-sm text-slate-400 font-medium">min</span>
                        </div>
                        <div className="flex flex-col items-center px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase">Descanso</span>
                          <span className="text-xl font-bold text-amber-700 dark:text-amber-300">+{Math.floor(workMinutes / 4)}m</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={startSession} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"><Play size={24} fill="currentColor" /> Iniciar Sesión</button>
                  </div>
                </div>
              ) : (
                // --- ACTIVE SESSION VIEW ---
                <div className="flex flex-col h-full">
                  <header className="mb-6 flex items-center justify-between">
                    <button onClick={stopSession} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-sm font-medium"><ArrowLeft size={18} /> Configuración</button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wide"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>En curso</div>
                  </header>
                  <div className="text-center mb-8">
                    <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">Foco Actual</h2>
                    <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white px-4">{tasks.find(t => t.id === focusState.activeTaskId)?.title || "Tarea sin título"}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className={`relative overflow-hidden p-6 rounded-3xl border-2 transition-all duration-300 ${focusState.mode === 'work' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-lg scale-105 z-10' : 'bg-white dark:bg-slate-800 border-transparent opacity-60'}`}>
                      <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 relative z-10"><Zap size={20} /><span className="font-bold uppercase text-xs tracking-wider">Trabajo</span></div>
                      <div className="text-6xl font-mono font-bold text-slate-900 dark:text-white mb-2 relative z-10 tracking-tighter">{formatTime(focusState.workLeft)}</div>
                      <div className="absolute bottom-0 left-0 h-1.5 bg-indigo-500 transition-all duration-1000" style={{ width: `${getProgress(focusState.workLeft, focusState.initialWork)}%` }}></div>
                    </div>
                    <div className={`relative overflow-hidden p-6 rounded-3xl border-2 transition-all duration-300 ${focusState.mode === 'rest' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 shadow-lg scale-105 z-10' : 'bg-white dark:bg-slate-800 border-transparent opacity-60'}`}>
                      <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400 relative z-10"><Coffee size={20} /><span className="font-bold uppercase text-xs tracking-wider">Descanso</span></div>
                      <div className="text-6xl font-mono font-bold text-slate-900 dark:text-white mb-2 relative z-10 tracking-tighter">{formatTime(focusState.restLeft)}</div>
                      <div className="absolute bottom-0 left-0 h-1.5 bg-amber-500 transition-all duration-1000" style={{ width: `${getProgress(focusState.restLeft, focusState.initialRest)}%` }}></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 mt-auto">
                    <button onClick={switchMode} className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${focusState.mode === 'work' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 dark:shadow-amber-900/30' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-indigo-900/30'}`}>
                      {focusState.mode === 'work' ? <><Coffee size={24} /> ¡Tomar Descanso!</> : <><Zap size={24} /> ¡Volver al Trabajo!</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>

        {/* Modales... (Sin cambios) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border dark:border-slate-700">
              <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><Plus className="text-indigo-600 dark:text-indigo-400" size={20} /> Nueva Tarea</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <form onSubmit={addTask} className="p-6 space-y-4">
                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">¿Qué hay que hacer?</label><input type="text" placeholder="Ej: Revisar presupuesto..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none text-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" autoFocus /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Fecha Límite</label><input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" /></div>
                  <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Hora (Opcional)</label><input type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" /></div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Etiqueta</label>
                  <input type="text" placeholder="Ej: Trabajo, Personal..." value={newTaskTag} list="tags-list-modal" onChange={(e) => setNewTaskTag(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" />
                  <datalist id="tags-list-modal">{availableTags.map(tag => <option key={tag} value={tag} />)}</datalist>
                </div>
                {/* NUEVO CHECKBOX PARA EVENTO */}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isEvent" checked={newTaskIsEvent} onChange={(e) => setNewTaskIsEvent(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
                  <label htmlFor="isEvent" className="text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer">Marcar como Evento Fijo (Persiste al completar)</label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all">Cancelar</button>
                  <button type="submit" disabled={!newTaskTitle || !newTaskDate} className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:shadow-none transition-all">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {taskToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border dark:border-slate-700">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="text-red-600" size={24} /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">¿Borrar tarea?</h3>
              <div className="flex gap-3 mt-6"><button onClick={() => setTaskToDelete(null)} className="flex-1 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Cancelar</button><button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold shadow-lg">Sí, Borrar</button></div>
            </div>
          </div>
        )}

        {isStopSessionModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border dark:border-slate-700">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-amber-600 dark:text-amber-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">¿Salir de la sesión?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                El cronómetro se detendrá y volverás a la pantalla de configuración.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsStopSessionModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium">Cancelar</button>
                <button onClick={confirmStopSession} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-all">Salir</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}