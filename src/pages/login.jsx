import { useState } from 'react';
import Link from 'next/link';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import FloatingInput from '@/components/FloatingInput';
import { signInWithGoogle } from '@/firebase/auth/signInWithProvider';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (e) {
      setError(e.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen w-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <div className="mb-6">
            <div className="text-slate-900 text-3xl font-medium">Log in</div>
            <div className="mt-3 w-full max-w-[557px] text-gray-600 text-base leading-normal">
              Add your username and password to log in. By clicking on continue you are agreed to our
              <span className="text-slate-900 font-medium"> Terms of Services</span>
              <span> and</span>
              <span className="text-slate-900 font-medium"> Privacy Policy</span>
            </div>
          </div>

          {error && <p className="text-red-500 mb-3">{error}</p>}

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full max-w-[566px] h-10 px-5 py-2 bg-white rounded-full outline outline-1 outline-gray-400 inline-flex justify-center items-center gap-2"
          >
            <img src="/icons/signup/google.svg" alt="Google" className="w-[21px] h-[20px]" />
            <span className="text-slate-900 text-sm font-semibold">Continue with Google</span>
          </button>

          <div className="mt-6 flex items-center gap-6">
            <div className="flex-1 h-px bg-gray-400" />
            <div className="text-slate-900 text-sm">OR</div>
            <div className="flex-1 h-px bg-gray-400" />
          </div>

          <div className="mt-6 space-y-4">
            <FloatingInput
              id="email"
              type="email"
              value={email}
              onChange={setEmail}
              label="Enter your email id*"
              className="w-full max-w-[566px]"
            />
            <FloatingInput
              id="password"
              type="password"
              value={password}
              onChange={setPassword}
              label="Enter your password*"
              className="w-full max-w-[566px]"
            />
            <div className="text-pink-700 text-base font-medium cursor-pointer">Forgot password?</div>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="mt-6 w-full max-w-[588px] h-10 px-5 py-2 bg-stone-300 rounded-full inline-flex justify-center items-center gap-2 text-white text-sm font-semibold"
          >
            Continue
          </button>

          <div className="mt-8 text-base">
            <span className="text-gray-600">Don’t have an account? </span>
            <Link href="/signup" className="text-pink-700 font-medium">Sign up</Link>
          </div>
        </div>
      </div>
      {/* Right: image panel */}
      <div className="hidden md:block relative">
        <img
          src="/login-bg.png"
          alt="Login background"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default Login;
