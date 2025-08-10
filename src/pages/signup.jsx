import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, rtdb } from '../firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { signInWithGoogle } from '@/firebase/auth/signInWithProvider';
import { ref, set } from 'firebase/database';
import { sendVerificationEmail } from '../utils/sendVerificationEmail';
import { getUserNicknameFromEmail } from '../utils/getUserNicknameFromEmail';
import getRandomUsername from '../utils/getRandomUsername';
import FloatingInput from '../components/FloatingInput';
import FollowStep from '../components/FollowStep';
import useRtdbDataKey from '@/hooks/useRtdbData'

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState('');
  const [codeError, setCodeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleSendVerificationEmail = async () => {
    // normalize and validate email to match login page behavior
    const emailTrimmed = (email || '').trim();
    if (email !== emailTrimmed) setEmail(emailTrimmed);
    // required + basic format validation
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailError(true);
      return;
    }
    setLoading(true);
    try {
      const { code: generatedCode } = await sendVerificationEmail(emailTrimmed, { test: true });
      setCodeSent(generatedCode);
      setCodeError('');
      setStep(2);
    } catch (error) {
      console.error(error);
      alert('Failed to send verification email.');
    } finally {
      setLoading(false);
    }
  };
  const RESEND_COUNTDOWN = 8;
  const [resendSeconds, setResendSeconds] = useState(RESEND_COUNTDOWN);

  // Reset and start countdown when entering verification step
  useEffect(() => {
    if (step === 2) {
      setResendSeconds(RESEND_COUNTDOWN);
      setResendSuccess(false);
    }
  }, [step]);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (step === 2 && resendSeconds > 0) {
      timer = setTimeout(() => setResendSeconds(resendSeconds - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendSeconds]);

  // Format seconds to MM:SS
  const formatTime = seconds => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Resend handler when countdown reaches zero
  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await sendVerificationEmail(email, { test: true });
      setResendSeconds(RESEND_COUNTDOWN);
      setCodeError('');
      setResendSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyCode = () => {
    if (code !== codeSent) {
      setCodeError('The verification code you entered is wrong. Please try again.');
    } else {
      setStep(3);
      const suggested = getUserNicknameFromEmail(email) || getRandomUsername();
      setUsername((prev) => prev || suggested);
    }
  };

  const handleSkipVerification = () => {
    setCodeError('');
    setStep(3);
    const suggested = getUserNicknameFromEmail(email) || getRandomUsername();
    setUsername((prev) => prev || suggested);
  };

  const validateUsername = (value) => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 60) return 'Username must be at most 60 characters';
    if (!/^[A-Za-z0-9_]+$/.test(value)) return 'Only letters, numbers and _ are allowed';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return '';
    if (value.length < 8) return `Please use at least 8 characters (you are currently using ${value.length} characters).`;
    return '';
  };

  const handleContinueAfterProfile = () => {
    // reset submit error each attempt
    setSignupError('');
    const uErr = validateUsername(username);
    setUsernameError(uErr);
    const pErr = password ? validatePassword(password) : 'Password is required';
    setPasswordError(pErr === 'Password is required' ? 'Please use at least 8 characters (you are currently using 0 characters).' : pErr);
    if (uErr || pErr || !(email || '').trim()) return;

    // Create Firebase account with email/password and set displayName
    const doSignup = async () => {
      try {
        setSignupLoading(true);
        const emailToUse = (email || '').trim();
        const cred = await createUserWithEmailAndPassword(auth, emailToUse, password);
        if (cred?.user && username) {
          try { await updateProfile(cred.user, { displayName: username }); } catch (_) {}
        // Write minimal user record to Realtime Database (dev mode simple schema)
        try {
          const u = cred.user;
          const uid = u.uid;
          const userRecord = {
            public: {
              displayName: username || u.displayName || '',
              username: username || (u.email ? u.email.split('@')[0] : uid),
              avatarUrl: u.photoURL || '',
            },
            private: {
              email: u.email || '',
              emailVerified: u.emailVerified || false,
            },
            meta: {
              createdAt: Date.now(),
              lastLoginAt: Date.now(),
              provider: 'password',
              role: 'user',
            },
          };
          await set(ref(rtdb, `users/${uid}`), userRecord);
        } catch (e) {
          console.error('Failed to write user record to RTDB:', e);
        }
        }
        setStep(4);
      } catch (e) {
        const code = e?.code || '';
        let msg = e?.message || 'Failed to sign up';
        if (code === 'auth/email-already-in-use') msg = 'This email is already in use. Try logging in instead.';
        if (code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
        if (code === 'auth/weak-password') msg = 'Password is too weak. Please use at least 8 characters.';
        setSignupError(msg);
      } finally {
        setSignupLoading(false);
      }
    };
    doSignup();
  };

  // Step 4: Tags & Topics
  const { data: topics, loading: topicsLoading } = useRtdbDataKey('topics')
  const [selectedTopics, setSelectedTopics] = useState([]);
  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  // Step 5: Companies (next step after Topics) - same UI but different items
  const { data: companies, loading: companiesLoading } = useRtdbDataKey('companies')
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const toggleCompany = (c) => {
    setSelectedCompanies((prev) =>
      prev.includes(c) ? prev.filter((t) => t !== c) : [...prev, c]
    );
  };

  // Use FollowStep component for steps 4 and 5
  if (step === 4) {
    return (
      <FollowStep
        items={topics || []}
        selected={selectedTopics}
        toggle={toggleTopic}
        selectedTitle="Selected topics"
        prompt="Give us an idea of some tags/topics you'd like to follow."
        searchLabel="Search topics"
        onBack={() => router.push('/')}
        onContinue={() => setStep(5)}
        onSkip={() => setStep(5)}
      />
    )
  }
  if (step === 5) {
    return (
      <FollowStep
        items={companies || []}
        selected={selectedCompanies}
        toggle={toggleCompany}
        selectedTitle="Selected companies"
        prompt="Give us an idea of some companies you'd like to follow."
        searchLabel="Search companies"
        onBack={() => setStep(4)}
        onContinue={() => router.push('/')}
        onSkip={() => router.push('/')}
      />
    )
  }

  return (
    <div
      data-layer="Sign up"
      className="SignUp w-screen min-h-screen relative bg-pink-700 overflow-y-auto flex items-center justify-center py-[24px]"
    >
      {step === 1 ? (
        <div
          data-layer="Signup Form Card"
          className="SignupFormCard relative w-[684px] h-[740px] bg-white rounded-[32px] shadow-[0px_0px_16px_0px_rgba(16,17,42,0.12)] overflow-hidden"
        >
          <div data-layer="Sign up" className="SignUp left-[292px] top-[48px] absolute text-center justify-start text-slate-900 text-3xl font-medium font-['Inter']">
            Sign up
          </div>
          <div data-layer="Create an account to start gossiping! By clicking on continue you are agreed to our Terms of Services and Privacy Policy" className="CreateAnAccountToStartGossipingByClickingOnContinueYouAreAgreedToOurTermsOfServicesAndPrivacyPolicy w-[468px] left-[108px] top-[98px] absolute text-center justify-start">
            <span className="text-gray-600 text-base font-normal font-['Inter'] leading-normal">Create an account to start gossiping! By clicking on continue you are agreed to our </span>
            <span className="text-pink-700 text-base font-medium font-['Inter'] leading-normal cursor-pointer">Terms of Services</span>
            <span className="text-gray-600 text-base font-normal font-['Inter'] leading-normal"> and </span>
            <span className="text-pink-700 text-base font-medium font-['Inter'] leading-normal cursor-pointer">Privacy Policy</span>
          </div>
          <div data-layer="Already have an account? Log in" className="AlreadyHaveAnAccountLogIn left-[219px] top-[673px] absolute text-center justify-start">
            <span className="text-gray-600 text-base font-normal font-['Inter']">Already have an account? </span>
            <Link href="/login" className="text-pink-700 text-base font-medium font-['Inter'] cursor-pointer">
              Log in
            </Link>
          </div>
          <div data-layer="OR" className="Or left-[332px] top-[258px] absolute text-center justify-start text-slate-900 text-sm font-normal font-['Inter']">OR</div>
          <div data-layer="Primary Button" onClick={handleGoogleSignUp} className="PrimaryButton w-[588px] h-10 px-5 py-2 left-[48px] top-[186px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-gray-400 inline-flex justify-center items-center gap-2 cursor-pointer">
            <div data-svg-wrapper data-layer="google" className="Google">
              <img
                src="/icons/signup/google.svg"
                alt="Google icon"
                className="w-[21px] h-[20px]"
              />
            </div>
            <div data-layer="Button" className="Button justify-start text-slate-900 text-sm font-semibold font-['Inter']">Continue with Google</div>
          </div>
          <div
            data-layer="Primary Button"
            onClick={handleSendVerificationEmail}
            className={
              `PrimaryButton w-[588px] h-10 px-5 py-2 left-[48px] top-[617px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 ` +
              (((email || '').trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim()) && !loading)
                ? 'bg-pink-700 cursor-pointer'
                : 'bg-[#E5C0D1] cursor-not-allowed')
            }
          >
            <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">
              {loading ? 'Sending...' : 'Continue'}
            </div>
          </div>
          <div data-svg-wrapper data-layer="Line 1" className="Line1 left-[376px] top-[266px] absolute">
            <img src="/icons/signup/line.svg" alt="" />
          </div>
          <div data-svg-wrapper data-layer="Line 2" className="Line2 left-[48px] top-[266px] absolute">
            <img src="/icons/signup/line.svg" alt="" />
          </div>
        <FloatingInput
          data-layer="Input field"
          data-count="False"
          data-property-1="Typing"
          data-size="Medium"
          id="email"
          type="email"
          value={email}
          onChange={(v) => { setEmail(v); setEmailError(false); }}
          label="Enter your email id*"
          className="w-[588px] left-[48px] top-[307px] absolute"
          error={emailError}
          inputProps={{
            autoComplete: 'email',
            name: 'email',
            required: true,
            onBlur: () => {
              const t = (email || '').trim();
              if (t !== email) setEmail(t);
            },
            'aria-invalid': emailError ? 'true' : 'false',
          }}
          rightElement={emailError ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g clipPath="url(#clip0_err_email_su)">
                <path d="M11.333 2.226C12.347 2.811 13.189 3.653 13.774 4.666 14.359 5.68 14.667 6.83 14.667 8c0 1.17-.308 2.32-.893 3.333-.585 1.013-1.426 1.855-2.44 2.44C10.32 14.358 9.17 14.666 8 14.666a6.666 6.666 0 1 1 3.333-12.44ZM8 10c-.177 0-.346.07-.471.195A.666.666 0 0 0 7.333 10.667v.006c0 .176.07.346.195.471.125.125.294.195.471.195.177 0 .346-.07.471-.195.125-.125.195-.295.195-.471v-.006a.666.666 0 0 0-.195-.472A.667.667 0 0 0 8 10Zm0-4.667c-.177 0-.346.07-.471.195A.666.666 0 0 0 7.333 6v2.667c0 .177.07.346.195.471.125.125.294.195.471.195.177 0 .346-.07.471-.195.125-.125.195-.294.195-.471V6a.666.666 0 0 0-.195-.471A.667.667 0 0 0 8 5.333Z" fill="#DB0000"/>
              </g>
              <defs>
                <clipPath id="clip0_err_email_su">
                  <rect width="16" height="16" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          ) : null}
        />
        </div>
      ) : step === 2 ? (
        <div data-layer="Frame 44" className="Frame44 w-[684px] h-[740px] relative bg-white rounded-[32px] shadow-[0px_0px_16px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-stone-300 overflow-visible">
          {resendSuccess && (
            <div data-layer="Frame 48097004" className="Frame48097004 w-96 h-14 absolute left-1/2 -translate-x-1/2 top-[-44px] bg-green-50 rounded-2xl outline outline-1 outline-offset-[-1px] outline-green-300">
              <div data-layer="The code has been successfully resent!" className="TheCodeHasBeenSuccessfullyResent left-[16px] top-[16px] absolute justify-start text-green-600 text-base font-medium font-['Inter'] leading-snug">
                The code has been successfully resent!
              </div>
              <div data-svg-wrapper data-layer="Frame" className="Frame left-[336px] top-[19px] absolute cursor-pointer" onClick={() => setResendSuccess(false)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_215_8467)">
                    <path d="M12 4L4 12" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 4L12 12" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_215_8467">
                      <rect width="16" height="16" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
          )}
          <div data-layer="Verify your email" className="VerifyYourEmail left-[230px] top-[48px] absolute text-center justify-start text-slate-900 text-3xl font-medium font-['Inter']">
            Verify your email
          </div>
          <div
            data-layer="Enter the 6-digit code we sent you on  john@gmail.com Change email"
            className="EnterThe6DigitCodeWeSentYouOnJohnGmailComChangeEmail absolute left-1/2 top-[98px] transform -translate-x-1/2 text-center"
          >
            <span className="text-gray-600 text-base font-normal font-['Inter'] leading-normal">
              Enter the 6-digit code we sent you on<br />
              {email}{' '}
              <span
                onClick={() => { setStep(1); setCodeError(''); }}
                className="text-black text-base font-medium font-['Inter'] leading-normal cursor-pointer"
              >
                Change email
              </span>
            </span>
          </div>
          {resendSeconds > 0 ? (
            <div
              data-layer={"Don&apos;t get the email? Resend in " + formatTime(resendSeconds)}
              className="DidnTGetTheEmailResendIn0008 left-[200px] top-[282px] absolute text-center justify-start"
            >
              <span className="text-slate-950 text-base font-normal font-['Inter']">
                Don&apos;t get the email?{' '}
              </span>
              <span className="text-gray-400 text-base font-medium font-['Inter']">
                Resend in {formatTime(resendSeconds)}
              </span>
            </div>
          ) : (
            <div
              data-layer="Don&apos;t get the email? Resend"
              className="DidnTGetTheEmailResend left-[200px] top-[282px] absolute text-center justify-start"
            >
              <span className="text-slate-900 text-base font-normal font-['Inter']">
                Don&apos;t get the email?{' '}
              </span>
              <span
                className="text-pink-700 text-base font-medium font-['Inter'] cursor-pointer"
                onClick={handleResend}
              >
                Resend
              </span>
            </div>
          )}
          <div
            data-layer="Primary Button"
            onClick={handleVerifyCode}
            className={
              `PrimaryButton w-[588px] h-10 px-5 py-2 left-[48px] top-[646px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 ` +
              (code ? 'bg-pink-700 cursor-pointer' : 'bg-[#E5C0D1] cursor-not-allowed')
            }
          >
            <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">
              Continue
            </div>
          </div>
          <div data-layer="Primary Button" onClick={() => { setStep(1); setCodeError(''); }} className="PrimaryButton size-10 px-3 py-2 left-[24px] top-[24px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer">
            <div data-svg-wrapper data-layer="Back" className="Back relative">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_9890_4155)">
                  <path d="M15.8337 9.375C16.1788 9.375 16.4587 9.65482 16.4587 10C16.4587 10.3452 16.1788 10.625 15.8337 10.625H4.16699C3.82181 10.625 3.54199 10.3452 3.54199 10C3.54199 9.65482 3.82181 9.375 4.16699 9.375H15.8337Z" fill="black"/>
                  <path d="M3.72505 9.55806C3.96913 9.31398 4.36476 9.31398 4.60884 9.55806L9.60884 14.5581C9.85292 14.8021 9.85292 15.1978 9.60884 15.4418C9.36476 15.6859 8.96913 15.6859 8.72505 15.4418L3.72505 10.4418C3.48097 10.1978 3.48097 9.80214 3.72505 9.55806Z" fill="black"/>
                  <path d="M8.72505 4.55806C8.96913 4.31398 9.36476 4.31398 9.60884 4.55806C9.85292 4.80214 9.85292 5.19777 9.60884 5.44185L4.60884 10.4418C4.36476 10.6859 3.96913 10.6859 3.72505 10.4418C3.48097 10.1978 3.48097 9.80214 3.72505 9.55806L8.72505 4.55806Z" fill="black"/>
                </g>
                <defs>
                  <clipPath id="clip0_9890_4155">
                    <rect width="20" height="20" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
          <div
            data-layer="Primary Button"
            onClick={handleSkipVerification}
            className="PrimaryButton h-10 px-5 py-2 left-[607px] top-[24px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer"
          >
            <div data-layer="Button" className="Button justify-start text-slate-900 text-sm font-semibold font-['Inter']">Skip</div>
          </div>
        <FloatingInput
          data-layer="Input field"
          data-count="False"
          data-property-1={code ? 'Typing' : 'Empty'}
          data-size="Medium"
          id="code"
          type="text"
          value={code}
          onChange={(val) => { setCode(val); setCodeError(''); }}
          label="Enter verification code*"
          className="w-[588px] left-[48px] top-[186px] absolute"
          error={Boolean(codeError)}
          helperText={codeError}
          helperTextType="error"
        />
        </div>
      ) : step === 3 ? (
        <div data-layer="Frame 44" className="Frame44 w-[684px] h-[740px] relative bg-white rounded-[32px] shadow-[0px_0px_16px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-stone-300 overflow-hidden">
          <div data-layer="Create username and password" className="CreateUsernameAndPassword left-[129px] top-[48px] absolute text-center justify-start text-slate-900 text-3xl font-medium font-['Inter']">Create username and password</div>
          <div data-layer="Salesgossip is all about venting, collaborating, and humor. It is anonymous, so your username is how you&apos;ll be identified here." className="SalesgossipIsAllAboutVentingCollaboratingAndHumorItIsAnonymousSoYourUsernameIsHowYouLlBeIdentifiedHere w-[513px] left-[86px] top-[98px] absolute text-center justify-start text-gray-600 text-base font-normal font-['Inter'] leading-normal">Salesgossip is all about venting, collaborating, and humor. It is anonymous, so your username is how you&apos;ll be identified here.</div>

          <div data-layer="Primary Button" onClick={() => setStep(2)} className="PrimaryButton size-10 px-3 py-2 left-[24px] top-[24px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer">
            <div data-svg-wrapper data-layer="Back" className="Back relative">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_9890_3572)">
                  <path d="M15.8327 9.375C16.1779 9.375 16.4577 9.65482 16.4577 10C16.4577 10.3452 16.1779 10.625 15.8327 10.625H4.16602C3.82084 10.625 3.54102 10.3452 3.54102 10C3.54102 9.65482 3.82084 9.375 4.16602 9.375H15.8327Z" fill="black"/>
                  <path d="M3.72407 9.55806C3.96815 9.31398 4.36379 9.31398 4.60786 9.55806L9.60786 14.5581C9.85194 14.8021 9.85194 15.1978 9.60786 15.4418C9.36379 15.6859 8.96815 15.6859 8.72407 15.4418L3.72407 10.4418C3.48 10.1978 3.48 9.80214 3.72407 9.55806Z" fill="black"/>
                  <path d="M8.72407 4.55806C8.96815 4.31398 9.36379 4.31398 9.60786 4.55806C9.85194 4.80214 9.85194 5.19777 9.60786 5.44185L4.60786 10.4418C4.36379 10.6859 3.96815 10.6859 3.72407 10.4418C3.48 10.1978 3.48 9.80214 3.72407 9.55806L8.72407 4.55806Z" fill="black"/>
                </g>
                <defs>
                  <clipPath id="clip0_9890_3572">
                    <rect width="20" height="20" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>

          <FloatingInput
            id="username"
            type="text"
            value={username}
            onChange={(val) => { setUsername(val); setUsernameError(''); }}
            label="Username*"
            className="w-[588px] left-[48px] top-[186px] absolute"
            error={Boolean(usernameError)}
            helperText={username ? (usernameError ? usernameError : 'Username available') : ''}
            helperTextType={usernameError ? 'error' : 'success'}
            rightElement={(
              <div className="inline-flex items-center gap-2">
                {username && !validateUsername(username) ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M8 1C4.13438 1 1 4.13438 1 8C1 11.8656 4.13438 15 8 15C11.8656 15 15 11.8656 15 8C15 4.13438 11.8656 1 8 1ZM11.0234 5.71406L7.73281 10.2766C7.68682 10.3408 7.62619 10.3931 7.55595 10.4291C7.48571 10.4652 7.40787 10.4841 7.32891 10.4841C7.24994 10.4841 7.17211 10.4652 7.10186 10.4291C7.03162 10.3931 6.97099 10.3408 6.925 10.2766L4.97656 7.57656C4.91719 7.49375 4.97656 7.37813 5.07812 7.37813H5.81094C5.97031 7.37813 6.12187 7.45469 6.21562 7.58594L7.32812 9.12969L9.78438 5.72344C9.87813 5.59375 10.0281 5.51562 10.1891 5.51562H10.9219C11.0234 5.51562 11.0828 5.63125 11.0234 5.71406Z" fill="#34A853"/>
                  </svg>
                ) : null}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <g clipPath="url(#clip0_215_8807)">
                    <path d="M4 12V9C4 8.20435 4.31607 7.44129 4.87868 6.87868C5.44129 6.31607 6.20435 6 7 6H20M20 6L17 3M20 6L17 9" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 12V15C20 15.7956 19.6839 16.5587 19.1213 17.1213C18.5587 17.6839 17.7956 18 17 18H4M4 18L7 21M4 18L7 15" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_215_8807">
                      <rect width="24" height="24" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
            )}
          />
          <div data-layer="count" className="Count left-[595px] top-[246px] absolute text-right justify-start text-gray-600 text-xs font-normal font-['Inter'] leading-none">{`${username.length}/60`}</div>

          <FloatingInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(val) => {
              setPassword(val);
              setPasswordError(validatePassword(val));
              setSignupError('');
            }}
            label="Password*"
            className="w-[588px] left-[48px] top-[290px] absolute"
            error={Boolean(passwordError) || Boolean(signupError)}
            helperText={signupError || passwordError}
            helperTextType={signupError ? 'error' : 'error'}
            rightElement={(
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="cursor-pointer inline-flex items-center gap-2"
                onClick={() => setShowPassword(!showPassword)}
             >
                {passwordError ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <g clipPath="url(#clip0_215_8761)">
                      <path d="M11.334 2.22725C12.3475 2.81237 13.189 3.65396 13.7742 4.66743C14.3593 5.6809 14.6673 6.83054 14.6673 8.00079C14.6673 9.17104 14.3593 10.3207 13.7741 11.3341C13.189 12.3476 12.3474 13.1892 11.3339 13.7743C10.3204 14.3594 9.1708 14.6674 8.00055 14.6674C6.83029 14.6674 5.68066 14.3593 4.66721 13.7742C3.65375 13.189 2.81218 12.3474 2.22707 11.334C1.64197 10.3205 1.33395 9.17083 1.33398 8.00058L1.33732 7.78458C1.37465 6.63324 1.70968 5.51122 2.30974 4.52791C2.90981 3.5446 3.75442 2.73355 4.76125 2.17383C5.76807 1.61412 6.90275 1.32484 8.05465 1.3342C9.20656 1.34357 10.3364 1.65124 11.334 2.22725ZM8.00065 10.0006C7.82384 10.0006 7.65427 10.0708 7.52925 10.1958C7.40422 10.3209 7.33398 10.4904 7.33398 10.6672V10.6739C7.33398 10.8507 7.40422 11.0203 7.52925 11.1453C7.65427 11.2703 7.82384 11.3406 8.00065 11.3406C8.17746 11.3406 8.34703 11.2703 8.47205 11.1453C8.59708 11.0203 8.66732 10.8507 8.66732 10.6739V10.6672C8.66732 10.4904 8.59708 10.3209 8.47205 10.1958C8.34703 10.0708 8.17746 10.0006 8.00065 10.0006ZM8.00065 5.33391C7.82384 5.33391 7.65427 5.40415 7.52925 5.52918C7.40422 5.6542 7.33398 5.82377 7.33398 6.00058V8.66725C7.33398 8.84406 7.40422 9.01363 7.52925 9.13865C7.65427 9.26367 7.82384 9.33391 8.00065 9.33391C8.17746 9.33391 8.34703 9.26367 8.47205 9.13865C8.59708 9.01363 8.66732 8.84406 8.66732 8.66725V6.00058C8.66732 5.82377 8.59708 5.6542 8.47205 5.52918C8.34703 5.40415 8.17746 5.33391 8.00065 5.33391Z" fill="#DB0000"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_215_8761">
                        <rect width="16" height="16" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                ) : null}
                {showPassword ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <g clipPath="url(#clip0_215_8713)">
                      <path d="M10.5856 10.5869C10.2105 10.9621 9.99991 11.4708 10 12.0013C10.0001 12.5317 10.2109 13.0404 10.5861 13.4154C10.9612 13.7904 11.47 14.0011 12.0004 14.001C12.5309 14.0009 13.0395 13.7901 13.4146 13.4149" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16.681 16.673C15.2782 17.5507 13.6547 18.0109 12 18C8.4 18 5.4 16 3 12C4.272 9.88003 5.712 8.32203 7.32 7.32603M10.18 6.18003C10.779 6.05876 11.3888 5.99845 12 6.00003C15.6 6.00003 18.6 8.00003 21 12C20.334 13.11 19.621 14.067 18.862 14.87" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 3L21 21" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_215_8713">
                        <rect width="24" height="24" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <g clipPath="url(#clip0_215_8813)">
                      <path d="M10 12C10 12.5304 10.2107 13.0391 10.5858 13.4142C10.9609 13.7893 11.4696 14 12 14C12.5304 14 13.0391 13.7893 13.4142 13.4142C13.7893 13.0391 14 12.5304 14 12C14 11.4696 13.7893 10.9609 13.4142 10.5858C13.0391 10.2107 12.5304 10 12 10C11.4696 10 10.9609 10.2107 10.5858 10.5858C10.2107 10.9609 10 11.4696 10 12Z" stroke="black" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12C18.6 16 15.6 18 12 18C8.4 18 5.4 16 3 12C5.4 8 8.4 6 12 6C15.6 6 18.6 8 21 12Z" stroke="black" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_215_8813">
                        <rect width="24" height="24" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                )}
              </button>
            )}
          />
          <div
            data-layer="Primary Button"
            onClick={!signupLoading ? handleContinueAfterProfile : undefined}
            className={`PrimaryButton w-[588px] h-10 px-5 py-2 left-[48px] top-[646px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 ${username && !validateUsername(username) && !validatePassword(password) && !signupLoading ? 'bg-pink-700 cursor-pointer' : 'bg-[#E5C0D1] cursor-not-allowed'}`}
          >
            <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">{signupLoading ? 'Creating account...' : 'Continue'}</div>
          </div>
        </div>
      ) : null}
      {step !== 4 && step !== 5 && (
        <div data-layer="Signup Header" className="SignupHeader w-48 h-10 left-[24px] top-[24px] absolute inline-flex justify-center items-center gap-1.5">
          <div className="size-10">
            <img
              src="/icons/signup/logo.png"
              alt="SalesGossip icon"
              className="w-[42px] h-[40px]"
            />
          </div>
          <div data-layer="SalesGossip" className="Salesgossip justify-start text-white text-2xl font-black font-['DM_Sans']">
            SalesGossip
          </div>
        </div>
      )}
    </div>
  );
}
