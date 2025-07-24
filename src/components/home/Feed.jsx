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
];

export default function Feed() {
  const [followed, setFollowed] = useState({});
  const toggleFollow = (id) => {
    setFollowed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col ">
      <FeedFilterBar />
      {sampleFeed.map((post) => (
        <FeedPost key={post.id} {...post} onFollow={() => toggleFollow(post.id)} />
      ))}

      {/* Rounded footer */}
      <div className="w-[684px] h-4 relative bg-white border border-t-0 mt-[-1px] mb-10 border-gray-200 rounded-bl-2xl rounded-br-2xl" />
    </div>
  );
}

