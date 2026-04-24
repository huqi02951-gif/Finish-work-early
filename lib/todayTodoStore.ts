import { useEffect, useState } from 'react';

export type TodoUrgency = 'urgent' | 'nobody_cares' | 'not_my_biz' | 'guess_who' | 'unset';

export interface TodoItem {
  id: number;
  text: string;
  done: boolean;
  /** 打工人分组，默认 unset */
  urgency: TodoUrgency;
}

export interface TodoStats {
  total: number;
  done: number;
  rate: number;
}

const KEY_PREFIX = 'cl_today_todos';
const CHANGE_EVENT = 'fwe:today-todos-change';

function todayKey() {
  return `${KEY_PREFIX}_${new Date().toDateString()}`;
}

function readTodos(): TodoItem[] {
  try {
    const raw = localStorage.getItem(todayKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTodos(todos: TodoItem[]) {
  localStorage.setItem(todayKey(), JSON.stringify(todos));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: todos }));
}

function computeStats(todos: TodoItem[]): TodoStats {
  const done = todos.filter((t) => t.done).length;
  return {
    total: todos.length,
    done,
    rate: todos.length === 0 ? 0 : done / todos.length,
  };
}

export const todayTodoStore = {
  get: readTodos,
  stats(): TodoStats {
    return computeStats(readTodos());
  },
  add(text: string, urgency: TodoUrgency = 'unset') {
    const trimmed = text.trim();
    if (!trimmed) return;
    const todos = readTodos();
    todos.push({ id: Date.now(), text: trimmed, done: false, urgency });
    writeTodos(todos);
  },
  setUrgency(id: number, urgency: TodoUrgency) {
    writeTodos(
      readTodos().map((t) => (t.id === id ? { ...t, urgency } : t)),
    );
  },
  toggle(id: number) {
    writeTodos(
      readTodos().map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  },
  markDone(id: number) {
    const todos = readTodos();
    const target = todos.find((t) => t.id === id);
    if (!target || target.done) return;
    writeTodos(todos.map((t) => (t.id === id ? { ...t, done: true } : t)));
  },
  remove(id: number) {
    writeTodos(readTodos().filter((t) => t.id !== id));
  },
};

export function useTodayTodos(): TodoItem[] {
  const [todos, setTodos] = useState<TodoItem[]>(() => readTodos());
  useEffect(() => {
    const sync = () => setTodos(readTodos());
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<TodoItem[]>).detail;
      setTodos(Array.isArray(detail) ? detail : readTodos());
    };
    window.addEventListener(CHANGE_EVENT, onCustom as EventListener);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onCustom as EventListener);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return todos;
}

export function useTodayTodoStats(): TodoStats {
  const todos = useTodayTodos();
  return computeStats(todos);
}
