import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Starting seed process...");

    // Check if we already have categories
    const existingCategories = await db.query.categories.findMany();
    
    // Only seed if no categories exist
    if (existingCategories.length === 0) {
      console.log("Seeding categories...");
      
      // Insert categories
      const categories = [
        { name: "Data Access", color: "#3B82F6" }, // Blue
        { name: "Report Issues", color: "#EF4444" }, // Red
        { name: "Clarification", color: "#8B5CF6" }, // Purple
        { name: "Data Updates", color: "#10B981" }  // Green
      ];
      
      const insertedCategories = await db.insert(schema.categories)
        .values(categories)
        .returning();
      
      console.log(`Inserted ${insertedCategories.length} categories`);
      
      // Insert variables
      console.log("Seeding variables...");
      
      const variables = [
        { name: "customer.name", description: "Customer's full name", exampleValue: "John Smith" },
        { name: "customer.email", description: "Customer's email address", exampleValue: "john.smith@example.com" },
        { name: "customer.company", description: "Customer's company name", exampleValue: "Acme Inc." },
        { name: "user.name", description: "Your name", exampleValue: "Alex Morgan" },
        { name: "user.title", description: "Your job title", exampleValue: "Data Analyst" },
        { name: "company.name", description: "Your company name", exampleValue: "DataCorp" },
        { name: "company.email", description: "Support email address", exampleValue: "support@datacorp.com" },
        { name: "verification_link", description: "Link for customer verification", exampleValue: "https://example.com/verify/ID12345" },
        { name: "delivery_timeframe", description: "Timeframe for data delivery", exampleValue: "3" },
        { name: "issue_reference", description: "Issue tracking reference", exampleValue: "ISSUE-1234" },
        { name: "resolution_date", description: "Expected resolution date", exampleValue: "August 15, 2023" }
      ];
      
      const insertedVariables = await db.insert(schema.variables)
        .values(variables)
        .returning();
      
      console.log(`Inserted ${insertedVariables.length} variables`);
      
      // Insert templates
      console.log("Seeding templates...");
      
      const templates = [
        {
          name: "Data Access Request",
          content: "Hello {{customer.name}},\n\nThank you for your request to access your data. We'll process your request according to our data policies.\n\nTo confirm your identity, please complete the verification process at our secure portal: {{verification_link}}\n\nOnce verified, you'll receive your data within {{delivery_timeframe}} business days.\n\nLet me know if you have any questions.\n\nBest regards,\n{{user.name}}\n{{company.name}} Data Team",
          categoryId: insertedCategories[0].id, // Data Access
          headerColor: "#3B82F6",
          accentColor: "#6366F1"
        },
        {
          name: "Data Pipeline Error",
          content: "Hello {{customer.name}},\n\nWe're currently experiencing an issue with the data pipeline that's affecting your reports. Our team is actively working on resolving this issue (Reference: {{issue_reference}}).\n\nWe estimate the issue will be resolved by {{resolution_date}}. In the meantime, you can access the last successfully processed data from yesterday.\n\nWe apologize for any inconvenience this may cause and will notify you once service is fully restored.\n\nBest regards,\n{{user.name}}\n{{company.name}} Data Team",
          categoryId: insertedCategories[1].id, // Report Issues
          headerColor: "#EF4444",
          accentColor: "#6366F1"
        },
        {
          name: "Data Metrics Inquiry",
          content: "Hello {{customer.name}},\n\nThank you for your inquiry about our data calculation methodologies.\n\nThe metrics in your dashboard are calculated using a rolling 30-day window with daily aggregation. This approach ensures that short-term fluctuations don't overly influence the trend analysis.\n\nFor more detailed information, I've included some helpful resources:\n- Documentation: https://docs.example.com/metrics\n- Knowledge Base: https://support.example.com/kb/calculation-methods\n\nPlease let me know if you have any additional questions.\n\nBest regards,\n{{user.name}}\n{{company.name}} Data Team",
          categoryId: insertedCategories[2].id, // Clarification
          headerColor: "#8B5CF6",
          accentColor: "#6366F1"
        },
        {
          name: "Dataset Update Notice",
          content: "Hello {{customer.name}},\n\nWe're writing to inform you about an upcoming update to the {{customer.company}} dataset scheduled for {{resolution_date}}.\n\nChanges include:\n- Improved data normalization for better accuracy\n- New demographic fields added\n- Historical data corrected for Q1 2023\n\nThese changes will automatically be reflected in your dashboard. No action is required on your part.\n\nIf you have any questions about these updates, please reply to this message or contact us at {{company.email}}.\n\nBest regards,\n{{user.name}}\n{{company.name}} Data Team",
          categoryId: insertedCategories[3].id, // Data Updates
          headerColor: "#10B981",
          accentColor: "#6366F1"
        }
      ];
      
      const insertedTemplates = await db.insert(schema.templates)
        .values(templates)
        .returning();
      
      console.log(`Inserted ${insertedTemplates.length} templates`);
      
      // Create default brand settings
      console.log("Creating default brand settings...");
      
      const brandSettings = {
        companyName: "ResponseCraft",
        primaryColor: "#3B82F6",
        accentColor: "#6366F1",
        logoUrl: ""  // Empty default, will be configured by user
      };
      
      const insertedBrandSettings = await db.insert(schema.brandSettings)
        .values(brandSettings)
        .returning();
      
      console.log(`Created default brand settings`);
      
      // Seed some analytics data for demonstration
      console.log("Seeding analytics data...");
      
      const analytics = [];
      const now = new Date();
      
      // Create some usage data for each template
      for (const template of insertedTemplates) {
        // Determine how many analytics entries to create for this template (random between 5-20)
        const entries = Math.floor(Math.random() * 15) + 5;
        
        for (let i = 0; i < entries; i++) {
          // Random date within the last 30 days
          const date = new Date();
          date.setDate(now.getDate() - Math.floor(Math.random() * 30));
          
          analytics.push({
            templateId: template.id,
            timestamp: date,
            metadata: JSON.stringify({ action: Math.random() > 0.3 ? "use" : "copy" })
          });
        }
      }
      
      const insertedAnalytics = await db.insert(schema.templateAnalytics)
        .values(analytics)
        .returning();
      
      console.log(`Inserted ${insertedAnalytics.length} analytics records`);
    } else {
      console.log("Database already seeded. Skipping seed process.");
    }
    
    console.log("Seed process completed successfully!");
  } catch (error) {
    console.error("Error during seed process:", error);
  }
}

seed();
