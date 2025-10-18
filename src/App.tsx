import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ingredients from "./pages/Ingredients";
import RecipeTypes from "./pages/RecipeTypes";
import Recipes from "./pages/Recipes";
import Orders from "./pages/Orders";
import Summary from "./pages/Summary";
import Permissions from "./pages/Permissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ingredients"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Ingredients />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipe-types"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RecipeTypes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipes"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Recipes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Orders />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/summary"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Summary />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/permissions"
              element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <Permissions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
