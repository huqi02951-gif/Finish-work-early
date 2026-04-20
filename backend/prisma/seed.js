const bcrypt = require('bcrypt');
const {
  BoardStatus,
  CatalogStatus,
  CommentStatus,
  PostSourceType,
  PostStatus,
  PostType,
  PrismaClient,
  TagStatus,
  UserRole,
  UserStatus,
} = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const prisma = new PrismaClient({
  datasourceUrl: connectionString,
});

function toJsonValue(value) {
  return JSON.parse(JSON.stringify(value));
}

const HOME_PAGE_DEFAULT_CONFIG = require('./seed-data/page-configs/home_page.json');
const SKILLS_LIBRARY_PAGE_DEFAULT_CONFIG = require('./seed-data/page-configs/skills_library_page.json');
const BUSINESS_GUIDE_PRODUCTS = require('./seed-data/products/business-guide-products.json');
const SKILLS = require('./seed-data/skills/skills.json');
const FORUM_GUIDE_POSTS = require('./seed-data/forum/forum-guide-posts.json');
const BBS_SEED_POSTS = require('./seed-data/forum/bbs-seed-posts.json');

function slugifyTag(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

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

async function seedForumBoards() {
  const boards = [
    {
      slug: 'official-help',
      name: '官方帮助',
      description: '官方帮助帖、用户手册、常见问题。',
      sortOrder: 100,
      isOfficial: true,
      requiresReview: false,
    },
    {
      slug: 'official-updates',
      name: '官方更新',
      description: '版本更新、功能变化、重要公告。',
      sortOrder: 90,
      isOfficial: true,
      requiresReview: false,
    },
    {
      slug: 'experience-sharing',
      name: '经验分享',
      description: '客户经理实战经验、打法沉淀与防坑记录。',
      sortOrder: 80,
      isOfficial: false,
      requiresReview: false,
    },
    {
      slug: 'system-operations',
      name: '系统操作',
      description: '系统使用方法、工具操作路径、流程说明。',
      sortOrder: 70,
      isOfficial: false,
      requiresReview: false,
    },
    {
      slug: 'compliance-discussion',
      name: '合规探讨',
      description: '合规边界、审批口径、流程风险讨论。',
      sortOrder: 60,
      isOfficial: false,
      requiresReview: false,
    },
    {
      slug: 'product-practice',
      name: '产品实战',
      description: '长融保、长易担等产品的进门打法和推进经验。',
      sortOrder: 50,
      isOfficial: false,
      requiresReview: false,
    },
    {
      slug: 'skills-discussion',
      name: 'Skills 交流',
      description: '工具使用经验、适用场景和常见问题。',
      sortOrder: 40,
      isOfficial: false,
      requiresReview: false,
    },
    {
      slug: 'professional',
      name: '专业业务区',
      description: '产品经验、信贷操作、工具教程、产品建议。知识沉淀，共同进步。',
      sortOrder: 35,
      isOfficial: false,
      requiresReview: false,
    },
    {
      slug: 'pantry',
      name: '地下茶水间',
      description: '匿名吐槽、Gossip、二手交易、请开发者喝咖啡。',
      sortOrder: 30,
      isOfficial: false,
      requiresReview: false,
    },
    {
      slug: 'gossip',
      name: '限时流言板',
      description: '限时流言、匿名爆料、即时情报。12小时自动焚毁。',
      sortOrder: 25,
      isOfficial: false,
      requiresReview: false,
    },
  ];

  for (const board of boards) {
    await prisma.board.upsert({
      where: { slug: board.slug },
      update: {
        ...board,
        status: BoardStatus.ACTIVE,
        deletedAt: null,
      },
      create: {
        ...board,
        status: BoardStatus.ACTIVE,
      },
    });
  }
}

async function seedForumTags() {
  const tagNames = [
    '新手必看',
    'APEX',
    '帮助帖',
    '业务通',
    '长融保',
    '长易担',
    'Skills',
    '持续更新',
    '系统操作',
    '经验分享',
    '合规探讨',
    '产品实战',
  ];

  for (const [index, name] of tagNames.entries()) {
    await prisma.tag.upsert({
      where: { name },
      update: {
        slug: slugifyTag(name),
        sortOrder: tagNames.length - index,
        status: TagStatus.ACTIVE,
      },
      create: {
        name,
        slug: slugifyTag(name),
        sortOrder: tagNames.length - index,
        status: TagStatus.ACTIVE,
      },
    });
  }
}

async function syncPostTags(postId, tagNames) {
  const normalizedNames = Array.from(
    new Set((tagNames || []).map((item) => String(item || '').trim()).filter(Boolean)),
  );

  await prisma.postTag.deleteMany({ where: { postId } });
  if (normalizedNames.length === 0) return;

  const tags = [];
  for (const [index, name] of normalizedNames.entries()) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {
        slug: slugifyTag(name),
        sortOrder: normalizedNames.length - index,
        status: TagStatus.ACTIVE,
      },
      create: {
        name,
        slug: slugifyTag(name),
        sortOrder: normalizedNames.length - index,
        status: TagStatus.ACTIVE,
      },
      select: { id: true },
    });
    tags.push(tag);
  }

  await prisma.postTag.createMany({
    data: tags.map((tag) => ({
      postId,
      tagId: tag.id,
    })),
    skipDuplicates: true,
  });
}

