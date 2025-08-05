import Link from 'next/link';
import { useState } from 'react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  return (
    <div
      data-layer="Sign up"
      className="SignUp w-screen min-h-screen relative bg-pink-700 overflow-y-auto flex items-center justify-center py-[24px]"
    >
      <div
        data-layer="Signup Form Card"
        className="SignupFormCard relative w-[684px] h-[740px] bg-white rounded-[32px] shadow-[0px_0px_16px_0px_rgba(16,17,42,0.12)] overflow-hidden"
      >
        <div data-layer="Sign up" className="SignUp left-[292px] top-[48px] absolute text-center justify-start text-slate-900 text-3xl font-medium font-['Inter']">
          Sign up
        </div>
        <div data-layer="Create an account to start gossiping! By clicking on continue you are agreed to our Terms of Services and Privacy Policy" className="CreateAnAccountToStartGossipingByClickingOnContinueYouAreAgreedToOurTermsOfServicesAndPrivacyPolicy w-[468px] left-[108px] top-[98px] absolute text-center justify-start">
          <span className="text-gray-600 text-base font-normal font-['Inter'] leading-normal">Create an account to start gossiping! By clicking on continue you are agreed to our </span>
          <span className="text-pink-700 text-base font-medium font-['Inter'] leading-normal">Terms of Services</span>
          <span className="text-gray-600 text-base font-normal font-['Inter'] leading-normal"> and </span>
          <span className="text-pink-700 text-base font-medium font-['Inter'] leading-normal">Privacy Policy</span>
        </div>
        <div data-layer="Already have an account? Log in" className="AlreadyHaveAnAccountLogIn left-[219px] top-[673px] absolute text-center justify-start">
          <span className="text-gray-600 text-base font-normal font-['Inter']">Already have an account? </span>
          <Link href="/login" className="text-pink-700 text-base font-medium font-['Inter']">
            Log in
          </Link>
        </div>
        <div data-layer="OR" className="Or left-[332px] top-[258px] absolute text-center justify-start text-slate-900 text-sm font-normal font-['Inter']">OR</div>
        <div data-layer="Primary Button" className="PrimaryButton w-[588px] h-10 px-5 py-2 left-[48px] top-[186px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-gray-400 inline-flex justify-center items-center gap-2">
          <div data-svg-wrapper data-layer="google" className="Google">
            <img
              src="/icons/signup/google.svg"
              alt="Google icon"
              className="w-[21px] h-[20px]"
            />
          </div>
          <div data-layer="Button" className="Button justify-start text-slate-900 text-sm font-semibold font-['Inter']">Continue with Google</div>
        </div>
        <div data-layer="Primary Button" className="PrimaryButton w-[588px] h-10 px-5 py-2 left-[48px] top-[617px] absolute bg-stone-300 rounded-[56px] inline-flex justify-center items-center gap-2">
          <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">Continue</div>
        </div>
        <div data-svg-wrapper data-layer="Line 1" className="Line1 left-[376px] top-[266px] absolute">
          <img src="/icons/signup/line.svg" alt="" />
        </div>
        <div data-svg-wrapper data-layer="Line 2" className="Line2 left-[48px] top-[266px] absolute">
          <img src="/icons/signup/line.svg" alt="" />
        </div>
        <div data-layer="Input field" data-count="False" data-property-1="Empty" data-size="Medium" className="InputField w-[588px] h-14 left-[48px] top-[307px] absolute bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-400">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email id*"
            className="w-full h-full px-4 text-base font-normal font-['Inter'] placeholder-zinc-400 outline-none"
          />
        </div>
      </div>
      <div data-layer="Signup Header" className="SignupHeader w-48 h-10 left-[24px] top-[24px] absolute inline-flex justify-center items-center gap-1.5">
        <div data-layer="uuid-46414533-c34e-4145-a940-e20096abd5ec" className="Uuid46414533C34e4145A940E20096abd5ec size-10">
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
