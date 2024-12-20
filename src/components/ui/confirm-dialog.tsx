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
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data?: any) => void;
  title: string;
  description: string;
  actionLabel?: string;
  variant?: 'default' | 'destructive';
  fields?: {
    type: 'select' | 'textarea';
    name: string;
    label: string;
    placeholder?: string;
    options?: { label: string; value: string }[];
    required?: boolean;
  }[];
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  actionLabel = "Continue",
  variant = "default",
  fields
}: ConfirmDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleConfirm = () => {
    onConfirm(formData);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            {description}
            
            {fields && (
              <div className="space-y-4 mt-4">
                {fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>{field.label}</Label>
                    {field.type === 'select' ? (
                      <Select
                        value={formData[field.name]}
                        onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, [field.name]: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Textarea
                        id={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => 
                          setFormData(prev => ({ ...prev, [field.name]: e.target.value }))
                        }
                        className="h-20"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={cn(
              variant === 'destructive' && 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
            )}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 