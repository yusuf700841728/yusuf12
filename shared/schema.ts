import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (kept from original)
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

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  idNumber: text("id_number").notNull().unique(),
  idExpiry: text("id_expiry").notNull(),
  mobile: text("mobile").notNull(),
  idImageUrl: text("id_image_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Template schema
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  fields: jsonb("fields").notNull(), // Array of field definitions
  questions: jsonb("questions").notNull(), // Array of question definitions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Document schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  data: jsonb("data").notNull(), // Document data based on template fields
  archived: boolean("archived").default(false),
  archivedAt: timestamp("archived_at"),
  archiveMetadata: jsonb("archive_metadata"), // Archive-specific metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  archived: true,
  archivedAt: true,
  archiveMetadata: true,
  createdAt: true,
  updatedAt: true
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Archive metadata schema (used within documents)
export const archiveMetadataSchema = z.object({
  title: z.string().optional(),
  versionType: z.enum(["original", "copy"]).optional(),
  expiryDate: z.string().optional(),
  storageLocation: z.object({
    cabinet: z.string().optional(),
    shelf: z.string().optional(),
    folder: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export type ArchiveMetadata = z.infer<typeof archiveMetadataSchema>;

// Report schema
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // client, document, template, archive
  filters: jsonb("filters"), // Report filters
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
