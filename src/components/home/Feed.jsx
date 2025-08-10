// components/home/Feed.jsx
import { useState } from 'react';
import FeedPost from './FeedPost';
import FeedFilterBar from './FeedFilterBar'
import useRtdbDataKey from '@/hooks/useRtdbData'

export default function Feed() {
  const { data: sampleFeed } = useRtdbDataKey('sampleFeed')
  const [followed, setFollowed] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('Best');
  const toggleFollow = (id) => {
    setFollowed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // derive list of all tags and filter posts by selected tags
  const feed = sampleFeed || []
  const availableTags = Array.from(new Set(feed.flatMap((post) => post.tags || [])));
  const filteredPosts = feed.filter(
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
