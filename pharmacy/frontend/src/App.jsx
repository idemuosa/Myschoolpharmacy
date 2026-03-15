import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Import Pages
import AdminLogin from './pages/AdminLogin';
import StaffManagement from './pages/StaffManagement';
import AddNewStaff from './pages/AddNewStaff';
import SalesReport from './pages/SalesReport';
import InventoryTurnover from './pages/InventoryTurnover';
import StaffAttendanceReport from './pages/StaffAttendanceReport';
import PharmacyDashboard from './pages/pharmacydashboard';
import UploadPrescription from './pages/UploadPrescription';
import DetailPrescriptionReview from './pages/DetailPrescriptionReview';
import InventoryManagement from './pages/InventoryManagement';
import AddNewDrugs from './pages/AddNewDrugs';
import CustomerManagement from './pages/CustomerManagement';
import AddCustomer from './pages/AddCustomer';
import PointOfSales from './pages/PointOfSales';
import StaffSalesDashboard from './pages/StaffSalesDashboard';
import SaleReturn from './pages/SaleReturn';
import StaffRegistration from './pages/StaffRegistraion';
import SupermarketDashboard from './pages/SupermarketDashboard';
import SupermarketInventory from './pages/SupermarketInventory';
import AddNewProduct from './pages/AddNewProduct';
import PatientPage from './pages/PatientPage';
import Prescription from './pages/Prescription';
import SupermarketPOS from './pages/SupermarketPOS';
import ForgotPassword from './pages/ForgotPassword';
import Settings from './pages/Settings';
import NotificationSettings from './pages/NotificationSettings';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <PharmacyDashboard />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/staff/new" element={
            <PrivateRoute>
              <Layout>
                <StaffRegistration />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/staff" element={
            <PrivateRoute>
              <Layout>
                <StaffManagement />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/staff/dashboards" element={
            <PrivateRoute>
              <Layout>
                <StaffSalesDashboard />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/reports/sales" element={
            <PrivateRoute>
              <Layout>
                <SalesReport />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/reports/inventory" element={
            <PrivateRoute>
              <Layout>
                <InventoryTurnover />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/reports/attendance" element={
            <PrivateRoute>
              <Layout>
                <StaffAttendanceReport />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/pos" element={
            <PrivateRoute>
              <Layout>
                <PointOfSales />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/sales/return" element={
            <PrivateRoute>
              <Layout>
                <SaleReturn />
              </Layout>
            </PrivateRoute>
          } />
           <Route path="/prescriptions/upload" element={
             <PrivateRoute>
               <Layout>
                 <UploadPrescription />
               </Layout>
             </PrivateRoute>
           } />
           <Route path="/prescriptions/review" element={
             <PrivateRoute>
               <Layout>
                 <DetailPrescriptionReview />
               </Layout>
             </PrivateRoute>
           } />
           <Route path="/prescriptions/new" element={
              <PrivateRoute>
                <Layout>
                  <Prescription />
                </Layout>
              </PrivateRoute>
            } />
          <Route path="/inventory" element={
            <PrivateRoute>
              <Layout>
                <InventoryManagement />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/inventory/new" element={
            <PrivateRoute>
              <Layout>
                <AddNewDrugs />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/inventory/edit/:id" element={
            <PrivateRoute>
              <Layout>
                <AddNewDrugs />
              </Layout>
            </PrivateRoute>
          } />
           <Route path="/customers" element={
             <PrivateRoute>
               <Layout>
                 <CustomerManagement />
               </Layout>
             </PrivateRoute>
           } />
           <Route path="/customers/new" element={
             <PrivateRoute>
               <Layout>
                 <AddCustomer />
               </Layout>
             </PrivateRoute>
           } />
           <Route path="/customers/detail/:id" element={
              <PrivateRoute>
                <Layout>
                  <PatientPage />
                </Layout>
              </PrivateRoute>
            } />

           {/* Supermarket Routes */}
           <Route path="/supermarket" element={
              <PrivateRoute>
                <Layout>
                  <SupermarketDashboard />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/supermarket/inventory" element={
              <PrivateRoute>
                <Layout>
                  <SupermarketInventory />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/supermarket/inventory/new" element={
              <PrivateRoute>
                <Layout>
                  <AddNewProduct />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/supermarket/inventory/edit/:id" element={
              <PrivateRoute>
                <Layout>
                  <AddNewProduct />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/supermarket/pos" element={
              <PrivateRoute>
                <Layout>
                  <SupermarketPOS />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <Layout>
                  <Settings />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/settings/notifications" element={
              <PrivateRoute>
                <Layout>
                  <NotificationSettings />
                </Layout>
              </PrivateRoute>
            } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
