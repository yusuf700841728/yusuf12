import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FieldConfig from "./FieldConfig";
import QuestionConfig from "./QuestionConfig";

// Define the template form schema
const templateSchema = z.object({
  name: z.string().min(2, { message: "اسم النموذج يجب أن يكون حرفين على الأقل" }),
  description: z.string().min(10, { message: "وصف النموذج يجب أن يكون 10 أحرف على الأقل" }),
  fields: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, { message: "اسم الحقل مطلوب" }),
      type: z.string().min(1, { message: "نوع الحقل مطلوب" }),
      clientField: z.string().optional(),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
      format: z.string().optional(),
    })
  ),
  questions: z.array(
    z.object({
      id: z.string(),
      text: z.string().min(1, { message: "نص السؤال مطلوب" }),
      type: z.string().min(1, { message: "نوع السؤال مطلوب" }),
      fieldId: z.string().optional(),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
    })
  ),
});

interface TemplateFormProps {
  template?: any;
  onSave: (data: any) => void;
  isPending?: boolean;
}

export default function TemplateForm({ template, onSave, isPending = false }: TemplateFormProps) {
  const [fields, setFields] = useState<any[]>(template?.fields || []);
  const [questions, setQuestions] = useState<any[]>(template?.questions || []);
  
  // Initialize the form with template data or empty values
  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template?.name || "",
      description: template?.description || "",
      fields: template?.fields || [],
      questions: template?.questions || []
    }
  });
  
  // Update form values when template changes
  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name || "",
        description: template.description || "",
        fields: template.fields || [],
        questions: template.questions || []
      });
      setFields(template.fields || []);
      setQuestions(template.questions || []);
    } else {
      form.reset({
        name: "",
        description: "",
        fields: [],
        questions: []
      });
      setFields([]);
      setQuestions([]);
    }
  }, [template, form]);
  
  const handleAddField = () => {
    const newField = {
      id: uuidv4(),
      name: "",
      type: "text",
      required: false
    };
    setFields([...fields, newField]);
    form.setValue("fields", [...fields, newField]);
  };
  
  const handleUpdateField = (index: number, updatedField: any) => {
    const updatedFields = [...fields];
    updatedFields[index] = updatedField;
    setFields(updatedFields);
    form.setValue("fields", updatedFields);
  };
  
  const handleRemoveField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    form.setValue("fields", updatedFields);
    
    // Also remove any questions linked to this field
    const fieldId = fields[index].id;
    const updatedQuestions = questions.filter(q => q.fieldId !== fieldId);
    setQuestions(updatedQuestions);
    form.setValue("questions", updatedQuestions);
  };
  
  const handleAddQuestion = () => {
    const newQuestion = {
      id: uuidv4(),
      text: "",
      type: "yesno",
      required: false
    };
    setQuestions([...questions, newQuestion]);
    form.setValue("questions", [...questions, newQuestion]);
  };
  
  const handleUpdateQuestion = (index: number, updatedQuestion: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = updatedQuestion;
    setQuestions(updatedQuestions);
    form.setValue("questions", updatedQuestions);
  };
  
  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    form.setValue("questions", updatedQuestions);
  };
  
  const onSubmit = (data: z.infer<typeof templateSchema>) => {
    onSave(data);
  };
  
  return (
    <Form {...form}>
      <form id="template-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <CardTitle className="font-medium text-base">بيانات النموذج</CardTitle>
            <button type="button" className="text-neutral-500 hover:text-neutral-700">
              <i className="fas fa-cog"></i>
            </button>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم النموذج</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="أدخل اسم النموذج" 
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف النموذج</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أدخل وصف النموذج" 
                      rows={2}
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Field definitions section */}
        <Card>
          <CardHeader className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <CardTitle className="font-medium text-base">حقول النموذج</CardTitle>
            <button 
              type="button" 
              className="text-primary hover:text-secondary"
              onClick={handleAddField}
            >
              <i className="fas fa-plus"></i> إضافة حقل
            </button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-gray-200">
            {fields.length > 0 ? (
              fields.map((field, index) => (
                <FieldConfig
                  key={field.id}
                  field={field}
                  index={index}
                  onChange={handleUpdateField}
                  onRemove={handleRemoveField}
                  disabled={isPending}
                />
              ))
            ) : (
              <div className="p-4 text-center text-neutral-500">
                لا توجد حقول. قم بإضافة حقل جديد.
              </div>
            )}
            
            {/* Add new field button */}
            <div className="p-4 text-center">
              <button 
                type="button"
                className="px-4 py-2 border border-dashed border-gray-300 rounded w-full text-neutral-500 hover:text-primary hover:border-primary"
                onClick={handleAddField}
              >
                <i className="fas fa-plus ml-2"></i>
                <span>إضافة حقل جديد</span>
              </button>
            </div>
          </CardContent>
        </Card>
        
        {/* Questions section */}
        <Card>
          <CardHeader className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <CardTitle className="font-medium text-base">أسئلة المتابعة</CardTitle>
            <button 
              type="button" 
              className="text-primary hover:text-secondary"
              onClick={handleAddQuestion}
            >
              <i className="fas fa-plus"></i> إضافة سؤال
            </button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-gray-200">
            {questions.length > 0 ? (
              questions.map((question, index) => (
                <QuestionConfig
                  key={question.id}
                  question={question}
                  index={index}
                  fields={fields}
                  onChange={handleUpdateQuestion}
                  onRemove={handleRemoveQuestion}
                  disabled={isPending}
                />
              ))
            ) : (
              <div className="p-4 text-center text-neutral-500">
                لا توجد أسئلة. قم بإضافة سؤال جديد.
              </div>
            )}
            
            {/* Add new question button */}
            <div className="p-4 text-center">
              <button 
                type="button"
                className="px-4 py-2 border border-dashed border-gray-300 rounded w-full text-neutral-500 hover:text-primary hover:border-primary"
                onClick={handleAddQuestion}
              >
                <i className="fas fa-plus ml-2"></i>
                <span>إضافة سؤال جديد</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
