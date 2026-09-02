import RegisterForm from "@/components/sections/RegisterForm";
import AuthBrandPanel from "@/components/sections/AuthBrandPanel";
import AuthTabs from "@/components/sections/AuthTabs";

export default function RegisterPage() {
  return (
    <div className="grid min-h-[calc(100vh-73px)] grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-7 px-6 py-16 md:px-14">
        <div className="w-full max-w-105">
          <AuthTabs active="register" />
        </div>
        <RegisterForm />
      </div>
      <AuthBrandPanel />
    </div>
  );
}
