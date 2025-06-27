
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

const paymentStats = [
  {
    title: "Total Revenue",
    value: "$124,563",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    title: "Pending Payments",
    value: "$18,420",
    change: "23 items",
    icon: Clock,
    color: "text-yellow-600",
  },
  {
    title: "Overdue",
    value: "$5,340",
    change: "8 items",
    icon: AlertCircle,
    color: "text-red-600",
  },
  {
    title: "This Month",
    value: "$34,210",
    change: "+8.2%",
    icon: TrendingUp,
    color: "text-blue-600",
  },
];

const samplePayments = [
  {
    id: 1,
    assetName: "Downtown Office Complex",
    contact: "John Smith",
    amount: "$15,000",
    dueDate: "2024-02-01",
    status: "pending",
    type: "rent",
    description: "Monthly rent payment"
  },
  {
    id: 2,
    assetName: "Fleet Vehicle #247",
    contact: "Sarah Johnson",
    amount: "$850",
    dueDate: "2024-01-28",
    status: "overdue",
    type: "maintenance",
    description: "Vehicle maintenance fee"
  },
  {
    id: 3,
    assetName: "Server Infrastructure",
    contact: "Mike Wilson",
    amount: "$5,200",
    dueDate: "2024-02-15",
    status: "scheduled",
    type: "service",
    description: "Monthly service contract"
  },
  {
    id: 4,
    assetName: "Warehouse B",
    contact: "Emily Chen",
    amount: "$12,500",
    dueDate: "2024-01-25",
    status: "paid",
    type: "rent",
    description: "Quarterly rent payment"
  },
];

export const PaymentTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200";
      case "scheduled":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filterPayments = (status: string) => {
    if (status === "all") return samplePayments;
    return samplePayments.filter(payment => payment.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all payment collections and schedules.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentStats.map((stat) => {
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
                  <span className="text-xs text-gray-500">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Overview</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-4">
                {filterPayments(activeTab).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getStatusColor(payment.status).replace('text-', 'bg-').replace('border-', '').replace('-700', '-100')}`}>
                        {getStatusIcon(payment.status)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{payment.assetName}</p>
                        <p className="text-sm text-gray-500">{payment.description}</p>
                        <p className="text-xs text-gray-400">Contact: {payment.contact}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{payment.amount}</p>
                        <p className="text-sm text-gray-500">Due: {payment.dueDate}</p>
                      </div>
                      
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        {payment.status !== 'paid' && (
                          <Button size="sm" variant="outline">
                            Mark Paid
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
