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
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const router = useRouter();
  const auth = getAuth();
  const [submitting, setSubmitting] = useState(false);
  
  // Derived validity state to control the Continue button visual state
  const emailTrimmed = (email || '').trim();
  const passwordTrimmed = (password || '').trim();
  const isEmailValid = !!emailTrimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
  const isPasswordValid = passwordTrimmed.length >= 6;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleLogin = async (e) => {
    e.preventDefault?.();
    // reset field errors
    setEmailError(false);
    setPasswordError(false);
    setError(null);

    // normalize inputs
    const emailTrimmed = (email || '').trim();
    const passwordTrimmed = (password || '').trim();
    if (email !== emailTrimmed) setEmail(emailTrimmed);
    if (password !== passwordTrimmed) setPassword(passwordTrimmed);

    // required + basic format validation
    if (!emailTrimmed) {
      setEmailError(true);
      setError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailError(true);
      setError('Please enter a valid email address.');
      return;
    }
    if (!passwordTrimmed) {
      setPasswordError(true);
      setError('Please enter your password.');
      return;
    }
    if (passwordTrimmed.length < 6) {
      setPasswordError(true);
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      setSubmitting(true);
      await signInWithEmailAndPassword(auth, emailTrimmed, passwordTrimmed);
      router.push('/');
    } catch (error) {
      // Show a friendly validation state similar to design
      const code = error?.code || '';
      if (code === 'auth/invalid-email') {
        setEmailError(true);
        setError('Please enter a valid email address.');
      } else if (code === 'auth/user-disabled') {
        setError('This account has been disabled.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.');
      } else {
        setEmailError(true);
        setPasswordError(true);
        setError('Invalid email or password');
      }
    } finally {
      setSubmitting(false);
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

          {/* Suppress top-level error message; error is shown under password field */}

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
              onChange={(v) => { setEmail(v); setEmailError(false); setError(null); }}
              label="Enter your email id*"
              className="w-full max-w-[566px]"
              error={emailError}
              inputProps={{
                autoComplete: 'email',
                name: 'email',
                required: true,
                onBlur: () => {
                  const t = email.trim();
                  if (t !== email) setEmail(t);
                },
                'aria-invalid': emailError ? 'true' : 'false',
              }}
              rightElement={emailError ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <g clipPath="url(#clip0_err_email)">
                    <path d="M11.333 2.226C12.347 2.811 13.189 3.653 13.774 4.666 14.359 5.68 14.667 6.83 14.667 8c0 1.17-.308 2.32-.893 3.333-.585 1.013-1.426 1.855-2.44 2.44C10.32 14.358 9.17 14.666 8 14.666a6.666 6.666 0 1 1 3.333-12.44ZM8 10c-.177 0-.346.07-.471.195A.666.666 0 0 0 7.333 10.667v.006c0 .176.07.346.195.471.125.125.294.195.471.195.177 0 .346-.07.471-.195.125-.125.195-.295.195-.471v-.006a.666.666 0 0 0-.195-.472A.667.667 0 0 0 8 10Zm0-4.667c-.177 0-.346.07-.471.195A.666.666 0 0 0 7.333 6v2.667c0 .177.07.346.195.471.125.125.294.195.471.195.177 0 .346-.07.471-.195.125-.125.195-.294.195-.471V6a.666.666 0 0 0-.195-.471A.667.667 0 0 0 8 5.333Z" fill="#DB0000"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_err_email">
                      <rect width="16" height="16" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              ) : null}
            />
            <FloatingInput
              id="password"
              type="password"
              value={password}
              onChange={(v) => { setPassword(v); setPasswordError(false); setError(null); }}
              label="Enter your password*"
              className="w-full max-w-[566px]"
              error={passwordError}
              helperText={error || ''}
              helperTextType="error"
              inputProps={{
                autoComplete: 'current-password',
                name: 'password',
                required: true,
                minLength: 6,
                'aria-invalid': passwordError ? 'true' : 'false',
                onKeyDown: (e) => {
                  if (e.key === 'Enter') handleLogin(e);
                },
              }}
              rightElement={passwordError ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <g clipPath="url(#clip0_err_pwd)">
                    <path d="M11.333 2.226C12.347 2.811 13.189 3.653 13.774 4.666 14.359 5.68 14.667 6.83 14.667 8c0 1.17-.308 2.32-.893 3.333-.585 1.013-1.426 1.855-2.44 2.44C10.32 14.358 9.17 14.666 8 14.666a6.666 6.666 0 1 1 3.333-12.44ZM8 10c-.177 0-.346.07-.471.195A.666.666 0 0 0 7.333 10.667v.006c0 .176.07.346.195.471.125.125.294.195.471.195.177 0 .346-.07.471-.195.125-.125.195-.295.195-.471v-.006a.666.666 0 0 0-.195-.472A.667.667 0 0 0 8 10Zm0-4.667c-.177 0-.346.07-.471.195A.666.666 0 0 0 7.333 6v2.667c0 .177.07.346.195.471.125.125.294.195.471.195.177 0 .346-.07.471-.195.125-.125.195-.294.195-.471V6a.666.666 0 0 0-.195-.471A.667.667 0 0 0 8 5.333Z" fill="#DB0000"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_err_pwd">
                      <rect width="16" height="16" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              ) : null}
            />
            <div className="text-pink-700 text-base font-medium cursor-pointer">Forgot password?</div>
          </div>

          <button
            type="button"
            onClick={(!submitting && isFormValid) ? handleLogin : undefined}
            className={
              `mt-6 w-full max-w-[588px] h-10 px-5 py-2 rounded-full inline-flex justify-center items-center gap-2 text-white text-sm font-semibold ` +
              (isFormValid && !submitting ? 'bg-pink-700 cursor-pointer' : 'bg-[#E5C0D1] cursor-not-allowed')
            }
            aria-disabled={!isFormValid || submitting}
          >
            {submitting ? 'Please wait…' : 'Continue'}
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