async function seedForumOfficialPosts(adminUserId) {
  const helpBoard = await prisma.board.findUnique({
    where: { slug: 'official-help' },
    select: { id: true, name: true },
  });
  const updatesBoard = await prisma.board.findUnique({
    where: { slug: 'official-updates' },
    select: { id: true, name: true },
  });

  for (const post of FORUM_GUIDE_POSTS) {
    const content = post.sections
      .map((section) => `${section.title}\n${section.body.join('\n')}`)
      .join('\n\n');

    const record = await prisma.post.upsert({
      where: { externalKey: `guide:${post.slug}` },
      update: {
        boardId: helpBoard.id,
        title: post.title,
        summary: post.summary,
        content,
        contentData: toJsonValue({ sections: post.sections }),
        category: helpBoard.name,
        postType: PostType.GUIDE,
        sourceType: PostSourceType.SEED,
        isOfficial: true,
        isPinned: post.sortOrder <= 20,
        pinnedAt: post.sortOrder <= 20 ? new Date() : null,
        status: PostStatus.PUBLISHED,
        deletedAt: null,
        authorId: adminUserId,
      },
      create: {
        externalKey: `guide:${post.slug}`,
        boardId: helpBoard.id,
        title: post.title,
        summary: post.summary,
        content,
        contentData: toJsonValue({ sections: post.sections }),
        category: helpBoard.name,
        postType: PostType.GUIDE,
        sourceType: PostSourceType.SEED,
        isOfficial: true,
        isPinned: post.sortOrder <= 20,
        pinnedAt: post.sortOrder <= 20 ? new Date() : null,
        status: PostStatus.PUBLISHED,
        authorId: adminUserId,
      },
      select: { id: true },
    });

    await syncPostTags(record.id, [...post.tags, '官方帮助']);
  }

  const updateRecord = await prisma.post.upsert({
    where: { externalKey: 'update:apex-bbs-v1-launch' },
    update: {
      boardId: updatesBoard.id,
      title: 'APEX 社区 V1 已上线',
      summary: '正式业务社区、官方帮助帖、经验交流与评论能力已接入数据库。',
      content:
        '本次上线内容包括：\n1. 正式业务社区切到真实后端。\n2. 官方帮助帖可在论坛中统一展示。\n3. 注册用户可发帖、评论，管理员可隐藏、置顶、锁评。\n4. 后续会继续补产品页、Skills 页的相关讨论联动。',
      category: updatesBoard.name,
      postType: PostType.UPDATE,
      sourceType: PostSourceType.SEED,
      isOfficial: true,
      isPinned: true,
      pinnedAt: new Date(),
      status: PostStatus.PUBLISHED,
      deletedAt: null,
      authorId: adminUserId,
    },
    create: {
      externalKey: 'update:apex-bbs-v1-launch',
      boardId: updatesBoard.id,
      title: 'APEX 社区 V1 已上线',
      summary: '正式业务社区、官方帮助帖、经验交流与评论能力已接入数据库。',
      content:
        '本次上线内容包括：\n1. 正式业务社区切到真实后端。\n2. 官方帮助帖可在论坛中统一展示。\n3. 注册用户可发帖、评论，管理员可隐藏、置顶、锁评。\n4. 后续会继续补产品页、Skills 页的相关讨论联动。',
      category: updatesBoard.name,
      postType: PostType.UPDATE,
      sourceType: PostSourceType.SEED,
      isOfficial: true,
      isPinned: true,
      pinnedAt: new Date(),
      status: PostStatus.PUBLISHED,
      authorId: adminUserId,
    },
    select: { id: true },
  });
  await syncPostTags(updateRecord.id, ['APEX', '持续更新', '官方']);
}

