import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, History, RefreshCw, Scroll, ShieldCheck, Upload, X } from 'lucide-react';
import { GameSession, HistoryRecord } from '../types';
import { HELL_LEVELS } from '../data';
import { getLevelArtPreset, officeHellStageAsset } from '../artPresets';

interface WelcomeScreenProps {
  onStart: (session: GameSession) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [monsterName, setMonsterName] = useState('谢教你做人');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | undefined>();
  const [stickerScale, setStickerScale] = useState(1);
  const [stickerOffsetX, setStickerOffsetX] = useState(0);
  const [stickerOffsetY, setStickerOffsetY] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [stats, setStats] = useState({
    grievances: 1284902,
    merits: 48920,
    speed: 844
  });

  const previewArt = useMemo(() => getLevelArtPreset(HELL_LEVELS[0]), []);

  useEffect(() => {
    const saved = localStorage.getItem('reclaim_station_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (error) {
        console.error(error);
      }
    }

    const timer = setInterval(() => {
      setStats(prev => ({
        grievances: prev.grievances + Math.floor(Math.random() * 4) + 1,
        merits: prev.merits + (Math.random() > 0.62 ? 1 : 0),
        speed: Math.floor(Math.random() * 70) + 820
      }));
    }, 2600);

    return () => clearInterval(timer);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('reclaim_station_history');
    setHistory([]);
  };

