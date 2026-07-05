import MobileBottomNav from "./MobileBottomNav";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import UserPicker from "./UserPicker";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <UserPicker>
      <div
        className="min-h-screen text-[#24312A]"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(255, 255, 255, 0.9), transparent 34rem), linear-gradient(135deg, #F7F4EA 0%, #EFE9DD 45%, #E8DFCF 100%)",
        }}
      >
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex min-h-screen flex-1 flex-col">
            <Topbar />

            <div className="flex-1 px-4 py-5 pb-28 sm:px-6 sm:py-7 lg:px-8 lg:pb-7">
              {children}
            </div>
          </div>
        </div>

        <MobileBottomNav />
      </div>
    </UserPicker>
  );
}