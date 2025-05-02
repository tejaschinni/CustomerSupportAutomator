import { db } from "@db";
import { eq, and, desc, count, sum, sql } from "drizzle-orm";
import { 
  templates, 
  categories,
  variables, 
  brandSettings, 
  templateAnalytics 
} from "@shared/schema";

// Category operations
export const getCategories = async () => {
  return await db.query.categories.findMany({
    orderBy: categories.name,
  });
};

export const getCategoryById = async (id: number) => {
  return await db.query.categories.findFirst({
    where: eq(categories.id, id),
  });
};

export const createCategory = async (data: any) => {
  const [category] = await db.insert(categories).values(data).returning();
  return category;
};

// Template operations
export const getTemplates = async () => {
  return await db.query.templates.findMany({
    orderBy: desc(templates.updatedAt),
    with: {
      category: true,
    },
  });
};

export const getTemplateById = async (id: number) => {
  return await db.query.templates.findFirst({
    where: eq(templates.id, id),
    with: {
      category: true,
    },
  });
};

export const createTemplate = async (data: any) => {
  const [template] = await db.insert(templates).values(data).returning();
  return template;
};

export const updateTemplate = async (id: number, data: any) => {
  // Update updatedAt time
  data.updatedAt = new Date();
  
  const [template] = await db
    .update(templates)
    .set(data)
    .where(eq(templates.id, id))
    .returning();
  
  return template;
};

export const deleteTemplate = async (id: number) => {
  await db.delete(templates).where(eq(templates.id, id));
};

// Variable operations
export const getVariables = async () => {
  return await db.query.variables.findMany({
    orderBy: variables.name,
  });
};

export const createVariable = async (data: any) => {
  const [variable] = await db.insert(variables).values(data).returning();
  return variable;
};

// Brand settings operations
export const getBrandSettings = async () => {
  // Get the first brand settings (assuming only one record for now)
  const settings = await db.query.brandSettings.findFirst();
  return settings;
};

export const createBrandSettings = async (data: any) => {
  const [settings] = await db.insert(brandSettings).values(data).returning();
  return settings;
};

export const updateBrandSettings = async (id: number, data: any) => {
  // Update updatedAt time
  data.updatedAt = new Date();
  
  const [settings] = await db
    .update(brandSettings)
    .set(data)
    .where(eq(brandSettings.id, id))
    .returning();
  
  return settings;
};

// Analytics operations
export const getAnalyticsSummary = async () => {
  // Get total templates count
  const templatesCount = await db
    .select({ count: count() })
    .from(templates)
    .then(res => res[0]?.count || 0);
  
  // Get responses in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const responsesCount = await db
    .select({ count: count() })
    .from(templateAnalytics)
    .where(
      and(
        sql`${templateAnalytics.timestamp} >= ${sevenDaysAgo.toISOString()}`
      )
    )
    .then(res => res[0]?.count || 0);
  
  // Get most popular template
  const popularTemplate = await db
    .select({
      templateId: templateAnalytics.templateId,
      count: count(),
    })
    .from(templateAnalytics)
    .groupBy(templateAnalytics.templateId)
    .orderBy(desc(sql`count`))
    .limit(1)
    .then(async res => {
      if (res.length === 0) return null;
      
      const template = await getTemplateById(res[0].templateId);
      return template?.name || null;
    });
  
  return {
    totalTemplates: templatesCount,
    responsesThisWeek: responsesCount,
    avgResponseTime: "< 1 min", // Placeholder, could calculate actual value
    popularTemplate: popularTemplate || "None",
  };
};

export const getAnalyticsByTimeRange = async (timeRange: string) => {
  // Calculate date range based on timeRange
  const endDate = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case "30days":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90days":
      startDate.setDate(startDate.getDate() - 90);
      break;
    default: // 7days
      startDate.setDate(startDate.getDate() - 7);
  }
  
  // Get template usage data
  const templateUsage = await db
    .select({
      templateId: templateAnalytics.templateId,
      count: count(),
    })
    .from(templateAnalytics)
    .where(
      and(
        sql`${templateAnalytics.timestamp} >= ${startDate.toISOString()}`,
        sql`${templateAnalytics.timestamp} <= ${endDate.toISOString()}`
      )
    )
    .groupBy(templateAnalytics.templateId)
    .orderBy(desc(sql`count`))
    .limit(10);
  
  // Get daily responses data
  const dailyResponses = await db
    .select({
      date: sql`DATE(${templateAnalytics.timestamp})`,
      count: count(),
    })
    .from(templateAnalytics)
    .where(
      and(
        sql`${templateAnalytics.timestamp} >= ${startDate.toISOString()}`,
        sql`${templateAnalytics.timestamp} <= ${endDate.toISOString()}`
      )
    )
    .groupBy(sql`DATE(${templateAnalytics.timestamp})`)
    .orderBy(sql`DATE(${templateAnalytics.timestamp})`);
  
  // Get category distribution data
  const categoryDistribution = await db
    .select({
      categoryId: templates.categoryId,
      count: count(),
    })
    .from(templateAnalytics)
    .innerJoin(templates, eq(templateAnalytics.templateId, templates.id))
    .where(
      and(
        sql`${templateAnalytics.timestamp} >= ${startDate.toISOString()}`,
        sql`${templateAnalytics.timestamp} <= ${endDate.toISOString()}`
      )
    )
    .groupBy(templates.categoryId)
    .orderBy(desc(sql`count`))
    .then(async res => {
      const result = [];
      
      for (const item of res) {
        const category = await getCategoryById(item.categoryId);
        if (category) {
          result.push({
            name: category.name,
            value: item.count,
            color: category.color,
          });
        }
      }
      
      return result;
    });
  
  return {
    templateUsage,
    dailyResponses,
    categoryDistribution,
  };
};

export const logTemplateUsage = async (templateId: number) => {
  await db.insert(templateAnalytics).values({
    templateId,
    timestamp: new Date(),
    metadata: JSON.stringify({ action: "use" }),
  });
};

export const logTemplateCopy = async (templateId: number) => {
  await db.insert(templateAnalytics).values({
    templateId,
    timestamp: new Date(),
    metadata: JSON.stringify({ action: "copy" }),
  });
};

export const storage = {
  getCategories,
  getCategoryById,
  createCategory,
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getVariables,
  createVariable,
  getBrandSettings,
  createBrandSettings,
  updateBrandSettings,
  getAnalyticsSummary,
  getAnalyticsByTimeRange,
  logTemplateUsage,
  logTemplateCopy,
};
