import React, { KeyboardEvent, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
  placeholder?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

export function TagInput({
  placeholder = "Add tag...",
  tags,
  onTagsChange,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onTagsChange([...tags, inputValue.trim()]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={cn("flex flex-wrap gap-2 p-1 min-h-[80px] rounded-md border border-input bg-background", className)}>
      <div className="flex flex-wrap gap-2 p-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 px-3"
          >
            {tag}
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
} 