import AuthForm from './AuthForm';

export const metadata = {
  title: 'Sign in | Zyph',
  description: 'Sign up or log in to Zyph',
};

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0008] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border p-8 shadow-xl backdrop-blur" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <h1 className="text-center text-2xl font-semibold" style={{ color: 'rgba(255,255,255,0.92)' }}>Zyph</h1>
          <p className="mt-2 text-center text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Sign in or create an account to continue
          </p>
          <AuthForm />
        </div>
        <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.22)' }}>
          By continuing, you agree to our terms and privacy policy.
        </p>
      </div>
    </main>
  );
}
