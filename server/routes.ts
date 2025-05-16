import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  insertClientSchema,
  insertTemplateSchema,
  insertDocumentSchema,
  insertReportSchema,
  archiveMetadataSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler for validation errors
  const handleValidationError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ message: validationError.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  };

  // Client routes
  app.get("/api/clients", async (_req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (err) {
      res.status(500).json({ message: "Error fetching clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (err) {
      res.status(500).json({ message: "Error fetching client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      
      // Check if client with the same ID number already exists
      const existingClient = await storage.getClientByIdNumber(clientData.idNumber);
      if (existingClient) {
        return res.status(400).json({ message: "Client with this ID number already exists" });
      }
      
      const newClient = await storage.createClient(clientData);
      res.status(201).json(newClient);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      // Validate only the provided fields
      const clientData = insertClientSchema.partial().parse(req.body);
      
      const updatedClient = await storage.updateClient(id, clientData);
      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(updatedClient);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const deleted = await storage.deleteClient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Error deleting client" });
    }
  });

  // Template routes
  app.get("/api/templates", async (_req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (err) {
      res.status(500).json({ message: "Error fetching templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (err) {
      res.status(500).json({ message: "Error fetching template" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const templateData = insertTemplateSchema.parse(req.body);
      const newTemplate = await storage.createTemplate(templateData);
      res.status(201).json(newTemplate);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.patch("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const templateData = insertTemplateSchema.partial().parse(req.body);
      
      const updatedTemplate = await storage.updateTemplate(id, templateData);
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(updatedTemplate);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const deleted = await storage.deleteTemplate(id);
      if (!deleted) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Error deleting template" });
    }
  });

  // Document routes
  app.get("/api/documents", async (_req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (err) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (err) {
      res.status(500).json({ message: "Error fetching document" });
    }
  });
  
  app.get("/api/documents/template/:templateId", async (req, res) => {
    try {
      const templateId = parseInt(req.params.templateId);
      if (isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const documents = await storage.getDocumentsByTemplateId(templateId);
      res.json(documents);
    } catch (err) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      
      // Check if template exists
      const template = await storage.getTemplate(documentData.templateId);
      if (!template) {
        return res.status(400).json({ message: "Template not found" });
      }
      
      const newDocument = await storage.createDocument(documentData);
      res.status(201).json(newDocument);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const documentData = insertDocumentSchema.partial().parse(req.body);
      
      const updatedDocument = await storage.updateDocument(id, documentData);
      if (!updatedDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(updatedDocument);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const deleted = await storage.deleteDocument(id);
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Error deleting document" });
    }
  });

  // Archive routes
  app.get("/api/archive", async (_req, res) => {
    try {
      const archivedDocuments = await storage.getArchivedDocuments();
      res.json(archivedDocuments);
    } catch (err) {
      res.status(500).json({ message: "Error fetching archived documents" });
    }
  });

  app.post("/api/archive/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const metadata = archiveMetadataSchema.parse(req.body);
      
      const archivedDocument = await storage.archiveDocument(id, metadata);
      if (!archivedDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(archivedDocument);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.delete("/api/archive/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const unarchivedDocument = await storage.unarchiveDocument(id);
      if (!unarchivedDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(unarchivedDocument);
    } catch (err) {
      res.status(500).json({ message: "Error unarchiving document" });
    }
  });

  // Report routes
  app.get("/api/reports", async (_req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (err) {
      res.status(500).json({ message: "Error fetching reports" });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid report ID" });
      }
      
      const report = await storage.getReport(id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(report);
    } catch (err) {
      res.status(500).json({ message: "Error fetching report" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const newReport = await storage.createReport(reportData);
      res.status(201).json(newReport);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.delete("/api/reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid report ID" });
      }
      
      const deleted = await storage.deleteReport(id);
      if (!deleted) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Error deleting report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
