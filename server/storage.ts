import {
  users, type User, type InsertUser,
  clients, type Client, type InsertClient,
  templates, type Template, type InsertTemplate,
  documents, type Document, type InsertDocument,
  reports, type Report, type InsertReport,
  type ArchiveMetadata
} from "@shared/schema";
import { db } from "./db";
import { eq, isNotNull } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Client methods
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientByIdNumber(idNumber: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Template methods
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;
  
  // Document methods
  getDocuments(): Promise<Document[]>;
  getDocumentsByTemplateId(templateId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Archive methods
  getArchivedDocuments(): Promise<Document[]>;
  archiveDocument(id: number, metadata: ArchiveMetadata): Promise<Document | undefined>;
  unarchiveDocument(id: number): Promise<Document | undefined>;
  
  // Report methods
  getReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  deleteReport(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private templates: Map<number, Template>;
  private documents: Map<number, Document>;
  private reports: Map<number, Report>;
  
  private userIdCounter: number;
  private clientIdCounter: number;
  private templateIdCounter: number;
  private documentIdCounter: number;
  private reportIdCounter: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.templates = new Map();
    this.documents = new Map();
    this.reports = new Map();
    
    this.userIdCounter = 1;
    this.clientIdCounter = 1;
    this.templateIdCounter = 1;
    this.documentIdCounter = 1;
    this.reportIdCounter = 1;
    
    // Add some initial data
    this.initializeData();
  }
  
  private initializeData() {
    // Add sample template for marriage contract
    const marriageTemplate: InsertTemplate = {
      name: "عقد زواج",
      description: "نموذج عقد زواج يتضمن بيانات الزوجين والشهود",
      fields: [
        {
          id: "field_1",
          name: "معلومات الزوج",
          type: "client",
          clientField: "name",
          required: true
        },
        {
          id: "field_2",
          name: "معلومات الزوجة",
          type: "client",
          clientField: "name",
          required: true
        },
        {
          id: "field_3",
          name: "تاريخ العقد",
          type: "date",
          format: "DMY",
          required: true
        }
      ],
      questions: [
        {
          id: "question_1",
          text: "هل تم التحقق من هوية الزوجين؟",
          type: "yesno",
          fieldId: "field_1",
          required: true
        },
        {
          id: "question_2",
          text: "هل هناك شروط خاصة للعقد؟",
          type: "yesno",
          required: false
        }
      ]
    };
    
    this.createTemplate(marriageTemplate);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Client methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async getClientByIdNumber(idNumber: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(
      (client) => client.idNumber === idNumber,
    );
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientIdCounter++;
    const now = new Date();
    const newClient: Client = {
      ...client,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.clients.set(id, newClient);
    return newClient;
  }
  
  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) return undefined;
    
    const updatedClient: Client = {
      ...existingClient,
      ...client,
      updatedAt: new Date()
    };
    
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }
  
  // Template methods
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }
  
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }
  
  async createTemplate(template: InsertTemplate): Promise<Template> {
    const id = this.templateIdCounter++;
    const now = new Date();
    const newTemplate: Template = {
      ...template,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }
  
  async updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined> {
    const existingTemplate = this.templates.get(id);
    if (!existingTemplate) return undefined;
    
    const updatedTemplate: Template = {
      ...existingTemplate,
      ...template,
      updatedAt: new Date()
    };
    
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }
  
  async deleteTemplate(id: number): Promise<boolean> {
    return this.templates.delete(id);
  }
  
  // Document methods
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }
  
  async getDocumentsByTemplateId(templateId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.templateId === templateId,
    );
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const now = new Date();
    const newDocument: Document = {
      ...document,
      id,
      archived: false,
      archiveMetadata: null,
      createdAt: now,
      updatedAt: now
    };
    this.documents.set(id, newDocument);
    return newDocument;
  }
  
  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) return undefined;
    
    const updatedDocument: Document = {
      ...existingDocument,
      ...document,
      updatedAt: new Date()
    };
    
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
  
  // Archive methods
  async getArchivedDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.archived,
    );
  }
  
  async archiveDocument(id: number, metadata: ArchiveMetadata): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) return undefined;
    
    const updatedDocument: Document = {
      ...existingDocument,
      archived: true,
      archiveMetadata: metadata,
      updatedAt: new Date()
    };
    
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  async unarchiveDocument(id: number): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) return undefined;
    
    const updatedDocument: Document = {
      ...existingDocument,
      archived: false,
      archiveMetadata: null,
      updatedAt: new Date()
    };
    
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  // Report methods
  async getReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }
  
  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    const id = this.reportIdCounter++;
    const now = new Date();
    const newReport: Report = {
      ...report,
      id,
      createdAt: now
    };
    this.reports.set(id, newReport);
    return newReport;
  }
  
  async deleteReport(id: number): Promise<boolean> {
    return this.reports.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Client methods
  async getClients(): Promise<Client[]> {
    return db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientByIdNumber(idNumber: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.idNumber, idNumber));
    return client || undefined;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db
      .insert(clients)
      .values(client)
      .returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return updatedClient || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db
      .delete(clients)
      .where(eq(clients.id, id));
    return true;
  }
  
  // Template methods
  async getTemplates(): Promise<Template[]> {
    return db.select().from(templates);
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db
      .insert(templates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined> {
    const [updatedTemplate] = await db
      .update(templates)
      .set(template)
      .where(eq(templates.id, id))
      .returning();
    return updatedTemplate || undefined;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    const result = await db
      .delete(templates)
      .where(eq(templates.id, id));
    return true;
  }
  
  // Document methods
  async getDocuments(): Promise<Document[]> {
    return db.select().from(documents);
  }

  async getDocumentsByTemplateId(templateId: number): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.templateId, templateId));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set(document)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db
      .delete(documents)
      .where(eq(documents.id, id));
    return true;
  }
  
  // Archive methods
  async getArchivedDocuments(): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.archived, true));
  }

  async archiveDocument(id: number, metadata: ArchiveMetadata): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set({
        archived: true,
        archiveMetadata: metadata
      })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  async unarchiveDocument(id: number): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set({
        archived: false,
        archiveMetadata: null
      })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument || undefined;
  }
  
  // Report methods
  async getReports(): Promise<Report[]> {
    return db.select().from(reports);
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values(report)
      .returning();
    return newReport;
  }

  async deleteReport(id: number): Promise<boolean> {
    const result = await db
      .delete(reports)
      .where(eq(reports.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
