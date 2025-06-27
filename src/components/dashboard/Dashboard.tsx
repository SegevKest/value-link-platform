
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Users, 
  CreditCard, 
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Plus
} from "lucide-react";

const statsCards = [
  {
    title: "Total Assets",
    value: "1,247",
    change: "+12%",
    icon: Package,
    color: "text-blue-600",
  },
  {
    title: "Active Contacts",
    value: "384",
    change: "+8%",
    icon: Users,
    color: "text-green-600",
  },
  {
    title: "Monthly Revenue",
    value: "$54,231",
    change: "+23%",
    icon: DollarSign,
    color: "text-purple-600",
  },
  {
    title: "Pending Payments",
    value: "23",
    change: "-5%",
    icon: CreditCard,
    color: "text-orange-600",
  },
];

const recentAssets = [
  { id: 1, name: "Office Building A", type: "Real Estate", status: "Active", value: "$2.5M" },
  { id: 2, name: "Fleet Vehicle #247", type: "Vehicle", status: "Maintenance", value: "$45K" },
  { id: 3, name: "Server Rack #12", type: "Equipment", status: "Active", value: "$15K" },
  { id: 4, name: "Warehouse B", type: "Real Estate", status: "Under Review", value: "$1.8M" },
];

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your asset overview.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">{stat.change} from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assets */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Assets
              <Button variant="outline" size="sm">View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{asset.name}</p>
                      <p className="text-sm text-gray-500">{asset.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{asset.value}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      asset.status === 'Active' ? 'bg-green-100 text-green-700' :
                      asset.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {asset.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Add New Asset
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Add Contact
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <CreditCard className="h-4 w-4" />
                Record Payment
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-800">Maintenance Due</p>
                <p className="text-xs text-orange-600">5 assets require maintenance</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800">Overdue Payments</p>
                <p className="text-xs text-red-600">3 payments are overdue</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">Contract Renewal</p>
                <p className="text-xs text-blue-600">2 contracts expire this month</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
