import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/AdminLogin'; // Use AdminLogin as the main login
import SuperAdmin from './pages/SuperAdmin';
import AdminLayout from './layouts/AdminLayout';
import AdminSalesHistory from './pages/AdminSalesHistory';
import AddBranch from './pages/AddBranch';
import CreateSalesAccount from './pages/CreateSalesAccount';
import ChangePassword from './pages/ChangePassword';
import CreateInvestor from './pages/CreateInvestor';
import ManageSales from './pages/ManageSales';
import ManageInvestors from './pages/ManageInvestors';
import ManageBranches from './pages/ManageBranches';
import ApproveSales from './pages/ApproveSales';
import ApproveRewards from './pages/ApproveRewards';
import ApproveWithdrawals from './pages/ApproveWithdrawals';
import WithdrawalHistory from './pages/WithdrawalHistory';
import InvestorTeam from './pages/InvestorTeam';
import ManagePlans from './pages/ManagePlans';
import ActivityLogs from './pages/ActivityLogs';

import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<SuperAdmin />} />
          <Route path="/history" element={<AdminSalesHistory />} />
          <Route path="/add-branch" element={<AddBranch />} />
          <Route path="/create-sales-account" element={<CreateSalesAccount />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/manage-sales" element={<ManageSales />} />
          <Route path="/manage-investors" element={<ManageInvestors />} />
          <Route path="/manage-investors/:id/team" element={<InvestorTeam />} />
          <Route path="/create-investor" element={<CreateInvestor />} />
          <Route path="/manage-branches" element={<ManageBranches />} />
          <Route path="/approve-sales" element={<ApproveSales />} />
          <Route path="/approve-rewards" element={<ApproveRewards />} />
          <Route path="/approve-withdrawals" element={<ApproveWithdrawals />} />
          <Route path="/withdrawal-history" element={<WithdrawalHistory />} />
          <Route path="/manage-plans" element={<ManagePlans />} />
          <Route path="/activity-logs" element={<ActivityLogs />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
