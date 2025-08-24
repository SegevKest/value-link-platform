
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  CreditCard, 
  Settings,
  ChevronLeft,
  ChevronRight,
  FileSignature
} from "lucide-react";
import type { NavigationItem } from "@/pages/Index";

interface SidebarProps {
  activeSection: NavigationItem;
  onSectionChange: (section: NavigationItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navigationItems = [
  {
    id: "dashboard" as NavigationItem,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "assets" as NavigationItem,
    label: "Assets",
    icon: Package,
  },
  {
    id: "contacts" as NavigationItem,
    label: "Contacts",
    icon: Users,
  },
  {
    id: "payments" as NavigationItem,
    label: "Payments",
    icon: CreditCard,
  },
  {
    id: "contracts" as NavigationItem,
    label: "Contracts",
    icon: FileSignature,
  },
  {
    id: "settings" as NavigationItem,
    label: "Settings",
    icon: Settings,
  },
];

export const Sidebar = ({ 
  activeSection, 
  onSectionChange, 
  collapsed, 
  onToggleCollapse 
}: SidebarProps) => {
  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-900">AssetFlow</h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-2"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                collapsed && "justify-center px-2",
                isActive && "bg-blue-600 hover:bg-blue-700 text-white"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* User section placeholder */}
      <div className="p-4 border-t border-gray-200">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">User</p>
              <p className="text-xs text-gray-500 truncate">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
