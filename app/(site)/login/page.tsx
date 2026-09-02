import LoginForm from "@/components/sections/LoginForm";
import AuthBrandPanel from "@/components/sections/AuthBrandPanel";
import AuthTabs from "@/components/sections/AuthTabs";

export default function LoginPage() {
  return (
    <div className="grid min-h-[calc(100vh-73px)] grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-7 px-6 py-16 md:px-14">
        <div className="w-full max-w-105">
          <AuthTabs active="login" />
        </div>
        <LoginForm />
      </div>
      <AuthBrandPanel />
    </div>
  );
}
