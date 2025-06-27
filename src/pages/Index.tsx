
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AssetManagement } from "@/components/assets/AssetManagement";
import { ContactManagement } from "@/components/contacts/ContactManagement";
import { PaymentTracking } from "@/components/payments/PaymentTracking";
import { Settings } from "@/components/settings/Settings";

export type NavigationItem = 
  | "dashboard" 
  | "assets" 
  | "contacts" 
  | "payments" 
  | "settings";

const Index = () => {
  const [activeSection, setActiveSection] = useState<NavigationItem>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "assets":
        return <AssetManagement />;
      case "contacts":
        return <ContactManagement />;
      case "payments":
        return <PaymentTracking />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};

export default Index;
