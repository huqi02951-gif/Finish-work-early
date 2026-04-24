import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Flame, Package2, MessageSquareWarning, Lock,
  Clock, Plus, X, Send, AlertTriangle, Zap, Eye,
  ShieldCheck, Ghost,
} from 'lucide-react';
import CyberLayout from '../../components/layout/CyberLayout';
import { cn } from '../../../lib/utils';

// ═══════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════
const SK = {
  BURN:     'fwe:pantry:burn',      // 焚信墙
  MARKET:   'fwe:pantry:market',    // 黑市
  GOSSIP:   'fwe:pantry:gossip',    // 流言
  DROP:     'fwe:pantry:drop',      // 密信
  CODENAME: 'fwe:pantry:codename',  // 匿名代号
  UNLOCKED: 'fwe:pantry:unlocked',  // 握手完成标记
};

interface BurnMsg    { id: string; text: string; author: string; createdAt: number; expireAt: number; }
interface MarketItem { id: string; title: string; price: string; tag: string; note: string; author: string; createdAt: number; expireAt: number; }
interface Gossip     { id: string; text: string; author: string; createdAt: number; heat: number; threshold: number; }
interface DropMsg    { id: string; text: string; to: string; author: string; createdAt: number; expireAt: number; }

function readArr<T>(key: string): T[] {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function writeArr<T>(key: string, arr: T[]) { localStorage.setItem(key, JSON.stringify(arr)); }
function uid() { return Math.random().toString(36).slice(2, 10); }
function genCodename() {
  const adj = ['Ghost', 'Shadow', 'Phantom', 'Rogue', 'Silent', 'Wraith', 'Cipher', 'Raven', 'Echo', 'Null'];
  const n = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${adj[Math.floor(Math.random() * adj.length)]}_${n}`;
}
function getCodename(): string {
  const existing = localStorage.getItem(SK.CODENAME);
  if (existing) return existing;
  const fresh = genCodename();
  localStorage.setItem(SK.CODENAME, fresh);
  return fresh;
}

// ═══════════════════════════════════════════════════════════════
// ACCESS GATE — 进入仪式
// ═══════════════════════════════════════════════════════════════
const HANDSHAKE_LINES = [
  '> INIT pantry.dat ...',
  '> Generating ephemeral key-pair ...',
  '> Rotating Tor circuit ...',
  '> Establishing E2E channel ...',
  '> Verifying codename integrity ...',
  '> Shredding session history ...',
  '> ACCESS GRANTED. Welcome to the backroom.',
];

const AccessGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (step >= HANDSHAKE_LINES.length) {
      const t = setTimeout(onUnlock, 600);
      return () => clearTimeout(t);
    }
    const line = HANDSHAKE_LINES[step];
    let i = 0;
    setTyped('');
    const typer = setInterval(() => {
      i++;
      setTyped(line.slice(0, i));
      if (i >= line.length) {
        clearInterval(typer);
        setTimeout(() => setStep((s) => s + 1), 250);
      }
    }, 22);
    return () => clearInterval(typer);
  }, [step, onUnlock]);

  return (
    <div className="min-h-screen bg-black text-[#00ff41] font-mono flex items-center justify-center px-6">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 mb-6 text-[#00ff41]/70">
          <Lock className="w-4 h-4" />
          <span className="text-[11px] tracking-widest uppercase">Secure Handshake</span>
        </div>
        <div className="border border-[#00ff41]/30 bg-[#00ff41]/[0.02] rounded-lg p-5 min-h-[240px]">
          {HANDSHAKE_LINES.slice(0, step).map((l, i) => (
            <p key={i} className="text-[12px] leading-relaxed text-[#00ff41]/80">{l}</p>
          ))}
          {step < HANDSHAKE_LINES.length && (
            <p className="text-[12px] leading-relaxed text-[#00ff41]">
              {typed}<span className="animate-pulse">█</span>
            </p>
          )}
        </div>
        <p className="mt-5 text-[10px] text-[#00ff41]/40 leading-relaxed">
          {'>>'} 本区消息不落后端，不上云，全部仅存于本地。过期即焚，断网即消。
        </p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const formatRemain = (ms: number) => {
  if (ms <= 0) return 'BURNED';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${ss.toString().padStart(2, '0')}s`;
  return `${ss}s`;
};

// ═══════════════════════════════════════════════════════════════
// MODULE 1 · BURN WALL（焚信墙）— 匿名吐槽，N 分钟后焚毁
// ═══════════════════════════════════════════════════════════════
const BURN_PRESETS = [
  { label: '5 分钟', mins: 5 },
  { label: '30 分钟', mins: 30 },
  { label: '2 小时', mins: 120 },
];

const BurnWall: React.FC<{ codename: string; now: number }> = ({ codename, now }) => {
  const [msgs, setMsgs] = useState<BurnMsg[]>(() => readArr<BurnMsg>(SK.BURN));
  const [input, setInput] = useState('');
  const [ttlMin, setTtlMin] = useState(30);

  useEffect(() => {
    const alive = msgs.filter((m) => m.expireAt > now);
    if (alive.length !== msgs.length) {
      setMsgs(alive);
      writeArr(SK.BURN, alive);
    }
  }, [now, msgs]);

  const post = () => {
    const text = input.trim();
    if (!text) return;
    const entry: BurnMsg = {
      id: uid(),
      text,
      author: codename,
      createdAt: Date.now(),
      expireAt: Date.now() + ttlMin * 60_000,
    };
    const next = [entry, ...msgs];
    setMsgs(next);
    writeArr(SK.BURN, next);
    setInput('');
  };

  return (
    <div className="space-y-3">
      <div className="border border-red-500/30 bg-red-500/[0.04] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3 text-red-400">
          <Flame className="w-3.5 h-3.5" />
          <span className="text-[10px] tracking-widest uppercase font-bold">New Burn · 说完就忘</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="今天这个客户真的……（别激动，发完会自动焚毁）"
          rows={3}
          className="w-full bg-black border border-red-500/20 text-red-300 placeholder-red-500/30 text-[12px] leading-relaxed rounded-md px-3 py-2 outline-none focus:border-red-500/60 resize-none font-mono"
        />
        <div className="flex items-center gap-2 mt-3">
          <div className="flex gap-1.5">
            {BURN_PRESETS.map((p) => (
              <button
                key={p.mins}
                onClick={() => setTtlMin(p.mins)}
                className={cn(
                  'px-2.5 py-1 rounded text-[10px] font-bold border transition-colors',
                  ttlMin === p.mins
                    ? 'bg-red-500/20 text-red-300 border-red-500/60'
                    : 'bg-transparent text-red-400/60 border-red-500/20 hover:border-red-500/40'
                )}>
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={post}
            disabled={!input.trim()}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] font-bold rounded hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed">
            <Zap className="w-3 h-3" /> 扔出去
          </button>
        </div>
      </div>

      {msgs.length === 0 ? (
        <div className="text-center py-10 text-[#00ff41]/30 text-[11px] font-mono">
          [ 墙上干净 · 没人吐槽 ]
        </div>
      ) : (
        <div className="space-y-2">
          {msgs.map((m) => {
            const remain = m.expireAt - now;
            const totalTtl = m.expireAt - m.createdAt;
            const pct = Math.max(0, Math.min(100, (remain / totalTtl) * 100));
            return (
              <div key={m.id} className="border border-[#00ff41]/15 bg-black/40 rounded-md p-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-px bg-red-500/60" style={{ width: `${pct}%` }} />
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <span className="text-[10px] font-bold text-[#00ff41]/50">{m.author}</span>
                  <span className="text-[10px] font-mono text-red-400/70 flex items-center gap-1 shrink-0">
                    <Flame className="w-2.5 h-2.5" /> {formatRemain(remain)}
                  </span>
                </div>
                <p className="text-[12px] text-[#00ff41]/85 leading-relaxed whitespace-pre-wrap break-words">{m.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MODULE 2 · BLACK MARKET（黑市）— 金融打工人二手
// ═══════════════════════════════════════════════════════════════
const MARKET_TAGS = ['工牌挂绳', '奢侈品', '培训资料', '面试题', '内推', '伴手礼', '代打卡', '其他'];

const BlackMarket: React.FC<{ codename: string; now: number }> = ({ codename, now }) => {
  const [items, setItems] = useState<MarketItem[]>(() => readArr<MarketItem>(SK.MARKET));
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ title: '', price: '', tag: MARKET_TAGS[0], note: '' });

  useEffect(() => {
    const alive = items.filter((i) => i.expireAt > now);
    if (alive.length !== items.length) {
      setItems(alive);
      writeArr(SK.MARKET, alive);
    }
  }, [now, items]);

  const list = () => {
    if (!draft.title.trim()) return;
    const entry: MarketItem = {
      id: uid(),
      title: draft.title.trim(),
      price: draft.price.trim() || '私聊',
      tag: draft.tag,
      note: draft.note.trim(),
      author: codename,
      createdAt: Date.now(),
      expireAt: Date.now() + 7 * 24 * 3600_000, // 7 天
    };
    const next = [entry, ...items];
    setItems(next);
    writeArr(SK.MARKET, next);
    setDraft({ title: '', price: '', tag: MARKET_TAGS[0], note: '' });
    setShowForm(false);
  };

  const revoke = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    writeArr(SK.MARKET, next);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#00ff41]/5 border border-[#00ff41]/30 text-[#00ff41] rounded-md hover:bg-[#00ff41]/10 transition-colors text-[11px] font-bold">
        {showForm ? <><X className="w-3 h-3" /> 收起挂单</> : <><Plus className="w-3 h-3" /> 挂一个 · 出货 / 求购</>}
      </button>

      {showForm && (
        <div className="border border-[#00ff41]/30 bg-[#00ff41]/[0.03] rounded-lg p-4 space-y-2.5">
          <input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="标题：e.g. 九成新 LV 女士钱包，上家客户送的"
            className="w-full bg-black border border-[#00ff41]/20 text-[#00ff41] placeholder-[#00ff41]/30 text-[12px] rounded-md px-3 py-2 outline-none focus:border-[#00ff41]/60"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={draft.price}
              onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
              placeholder="价格 / 交换方式"
              className="bg-black border border-[#00ff41]/20 text-[#00ff41] placeholder-[#00ff41]/30 text-[12px] rounded-md px-3 py-2 outline-none focus:border-[#00ff41]/60"
            />
            <select
              value={draft.tag}
              onChange={(e) => setDraft((d) => ({ ...d, tag: e.target.value }))}
              className="bg-black border border-[#00ff41]/20 text-[#00ff41] text-[12px] rounded-md px-3 py-2 outline-none focus:border-[#00ff41]/60">
              {MARKET_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <textarea
            value={draft.note}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
            placeholder="补充说明 / 暗号联系方式（挂 7 天自动下架）"
            rows={2}
            className="w-full bg-black border border-[#00ff41]/20 text-[#00ff41] placeholder-[#00ff41]/30 text-[12px] rounded-md px-3 py-2 outline-none focus:border-[#00ff41]/60 resize-none"
          />
          <button
            onClick={list}
            disabled={!draft.title.trim()}
            className="w-full py-2 bg-[#00ff41]/20 border border-[#00ff41]/60 text-[#00ff41] text-[11px] font-bold rounded hover:bg-[#00ff41]/30 disabled:opacity-40">
            上架 ▸
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-10 text-[#00ff41]/30 text-[11px] font-mono">
          [ 黑市空空如也 · 没人挂货 ]
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="border border-[#00ff41]/15 bg-black/40 rounded-md p-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 bg-[#00ff41]/10 border border-[#00ff41]/30 text-[#00ff41] text-[9px] font-bold rounded">
                      {it.tag}
                    </span>
                    <span className="text-[10px] text-[#00ff41]/40">{it.author}</span>
                  </div>
                  <h4 className="text-[13px] font-bold text-[#00ff41] leading-snug">{it.title}</h4>
                </div>
                <span className="text-[13px] font-black text-amber-400 tabular-nums shrink-0">{it.price}</span>
              </div>
              {it.note && <p className="text-[11px] text-[#00ff41]/60 leading-relaxed whitespace-pre-wrap break-words mb-2">{it.note}</p>}
              <div className="flex items-center justify-between pt-2 border-t border-[#00ff41]/10">
                <span className="text-[10px] text-[#00ff41]/30 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {formatRemain(it.expireAt - now)} 后下架
                </span>
                {it.author === codename && (
                  <button onClick={() => revoke(it.id)} className="text-[10px] text-red-400/60 hover:text-red-400">
                    撤货
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MODULE 3 · GOSSIP VAULT（流言）— 匿名爆料，热度越高越快暴露
// ═══════════════════════════════════════════════════════════════
const GossipVault: React.FC<{ codename: string; now: number }> = ({ codename, now }) => {
  const [list, setList] = useState<Gossip[]>(() => readArr<Gossip>(SK.GOSSIP));
  const [input, setInput] = useState('');

  // clean up overheated gossip (auto-destruct)
  useEffect(() => {
    const alive = list.filter((g) => g.heat < g.threshold);
    if (alive.length !== list.length) {
      setList(alive);
      writeArr(SK.GOSSIP, alive);
    }
  }, [list, now]);

  const post = () => {
    const text = input.trim();
    if (!text) return;
    const entry: Gossip = {
      id: uid(),
      text,
      author: codename,
      createdAt: Date.now(),
      heat: 0,
      threshold: 10 + Math.floor(Math.random() * 20), // 10-30 次吃瓜后自毁
    };
    const next = [entry, ...list];
    setList(next);
    writeArr(SK.GOSSIP, next);
    setInput('');
  };

  const bump = (id: string) => {
    const next = list.map((g) => g.id === id ? { ...g, heat: g.heat + 1 } : g);
    setList(next);
    writeArr(SK.GOSSIP, next);
  };

  return (
    <div className="space-y-3">
      <div className="border border-purple-500/30 bg-purple-500/[0.04] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3 text-purple-400">
          <MessageSquareWarning className="w-3.5 h-3.5" />
          <span className="text-[10px] tracking-widest uppercase font-bold">Leak · 热度越高越快消失</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="听说 X 行长秋招前两周还在谈离职……（爆料越多人吃瓜越快蒸发）"
          rows={3}
          className="w-full bg-black border border-purple-500/20 text-purple-300 placeholder-purple-500/30 text-[12px] leading-relaxed rounded-md px-3 py-2 outline-none focus:border-purple-500/60 resize-none font-mono"
        />
        <button
          onClick={post}
          disabled={!input.trim()}
          className="mt-3 w-full py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-bold rounded hover:bg-purple-500/30 disabled:opacity-40">
          丢进流言池 ▸
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-10 text-[#00ff41]/30 text-[11px] font-mono">
          [ 流言池干涸 · 无瓜可吃 ]
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((g) => {
            const pct = (g.heat / g.threshold) * 100;
            const danger = pct > 70;
            return (
              <div key={g.id} className={cn(
                'border rounded-md p-3 relative overflow-hidden transition-colors',
                danger ? 'border-red-500/40 bg-red-500/[0.06]' : 'border-purple-500/20 bg-black/40'
              )}>
                <p className="text-[12px] text-[#00ff41]/85 leading-relaxed whitespace-pre-wrap break-words mb-3">{g.text}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#00ff41]/40">{g.author}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1 bg-black border border-purple-500/20 rounded overflow-hidden">
                      <div className={cn('h-full transition-all', danger ? 'bg-red-500' : 'bg-purple-500')} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-purple-400/70 tabular-nums">{g.heat}/{g.threshold}</span>
                    <button
                      onClick={() => bump(g.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold rounded hover:bg-purple-500/20">
                      <Eye className="w-2.5 h-2.5" /> 吃瓜
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MODULE 4 · DEAD DROP（密信）— 定时销毁的留言
// ═══════════════════════════════════════════════════════════════
const DeadDrop: React.FC<{ codename: string; now: number }> = ({ codename, now }) => {
  const [list, setList] = useState<DropMsg[]>(() => readArr<DropMsg>(SK.DROP));
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ text: '', to: '', ttlHours: 24 });

  useEffect(() => {
    const alive = list.filter((d) => d.expireAt > now);
    if (alive.length !== list.length) {
      setList(alive);
      writeArr(SK.DROP, alive);
    }
  }, [list, now]);

  const drop = () => {
    if (!draft.text.trim()) return;
    const entry: DropMsg = {
      id: uid(),
      text: draft.text.trim(),
      to: draft.to.trim() || '无名氏',
      author: codename,
      createdAt: Date.now(),
      expireAt: Date.now() + draft.ttlHours * 3600_000,
    };
    const next = [entry, ...list];
    setList(next);
    writeArr(SK.DROP, next);
    setDraft({ text: '', to: '', ttlHours: 24 });
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500/5 border border-amber-500/30 text-amber-300 rounded-md hover:bg-amber-500/10 transition-colors text-[11px] font-bold">
        {showForm ? <><X className="w-3 h-3" /> 收起</> : <><Send className="w-3 h-3" /> 投下一封密信</>}
      </button>

      {showForm && (
        <div className="border border-amber-500/30 bg-amber-500/[0.03] rounded-lg p-4 space-y-2.5">
          <input
            value={draft.to}
            onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
            placeholder="收件方代号（留空=给所有人）"
            className="w-full bg-black border border-amber-500/20 text-amber-300 placeholder-amber-500/30 text-[12px] rounded-md px-3 py-2 outline-none focus:border-amber-500/60"
          />
          <textarea
            value={draft.text}
            onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
            placeholder="写给未来的自己 / 写给陌生打工人 / 不能说出口的话"
            rows={4}
            className="w-full bg-black border border-amber-500/20 text-amber-300 placeholder-amber-500/30 text-[12px] leading-relaxed rounded-md px-3 py-2 outline-none focus:border-amber-500/60 resize-none"
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-amber-400/60 font-bold">销毁倒计时：</span>
            {[1, 6, 24, 72].map((h) => (
              <button
                key={h}
                onClick={() => setDraft((d) => ({ ...d, ttlHours: h }))}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold border',
                  draft.ttlHours === h
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                    : 'bg-transparent text-amber-400/50 border-amber-500/20'
                )}>
                {h}h
              </button>
            ))}
          </div>
          <button
            onClick={drop}
            disabled={!draft.text.trim()}
            className="w-full py-2 bg-amber-500/20 border border-amber-500/60 text-amber-300 text-[11px] font-bold rounded hover:bg-amber-500/30 disabled:opacity-40">
            投递 ▸
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <div className="text-center py-10 text-[#00ff41]/30 text-[11px] font-mono">
          [ 邮筒里什么都没有 ]
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((d) => (
            <div key={d.id} className="border border-amber-500/20 bg-black/40 rounded-md p-3">
              <div className="flex items-center justify-between mb-2 text-[10px] font-mono">
                <span className="text-[#00ff41]/50">
                  <span className="text-amber-400/70">{d.author}</span> → <span className="text-amber-400/70">{d.to}</span>
                </span>
                <span className="text-amber-400/70 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {formatRemain(d.expireAt - now)}
                </span>
              </div>
              <p className="text-[12px] text-[#00ff41]/85 leading-relaxed whitespace-pre-wrap break-words">{d.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
type Tab = 'burn' | 'market' | 'gossip' | 'drop';

const TABS: { id: Tab; label: string; sub: string; icon: React.FC<{ className?: string }>; color: string }[] = [
  { id: 'burn',   label: '焚信墙',   sub: 'Burn Wall',     icon: Flame,               color: 'text-red-400' },
  { id: 'market', label: '黑市',     sub: 'Black Market',  icon: Package2,            color: 'text-[#00ff41]' },
  { id: 'gossip', label: '流言池',   sub: 'Gossip Vault',  icon: MessageSquareWarning, color: 'text-purple-400' },
  { id: 'drop',   label: '密信',     sub: 'Dead Drop',     icon: Send,                color: 'text-amber-300' },
];

const PantryPage: React.FC = () => {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(SK.UNLOCKED) === '1');
  const [codename] = useState(() => getCodename());
  const [tab, setTab] = useState<Tab>('burn');
  const [now, setNow] = useState(() => Date.now());
  const tickerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!unlocked) return;
    tickerRef.current = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, [unlocked]);

  const handleUnlock = () => {
    localStorage.setItem(SK.UNLOCKED, '1');
    setUnlocked(true);
  };

  const counts = useMemo(() => {
    const burn   = readArr<BurnMsg>(SK.BURN).filter((m) => m.expireAt > now).length;
    const market = readArr<MarketItem>(SK.MARKET).filter((m) => m.expireAt > now).length;
    const gossip = readArr<Gossip>(SK.GOSSIP).filter((g) => g.heat < g.threshold).length;
    const drop   = readArr<DropMsg>(SK.DROP).filter((d) => d.expireAt > now).length;
    return { burn, market, gossip, drop };
  }, [now]);

  if (!unlocked) return <AccessGate onUnlock={handleUnlock} />;

  return (
    <CyberLayout title="地下茶水间" subtitle="Off-grid · Ephemeral · No log">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* ─── Identity strip ─────────────────────────────── */}
        <div className="border border-[#00ff41]/30 bg-black/60 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Ghost className="w-4 h-4 text-[#00ff41]" />
              <span className="text-[10px] text-[#00ff41]/50 uppercase tracking-widest">Your Codename</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#00ff41]/50">
              <ShieldCheck className="w-3 h-3" /> E2E · Local Only
            </div>
          </div>
          <p className="text-xl font-black text-[#00ff41] tabular-nums tracking-tight">{codename}</p>
          <p className="mt-1 text-[10px] text-[#00ff41]/40">每次进入重置不了 · 清空浏览器=换身份</p>
        </div>

        {/* ─── Tabs ───────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            const count = counts[t.id];
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative flex flex-col items-center gap-1 py-3 rounded-md border transition-all',
                  active
                    ? 'bg-[#00ff41]/10 border-[#00ff41]/60'
                    : 'bg-black/40 border-[#00ff41]/15 hover:border-[#00ff41]/30'
                )}>
                <Icon className={cn('w-4 h-4', active ? t.color : 'text-[#00ff41]/50')} />
                <span className={cn('text-[11px] font-bold', active ? 'text-[#00ff41]' : 'text-[#00ff41]/60')}>{t.label}</span>
                <span className="text-[9px] text-[#00ff41]/40 tabular-nums font-mono">{t.sub} · {count}</span>
                {active && <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00ff41]" />}
              </button>
            );
          })}
        </div>

        {/* ─── Warning banner ─────────────────────────────── */}
        <div className="flex items-start gap-2 border border-red-500/20 bg-red-500/[0.04] rounded-md p-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-300/80 leading-relaxed">
            本区所有内容<span className="text-red-400 font-bold">仅保存于你本地浏览器</span>，不上传、不同步、不留痕。
            过期/焚毁即不可恢复。清空浏览器 = 一切归零。
          </p>
        </div>

        {/* ─── Active module ──────────────────────────────── */}
        <div className="pb-10">
          {tab === 'burn'   && <BurnWall codename={codename} now={now} />}
          {tab === 'market' && <BlackMarket codename={codename} now={now} />}
          {tab === 'gossip' && <GossipVault codename={codename} now={now} />}
          {tab === 'drop'   && <DeadDrop codename={codename} now={now} />}
        </div>
      </div>
    </CyberLayout>
  );
};

export default PantryPage;
