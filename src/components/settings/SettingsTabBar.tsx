export default function SettingsTabBar({ activeTab, onTabChange }) {
  return (
    <>
      <div
        data-layer="Settings"
        className="Settings left-[142px] top-[112px] absolute justify-start text-slate-900 text-2xl font-semibold font-inter leading-loose"
      >
        Settings
      </div>
      <div
        data-layer="Tab bar"
        role="tablist"
        aria-label="Settings tabs"
        className="TabBar size- left-[142px] top-[168px] absolute inline-flex justify-center items-center gap-6"
      >
        <button
          type="button"
          role="tab"
          id="tab-account"
          aria-selected={activeTab === 'account'}
          aria-controls="panel-account"
          onClick={() => onTabChange('account')}
          className={`Menu size- py-2 flex justify-center items-center gap-2 ${activeTab === 'account' ? 'border-b-[1.50px] border-pink-900' : ''}`}
        >
          <div
            data-layer="Menu"
            className={`Menu justify-start ${activeTab === 'account' ? 'text-pink-900' : 'text-zinc-400'} text-base font-medium font-inter`}
          >
            Account
          </div>
        </button>
        <button
          type="button"
          role="tab"
          id="tab-profile"
          aria-selected={activeTab === 'profile'}
          aria-controls="panel-profile"
          onClick={() => onTabChange('profile')}
          className={`Menu size- py-2 flex justify-center items-center gap-2 ${activeTab === 'profile' ? 'border-b-[1.50px] border-pink-900' : ''}`}
        >
          <div
            data-layer="Menu"
            className={`Menu justify-start ${activeTab === 'profile' ? 'text-pink-900' : 'text-zinc-400'} text-base font-medium font-inter`}
          >
            Profile
          </div>
        </button>
        <button
          type="button"
          role="tab"
          id="tab-notifications"
          aria-selected={activeTab === 'notifications'}
          aria-controls="panel-notifications"
          onClick={() => onTabChange('notifications')}
          className={`Menu size- py-2 flex justify-center items-center gap-2 ${
            activeTab === 'notifications' ? 'border-b-[1.50px] border-pink-900' : ''
          }`}
        >
          <div
            data-layer="Menu"
            className={`Menu justify-start ${activeTab === 'notifications' ? 'text-pink-900' : 'text-zinc-400'} text-base font-medium font-inter`}
          >
            Notifications
          </div>
        </button>
      </div>
    </>
  )
}

