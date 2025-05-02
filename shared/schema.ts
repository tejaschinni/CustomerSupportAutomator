import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users (already defined in the initial file)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories for templates
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#3B82F6"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesInsertSchema = createInsertSchema(categories);
export type InsertCategory = z.infer<typeof categoriesInsertSchema>;
export type Category = typeof categories.$inferSelect;

// Templates
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  headerColor: text("header_color").default("#3B82F6"),
  accentColor: text("accent_color").default("#6366F1"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const templatesInsertSchema = createInsertSchema(templates, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  content: (schema) => schema.min(10, "Content must be at least 10 characters"),
});

export type InsertTemplate = z.infer<typeof templatesInsertSchema>;
export type Template = typeof templates.$inferSelect;

// Template variables (stored as examples)
export const variables = pgTable("variables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  exampleValue: text("example_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const variablesInsertSchema = createInsertSchema(variables);
export type InsertVariable = z.infer<typeof variablesInsertSchema>;
export type Variable = typeof variables.$inferSelect;

// Brand settings
export const brandSettings = pgTable("brand_settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  primaryColor: text("primary_color").default("#3B82F6"),
  accentColor: text("accent_color").default("#6366F1"),
  logoUrl: text("logo_url"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const brandSettingsInsertSchema = createInsertSchema(brandSettings);
export type InsertBrandSettings = z.infer<typeof brandSettingsInsertSchema>;
export type BrandSettings = typeof brandSettings.$inferSelect;

// Template usage analytics
export const templateAnalytics = pgTable("template_analytics", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => templates.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: json("metadata"),
});

export const templateAnalyticsInsertSchema = createInsertSchema(templateAnalytics);
export type InsertTemplateAnalytics = z.infer<typeof templateAnalyticsInsertSchema>;
export type TemplateAnalytics = typeof templateAnalytics.$inferSelect;

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  templates: many(templates),
}));

export const templatesRelations = relations(templates, ({ one }) => ({
  category: one(categories, { fields: [templates.categoryId], references: [categories.id] }),
  user: one(users, { fields: [templates.userId], references: [users.id] }),
}));

export const templateAnalyticsRelations = relations(templateAnalytics, ({ one }) => ({
  template: one(templates, { fields: [templateAnalytics.templateId], references: [templates.id] }),
  user: one(users, { fields: [templateAnalytics.userId], references: [users.id] }),
}));

export const brandSettingsRelations = relations(brandSettings, ({ one }) => ({
  user: one(users, { fields: [brandSettings.userId], references: [users.id] }),
}));