async function seedForumSamplePosts(adminUserId) {
  const author = await prisma.user.upsert({
    where: { username: 'rm_seed' },
    update: {
      nickname: '客户经理示例用户',
      status: UserStatus.ACTIVE,
    },
    create: {
      username: 'rm_seed',
      nickname: '客户经理示例用户',
      passwordHash: await bcrypt.hash('SeedUser123!', 10),
      status: UserStatus.ACTIVE,
      role: UserRole.USER,
    },
    select: { id: true },
  });

  const boards = await prisma.board.findMany({
    where: {
      slug: {
        in: ['experience-sharing', 'system-operations', 'product-practice', 'skills-discussion'],
      },
    },
    select: { id: true, slug: true, name: true },
  });
  const boardBySlug = new Map(boards.map((item) => [item.slug, item]));

  const samples = [
    {
      externalKey: 'seed:experience:chang-yi-dan-entry',
      boardSlug: 'product-practice',
      title: '长易担第一次进门不要先谈利率，先谈它为什么适合现在做',
      summary: '适合科技企业和制造业客户的第一轮沟通口径。',
      content:
        '最近跑下来，长易担第一句不要先说“利率怎么样”，而是先说它是当前政策导向比较强、适合真实经营和中长期融资安排的产品。客户如果本来就有设备投入、研发投入或订单周转需求，更容易听进去。',
      postType: PostType.DISCUSSION,
      tags: ['长易担', '产品实战'],
      relatedProductSlug: 'chang_yi_dan',
      authorId: author.id,
    },
    {
      externalKey: 'seed:system:workspace-usage',
      boardSlug: 'system-operations',
      title: '业务社区怎么用最省事：先看官方帖，再补自己的经验',
      summary: '适合刚开始用 APEX 的同事。',
      content:
        '建议先看置顶官方帖，把入口和基本逻辑先过一遍。自己在跑业务过程中遇到能复用的口径、材料、流程，再补成经验帖。这样论坛会越来越像一个能直接用的经验库。',
      postType: PostType.TOPIC,
      tags: ['系统操作', 'APEX'],
      authorId: adminUserId,
    },
    {
      externalKey: 'seed:skills:sensitive-comm',
      boardSlug: 'skills-discussion',
      title: '敏感沟通助手适合放在客户已经有异议、但还没完全拒绝的时候用',
      summary: '不是所有沟通都适合直接套模板，先看场景。',
      content:
        '如果客户还在沟通窗口里，敏感沟通助手很适合先帮你整理语气和边界；如果客户已经明确拒绝，就更适合先整理内部判断，再决定是否继续推进。',
      postType: PostType.DISCUSSION,
      tags: ['Skills', '经验分享'],
      relatedSkillSlug: 'sensitive-comm-assistant',
      authorId: author.id,
    },
  ];

  for (const sample of samples) {
    const board = boardBySlug.get(sample.boardSlug);
    const record = await prisma.post.upsert({
      where: { externalKey: sample.externalKey },
      update: {
        boardId: board.id,
        title: sample.title,
        summary: sample.summary,
        content: sample.content,
        category: board.name,
        postType: sample.postType,
        sourceType: PostSourceType.SEED,
        isOfficial: false,
        status: PostStatus.PUBLISHED,
        relatedProductSlug: sample.relatedProductSlug || null,
        relatedSkillSlug: sample.relatedSkillSlug || null,
        authorId: sample.authorId,
        deletedAt: null,
      },
      create: {
        externalKey: sample.externalKey,
        boardId: board.id,
        title: sample.title,
        summary: sample.summary,
        content: sample.content,
        category: board.name,
        postType: sample.postType,
        sourceType: PostSourceType.SEED,
        isOfficial: false,
        status: PostStatus.PUBLISHED,
        relatedProductSlug: sample.relatedProductSlug || null,
        relatedSkillSlug: sample.relatedSkillSlug || null,
        authorId: sample.authorId,
      },
      select: { id: true },
    });

    await syncPostTags(record.id, sample.tags);
  }

  const topic = await prisma.post.findUnique({
    where: { externalKey: 'seed:system:workspace-usage' },
    select: { id: true },
  });

  if (topic) {
    const existingCount = await prisma.comment.count({
      where: {
        postId: topic.id,
        authorId: author.id,
        content: '这个建议很实用，后面可以再补一个“发帖模板”官方帖。',
        deletedAt: null,
      },
    });

    if (existingCount === 0) {
      await prisma.comment.create({
        data: {
          postId: topic.id,
          authorId: author.id,
          content: '这个建议很实用，后面可以再补一个“发帖模板”官方帖。',
          status: CommentStatus.PUBLISHED,
        },
      });
    }
  }
}

