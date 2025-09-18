
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AssetManagement } from "@/components/assets/AssetManagement";
import { ContactManagement } from "@/components/contacts/ContactManagement";
import { PropertyOwnerManagement } from "@/components/propertyowners/PropertyOwnerManagement";
import { PaymentTracking } from "@/components/payments/PaymentTracking";
import { Settings } from "@/components/settings/Settings";
import { ContractCreation } from "@/components/contracts/ContractCreation";
import { ContractManagement } from "@/components/contracts/ContractManagement";


export type NavigationItem = 
  | "dashboard" 
  | "assets" 
  | "contacts" 
  | "propertyowners"
  | "payments" 
  | "contracts"
  | "contract-management"
  | "settings";

const Index = () => {
  const [activeSection, setActiveSection] = useState<NavigationItem>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "assets":
        return <AssetManagement />;
      case "contacts":
        return <ContactManagement />;
      case "propertyowners":
        return <PropertyOwnerManagement />;
      case "payments":
        return <PaymentTracking />;
      case "contracts":
        return <ContractCreation />;
      case "contract-management":
        return <ContractManagement />;
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
