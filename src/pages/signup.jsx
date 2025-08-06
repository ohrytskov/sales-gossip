import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import FloatingInput from '../components/FloatingInput';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
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
            onClick={() => email && setStep(2)}
            className={
              `PrimaryButton w-[588px] h-10 px-5 py-2 left-[48px] top-[617px] absolute rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer ` +
              (email ? 'bg-pink-700' : 'bg-stone-300')
            }
          >
            <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">
              Continue
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
        <div data-layer="Frame 44" className="Frame44 w-[684px] h-[740px] relative bg-white rounded-[32px] shadow-[0px_0px_16px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-stone-300 overflow-hidden">
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
                onClick={() => setStep(1)}
                className="text-black text-base font-medium font-['Inter'] leading-normal cursor-pointer"
              >
                Change email
              </span>
            </span>
          </div>
          <div data-layer="Didn't get the email? Resend in 00:08" className="DidnTGetTheEmailResendIn0008 left-[200px] top-[282px] absolute text-center justify-start">
            <span className="text-slate-950 text-base font-normal font-['Inter']">Don&apos;t get the email? </span>
            <span className="text-gray-400 text-base font-medium font-['Inter']">Resend in 00:08</span>
          </div>
          <div data-layer="Primary Button" className="PrimaryButton w-[588px] h-10 px-5 py-2 left-[48px] top-[646px] absolute bg-stone-300 rounded-[56px] inline-flex justify-center items-center gap-2">
            <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">
              Continue
            </div>
          </div>
          <div data-layer="Primary Button" className="PrimaryButton size-10 px-3 py-2 left-[24px] top-[24px] absolute rounded-[56px] inline-flex justify-center items-center gap-2">
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
        <FloatingInput
          data-layer="Input field"
          data-count="False"
          data-property-1="Empty"
          data-size="Medium"
          id="code"
          type="text"
          value={code}
          onChange={setCode}
          label="Enter verification code*"
          className="w-[588px] left-[48px] top-[186px] absolute"
        />
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
