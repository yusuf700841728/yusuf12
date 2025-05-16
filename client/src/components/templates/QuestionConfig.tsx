import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUESTION_TYPES } from "@/lib/utils";

interface QuestionConfigProps {
  question: any;
  index: number;
  fields: any[];
  onChange: (index: number, question: any) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export default function QuestionConfig({ 
  question, 
  index, 
  fields, 
  onChange, 
  onRemove, 
  disabled = false 
}: QuestionConfigProps) {
  const [questionData, setQuestionData] = useState(question);
  
  useEffect(() => {
    setQuestionData(question);
  }, [question]);
  
  const handleChange = (key: string, value: any) => {
    const updatedQuestion = { ...questionData, [key]: value };
    setQuestionData(updatedQuestion);
    onChange(index, updatedQuestion);
  };
  
  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          <i className="fas fa-grip-vertical text-neutral-300 ml-2 cursor-move"></i>
          <div className="font-medium">
            <Input
              placeholder="نص السؤال"
              value={questionData.text}
              onChange={(e) => handleChange("text", e.target.value)}
              className="font-medium border-0 p-0 h-auto bg-transparent focus-visible:ring-0"
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="flex space-x-2 space-x-reverse">
          <button 
            type="button"
            className="text-neutral-500 hover:text-neutral-700"
            disabled={disabled}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            type="button"
            className="text-destructive hover:text-red-700"
            onClick={() => onRemove(index)}
            disabled={disabled}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="block text-xs text-neutral-500 mb-1">نوع السؤال</Label>
          <Select
            value={questionData.type}
            onValueChange={(value) => handleChange("type", value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر نوع السؤال" />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="block text-xs text-neutral-500 mb-1">مرتبط بالحقل</Label>
          <Select
            value={questionData.fieldId || "none"}
            onValueChange={(value) => handleChange("fieldId", value === "none" ? undefined : value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر الحقل المرتبط" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">غير مرتبط</SelectItem>
              {fields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="block text-xs text-neutral-500 mb-1">إلزامي</Label>
          <div className="mt-1">
            <label className="inline-flex items-center">
              <Checkbox 
                checked={questionData.required}
                onCheckedChange={(checked) => handleChange("required", checked)}
                disabled={disabled}
              />
              <span className="mr-2 text-sm">سؤال إلزامي</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
