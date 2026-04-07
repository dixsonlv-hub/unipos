import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import TabletPOS from "./pages/TabletPOS";
import MobilePOS from "./pages/MobilePOS";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminCRM from "./pages/admin/AdminCRM";
import AdminKDS from "./pages/admin/AdminKDS";
import AdminSales from "./pages/admin/AdminSales";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminFloorPlan from "./pages/admin/AdminFloorPlan";
import AdminQueue from "./pages/admin/AdminQueue";
import QueueKiosk from "./pages/QueueKiosk";
import KioskOrdering from "./pages/KioskOrdering";
import QROrdering from "./pages/QROrdering";
import KDSDisplay from "./pages/KDSDisplay";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              {/* Protected: POS */}
              <Route path="/tablet" element={<AuthGuard><TabletPOS /></AuthGuard>} />
              <Route path="/mobile" element={<AuthGuard><MobilePOS /></AuthGuard>} />
              <Route path="/kds" element={<AuthGuard><KDSDisplay /></AuthGuard>} />
              {/* Protected: Admin */}
              <Route path="/admin" element={<AuthGuard><AdminLayout /></AuthGuard>}>
                <Route index element={<AdminDashboard />} />
                <Route path="menu" element={<AdminMenu />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="crm" element={<AdminCRM />} />
                <Route path="kds" element={<AdminKDS />} />
                <Route path="sales" element={<AdminSales />} />
                <Route path="finance" element={<AdminFinance />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="floorplan" element={<AdminFloorPlan />} />
                <Route path="queue" element={<AdminQueue />} />
              </Route>
              {/* Public: Customer-facing */}
              <Route path="/queue" element={<QueueKiosk />} />
              <Route path="/kiosk" element={<KioskOrdering />} />
              <Route path="/qr" element={<QROrdering />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
