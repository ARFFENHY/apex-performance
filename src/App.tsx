import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Clients from "./pages/Clients";
import Programs from "./pages/Programs";
import Routines from "./pages/Routines";
import NutritionPage from "./pages/Nutrition";
import ProgressPage from "./pages/Progress";
import Achievements from "./pages/Achievements";
import ChatPage from "./pages/Chat";
import Profile from "./pages/Profile";
import Install from "./pages/Install";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import DietsPage from "./pages/Diets";
import ExerciseCatalogPage from "./pages/ExerciseCatalog";
import { RoleDashboardRouter } from "@/components/RoleDashboardRouter";
import ExerciseImageAdminPage from "./pages/ExerciseImageAdmin";
import RecipeImageAdminPage from "./pages/RecipeImageAdmin";
import NutritionalCalculator from "./pages/NutritionalCalculator";
import DailyTracking from "./pages/DailyTracking";
import LandingPage from "./pages/LandingPage";
import ActiveWorkout from "./pages/ActiveWorkout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TenantProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Dashboard routes by role */}
              <Route path="/dashboard" element={<ProtectedRoute><RoleDashboardRouter /></ProtectedRoute>} />
              <Route path="/gyms" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
              
              {/* Protected routes */}
              <Route path="/clients" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'coach']}><Clients /></ProtectedRoute>} />
              <Route path="/programs" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'coach']}><Programs /></ProtectedRoute>} />
              <Route path="/routines" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'coach']}><Routines /></ProtectedRoute>} />
              <Route path="/diets" element={<ProtectedRoute><DietsPage /></ProtectedRoute>} />
              <Route path="/exercises" element={<ProtectedRoute><ExerciseCatalogPage /></ProtectedRoute>} />
              <Route path="/exercise-images" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><ExerciseImageAdminPage /></ProtectedRoute>} />
              <Route path="/recipe-images" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><RecipeImageAdminPage /></ProtectedRoute>} />
              <Route path="/nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/calculator" element={<ProtectedRoute><NutritionalCalculator /></ProtectedRoute>} />
              <Route path="/tracking" element={<ProtectedRoute><DailyTracking /></ProtectedRoute>} />
              <Route path="/workout/:id" element={<ProtectedRoute><ActiveWorkout /></ProtectedRoute>} />
              <Route path="/install" element={<ProtectedRoute><Install /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
