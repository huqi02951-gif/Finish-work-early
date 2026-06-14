import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RotateCcw, Award, Shield, AlertTriangle, Coffee } from 'lucide-react';
import { BattleMetrics, StressType, MonsterStyle, HistoryRecord, GameSession } from '../types';
import { PROTECTIVE_AMULETS } from '../data';
import { getLevelMechanic } from '../levelMechanics';

interface ResultScreenProps {
  selectedStress: StressType;
  selectedMonsterStyle: MonsterStyle;
  monsterName: string;
  gameSession: GameSession;
  battleMetrics: BattleMetrics;
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  selectedStress,
  selectedMonsterStyle,
  monsterName,
  gameSession,
  battleMetrics,
  onRestart,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [talisman, setTalisman] = useState<any>(null);
  const finalMechanic = getLevelMechanic(selectedStress);

  const eqData = {
    reply: selectedStress.realityReply,
    reminder: selectedStress.verdict,
    nonSelfFriction: selectedStress.nonSelfFriction
  };

  // Choose an unlocked protective amulet based on stress and session metrics
  useEffect(() => {
    // Map stress types to suitable visual talismans or find randomly
    const indexMap: Record<string, number> = {
      after_hours: 8, // 边界护法
      blame_shifter: 3, // 不背锅
      pua_pie: 0, // 小人退散
      frequent_editor: 7, // 虚虚明鉴
      deadline_pusher: 5, // 福报回流
      credit_thief: 2, // 功劳归位
      useless_meeting: 8, // 边界
      emotional_roller: 1, // 口业反弹
      no_resources: 4, // 贵人
      weekend_troll: 8 // 边界
    };

    const preferredIndex = indexMap[selectedStress.id] ?? 0;
    const selectedTalisman = PROTECTIVE_AMULETS[preferredIndex % PROTECTIVE_AMULETS.length];
    setTalisman(selectedTalisman);

    // Record session into local storage history database
    const saved = localStorage.getItem('reclaim_station_history');
    let history: HistoryRecord[] = [];
    if (saved) {
      try {
        history = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    const newRecord: HistoryRecord = {
      id: String(Date.now()),
      monsterName: monsterName,
      stressName: selectedStress.name,
      date: new Date().toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      reliefGain: battleMetrics.relief,
      meritDelta: battleMetrics.meritsEarned,
      status: `十八层清算 ${battleMetrics.deepestLevel}/18 · 刑具 ${finalMechanic.toolName}`,
      deepestLevel: battleMetrics.deepestLevel,
      hellName: battleMetrics.finalHellName,
      usedPhoto: gameSession.hasUploadedPhoto,
      sinSummary: selectedStress.workplaceSin
    };

    history.unshift(newRecord);
    localStorage.setItem('reclaim_station_history', JSON.stringify(history.slice(0, 30)));
  }, [selectedStress, monsterName, battleMetrics]);

  // Handle high-eq comebacks copy
  const handleCopy = async () => {
    setCopyFailed(false);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(eqData.reply);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = eqData.reply;
        textArea.setAttribute('readonly', 'true');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const copiedWithFallback = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!copiedWithFallback) throw new Error('copy fallback failed');
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col justify-between min-h-[90vh] px-4 py-6">

      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-2.5 text-xs text-slate-400 font-mono tracking-widest uppercase">
          <span>{battleMetrics.deepestLevel >= 18 ? '十八层总账' : '本层清算'} / 回血礼包</span>
          <span className="text-emerald-500 font-bold">{selectedStress.hellName}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {battleMetrics.deepestLevel >= 18 ? '十八层清算完毕' : '本层宣判生效'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {selectedStress.judge} 已记录本案：{selectedStress.workplaceSin}。以下是现实边界防御包：
        </p>
      </div>

      <div className="mt-4 rounded-2xl border-2 border-slate-900 bg-slate-950 text-white p-4 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(248,113,113,0.32),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(251,191,36,0.22),transparent_30%)] pointer-events-none" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="text-[9px] font-black tracking-[0.26em] text-amber-300 uppercase">BATTLE REPORT</div>
            <div className="text-lg font-black mt-0.5">本局爽感战报</div>
            <div className="text-[10px] text-slate-400 mt-1">
              对手：{monsterName} · 第 {selectedStress.level} 层 {selectedStress.hellName} · {selectedMonsterStyle.name}
            </div>
          </div>
          <div className="text-4xl shrink-0 drop-shadow-[0_4px_0_rgba(0,0,0,0.8)]">{finalMechanic.toolIcon}</div>
        </div>

        <div className="relative grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3 text-center">
          <div className="rounded-xl bg-white/10 border border-white/10 py-2 px-1">
            <div className="text-[8px] text-slate-400 font-black">本层刑具</div>
            <div className="text-[10px] font-black text-yellow-200 mt-1 truncate">{finalMechanic.toolName}</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/10 py-2 px-1">
            <div className="text-[8px] text-slate-400 font-black">最深层</div>
            <div className="text-base font-black text-emerald-300">{battleMetrics.deepestLevel}/18</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/10 py-2 px-1">
            <div className="text-[8px] text-slate-400 font-black">最厚血条</div>
            <div className="text-[11px] font-black text-orange-200 mt-1">{battleMetrics.highestBossHp.toLocaleString()}</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/10 py-2 px-1">
            <div className="text-[8px] text-slate-400 font-black">最大连击</div>
            <div className="text-base font-black text-red-300">{battleMetrics.maxCombo}</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/10 py-2 px-1">
            <div className="text-[8px] text-slate-400 font-black">焚案次数</div>
            <div className="text-base font-black text-orange-300">{battleMetrics.ultimatesUsed}</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/10 py-2 px-1">
            <div className="text-[8px] text-slate-400 font-black">标签撕碎</div>
            <div className="text-base font-black text-emerald-300">{battleMetrics.tagsDestroyed}</div>
          </div>
        </div>
        <div className="relative mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold text-slate-300 leading-relaxed">
          <span className="text-amber-300 font-black">判词：</span>{battleMetrics.finalVerdict}
          {battleMetrics.usedPhoto && <span className="ml-2 text-rose-300">照片贴纸已参与清算，但未存入历史记录。</span>}
        </div>
      </div>

      <div className="space-y-4 my-5">

        {/* 1. High-EQ Comeback Module */}
        <div className="border border-slate-200 bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
            <span className="text-xs font-black text-rose-600 flex items-center gap-1.5 uppercase">
              <Coffee className="w-4 h-4 text-rose-500 animate-bounce" />
              <span>【现实高情商防御话术】</span>
            </span>
            <button
              onClick={handleCopy}
              id="btn_copy_eq_reply"
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                copyFailed
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : copied
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {copyFailed ? (
                <>
                  <Copy className="w-3 h-3" />
                  <span>复制失败</span>
                </>
              ) : copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>复制话术</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-slate-50 p-3 rounded-xl border border-slate-200 indent-1 italic text-justify">
            {eqData.reply}
          </p>

          <div className="mt-2.5 text-[10px] text-amber-700 font-extrabold flex items-center gap-1 bg-amber-50 rounded-lg p-2 border border-amber-100 leading-tight">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>提醒：{eqData.reminder}</span>
          </div>
        </div>

        {/* 2. Decal Protective Talisman */}
        {talisman && (
          <div className="border border-slate-200 bg-white rounded-2xl p-4 shadow-sm text-center flex flex-col items-center">
            <span className="text-xs font-black text-indigo-600 flex items-center gap-1.5 mb-2.5 uppercase">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>【已为您结界封印：专属护身符】</span>
            </span>

            {/* Simulated Chinese Taoist Talisman Yellow Scroll */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative w-full max-w-[280px] bg-amber-100 border-4 border-red-600 rounded-xl p-[18px] text-slate-800 shadow-md flex flex-col items-center select-none"
            >
              {/* Mystic squiggles design borders */}
              <div className="absolute inset-2 border border-dashed border-red-600/30 rounded-lg pointer-events-none" />

              <div className="flex flex-col items-center gap-1 relative z-10 text-red-700">
                {/* Symbol logo */}
                <span className="text-4xl animate-pulse">{talisman.emoji}</span>
                <span className="font-extrabold text-sm tracking-widest">{talisman.name}</span>
                <span className="text-[10px] bg-red-600 text-yellow-300 px-2 py-0.5 rounded-full font-sans tracking-wide font-black mt-1">
                  效果：{talisman.effect}
                </span>

                {/* Scroll long-text and incantation */}
                <p className="text-[10px] text-red-600/80 leading-relaxed mt-2.5 font-bold italic tracking-wide max-w-[200px] border-t border-dashed border-red-500/30 pt-2 text-center">
                  “{talisman.description}”
                </p>

                <div className="text-[9px] text-red-500/50 uppercase font-mono tracking-widest mt-2">
                  ☯️ 天道镇邪·退散小人 ☯️
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 3. "No Inner Friction" Affirmation */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-emerald-800">
          <div className="text-xs font-black flex items-center gap-1 mb-1">
            <span>✨ 今日别内耗金句：</span>
          </div>
          <p className="text-[11px] leading-relaxed font-bold italic">
            {eqData.nonSelfFriction}
          </p>
        </div>

        {/* 4. Mini Stats summary breakdown */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex justify-between items-center text-xs text-slate-600">
          <div>
            <div className="font-bold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-yellow-500" />
              <span>本次清算法事报告</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">功德记录写入天道自愈总簿中</p>
          </div>
          <div className="flex gap-4 font-extrabold text-right">
            <div>
              <div className="text-rose-500 text-[10px]">乳腺通畅</div>
              <div className="text-amber-600 text-sm">+{battleMetrics.relief}%</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">功德暴涨</div>
              <div className="text-emerald-600 text-sm">+{battleMetrics.meritsEarned}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">内耗拔除</div>
              <div className="text-red-500 text-sm">-100%</div>
            </div>
          </div>
        </div>

      </div>

      {/* Slogan wrap */}
      <p className="text-[11px] text-slate-400 text-center font-bold tracking-wide my-2 select-none">
        🌿 其罪在心，不染我体。小人退散，今天先安心放过自己。
      </p>

      {/* Actions */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRestart}
          id="btn_restart_game_full"
          className="w-full py-4 bg-slate-900 border-b-4 border-slate-950 hover:bg-slate-800 text-white rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span>重新清算 (换个姿势度化)</span>
        </motion.button>
      </div>

    </div>
  );
};