  const randomizeName = () => {
    const prefixes = ['张', '王', '李', '赵', '刘', '董', '周', '马', '高', '常', '郭', '许'];
    const titles = ['嚼舌鬼', '甩锅精', '画饼怪', '冷脸鬼', '抢功鬼', '卡晋升师', '背刺总监', 'PUA教练', '资源黑洞'];
    setMonsterName(`${prefixes[Math.floor(Math.random() * prefixes.length)]}${titles[Math.floor(Math.random() * titles.length)]}`);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('只能上传图片，用作本地小人贴纸。');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('图片太大了，换一张 3MB 以内的小头像。');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedPhotoUrl(reader.result);
        setStickerScale(1);
        setStickerOffsetX(0);
        setStickerOffsetY(0);
      }
    };
    reader.onerror = () => setUploadError('读取图片失败，先用默认纸傀儡也能开打。');
    reader.readAsDataURL(file);
  };

  const startCase = (trialMode = false) => {
    onStart({
      monsterName: monsterName.trim() || '这个职场小人',
      uploadedPhotoUrl,
      hasUploadedPhoto: Boolean(uploadedPhotoUrl),
      trialMode,
      stickerScale,
      stickerOffsetX,
      stickerOffsetY
    });
  };

  return (
    <div
      className="case-intake-shell"
      style={{ '--case-bg': `url(${officeHellStageAsset})` } as React.CSSProperties}
    >
      <div className="case-bg" />
      <div className="case-intake-grid">
        <section className="case-hero">
          <div className="case-kicker">十八层职场小人清算局</div>
          <h1>职场十八层小人清算</h1>
          <p>给小人立案、贴脸、命名，然后押进十八层。每层都能宣判，也能继续打到阿鼻终局。</p>

          <div className="case-stats">
            <div>
              <span>怨气回收</span>
              <b>{stats.grievances.toLocaleString()}</b>
            </div>
            <div>
              <span>电子功德</span>
              <b>{stats.merits.toLocaleString()}</b>
            </div>
            <div>
              <span>炉温</span>
              <b>{stats.speed}°</b>
            </div>
          </div>

          <div className="case-level-strip">
            {HELL_LEVELS.slice(0, 6).map(level => (
              <span key={level.id}>{level.level}.{level.hellName.replace('地狱', '')}</span>
            ))}
            <b>...18.阿鼻终局</b>
          </div>
        </section>

        <motion.section
          className="case-form-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="case-preview">
            <img src={previewArt.boss.asset} alt="纸傀儡小人预览" draggable={false} />
            {uploadedPhotoUrl ? (
              <div
                className="case-photo-preview"
                style={{
                  '--sticker-scale': stickerScale,
                  '--sticker-offset-x': `${stickerOffsetX}px`,
                  '--sticker-offset-y': `${stickerOffsetY}px`
                } as React.CSSProperties}
              >
                <img src={uploadedPhotoUrl} alt="小人头像预览" draggable={false} />
                <span>本地贴纸</span>
              </div>
            ) : (
              <div className="case-empty-face">待贴脸</div>
            )}
            <div className="case-seal">立案在审</div>
          </div>

          <label htmlFor="monster_name_input" className="case-label">小人名号</label>
          <div className="case-name-row">
            <input
              id="monster_name_input"
              value={monsterName}
              onChange={(event) => setMonsterName(event.target.value)}
              maxLength={20}
              placeholder="例如：张背刺、王画饼"
            />
            <button type="button" onClick={randomizeName} aria-label="随机小人名">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <label htmlFor="monster_photo_input" className="case-upload">
            <span>
              <Upload className="h-4 w-4" />
              上传小人照片
            </span>
            <b>{uploadedPhotoUrl ? '已封印' : '可选'}</b>
            <input id="monster_photo_input" type="file" accept="image/*" onChange={handlePhotoUpload} />
          </label>

          {uploadedPhotoUrl && (
            <>
              <div className="case-sticker-controls" aria-label="照片贴脸调整">
                <label>
                  <span>脸部大小</span>
                  <input
                    type="range"
                    min="0.72"
                    max="1.42"
                    step="0.02"
                    value={stickerScale}
                    onChange={(event) => setStickerScale(Number(event.target.value))}
                  />
                  <b>{Math.round(stickerScale * 100)}%</b>
                </label>
                <label>
                  <span>左右位置</span>
                  <input
                    type="range"
                    min="-42"
                    max="42"
                    step="1"
                    value={stickerOffsetX}
                    onChange={(event) => setStickerOffsetX(Number(event.target.value))}
                  />
                  <b>{stickerOffsetX > 0 ? `+${stickerOffsetX}` : stickerOffsetX}</b>
                </label>
                <label>
                  <span>上下位置</span>
                  <input
                    type="range"
                    min="-42"
                    max="42"
                    step="1"
                    value={stickerOffsetY}
                    onChange={(event) => setStickerOffsetY(Number(event.target.value))}
                  />
                  <b>{stickerOffsetY > 0 ? `+${stickerOffsetY}` : stickerOffsetY}</b>
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUploadedPhotoUrl(undefined);
                  setStickerScale(1);
                  setStickerOffsetX(0);
                  setStickerOffsetY(0);
                }}
                className="case-remove-photo"
              >
                <X className="h-3.5 w-3.5" />
                移除照片贴纸
              </button>
            </>
          )}
          {uploadError && <div className="case-error">{uploadError}</div>}

          <button type="button" id="btn_start_game" onClick={() => startCase(false)} className="case-start-button">
            <Flame className="h-5 w-5" />
            押入十八层 · 开始清算
          </button>

          <button type="button" id="btn_start_trial_mode" onClick={() => startCase(true)} className="case-trial-button">
            十八层试炼全开 · 看每层玩法
          </button>

          <button type="button" id="btn_show_history" onClick={() => setShowHistoryModal(true)} className="case-history-button">
            <History className="h-4 w-4" />
            历史清算日志
            {history.length > 0 && <span>{history.length}</span>}
          </button>
        </motion.section>
      </div>

      {showHistoryModal && (
        <div className="case-modal">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="case-modal-card"
          >
            <div className="case-modal-head">
              <div>
                <Scroll className="h-5 w-5" />
                <span>天曹功过簿</span>
              </div>
              <button type="button" onClick={() => setShowHistoryModal(false)}>×</button>
            </div>

            <div className="case-modal-list">
              {history.length === 0 ? (
                <div className="case-empty-history">
                  <ShieldCheck className="h-8 w-8" />
                  <p>清算簿暂无记录。开一局，把第一个小人押进去。</p>
                </div>
              ) : (
                history.map(record => (
                  <div key={record.id} className="case-history-row">
                    <div>
                      <b>{record.monsterName}</b>
                      <span>{record.hellName || record.stressName} · {record.date}</span>
                    </div>
                    <em>功德 +{record.meritDelta}</em>
                  </div>
                ))
              )}
            </div>

            <div className="case-modal-actions">
              {history.length > 0 ? <button type="button" onClick={clearHistory}>焚毁日志</button> : <span />}
              <button type="button" onClick={() => setShowHistoryModal(false)}>退下</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
