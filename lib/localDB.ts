/**
 * 本地数据层 — 基于 Dexie (IndexedDB) 的统一持久化
 *
 * 设计原则：
 * - 所有工具的草稿、生成结果、导出历史都存在这里
 * - localStorage 仅保留轻量偏好 (theme, collapsed panels 等)
 * - 为将来后端同步预留 `synced` 字段
 */
import Dexie, { type EntityTable } from 'dexie';
import { incrementLocalNumber, LOCAL_NUMBER_KEYS } from './localSignals';

// ─── 领域模型 ─────────────────────────────────

/** 草稿记录：工具表单的中间状态 */
export interface DraftRecord {
  id?: number;
  toolId: string;          // e.g. 'sensitive-comm', 'rate-offer'
  title: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/** 生成产物：工具产出的最终结果 */
export interface GeneratedArtifact {
  id?: number;
  toolId: string;
  title: string;
  content: string;         // 主文本内容
  metadata?: Record<string, any>;
  createdAt: Date;
}

/** 导出记录 */
export interface ExportRecord {
  id?: number;
  artifactId?: number;
  toolId: string;
  format: 'docx' | 'csv' | 'txt' | 'clipboard';
  filename?: string;
  createdAt: Date;
}

/** 本地帖子（Feed/BBS 本地演示用） */
export interface LocalPost {
  id?: number;
  type: 'feed' | 'bbs' | 'feedback';
  title?: string;
  content: string;
  author?: string;
  likes: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

/** 工作台条目 */
export interface WorkspaceItem {
  id?: number;
  type: 'draft' | 'artifact' | 'bookmark';
  refId?: number;
  toolId: string;
  title: string;
  preview?: string;
  createdAt: Date;
}

// ─── 数据库定义 ───────────────────────────────

class LocalDB extends Dexie {
  drafts!: EntityTable<DraftRecord, 'id'>;
  artifacts!: EntityTable<GeneratedArtifact, 'id'>;
  exports!: EntityTable<ExportRecord, 'id'>;
  posts!: EntityTable<LocalPost, 'id'>;
  workspace!: EntityTable<WorkspaceItem, 'id'>;

  constructor() {
    super('FinishWorkEarlyDB');

    this.version(1).stores({
      drafts:    '++id, toolId, updatedAt',
      artifacts: '++id, toolId, createdAt',
      exports:   '++id, toolId, createdAt',
      posts:     '++id, type, createdAt',
      workspace: '++id, toolId, type, createdAt',
    });
  }
}

export const db = new LocalDB();

// ─── 便捷方法 ─────────────────────────────────

/** 保存草稿（upsert by toolId + title） */
export async function saveDraft(toolId: string, title: string, data: Record<string, any>) {
  const existing = await db.drafts.where({ toolId, title }).first();
  if (existing) {
    return db.drafts.update(existing.id!, { data, updatedAt: new Date() });
  }
  return db.drafts.add({ toolId, title, data, createdAt: new Date(), updatedAt: new Date() });
}

/** 保存生成结果 */
export async function saveArtifact(toolId: string, title: string, content: string, metadata?: Record<string, any>) {
  const artifactId = await db.artifacts.add({ toolId, title, content, metadata, createdAt: new Date() });
  incrementLocalNumber(LOCAL_NUMBER_KEYS.artifactSavedSignal, 0);
  return artifactId;
}

/** 记录一次导出 */
export async function logExport(toolId: string, format: ExportRecord['format'], filename?: string, artifactId?: number) {
  return db.exports.add({ toolId, format, filename, artifactId, createdAt: new Date() });
}

/** 获取最近的生成历史 */
export async function getRecentArtifacts(toolId?: string, limit = 20) {
  let collection = db.artifacts.orderBy('createdAt').reverse();
  if (toolId) {
    collection = db.artifacts.where('toolId').equals(toolId).reverse();
  }
  return collection.limit(limit).toArray();
}

/** 获取工具的草稿列表 */
export async function getDrafts(toolId: string) {
  return db.drafts.where('toolId').equals(toolId).reverse().sortBy('updatedAt');
}

/** 保存一条本地帖子/反馈 */
export async function saveLocalPost(input: Omit<LocalPost, 'id' | 'createdAt'>) {
  return db.posts.add({
    ...input,
    createdAt: new Date(),
  });
}

/** 获取本地帖子/反馈 */
export async function getLocalPosts(type: LocalPost['type']) {
  return db.posts.where('type').equals(type).reverse().sortBy('createdAt');
}
