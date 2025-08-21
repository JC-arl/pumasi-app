import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// User Layout
import UserLayout from "./components/user/UserLayout";

// User pages
import HomePage from "./pages/user/HomePage";
import MapPage from "./pages/user/MapPage";
import AssetDetailPage from "./pages/user/AssetDetailPage";
import ReservePage from "./pages/user/ReservePage";
import MyReservationsPage from "./pages/user/MyReservationsPage";
import NotificationsPage from "./pages/user/NotificationsPage";
import ProfilePage from "./pages/user/ProfilePage";
import HelpPage from "./pages/user/HelpPage";
import RentalOfficeDetailPage from "./pages/user/RentalOfficeDetailPage";

// Admin pages
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Assets from "./pages/admin/Assets";
import Reservations from "./pages/admin/Reservations";

function App() {
  return (
    <Routes>
      {/* User routes */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<HomePage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="office/:officeId" element={<RentalOfficeDetailPage />} />
        <Route path="machinery/:machineryId" element={<AssetDetailPage />} />
        <Route path="assets/:id" element={<AssetDetailPage />} />
        <Route path="reserve" element={<ReservePage />} />
        <Route path="my/reservations" element={<MyReservationsPage />} />
        <Route path="my/alerts" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="help" element={<HelpPage />} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="assets" element={<Assets />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="offices" element={<div className="p-8 text-center text-gray-500">임대사업소 관리 (개발 예정)</div>} />
        <Route path="maintenance" element={<div className="p-8 text-center text-gray-500">정비·점검 관리 (개발 예정)</div>} />
        <Route path="users" element={<div className="p-8 text-center text-gray-500">사용자·권한 관리 (개발 예정)</div>} />
        <Route path="analytics" element={<div className="p-8 text-center text-gray-500">분석·리포트 (개발 예정)</div>} />
        <Route path="settings" element={<div className="p-8 text-center text-gray-500">설정 (개발 예정)</div>} />
        <Route path="audit" element={<div className="p-8 text-center text-gray-500">감사 로그 (개발 예정)</div>} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
