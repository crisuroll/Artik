import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { fetchPostById, fetchCommentsByPostId, addCommentToPost, loadTimeline, interactWithPost, fetchPostStats, handleInteraction } from '../services/postsService';
import { getImageSize } from '../services/getImages';

export function useCreatePost() {
  const [categories, setCategories] = useState([]);
  const [artstyles, setArtstyles] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArtstyle, setSelectedArtstyle] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeChecked, setChallengeChecked] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: categoriesData }, { data: stylesData }, { data: challengesData }] = await Promise.all([
          supabase.from('categories').select('id, name'),
          supabase.from('styles').select('id, name'),
          supabase.from('challenges').select('id, title'),
        ]);

        if (categoriesData) {
          setCategories(categoriesData.map(item => ({ label: item.name, value: item.id.toString() })));
        }

        if (stylesData) {
          setArtstyles(stylesData.map(item => ({ label: item.name, value: item.id.toString() })));
        }

        if (challengesData) {
          setChallenges(challengesData.map(item => ({ label: item.title, value: item.id.toString() })));
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePost = async () => {
    if (!title || !description || !selectedCategory || !selectedArtstyle) {
      Alert.alert('Error', 'Please fill all the required fields.');
      return;
    }

    setPosting(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert('Error', 'User not logged in.');
      setPosting(false);
      return;
    }

    const categoryId = selectedCategory?.value ?? selectedCategory;
    const styleId = selectedArtstyle?.value ?? selectedArtstyle;

    const { error } = await supabase.from('posts').insert([{
      user_id: user.id,
      title,
      description,
      image_url: imageUrl,
      category_id: parseInt(categoryId),
      style_id: parseInt(styleId),
      is_challenge: challengeChecked,
      challenge_id: challengeChecked && selectedChallenge ? parseInt(selectedChallenge?.value ?? selectedChallenge) : null,
    }]);

    if (error) {
      console.error('Error inserting post:', error);
      Alert.alert('Error', 'Could not create post.');
    } else {
      Alert.alert('Success', 'Post created successfully!');
      resetForm();
    }

    setPosting(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTags('');
    setSelectedCategory(null);
    setSelectedArtstyle(null);
    setChallengeChecked(false);
    setSelectedChallenge(null);
    setImageUrl('');
  };

  return {
    categories,
    artstyles,
    challenges,
    selectedCategory,
    setSelectedCategory,
    selectedArtstyle,
    setSelectedArtstyle,
    selectedChallenge,
    setSelectedChallenge,
    challengeChecked,
    setChallengeChecked,
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    imageUrl,
    setImageUrl,
    loading,
    posting,
    handlePost,
  };
}

export function useLoadPost(postId) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    Promise.all([
      fetchPostById(postId),
      fetchCommentsByPostId(postId)
    ]).then(([postData, commentsData]) => {
      setPost(postData);
      setComments(commentsData);
      setLoading(false);
    });
  }, [postId]);

  const handleAddComment = async (content) => {
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    if (!user) return;
    const newComment = await addCommentToPost(postId, content, user.id);
    setComments((prev) => [newComment, ...prev]);
  };

  return { post, comments, loading, handleAddComment };
}

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

export function usePostInteractions(postId, userId) {
  const [likes, setLikes] = useState(0);
  const [reposts, setReposts] = useState(0);
  const [shares, setShares] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const stats = await fetchPostStats(postId);
      setLikes(stats.likes);
      setReposts(stats.reposts);
      setShares(stats.shares ?? 0);
    };
    if (postId) loadStats();
  }, [postId]);

  const like = () => handleInteraction('likes', userId, postId, setLikes);
  const repost = () => handleInteraction('reposts', userId, postId, setReposts);
  const share = () => handleInteraction('shares', userId, postId, setShares);

  return { likes, reposts, shares, like, repost, share };
}