// components/home/Feed.jsx
import { useState } from 'react';
import FeedPost from './FeedPost';
import FeedFilterBar from './FeedFilterBar'

const sampleFeed = [
  {
    id: 1,
    avatar: '/images/feed/avatar1.svg',
    username: 'QuotaCrusher',
    timestamp: '14 min',
    title: 'Surprise Win: A Loom Video Got Me the Meeting',
    excerpt: 'I’ve been in sales for 3 years and always experimenting. One thing that surprisingly worked for me was simply sending a Loom video instead of a long email. It made the pitch more personal and drove engagement.',
    moreLink: true,
    tags: ['Sales', 'Growth', 'Loomvideo'],
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    likes: 256,
    commentsCount: 128,
    shares: 10,
    comments: [
      { id: 1, user: { name: 'John Doe', avatar: '/images/feed/commentsAvatar1.svg' }, text: 'Love this!', time: '11 min' },
      { id: 2, user: { name: 'david.sdr', avatar: '/images/feed/commentsAvatar2.svg' }, text: 'Thanks for sharing this', time: '12 min' },
    ],
    companyLogo: '/images/feed/companyLogo1.svg',
    companyName: 'NimbusWorks',
  },
  {
    id: 2,
    avatar: '/images/feed/avatar2.svg',
    username: 'RevWizard',
    timestamp: '2h',
    title: 'Ghosted? This One Voice Note Closed the Deal 💼🎙️',
    excerpt: `Thought the lead ghosted me 👻. It had been weeks.
Not only did I get a reply, but the deal closed in 2 days. Sales is human. Sometimes a little personality does what 5 follow-up emails can’t.
But instead of sending another “just checking in” email 📩 , I sent a short voice note with a quick update and a joke we laughed about during the call —this was with @NimbusWorks. 💰`,
    moreLink: false,
    tags: [],
    mediaUrl: '',
    likes: 156,
    commentsCount: 88,
    shares: 5,
    comments: [],
    companyLogo: '/images/feed/companyLogo2.svg',
    companyName: 'CorevistaGroup',
  },
  {
    id: 3,
    avatar: '/images/feed/avatar1.svg',
    username: 'QuickResponder',
    timestamp: '1 min',
    title: 'Lightning fast reply closes deals',
    excerpt: 'Speedy responses show commitment and keep the conversation alive.',
    moreLink: false,
    tags: ['Speed', 'FollowUp'],
    mediaUrl: '',
    likes: 50,
    commentsCount: 200,
    comments: [],
    companyLogo: '/images/feed/companyLogo1.svg',
    companyName: 'FastLane',
  },
  {
    id: 4,
    avatar: '/images/feed/avatar2.svg',
    username: 'PowerSeller',
    timestamp: '3h',
    title: 'Powerful follow-ups after calls',
    excerpt: 'A clear recap with next steps showcases professionalism and closes deals.',
    moreLink: false,
    tags: ['Recap', 'Call'],
    mediaUrl: '',
    likes: 500,
    commentsCount: 10,
    comments: [],
    companyLogo: '/images/feed/companyLogo2.svg',
    companyName: 'SalesPower',
  },
];

export default function Feed() {
  const [followed, setFollowed] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('Best');
  const toggleFollow = (id) => {
    setFollowed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // derive list of all tags and filter posts by selected tags
  const availableTags = Array.from(
    new Set(sampleFeed.flatMap((post) => post.tags || []))
  );
  const filteredPosts = sampleFeed.filter(
    (post) =>
      selectedTags.length === 0 ||
      (post.tags || []).some((tag) => selectedTags.includes(tag))
  );
  // sort posts according to selected sort option
  const parseTimestamp = (ts) => {
    const val = parseInt(ts, 10) || 0;
    return ts.includes('h') ? val * 60 : val;
  };
  const sortedPosts = [...filteredPosts];
  if (sortBy === 'New') {
    sortedPosts.sort((a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp));
  } else if (sortBy === 'Top') {
    sortedPosts.sort((a, b) => b.likes - a.likes);
  } else if (sortBy === 'Rising') {
    sortedPosts.sort((a, b) => b.commentsCount - a.commentsCount);
  }

  return (
    <div className="flex flex-col ">
      <FeedFilterBar
        availableTags={availableTags}
        selectedTags={selectedTags}
        onChange={setSelectedTags}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      {sortedPosts.map((post) => (
        <FeedPost key={post.id} {...post} onFollow={() => toggleFollow(post.id)} />
      ))}

      {/* Rounded footer */}
      <div className="w-[684px] h-4 relative bg-white border border-t-0 mt-[-1px] mb-10 border-gray-200 rounded-bl-2xl rounded-br-2xl" />
    </div>
  );
}
