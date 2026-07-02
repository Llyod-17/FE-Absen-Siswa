import type { Metadata, Viewport } from "next";

import "@/app/globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { SidebarProvider } from "@/context/sidebar-context";
import { MainContent } from "@/components/main-context";
import AdminGuard from "@/components/AdminGuard";

export const metadata: Metadata = {
  title: "Admin Dashboard - Token & Attendance Management",
  openGraph: {
    title: "Admin Dashboard",
    description: "Token and Attendance Management System",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminGuard>
      <SidebarProvider>
        <div className="admin-theme min-h-screen bg-background text-foreground">
          <AppSidebar />
          <Header />
          <MainContent>{children}</MainContent>
        </div>
      </SidebarProvider>
    </AdminGuard>
  );
}
