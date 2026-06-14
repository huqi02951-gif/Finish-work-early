import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { BattleMetrics, GamePage, StressType, MonsterStyle, GameSession } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BattleScreen } from './components/BattleScreen';
import { ApologyScreen } from './components/ApologyScreen';
import { ResultScreen } from './components/ResultScreen';
import { STRESS_TYPES, MONSTER_STYLES } from './data';

export default function GameRoot() {
  const [page, setPage] = useState<GamePage>('welcome');
  const isBattlePage = page === 'battle';

  // Initialize with standard cartoon presets for lightning-fast start
  const [selectedStress, setSelectedStress] = useState<StressType>(STRESS_TYPES[0]);
  const [selectedStyle, setSelectedStyle] = useState<MonsterStyle>(MONSTER_STYLES[0]);
  const [monsterName, setMonsterName] = useState<string>('谢教你做人');
  const [gameSession, setGameSession] = useState<GameSession>({
    monsterName: '谢教你做人',
    hasUploadedPhoto: false,
    stickerScale: 1,
    stickerOffsetX: 0,
    stickerOffsetY: 0
  });
  // 测试阶段先全开 18 层；正式上线再恢复锁关机制。
  const [maxLevelUnlocked, setMaxLevelUnlocked] = useState(() => 18);

  // Battle arena settlement parameters
  const [battleMetrics, setBattleMetrics] = useState<BattleMetrics | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [page]);

  // Restart handler
  const handleRestart = () => {
    setPage('welcome');
    setSelectedStress(STRESS_TYPES[0]);
    setSelectedStyle(MONSTER_STYLES[0]);
    setMonsterName('谢教你做人');
    setGameSession({
      monsterName: '谢教你做人',
      hasUploadedPhoto: false,
      stickerScale: 1,
      stickerOffsetX: 0,
      stickerOffsetY: 0
    });
    setBattleMetrics(null);
  };

  const handleStart = (session: GameSession) => {
    const cleanName = session.monsterName.trim() || '这个职场小人';
    setMonsterName(cleanName);
    setGameSession({
      monsterName: cleanName,
      uploadedPhotoUrl: session.uploadedPhotoUrl,
      hasUploadedPhoto: Boolean(session.uploadedPhotoUrl),
      trialMode: session.trialMode,
      stickerScale: session.stickerScale ?? 1,
      stickerOffsetX: session.stickerOffsetX ?? 0,
      stickerOffsetY: session.stickerOffsetY ?? 0
    });
    if (session.trialMode) setMaxLevelUnlocked(18);
    setSelectedStress(STRESS_TYPES[0]);
    setSelectedStyle(MONSTER_STYLES[0]);
    setPage('battle');
  };

  const handleUnlockLevel = (level: number) => {
    setMaxLevelUnlocked(prev => {
      const next = Math.max(prev, Math.min(18, level));
      window.localStorage.setItem('officeHellMaxLevelUnlocked', String(next));
      return next;
    });
  };

  const handleBattleCheckout = (results: {
    relief: number;
    innerFriction: number;
    boundary: number;
    meritsEarned: number;
    unlockedAmuletsCount: number;
    maxCombo: number;
    ultimatesUsed: number;
    favoriteWeaponId: BattleMetrics['favoriteWeaponId'];
    tagsDestroyed: number;
    stagesCleared: number;
    highestBossHp: number;
    deepestLevel: number;
    finalHellName: string;
    finalVerdict: string;
    usedPhoto: boolean;
    finalStress: StressType;
    finalStyle: MonsterStyle;
    finalName: string;
  }) => {
    // Record customized configurations designed live on playing dashboard
    setSelectedStress(results.finalStress);
    setSelectedStyle(results.finalStyle);
    setMonsterName(results.finalName);

    setBattleMetrics({
      relief: results.relief,
      innerFriction: results.innerFriction,
      boundary: results.boundary,
      meritsEarned: results.meritsEarned,
      unlockedAmuletsCount: results.unlockedAmuletsCount,
      maxCombo: results.maxCombo,
      ultimatesUsed: results.ultimatesUsed,
      favoriteWeaponId: results.favoriteWeaponId,
      tagsDestroyed: results.tagsDestroyed,
      stagesCleared: results.stagesCleared,
      highestBossHp: results.highestBossHp,
      deepestLevel: results.deepestLevel,
      finalHellName: results.finalHellName,
      finalVerdict: results.finalVerdict,
      usedPhoto: results.usedPhoto
    });
    setPage('apology');
  };

  const handleApologyDone = () => {
    setPage('result');
  };

  return (
    <div className={`min-h-[calc(100dvh-3.5rem)] font-sans tracking-tight antialiased flex flex-col transition-colors duration-500 ${
      isBattlePage
        ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(127,29,29,0.32),transparent_38%),linear-gradient(180deg,#020617,#111827_42%,#030712)]'
        : 'bg-[radial-gradient(circle_at_50%_0%,rgba(127,29,29,0.22),transparent_34%),linear-gradient(180deg,#050607,#11100d_48%,#050607)]'
    }`} id="root-container">
      {/* Primary interactive screens viewport */}
      <main className={`flex-1 w-full mx-auto flex flex-col relative z-10 ${isBattlePage ? 'max-w-[1560px] px-0 sm:px-2 justify-start' : 'max-w-lg justify-center py-4'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            {page === 'welcome' && (
              <WelcomeScreen onStart={handleStart} />
            )}

            {page === 'battle' && (
              <BattleScreen
                initialStress={selectedStress}
                initialMonsterStyle={selectedStyle}
                initialMonsterName={monsterName}
                initialSession={gameSession}
                maxLevelUnlocked={maxLevelUnlocked}
                onUnlockLevel={handleUnlockLevel}
                onNext={handleBattleCheckout}
              />
            )}

            {page === 'apology' && (
              <ApologyScreen
                selectedStress={selectedStress}
                selectedMonsterStyle={selectedStyle}
                monsterName={monsterName}
                gameSession={gameSession}
                onNext={handleApologyDone}
              />
            )}

            {page === 'result' && battleMetrics && (
              <ResultScreen
                selectedStress={selectedStress}
                selectedMonsterStyle={selectedStyle}
                monsterName={monsterName}
                gameSession={gameSession}
                battleMetrics={battleMetrics}
                onRestart={handleRestart}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
