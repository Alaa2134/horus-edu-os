import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ToastHost } from "@/components/ui/ToastHost";
import { Landing } from "@/pages/Landing";
import { Dashboard } from "@/pages/Dashboard";
import { Checkpoints } from "@/pages/Checkpoints";
import { CameraDetection } from "@/pages/CameraDetection";
import { Reports } from "@/pages/Reports";
import { ReportDetails } from "@/pages/ReportDetails";
import { RescueBoard } from "@/pages/RescueBoard";
import { Analytics } from "@/pages/Analytics";
import { Simulation } from "@/pages/Simulation";
import { MobileReport } from "@/pages/MobileReport";
import { SettingsPage } from "@/pages/Settings";
import { About } from "@/pages/About";

export default function App() {
  return (
    <>
      <ToastHost />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/mobile" element={<MobileReport />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="checkpoints" element={<Checkpoints />} />
          <Route path="cameras" element={<CameraDetection />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<ReportDetails />} />
          <Route path="rescue" element={<RescueBoard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="simulation" element={<Simulation />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="about" element={<About />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