async function seedBBSPosts(adminUserId) {
  const bbsAuthor = await prisma.user.upsert({
    where: { username: 'bbs_seed' },
    update: {
      nickname: 'BBS 示例用户',
      status: UserStatus.ACTIVE,
    },
    create: {
      username: 'bbs_seed',
      nickname: 'BBS 示例用户',
      passwordHash: await bcrypt.hash('BBSSeed123!', 10),
      status: UserStatus.ACTIVE,
      role: UserRole.USER,
    },
    select: { id: true },
  });

  const boards = await prisma.board.findMany({
    where: {
      slug: { in: ['professional', 'pantry', 'gossip'] },
    },
    select: { id: true, slug: true, name: true },
  });
  const boardBySlug = new Map(boards.map((item) => [item.slug, item]));

  for (const post of BBS_SEED_POSTS) {
    const board = boardBySlug.get(post.boardSlug);
    if (!board) continue;

    const record = await prisma.post.upsert({
      where: { externalKey: post.externalKey },
      update: {
        boardId: board.id,
        title: post.title,
        summary: post.summary || null,
        content: post.content,
        category: post.category || board.name,
        postType: post.postType || PostType.DISCUSSION,
        sourceType: PostSourceType.SEED,
        isOfficial: post.isOfficial || false,
        isPinned: post.isPinned || false,
        pinnedAt: post.isPinned ? new Date() : null,
        status: PostStatus.PUBLISHED,
        authorId: post.isOfficial ? adminUserId : bbsAuthor.id,
        deletedAt: null,
      },
      create: {
        externalKey: post.externalKey,
        boardId: board.id,
        title: post.title,
        summary: post.summary || null,
        content: post.content,
        category: post.category || board.name,
        postType: post.postType || PostType.DISCUSSION,
        sourceType: PostSourceType.SEED,
        isOfficial: post.isOfficial || false,
        isPinned: post.isPinned || false,
        pinnedAt: post.isPinned ? new Date() : null,
        status: PostStatus.PUBLISHED,
        authorId: post.isOfficial ? adminUserId : bbsAuthor.id,
      },
      select: { id: true },
    });

    await syncPostTags(record.id, post.tags || []);
  }
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
  await seedForumBoards();
  await seedForumTags();
  await seedForumOfficialPosts(admin.id);
  await seedForumSamplePosts(admin.id);
  await seedBBSPosts(admin.id);
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
