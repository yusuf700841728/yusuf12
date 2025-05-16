import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDate } from "@/lib/utils";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const archiveMetadataSchema = z.object({
  title: z.string().min(1, { message: "عنوان الوثيقة مطلوب" }),
  versionType: z.enum(["original", "copy"], {
    required_error: "نوع النسخة مطلوب",
  }),
  expiryDate: z.string().optional(),
  storageLocation: z.object({
    cabinet: z.string().min(1, { message: "رقم الخزانة مطلوب" }),
    shelf: z.string().min(1, { message: "رقم الرف مطلوب" }),
    folder: z.string().optional(),
  }),
  notes: z.string().optional(),
});

export default function ArchiveModule() {
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("unarchived");
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false);
  
  // Fetch all documents
  const { data: allDocuments = [], isLoading: isLoadingDocuments } = useQuery({
    queryKey: ["/api/documents"],
  });
  
  // Fetch archived documents
  const { data: archivedDocuments = [], isLoading: isLoadingArchived } = useQuery({
    queryKey: ["/api/archive"],
  });
  
  // Fetch templates for reference
  const { data: templates = [] } = useQuery({
    queryKey: ["/api/templates"],
  });
  
  // Create form for archive metadata
  const archiveForm = useForm<z.infer<typeof archiveMetadataSchema>>({
    resolver: zodResolver(archiveMetadataSchema),
    defaultValues: {
      title: "",
      versionType: "original",
      expiryDate: "",
      storageLocation: {
        cabinet: "",
        shelf: "",
        folder: "",
      },
      notes: "",
    },
  });
  
  // Mutations
  const archiveDocumentMutation = useMutation({
    mutationFn: (data: { id: number; metadata: any }) => 
      apiRequest("POST", `/api/archive/${data.id}`, data.metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/archive"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "تم أرشفة الوثيقة بنجاح",
        variant: "default",
      });
      setIsArchiveDialogOpen(false);
      setSelectedDocument(null);
    },
    onError: (error) => {
      toast({
        title: "خطأ في أرشفة الوثيقة",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const unarchiveDocumentMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/archive/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/archive"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "تم إلغاء أرشفة الوثيقة بنجاح",
        variant: "default",
      });
      setIsUnarchiveDialogOpen(false);
      setSelectedDocument(null);
    },
    onError: (error) => {
      toast({
        title: "خطأ في إلغاء أرشفة الوثيقة",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter documents based on archived status
  const unarchivedDocuments = allDocuments.filter((doc: any) => !doc.archived);
  
  // Handle document selection
  const handleSelectDocument = (document: any) => {
    setSelectedDocument(document);
    
    // If document is already archived, pre-fill the form with existing metadata
    if (document.archived && document.archiveMetadata) {
      archiveForm.reset({
        title: document.archiveMetadata.title || "",
        versionType: document.archiveMetadata.versionType || "original",
        expiryDate: document.archiveMetadata.expiryDate || "",
        storageLocation: {
          cabinet: document.archiveMetadata.storageLocation?.cabinet || "",
          shelf: document.archiveMetadata.storageLocation?.shelf || "",
          folder: document.archiveMetadata.storageLocation?.folder || "",
        },
        notes: document.archiveMetadata.notes || "",
      });
    } else {
      // Reset form for new archive
      archiveForm.reset({
        title: "",
        versionType: "original",
        expiryDate: "",
        storageLocation: {
          cabinet: "",
          shelf: "",
          folder: "",
        },
        notes: "",
      });
    }
  };
  
  // Handle archive submission
  const handleArchiveSubmit = (data: z.infer<typeof archiveMetadataSchema>) => {
    if (!selectedDocument) {
      toast({
        title: "الرجاء اختيار وثيقة للأرشفة",
        variant: "destructive",
      });
      return;
    }
    
    archiveDocumentMutation.mutate({
      id: selectedDocument.id,
      metadata: data,
    });
  };
  
  // Handle unarchive confirmation
  const handleUnarchiveConfirm = () => {
    if (!selectedDocument) {
      toast({
        title: "الرجاء اختيار وثيقة لإلغاء الأرشفة",
        variant: "destructive",
      });
      return;
    }
    
    unarchiveDocumentMutation.mutate(selectedDocument.id);
  };
  
  // Handle archive button click
  const handleArchiveClick = () => {
    if (!selectedDocument) {
      toast({
        title: "الرجاء اختيار وثيقة للأرشفة",
        variant: "destructive",
      });
      return;
    }
    
    setIsArchiveDialogOpen(true);
  };
  
  // Handle unarchive button click
  const handleUnarchiveClick = () => {
    if (!selectedDocument) {
      toast({
        title: "الرجاء اختيار وثيقة لإلغاء الأرشفة",
        variant: "destructive",
      });
      return;
    }
    
    setIsUnarchiveDialogOpen(true);
  };
  
  // Get template name for a document
  const getTemplateName = (templateId: number) => {
    const template = templates.find((t: any) => t.id === templateId);
    return template ? template.name : `نموذج #${templateId}`;
  };
  
  return (
    <div className="flex-1 overflow-hidden flex flex-col" id="archive-module">
      {/* Command bar */}
      <div className="bg-white border-b border-gray-200 p-2 command-bar flex flex-wrap gap-2">
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handleArchiveClick}
          disabled={archiveDocumentMutation.isPending || !selectedDocument || (selectedDocument && selectedDocument.archived)}
        >
          <i className="fas fa-archive ml-2"></i>
          <span>أرشفة</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={handleUnarchiveClick}
          disabled={unarchiveDocumentMutation.isPending || !selectedDocument || (selectedDocument && !selectedDocument.archived)}
        >
          <i className="fas fa-box-open ml-2"></i>
          <span>إلغاء الأرشفة</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/archive"] });
            queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
          }}
          disabled={isLoadingDocuments || isLoadingArchived}
        >
          <i className="fas fa-sync-alt ml-2"></i>
          <span>تحديث</span>
        </button>
        
        <button 
          className="flex items-center px-3 py-1.5 rounded text-sm text-neutral-700 hover:bg-gray-100"
          onClick={() => window.print()}
          disabled={!selectedDocument}
        >
          <i className="fas fa-print ml-2"></i>
          <span>طباعة</span>
        </button>
      </div>
      
      {/* Content area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="unarchived">وثائق غير مؤرشفة</TabsTrigger>
            <TabsTrigger value="archived">الوثائق المؤرشفة</TabsTrigger>
          </TabsList>
          
          <TabsContent value="unarchived" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الوثائق غير المؤرشفة</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingDocuments ? (
                  <div className="text-center py-4">جاري تحميل البيانات...</div>
                ) : unarchivedDocuments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الوثيقة</TableHead>
                        <TableHead>نوع الوثيقة</TableHead>
                        <TableHead>تاريخ الإنشاء</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unarchivedDocuments.map((document: any) => (
                        <TableRow 
                          key={document.id}
                          className={`cursor-pointer ${selectedDocument?.id === document.id ? 'bg-blue-50' : ''}`}
                          onClick={() => handleSelectDocument(document)}
                        >
                          <TableCell>{document.id}</TableCell>
                          <TableCell>{getTemplateName(document.templateId)}</TableCell>
                          <TableCell>{formatDate(document.createdAt)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              غير مؤرشف
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    لا توجد وثائق غير مؤرشفة. جميع الوثائق تم أرشفتها.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="archived" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الوثائق المؤرشفة</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingArchived ? (
                  <div className="text-center py-4">جاري تحميل البيانات...</div>
                ) : archivedDocuments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الوثيقة</TableHead>
                        <TableHead>عنوان الوثيقة</TableHead>
                        <TableHead>نوع الوثيقة</TableHead>
                        <TableHead>تاريخ الأرشفة</TableHead>
                        <TableHead>موقع التخزين</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {archivedDocuments.map((document: any) => (
                        <TableRow 
                          key={document.id}
                          className={`cursor-pointer ${selectedDocument?.id === document.id ? 'bg-blue-50' : ''}`}
                          onClick={() => handleSelectDocument(document)}
                        >
                          <TableCell>{document.id}</TableCell>
                          <TableCell>{document.archiveMetadata?.title || 'بدون عنوان'}</TableCell>
                          <TableCell>{getTemplateName(document.templateId)}</TableCell>
                          <TableCell>{formatDate(document.updatedAt)}</TableCell>
                          <TableCell>
                            {document.archiveMetadata?.storageLocation ? (
                              `خزانة ${document.archiveMetadata.storageLocation.cabinet}، رف ${document.archiveMetadata.storageLocation.shelf}`
                            ) : (
                              'غير محدد'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    لا توجد وثائق مؤرشفة. قم بأرشفة بعض الوثائق أولاً.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Document details section */}
        {selectedDocument && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>
                تفاصيل الوثيقة
                {selectedDocument.archived && (
                  <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-100">
                    مؤرشف
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">بيانات الوثيقة</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">رقم الوثيقة:</span>
                      <span>{selectedDocument.id}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">نوع الوثيقة:</span>
                      <span>{getTemplateName(selectedDocument.templateId)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                      <span>{formatDate(selectedDocument.createdAt)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">آخر تحديث:</span>
                      <span>{formatDate(selectedDocument.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                
                {selectedDocument.archived && selectedDocument.archiveMetadata && (
                  <div>
                    <h3 className="font-semibold mb-2">بيانات الأرشفة</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">عنوان الوثيقة:</span>
                        <span>{selectedDocument.archiveMetadata.title || 'غير محدد'}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">نوع النسخة:</span>
                        <span>
                          {selectedDocument.archiveMetadata.versionType === 'original' ? 'أصل' : 'صورة'}
                        </span>
                      </div>
                      {selectedDocument.archiveMetadata.expiryDate && (
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                          <span>{formatDate(selectedDocument.archiveMetadata.expiryDate)}</span>
                        </div>
                      )}
                      {selectedDocument.archiveMetadata.storageLocation && (
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">موقع التخزين:</span>
                          <span>
                            خزانة {selectedDocument.archiveMetadata.storageLocation.cabinet}، 
                            رف {selectedDocument.archiveMetadata.storageLocation.shelf}
                            {selectedDocument.archiveMetadata.storageLocation.folder && 
                              `، ملف ${selectedDocument.archiveMetadata.storageLocation.folder}`}
                          </span>
                        </div>
                      )}
                      {selectedDocument.archiveMetadata.notes && (
                        <div className="border-b pb-1">
                          <span className="text-muted-foreground block">ملاحظات:</span>
                          <span className="mt-1 block">{selectedDocument.archiveMetadata.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Archive Dialog */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>أرشفة الوثيقة</AlertDialogTitle>
            <AlertDialogDescription>
              أدخل بيانات الأرشفة للوثيقة رقم {selectedDocument?.id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <Form {...archiveForm}>
            <form className="space-y-4" onSubmit={archiveForm.handleSubmit(handleArchiveSubmit)}>
              <FormField
                control={archiveForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الوثيقة</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل عنوان الوثيقة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={archiveForm.control}
                name="versionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع النسخة</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع النسخة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="original">أصل</SelectItem>
                        <SelectItem value="copy">صورة</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={archiveForm.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الانتهاء (اختياري)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <div className="font-medium text-sm">موقع التخزين</div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={archiveForm.control}
                    name="storageLocation.cabinet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الخزانة</FormLabel>
                        <FormControl>
                          <Input placeholder="رقم الخزانة" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={archiveForm.control}
                    name="storageLocation.shelf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الرف</FormLabel>
                        <FormControl>
                          <Input placeholder="رقم الرف" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={archiveForm.control}
                  name="storageLocation.folder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الملف (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="رقم الملف" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={archiveForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="ملاحظات إضافية" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction type="submit" className="bg-primary">أرشفة</AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Unarchive Confirmation Dialog */}
      <AlertDialog open={isUnarchiveDialogOpen} onOpenChange={setIsUnarchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إلغاء الأرشفة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في إلغاء أرشفة الوثيقة رقم {selectedDocument?.id}؟
              هذا سيؤدي إلى إزالة بيانات الأرشفة المرتبطة بهذه الوثيقة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnarchiveConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              تأكيد إلغاء الأرشفة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
