import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Template routes
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplateById(id);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error(`Error fetching template ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const template = await storage.createTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.updateTemplate(id, req.body);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error(`Error updating template ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTemplate(id);
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting template ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Variables routes
  app.get("/api/variables", async (req, res) => {
    try {
      const variables = await storage.getVariables();
      res.json(variables);
    } catch (error) {
      console.error("Error fetching variables:", error);
      res.status(500).json({ message: "Failed to fetch variables" });
    }
  });

  app.post("/api/variables", async (req, res) => {
    try {
      const variable = await storage.createVariable(req.body);
      res.status(201).json(variable);
    } catch (error) {
      console.error("Error creating variable:", error);
      res.status(500).json({ message: "Failed to create variable" });
    }
  });

  // Brand settings routes
  app.get("/api/brand-settings", async (req, res) => {
    try {
      const settings = await storage.getBrandSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching brand settings:", error);
      res.status(500).json({ message: "Failed to fetch brand settings" });
    }
  });

  app.post("/api/brand-settings", async (req, res) => {
    try {
      const settings = await storage.createBrandSettings(req.body);
      res.status(201).json(settings);
    } catch (error) {
      console.error("Error creating brand settings:", error);
      res.status(500).json({ message: "Failed to create brand settings" });
    }
  });

  app.put("/api/brand-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const settings = await storage.updateBrandSettings(id, req.body);
      
      if (!settings) {
        return res.status(404).json({ message: "Brand settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      console.error(`Error updating brand settings ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update brand settings" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const summary = await storage.getAnalyticsSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching analytics summary:", error);
      res.status(500).json({ message: "Failed to fetch analytics summary" });
    }
  });

  app.get("/api/analytics", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "7days";
      const analytics = await storage.getAnalyticsByTimeRange(timeRange);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.post("/api/analytics/templates/:id/use", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.logTemplateUsage(id);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error logging template usage for ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to log template usage" });
    }
  });

  app.post("/api/analytics/templates/:id/copy", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.logTemplateCopy(id);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error logging template copy for ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to log template copy" });
    }
  });

  // PDF download route (simplified implementation)
  app.get("/api/templates/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplateById(id);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // In a real implementation, generate PDF here
      // For now, just return a success message
      res.json({ message: "PDF generation would happen here", template });
    } catch (error) {
      console.error(`Error generating PDF for template ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
