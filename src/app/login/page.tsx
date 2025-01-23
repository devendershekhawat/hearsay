import { LoginCard } from '@/components/LoginCard';

export default function Login() {
  return (
    <main className="flex flex-col items-center justify-center h-screen px-4 gap-8">
      <h1 className="tinos-bold-italic text-4xl text-gradient animate-in fade-in-0 slide-in-from-bottom-1/2 slide-in-from-bottom-1/2 duration-500">
        hearsay
      </h1>
      <LoginCard />
    </main>
  );
}
