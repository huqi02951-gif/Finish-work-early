import type {
  HomePageConfig,
  ProductGuideCard,
  Skill,
  SkillsLibraryPageConfig,
} from '../../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const API_ROOT = `${API_BASE_URL}/api/v1`;

type PageKey = 'home_page' | 'skills_library_page';

interface PageConfigResponse<T> {
  id: number;
  pageKey: PageKey;
  configData: T;
  version: number;
  schemaVersion: number;
  updatedAt: string;
}

type BackendCatalogStatus = 'DRAFT' | 'PUBLISHED' | 'OFFLINE';

interface BackendProduct {
  id: number;
  slug: string;
  name: string;
  category: string;
  summary: string;
  coverUrl: string | null;
  targetUrl: string | null;
  status: BackendCatalogStatus;
  sortOrder: number;
  detailData: Partial<ProductGuideCard>;
  skills?: Array<{
    sortOrder: number;
    skill: BackendSkill;
  }>;
}

interface BackendSkill {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  toolRoute: string | null;
  formLabel: string | null;
  status: BackendCatalogStatus;
  sortOrder: number;
  detailData: Partial<Skill>;
  products?: Array<{
    sortOrder: number;
    product: BackendProduct;
  }>;
}

interface SkillQueryParams {
  category?: string;
  search?: string;
}

interface ProductQueryParams {
  search?: string;
}

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`);
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.message) {
        message = Array.isArray(payload.message) ? payload.message.join(', ') : String(payload.message);
      }
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function mapBackendStatusToDisplay(status: BackendCatalogStatus): Skill['status'] {
  if (status === 'PUBLISHED') return '在线可用';
  if (status === 'OFFLINE') return '需后端支持';
  return '开发中/能力介绍';
}

function mapSkill(skill: BackendSkill): Skill {
  return {
    id: skill.slug,
    name: skill.title,
    category: skill.category,
    scene: skill.detailData.scene || '',
    audience: Array.isArray(skill.detailData.audience) ? skill.detailData.audience : [],
    input: Array.isArray(skill.detailData.input) ? skill.detailData.input : [],
    output: Array.isArray(skill.detailData.output) ? skill.detailData.output : [],
    form: skill.formLabel || skill.detailData.form || '',
    status: skill.detailData.status || mapBackendStatusToDisplay(skill.status),
    note: skill.detailData.note,
    description: skill.summary,
    toolRoute: skill.toolRoute || skill.detailData.toolRoute,
    marketingGuide: skill.detailData.marketingGuide,
  };
}

function mapProduct(product: BackendProduct): ProductGuideCard {
  return {
    id: product.slug,
    name: product.name,
    category: product.category,
    overview: product.summary,
    targetCustomers: Array.isArray(product.detailData.targetCustomers) ? product.detailData.targetCustomers : [],
    suitableIndustries: Array.isArray(product.detailData.suitableIndustries) ? product.detailData.suitableIndustries : [],
    sellingPoints: Array.isArray(product.detailData.sellingPoints) ? product.detailData.sellingPoints : [],
    entryCriteria: Array.isArray(product.detailData.entryCriteria) ? product.detailData.entryCriteria : [],
    commonBlockers: Array.isArray(product.detailData.commonBlockers) ? product.detailData.commonBlockers : [],
    openingTalk: product.detailData.openingTalk || '',
    mustAskQuestions: Array.isArray(product.detailData.mustAskQuestions) ? product.detailData.mustAskQuestions : [],
    needRecognition: product.detailData.needRecognition || '',
    materials: Array.isArray(product.detailData.materials) ? product.detailData.materials : [],
    steps: Array.isArray(product.detailData.steps) ? product.detailData.steps : [],
    objections: Array.isArray(product.detailData.objections) ? product.detailData.objections : [],
    forbiddenPhrases: Array.isArray(product.detailData.forbiddenPhrases) ? product.detailData.forbiddenPhrases : [],
    details: product.detailData.details,
    comparison: product.detailData.comparison,
    relatedSkill: product.detailData.relatedSkill,
    productBoundary: product.detailData.productBoundary,
    highFreqQA: product.detailData.highFreqQA,
    speedUpChecklist: product.detailData.speedUpChecklist,
    industryMarketing: product.detailData.industryMarketing,
    scripts: product.detailData.scripts,
    practicalLogic: product.detailData.practicalLogic,
    messagingPack: product.detailData.messagingPack,
    checklistTemplateCode: product.detailData.checklistTemplateCode,
    reviewSubmissionTemplateCode: product.detailData.reviewSubmissionTemplateCode,
  };
}

function buildQuery(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function getPageConfig(pageKey: 'home_page'): Promise<HomePageConfig>;
export async function getPageConfig(pageKey: 'skills_library_page'): Promise<SkillsLibraryPageConfig>;
export async function getPageConfig(pageKey: PageKey) {
  const response = await requestJson<PageConfigResponse<HomePageConfig | SkillsLibraryPageConfig>>(
    `/public/configs/${pageKey}`,
  );
  return response.configData;
}

export async function getSkills(params: SkillQueryParams = {}): Promise<Skill[]> {
  const response = await requestJson<BackendSkill[]>(
    `/public/skills${buildQuery({ category: params.category, search: params.search })}`,
  );
  return response.map(mapSkill);
}

export async function getSkillDetail(slug: string): Promise<Skill> {
  const response = await requestJson<BackendSkill>(`/public/skills/${slug}`);
  return mapSkill(response);
}

export async function getProducts(params: ProductQueryParams = {}): Promise<ProductGuideCard[]> {
  const response = await requestJson<BackendProduct[]>(
    `/public/products${buildQuery({ search: params.search })}`,
  );
  return response.map(mapProduct);
}

export async function getProductDetail(slug: string): Promise<ProductGuideCard> {
  const response = await requestJson<BackendProduct>(`/public/products/${slug}`);
  return mapProduct(response);
}
