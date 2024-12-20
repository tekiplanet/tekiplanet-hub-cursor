import React from "react";
import {
  Code,
  Smartphone,
  Palette,
  Shield,
  Database,
  Settings,
  Cloud,
  GitMerge,
} from "lucide-react";

type IconComponent = typeof Code;

// Add all icons that are used in professional categories
export const Icons: Record<string, IconComponent> = {
  Code,
  Smartphone,
  Palette,
  Shield,
  Database,
  Settings,
  Cloud,
  GitMerge,
};

export type Icon = keyof typeof Icons; 