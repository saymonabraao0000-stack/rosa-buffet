import Image from "next/image";
import LoginForm from "@/components/crm/LoginForm";

export default function CrmLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-ink-soft px-6">
      <Image
        src="/images/logo-header.png"
        alt="Rosa Buffet"
        width={900}
        height={235}
        priority
        className="h-10 w-auto"
      />
      <LoginForm />
    </div>
  );
}
