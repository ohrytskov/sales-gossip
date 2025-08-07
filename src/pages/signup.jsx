import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { sendVerificationEmail } from '../utils/sendVerificationEmail';
import FloatingInput from '../components/FloatingInput';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState('');
  const [codeError, setCodeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const router = useRouter();
  const provider = new GoogleAuthProvider();

  const handleGoogleSignUp = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleSendVerificationEmail = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const { code: generatedCode } = await sendVerificationEmail(email, { test: true });
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
      router.push('/');
    }
  };

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
              (email && !loading ? 'bg-pink-700 cursor-pointer' : 'bg-stone-300 cursor-not-allowed')
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
          onChange={setEmail}
          label="Enter your email id*"
          className="w-[588px] left-[48px] top-[307px] absolute"
        />
        </div>
      ) : (
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
              data-layer={"Don't get the email? Resend in " + formatTime(resendSeconds)}
              className="DidnTGetTheEmailResendIn0008 left-[200px] top-[282px] absolute text-center justify-start"
            >
              <span className="text-slate-950 text-base font-normal font-['Inter']">
                Don't get the email?{' '}
              </span>
              <span className="text-gray-400 text-base font-medium font-['Inter']">
                Resend in {formatTime(resendSeconds)}
              </span>
            </div>
          ) : (
            <div
              data-layer="Don't get the email? Resend"
              className="DidnTGetTheEmailResend left-[200px] top-[282px] absolute text-center justify-start"
            >
              <span className="text-slate-900 text-base font-normal font-['Inter']">
                Don't get the email?{' '}
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
              (code ? 'bg-pink-700 cursor-pointer' : 'bg-stone-300 cursor-not-allowed')
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
          <div data-layer="Primary Button" className="PrimaryButton h-10 px-5 py-2 left-[607px] top-[24px] absolute rounded-[56px] inline-flex justify-center items-center gap-2">
            <div data-layer="Button" className="Button justify-start text-slate-900 text-sm font-semibold font-['Inter']">Skip</div>
          </div>
        {codeError ? (
          <div
            data-layer="Input field"
            data-count="False"
            data-property-1="Error"
            data-size="Medium"
            className="InputField w-[588px] h-14 relative bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-red-700 left-[48px] top-[186px] absolute"
          >
            <div
              data-layer="Label-text"
              className="LabelText w-56 left-[16px] top-[9px] absolute justify-start text-red-700 text-xs font-normal font-['Inter'] leading-none"
            >
              Enter verification code*
            </div>
            <div
              data-layer="Error Text"
              className="ErrorText left-[17.82px] top-[60px] absolute justify-start text-red-700 text-xs font-normal font-['Inter'] leading-none"
            >
              {codeError}
            </div>
            <div
              data-layer="Frame 48097000"
              className="Frame48097000 size- left-[16px] top-[25px] absolute inline-flex justify-start items-center gap-1"
            >
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value); setCodeError(''); }}
                className="LabelText w-full bg-transparent outline-none justify-start text-slate-900 text-base font-medium font-['Inter'] leading-snug"
              />
            </div>
            <div
              data-svg-wrapper
              data-layer="Frame"
              className="Frame left-[556px] top-[20px] absolute"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_9890_4761)">
                  <path
                    d="M11.333 2.22627C12.3465 2.8114 13.1881 3.65299 13.7732 4.66646C14.3583 5.67993 14.6663 6.82956 14.6663 7.99981C14.6663 9.17007 14.3583 10.3197 13.7731 11.3332C13.188 12.3466 12.3464 13.1882 11.3329 13.7733C10.3195 14.3584 9.16982 14.6665 7.99957 14.6664C6.82932 14.6664 5.67969 14.3584 4.66623 13.7732C3.65277 13.1881 2.8112 12.3465 2.2261 11.333C1.64099 10.3195 1.33298 9.16985 1.33301 7.9996L1.33634 7.7836C1.37368 6.63226 1.70871 5.51024 2.30877 4.52693C2.90883 3.54362 3.75344 2.73257 4.76027 2.17286C5.76709 1.61314 6.90177 1.32387 8.05368 1.33323C9.20558 1.34259 10.3354 1.65027 11.333 2.22627ZM7.99967 9.9996C7.82286 9.9996 7.65329 10.0698 7.52827 10.1949C7.40325 10.3199 7.33301 10.4895 7.33301 10.6663V10.6729C7.33301 10.8497 7.40325 11.0193 7.52827 11.1443C7.65329 11.2694 7.82286 11.3396 7.99967 11.3396C8.17649 11.3396 8.34605 11.2694 8.47108 11.1443C8.5961 11.0193 8.66634 10.8497 8.66634 10.6729V10.6663C8.66634 10.4895 8.5961 10.3199 8.47108 10.1949C8.34605 10.0698 8.17649 9.9996 7.99967 9.9996ZM7.99967 5.33294C7.82286 5.33294 7.65329 5.40317 7.52827 5.5282C7.40325 5.65322 7.33301 5.82279 7.33301 5.9996V8.66627C7.33301 8.84308 7.40325 9.01265 7.52827 9.13767C7.65329 9.2627 7.82286 9.33294 7.99967 9.33294C8.17649 9.33294 8.34605 9.2627 8.47108 9.13767C8.5961 9.01265 8.66634 8.84308 8.66634 8.66627V5.9996C8.66634 5.82279 8.5961 5.65322 8.47108 5.5282C8.34605 5.40317 8.17649 5.33294 7.99967 5.33294Z"
                    fill="#DB0000"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_9890_4761">
                    <rect width="16" height="16" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
        ) : (
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
          />
        )}
        </div>
      )}
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
    </div>
  );
}
