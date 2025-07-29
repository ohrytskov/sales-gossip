
import Gossips from './menu/Gossips'
import Companies from './menu/Companies'
import Tags from './menu/Tags'
import About from './menu/About'

export const menuItems = [
  { key: 'gossips', label: 'Gossips', Icon: Gossips },
  { key: 'companies', label: 'Companies', Icon: Companies },
  { key: 'tags', label: 'Tags', Icon: Tags },
  { key: 'about', label: 'About', Icon: About },
]

/**
 * A navigation menu for selecting between different tabs.
 *
 * @param {{ selectedTab: string; onSelect: (key: string) => void }} props
 */
export default function Menu({ selectedTab, onSelect }) {
  return (
    <nav className="flex items-center gap-10 text-sm font-medium">
      {menuItems.map(({ key, label, Icon }) => {
        const isActive = selectedTab === key
        return (
          <div
            key={key}
            onClick={() => onSelect(key)}
            className={`flex flex-col items-center cursor-pointer ${
              isActive ? 'text-pink-900' : 'text-gray-400'
            }`}
          >
            <Icon />
            <span>{label}</span>
            <div
              className={`
                w-16 h-0 border-b-2 
                ${isActive ? 'border-pink-900' : 'border-transparent'}
                mt-[11px] mb-[-11px] 
              `}
            />
          </div>
        )
      })}
    </nav>
  )
}
