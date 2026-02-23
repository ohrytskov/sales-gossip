import FloatingInput from '@/components/FloatingInput'

export default function SettingsChangePasswordModal({
  showChangePassword,
  setShowChangePassword,
  cpErrors,
  setCpErrors,
  cpCurrent,
  setCpCurrent,
  cpNew,
  setCpNew,
  cpConfirm,
  setCpConfirm,
  logoutOtherApps,
  setLogoutOtherApps,
  cpNewMasked,
  cpConfirmMasked,
  cpCurrentMasked,
  validationErrors,
  cpHasTyped,
  cpSaving,
  handleSavePassword,
}) {
  if (!showChangePassword) return null

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50"
      onClick={() => (setShowChangePassword(false), setCpCurrent(''), setCpNew(''), setCpConfirm(''), setCpErrors({}), setLogoutOtherApps(false))}
    >
      <div
        data-layer="Modal"
        className="Modal w-[566px] h-[456px] relative bg-white rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          data-layer="Section title"
          className="SectionTitle left-[24px] top-[24px] absolute justify-start text-[#17183b] text-lg font-semibold font-['Inter'] leading-normal"
        >
          Password
        </div>
        <div data-svg-wrapper data-layer="Ellipse 11" className="Ellipse11 left-[510px] top-[20px] absolute">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#F2F2F4" />
          </svg>
        </div>
        <div
          data-svg-wrapper
          data-layer="Frame"
          className="Frame left-[516.40px] top-[26.40px] absolute cursor-pointer"
          onClick={() => (setShowChangePassword(false), setCpCurrent(''), setCpNew(''), setCpConfirm(''), setCpErrors({}), setLogoutOtherApps(false))}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_407_12718)">
              <path
                d="M14.7953 5.20117L5.19531 14.8012"
                stroke="#17183B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.19531 5.20117L14.7953 14.8012"
                stroke="#17183B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_407_12718">
                <rect width="19.2" height="19.2" fill="white" transform="translate(0.398438 0.400391)" />
              </clipPath>
            </defs>
          </svg>
        </div>
        {cpErrors.current ? (
          <>
            <div
              data-layer="Input field"
              data-count="False"
              data-property-1="Filled"
              data-size="Medium"
              className="InputField w-[518px] h-14 left-[24px] top-[144px] absolute bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#b7b7c2]"
            >
              <div
                data-layer="Label-text"
                className="LabelText w-56 left-[16px] top-[9px] absolute justify-start text-[#9495a5] text-xs font-normal font-['Inter'] leading-none"
              >
                New password*
              </div>
              <div
                data-layer="Frame 48097001"
                className="Frame48097001 size- left-[16px] top-[25px] absolute inline-flex justify-start items-center gap-1"
              >
                <div
                  data-layer="Label-text"
                  className="LabelText justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-snug"
                >
                  {cpNewMasked}
                </div>
              </div>
            </div>
            <div
              data-layer="Input field"
              data-count="False"
              data-property-1="Filled"
              data-size="Medium"
              className="InputField w-[518px] h-14 left-[24px] top-[224px] absolute bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#b7b7c2]"
            >
              <div
                data-layer="Label-text"
                className="LabelText w-56 left-[16px] top-[9px] absolute justify-start text-[#9495a5] text-xs font-normal font-['Inter'] leading-none"
              >
                Confirm new password*
              </div>
              <div
                data-layer="Frame 48097001"
                className="Frame48097001 size- left-[16px] top-[25px] absolute inline-flex justify-start items-center gap-1"
              >
                <div
                  data-layer="Label-text"
                  className="LabelText justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-snug"
                >
                  {cpConfirmMasked}
                </div>
              </div>
            </div>
            <div
              data-layer="Input field"
              data-count="False"
              data-property-1="Error"
              data-size="Medium"
              className="InputField w-[518px] h-14 left-[24px] top-[64px] absolute bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#db0000]"
            >
              <div
                data-layer="Label-text"
                className="LabelText w-56 left-[16px] top-[9px] absolute justify-start text-[#db0000] text-xs font-normal font-['Inter'] leading-none"
              >
                Current password*
              </div>
              <div
                data-layer="Error Text"
                className="ErrorText left-[15.70px] top-[60px] absolute justify-start text-[#db0000] text-xs font-normal font-['Inter'] leading-none"
              >
                {cpErrors.current}
              </div>
              <div
                data-layer="Frame 48097000"
                className="Frame48097000 size- left-[16px] top-[25px] absolute inline-flex justify-start items-center gap-1"
              >
                <div
                  data-layer="Label-text"
                  className="LabelText justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-snug"
                >
                  {cpCurrentMasked}
                </div>
              </div>
              <div data-svg-wrapper data-layer="Frame" className="Frame left-[486px] top-[20px] absolute">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_10066_4739)">
                    <path
                      d="M11.333 2.22725C12.3465 2.81237 13.1881 3.65396 13.7732 4.66743C14.3583 5.6809 14.6663 6.83054 14.6663 8.00079C14.6663 9.17104 14.3583 10.3207 13.7731 11.3341C13.188 12.3476 12.3464 13.1892 11.3329 13.7743C10.3195 14.3594 9.16982 14.6674 7.99957 14.6674C6.82932 14.6674 5.67969 14.3593 4.66623 13.7742C3.65277 13.189 2.8112 12.3474 2.2261 11.334C1.64099 10.3205 1.33298 9.17083 1.33301 8.00058L1.33634 7.78458C1.37368 6.63324 1.70871 5.51122 2.30877 4.52791C2.90883 3.5446 3.75344 2.73355 4.76027 2.17383C5.76709 1.61412 6.90177 1.32484 8.05368 1.3342C9.20558 1.34357 10.3354 1.65124 11.333 2.22725ZM7.99967 10.0006C7.82286 10.0006 7.65329 10.0708 7.52827 10.1958C7.40325 10.3209 7.33301 10.4904 7.33301 10.6672V10.6739C7.33301 10.8507 7.40325 11.0203 7.52827 11.1453C7.65329 11.2703 7.82286 11.3406 7.99967 11.3406C8.17649 11.3406 8.34605 11.2703 8.47108 11.1453C8.5961 11.0203 8.66634 10.8507 8.66634 10.6739V10.6672C8.66634 10.4904 8.5961 10.3209 8.47108 10.1958C8.34605 10.0708 8.17649 10.0006 7.99967 10.0006ZM7.99967 5.33391C7.82286 5.33391 7.65329 5.40415 7.52827 5.52918C7.40325 5.6542 7.33301 5.82377 7.33301 6.00058V8.66725C7.33301 8.84406 7.40325 9.01363 7.52827 9.13865C7.65329 9.26367 7.82286 9.33391 7.99967 9.33391C8.17649 9.33391 8.34605 9.26367 8.47108 9.13865C8.5961 9.01363 8.66634 8.84406 8.66634 8.66725V6.00058C8.66634 5.82377 8.5961 5.6542 8.47108 5.52918C8.34605 5.40415 8.17649 5.33391 7.99967 5.33391Z"
                      fill="#DB0000"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_10066_4739">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
            <div data-layer="Frame 48097040" className="Frame48097040 w-[566px] h-16 left-0 top-[388px] absolute overflow-hidden">
              <div data-layer="Primary Button" className="PrimaryButton h-10 px-5 py-2 left-[469px] top-[14px] absolute bg-[#e5c0d1] rounded-[56px] inline-flex justify-center items-center gap-2">
                <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">
                  Save
                </div>
              </div>
              <div data-layer="Primary Button" className="PrimaryButton h-10 px-5 py-2 left-[365px] top-[14px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center gap-2">
                <div data-layer="Button" className="Button justify-start text-[#aa336a] text-sm font-semibold font-['Inter']">
                  Cancel
                </div>
              </div>
            </div>
            <div data-layer="*Checkbox*" data-check="True" data-label="True" data-state="Default" className="Checkbox size- left-[24px] top-[304px] absolute inline-flex justify-start items-start gap-2">
              <div data-layer="Checkbox Wrapper" className="CheckboxWrapper size- py-[3px] flex justify-start items-start gap-2">
                <div data-svg-wrapper data-layer="Checkbox/Active/Default" className="CheckboxActiveDefault relative">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 4C0 1.79086 1.79086 0 4 0H12C14.2091 0 16 1.79086 16 4V12C16 14.2091 14.2091 16 12 16H4C1.79086 16 0 14.2091 0 12V4Z" fill="#AA336A" />
                    <path d="M12.4688 3.84961C12.6699 3.84961 12.789 4.0837 12.6602 4.24414L12.6592 4.24316L6.9375 11.4961H6.93652C6.7256 11.7609 6.32265 11.7619 6.1123 11.4961L2.90234 7.42969C2.77666 7.27029 2.89024 7.0353 3.09375 7.03516H3.91309L4.03027 7.04883C4.06878 7.05769 4.10681 7.07051 4.14258 7.08789C4.21376 7.12255 4.2762 7.17315 4.3252 7.23535L6.52344 10.0215L11.2383 4.0498C11.3373 3.92341 11.4895 3.84973 11.6494 3.84961H12.4688Z" fill="white" stroke="white" strokeWidth="0.3" />
                  </svg>
                </div>
              </div>
              <div data-layer="Checkbox" className="Checkbox justify-start text-[#10112a] text-sm font-normal font-['Inter'] leading-snug">
                Changing your password logs you out of all browsers on your device(s). <br />
                Checking this box also logs you out of all apps you have authorized.
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="absolute w-[518px] left-[24px] top-[64px]">
              <FloatingInput
                id="settings-current-password"
                type="password"
                value={cpCurrent}
                onChange={(v) => {
                  setCpCurrent(v)
                  setCpErrors((prev) => ({ ...prev, current: '' }))
                }}
                label="Current password*"
                className="w-full"
                inputProps={{ autoComplete: 'off', name: 'settings-current-password' }}
                error={Boolean(cpErrors.current || validationErrors.current)}
                helperText={cpErrors.current || validationErrors.current}
              />
            </div>
            <div className="absolute w-[518px] left-[24px] top-[144px]">
              <FloatingInput
                id="settings-new-password"
                type="password"
                value={cpNew}
                onChange={(v) => {
                  setCpNew(v)
                  setCpErrors((prev) => ({ ...prev, new: '' }))
                }}
                label="New password*"
                className="w-full"
                inputProps={{ autoComplete: 'off', name: 'settings-new-password' }}
                error={Boolean(cpErrors.new || validationErrors.new)}
                helperText={cpErrors.new || validationErrors.new}
              />
            </div>
            <div className="absolute w-[518px] left-[24px] top-[224px]">
              <FloatingInput
                id="settings-confirm-password"
                type="password"
                value={cpConfirm}
                onChange={(v) => {
                  setCpConfirm(v)
                  setCpErrors((prev) => ({ ...prev, confirm: '' }))
                }}
                label="Confirm new password*"
                className="w-full"
                inputProps={{ autoComplete: 'off', name: 'settings-confirm-password' }}
                error={Boolean(cpErrors.confirm || validationErrors.confirm)}
                helperText={cpErrors.confirm || validationErrors.confirm}
              />
            </div>
            <div data-layer="*Checkbox*" data-check="False" data-label="True" data-state="Default" className="Checkbox size- left-[24px] top-[304px] absolute inline-flex justify-start items-start gap-2">
              <div data-layer="Checkbox Wrapper" className="CheckboxWrapper size- py-[3px] flex justify-start items-start gap-2">
                <div className="relative">
                  <input
                    id="logout-other-apps"
                    type="checkbox"
                    checked={logoutOtherApps}
                    onChange={(e) => setLogoutOtherApps(e.target.checked)}
                    className="w-4 h-4 rounded outline outline-1 outline-[#b7b7c2] bg-white"
                  />
                </div>
              </div>
              <div data-layer="Checkbox" className="Checkbox justify-start text-[#10112a] text-sm font-normal font-['Inter'] leading-snug">
                Changing your password logs you out of all browsers on your device(s). <br />
                Checking this box also logs you out of all apps you have authorized.
              </div>
            </div>
            <div data-layer="Frame 48097040" className="Frame48097040 w-[566px] h-16 left-0 top-[388px] absolute overflow-hidden">
              <div
                data-layer="Primary Button"
                className={`PrimaryButton h-10 px-5 py-2 left-[469px] top-[14px] absolute ${cpSaving ? 'bg-[#e5c0d1]' : cpHasTyped ? 'bg-pink-700' : 'bg-[#e5c0d1]'} rounded-[56px] inline-flex justify-center items-center gap-2 ${cpHasTyped && !cpSaving ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                onClick={cpHasTyped && !cpSaving ? handleSavePassword : undefined}
              >
                <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">
                  {cpSaving ? 'Saving...' : 'Save'}
                </div>
              </div>
              <div
                data-layer="Primary Button"
                className="PrimaryButton h-10 px-5 py-2 left-[365px] top-[14px] absolute bg-white rounded-[56px] outline outline-1 outline-offset-[-1px] outline-[#b7b7c2] inline-flex justify-center items-center gap-2 cursor-pointer"
                onClick={() => (setShowChangePassword(false), setCpCurrent(''), setCpNew(''), setCpConfirm(''), setCpErrors({}), setLogoutOtherApps(false))}
              >
                <div data-layer="Button" className="Button justify-start text-[#aa336a] text-sm font-semibold font-['Inter']">
                  Cancel
                </div>
              </div>
            </div>
            {cpErrors.general ? <div className="absolute left-4 top-[360px] text-red-700 text-sm">{cpErrors.general}</div> : null}
          </>
        )}
      </div>
    </div>
  )
}

