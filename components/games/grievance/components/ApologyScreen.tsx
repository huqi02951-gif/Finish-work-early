import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, FileSignature, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { GameSession, MonsterStyle, StressType } from '../types';
import { GENERIC_APOLOGIES } from '../data';
import { MonsterVisual } from './MonsterVisual';

interface ApologyScreenProps {
  selectedStress: StressType;
  selectedMonsterStyle: MonsterStyle;
  monsterName: string;
  gameSession: GameSession;
  onNext: () => void;
}

export const ApologyScreen: React.FC<ApologyScreenProps> = ({
  selectedStress,
  selectedMonsterStyle,
  monsterName,
  gameSession,
  onNext,
}) => {
  const [stampSealed, setStampSealed] = useState(false);

  // Load tailored self-criticism lines
  const targetApologies = selectedStress.apologies || GENERIC_APOLOGIES;
  const mainApology1 = targetApologies[0];
  const mainApology2 = targetApologies[Math.min(1, targetApologies.length - 1)];

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col justify-between min-h-[85vh] px-4 py-6">

      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-rose-500 font-mono tracking-widest uppercase">
          <span>第 {selectedStress.level}/18 层</span>
          <span className="font-extrabold">{selectedStress.judge} · 宣 判</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>{selectedStress.hellName} 宣判书</span>
          <span className="animate-pulse">😭</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          {selectedStress.tribunal} 已完成审理：{selectedStress.workplaceSin}。本层可结案，也可回到现实继续守住边界。
        </p>
      </div>

      {/* Remorse Area */}
      <div className="my-6 flex flex-col items-center">

        {/* Weep icon */}
        <div className="relative mb-2">
          <MonsterVisual
            styleId={selectedMonsterStyle.id}
            state="apologizing"
            shrinkFactor={0.8}
            uploadedPhotoUrl={gameSession.uploadedPhotoUrl}
            stickerScale={gameSession.stickerScale}
            stickerOffsetX={gameSession.stickerOffsetX}
            stickerOffsetY={gameSession.stickerOffsetY}
            punishmentPreset={selectedStress.punishment}
          />
          <div className="absolute top-2 right-2 bg-yellow-400/95 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full select-none shadow-md border border-yellow-200">
            忏悔中...
          </div>
        </div>

        {/* Written Self Criticism Doc */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full bg-linear-to-b from-[#fefbf6] to-[#fcf6e8] border-2 border-[#d97706]/40 rounded-2xl p-5 shadow-lg relative overflow-hidden"
        >
          {/* Ancient seals decorations */}
          <div className="absolute top-2 right-2 border-2 border-dashed border-red-500 text-red-500 text-[10px] p-1 rounded font-black opacity-30 select-none uppercase tracking-widest transform rotate-[15deg]">
            天道画押
          </div>

          <div className="flex items-center gap-1.5 text-xs font-black text-[#854d0e] mb-2.5 border-b border-[#eab308]/25 pb-1.5 uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>【{monsterName}】之第 {selectedStress.level} 层承负状</span>
          </div>

          {/* Lines */}
          <div className="space-y-2 text-xs font-medium text-[#713f12] leading-relaxed">
            <p className="indent-6">本人深刻认识到自己犯下“{selectedStress.workplaceSin}”，已被{selectedStress.judge}录入天曹功过簿。</p>
            <p className="font-extrabold bg-[#fef08a]/30 p-2 rounded border border-dashed border-[#eab308]/20 text-rose-800">
              ⚡ 判词：{selectedStress.verdict}
            </p>
            <p className="font-extrabold bg-[#fef08a]/30 p-2 rounded border border-dashed border-[#eab308]/20 text-rose-800">
              ⚡ 伏罪一：{mainApology1}
            </p>
            <p className="font-extrabold bg-[#fef08a]/30 p-2 rounded border border-dashed border-[#eab308]/20 text-rose-800">
              ⚡ 伏罪二：{mainApology2}
            </p>
            <p className="indent-6">现保证：今后立即闭嘴认清边界。凡涉及功劳、责任、资源、机会与名声，一律按事实归位。</p>
            <p className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-2">
              现实回血话术：{selectedStress.realityReply}
            </p>
            <p className="text-right mt-3 text-[10px] font-black text-slate-500 gap-1 flex items-center justify-end">
              <span>立誓傀儡：</span>
              <span className="underline italic text-[#854d0e]">{monsterName} (已盖章伏罪)</span>
            </p>
          </div>

          {/* Heavy Seal stamp activation */}
          {stampSealed && (
            <motion.div
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-x-0 inset-y-0 flex items-center justify-center bg-transparent pointer-events-none"
            >
              <div className="border-4 border-red-600/80 bg-red-500/10 text-red-600 font-extrabold text-2xl tracking-widest p-4 rounded-xl transform rotate-[-8deg] uppercase shadow-inner shadow-red-500/20">
                ✔️ 善 恶 有 报 🉐
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Seals active button */}
        {!stampSealed ? (
          <button
            onClick={() => setStampSealed(true)}
            id="btn_apply_sorry_seal"
            className="mt-4 px-4.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] rounded-lg tracking-widest flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>【加盖印章】宣判即刻生效</span>
          </button>
        ) : (
          <div className="mt-4 flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>清算已上天道金榜，福德功绩已固定！</span>
          </div>
        )}

      </div>

      {/* Next page */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          id="btn_claim_blood_pack"
          className="w-full sm:w-auto py-3.5 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg border-b-2 border-slate-950 cursor-pointer"
        >
          <HeartHandshake className="w-4 h-4 text-emerald-400" />
          <span>领取现实回血包 (职场优雅反击话术)</span>
        </motion.button>
      </div>

    </div>
  );
};
