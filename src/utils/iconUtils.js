import {
  Target,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Briefcase,
  Bell,
  PieChart,
  Circle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

const iconMap = {
  Target,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Briefcase,
  Bell,
  PieChart,
  Circle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle
};

export const getIconComponent = (iconName) => {
  return iconMap[iconName] || Circle;
};