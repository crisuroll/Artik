import { useEffect, useState } from 'react';
import { loadTimeline } from '../services/timeline';
import { getImageSize } from '../services/getImages';
import { interactWithPost } from '../services/interactions';

const useSearchPosts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const fetchedPosts = await loadTimeline();
      const processedPosts = await Promise.all(
        fetchedPosts.map(async (post) => {
          if (post.imageUrl) {
            try {
              const { width, height } = await getImageSize(post.imageUrl);
              return { ...post, width, height };
            } catch (error) {
              return post;
            }
          }
          return post;
        })
      );
      setPosts(processedPosts);
    };

    fetchPosts();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredPosts([]);
    } else {
      const results = posts.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(results);
    }
  };

  const handleInteraction = async (type, postId) => {
    try {
      const result = await interactWithPost(type, null, postId);
      setFilteredPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const currentValue = post[type] || 0;
            return {
              ...post,
              [type]: result.toggled === 'added' ? currentValue + 1 : Math.max(currentValue - 1, 0),
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error interacting with post:', error);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredPosts,
    activeMenuPostId,
    setActiveMenuPostId,
    handleSearch,
    handleInteraction,
  };
};

export default useSearchPosts;