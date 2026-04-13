const fs = require('fs');
const path = require('path');
const vm = require('vm');
const bcrypt = require('bcrypt');
const ts = require('typescript');
const { PrismaPg } = require('@prisma/adapter-pg');
const {
  CatalogStatus,
  PrismaClient,
  UserRole,
  UserStatus,
} = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function loadNamedExport(filePath, exportName) {
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2021,
    },
  });

  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    require,
    console,
    process,
  };

  vm.runInNewContext(transpiled.outputText, sandbox, { filename: filePath });
  return module.exports[exportName];
}

function toJsonValue(value) {
  return JSON.parse(JSON.stringify(value));
}

const rootDir = path.resolve(__dirname, '..', '..');
const HOME_PAGE_DEFAULT_CONFIG = loadNamedExport(
  path.join(rootDir, 'content/pageConfigDefaults.ts'),
  'HOME_PAGE_DEFAULT_CONFIG',
);
const SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG = loadNamedExport(
  path.join(rootDir, 'content/pageConfigDefaults.ts'),
  'SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG',
);
const BUSINESS_GUIDE_PRODUCTS = loadNamedExport(
  path.join(rootDir, 'content/businessGuideProducts.ts'),
  'BUSINESS_GUIDE_PRODUCTS',
);
const SKILLS = loadNamedExport(path.join(rootDir, 'constants/skills.ts'), 'SKILLS');

async function seedAdmin() {
  const password = process.env.SEED_ADMIN_PASSWORD || 'Phase2Admin123!';
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      nickname: 'Phase 2 Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
    create: {
      username: 'admin',
      nickname: 'Phase 2 Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
  });
}

async function seedPageConfigs(adminUserId) {
  await prisma.pageConfig.upsert({
    where: { pageKey: 'home_page' },
    update: {
      configData: toJsonValue(HOME_PAGE_DEFAULT_CONFIG),
      schemaVersion: 1,
      publishedAt: new Date(),
      deletedAt: null,
      updatedById: adminUserId,
    },
    create: {
      pageKey: 'home_page',
      configData: toJsonValue(HOME_PAGE_DEFAULT_CONFIG),
      schemaVersion: 1,
      version: 1,
      publishedAt: new Date(),
      updatedById: adminUserId,
    },
  });

  await prisma.pageConfig.upsert({
    where: { pageKey: 'skills_library_page' },
    update: {
      configData: toJsonValue(SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG),
      schemaVersion: 1,
      publishedAt: new Date(),
      deletedAt: null,
      updatedById: adminUserId,
    },
    create: {
      pageKey: 'skills_library_page',
      configData: toJsonValue(SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG),
      schemaVersion: 1,
      version: 1,
      publishedAt: new Date(),
      updatedById: adminUserId,
    },
  });
}

async function seedSkills() {
  const total = SKILLS.length;

  for (const [index, skill] of SKILLS.entries()) {
    await prisma.skill.upsert({
      where: { slug: skill.id },
      update: {
        title: skill.name,
        category: skill.category,
        summary: skill.description,
        toolRoute: skill.toolRoute || null,
        formLabel: skill.form,
        status: CatalogStatus.PUBLISHED,
        sortOrder: total - index,
        detailData: toJsonValue(skill),
        deletedAt: null,
      },
      create: {
        slug: skill.id,
        title: skill.name,
        category: skill.category,
        summary: skill.description,
        toolRoute: skill.toolRoute || null,
        formLabel: skill.form,
        status: CatalogStatus.PUBLISHED,
        sortOrder: total - index,
        detailData: toJsonValue(skill),
      },
    });
  }
}

async function seedProducts() {
  const total = BUSINESS_GUIDE_PRODUCTS.length;

  for (const [index, product] of BUSINESS_GUIDE_PRODUCTS.entries()) {
    await prisma.product.upsert({
      where: { slug: product.id },
      update: {
        name: product.name,
        category: product.category,
        summary: product.overview,
        status: CatalogStatus.PUBLISHED,
        sortOrder: total - index,
        detailData: toJsonValue(product),
        deletedAt: null,
      },
      create: {
        slug: product.id,
        name: product.name,
        category: product.category,
        summary: product.overview,
        status: CatalogStatus.PUBLISHED,
        sortOrder: total - index,
        detailData: toJsonValue(product),
      },
    });
  }
}

async function seedProductSkillRelations() {
  const allSkills = await prisma.skill.findMany({
    select: { id: true, slug: true, toolRoute: true },
  });
  const skillIdBySlug = new Map(allSkills.map((item) => [item.slug, item.id]));
  const skillIdByRoute = new Map(
    allSkills.filter((item) => item.toolRoute).map((item) => [item.toolRoute, item.id]),
  );

  const supplementalSkillMap = {
    chang_rong_bao: ['business-guide-main'],
    chang_yi_dan: ['business-guide-main'],
    policy_tech_loan: ['business-guide-main'],
    account_settlement: ['material-checklist-main'],
  };

  for (const product of BUSINESS_GUIDE_PRODUCTS) {
    const record = await prisma.product.findUnique({
      where: { slug: product.id },
      select: { id: true },
    });
    if (!record) continue;

    const relationSkillIds = new Set();
    const slugLikeSkillId = skillIdBySlug.get(product.id.replace(/_/g, '-'));
    if (slugLikeSkillId) relationSkillIds.add(slugLikeSkillId);

    const relatedRouteSkillId = product.relatedSkill && product.relatedSkill.path
      ? skillIdByRoute.get(product.relatedSkill.path)
      : undefined;
    if (relatedRouteSkillId) relationSkillIds.add(relatedRouteSkillId);

    for (const skillSlug of supplementalSkillMap[product.id] || []) {
      const skillId = skillIdBySlug.get(skillSlug);
      if (skillId) relationSkillIds.add(skillId);
    }

    await prisma.productSkillRel.deleteMany({
      where: { productId: record.id },
    });

    const orderedSkillIds = Array.from(relationSkillIds);
    if (orderedSkillIds.length > 0) {
      await prisma.productSkillRel.createMany({
        data: orderedSkillIds.map((skillId, index) => ({
          productId: record.id,
          skillId,
          sortOrder: index,
        })),
      });
    }
  }
}

async function main() {
  const admin = await seedAdmin();
  await seedPageConfigs(admin.id);
  await seedSkills();
  await seedProducts();
  await seedProductSkillRelations();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
