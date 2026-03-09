import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CustomersPage from "./pages/CustomersPage";
import TransactionsPage from "./pages/TransactionsPage";
import SuppliersPage from "./pages/SuppliersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./app/auth/ProtectedRoute";
import { ToastContainer } from "./components/ui/ToastContainer";

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="transactions" replace />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
