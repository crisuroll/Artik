import { useState, useEffect, useCallback } from 'react';
import { Alert, Image } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { fetchPostById, fetchCommentsByPostId, addCommentToPost, loadTimeline, interactWithPost, fetchPostStats, handleInteraction, loadTimelineWithImageSizes, getPostInteractions, getPostsByUserId } from '../services/postsService';
import { getImageSize } from '../services/getImages';
import { loadUser } from '../services/usersService';
import { fetchCategories, fetchStyles, fetchPostsByFilter } from '../services/postsService';
import { searchUsers } from '../services/usersService';

export function useHomePosts() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);

  const loadUserAndPosts = async () => {
    const user = await loadUser();
    if (user?.username) setUsername(user.username);
    if (user?.userId) setUserId(user.userId);
    const getPosts = await loadTimelineWithImageSizes();
    setPosts(getPosts);
  };

  return {
    username,
    userId,
    posts,
    setPosts,
    activeMenuPostId,
    setActiveMenuPostId,
    loadUserAndPosts,
  };
}

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

export function usePostInteractions(postId, userId, refresh) {
  const [likes, setLikes] = useState(0);
  const [reposts, setReposts] = useState(0);
  const [shares, setShares] = useState(0);

  useEffect(() => {
    if (!postId) return;
    getPostInteractions(postId).then(data => {
      setLikes(data.likes);
      setReposts(data.reposts);
      setShares(data.shares);
    });
  }, [postId, refresh]);

  const like = async () => await interactWithPost('likes', userId, postId);
  const repost = async () => await interactWithPost('reposts', userId, postId);
  const share = async () => await interactWithPost('shares', userId, postId);

  return { likes, reposts, shares, like, repost, share };
}

const useSearchPosts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPosts([]);
      setFilteredUsers([]);
      return;
    }

    const doSearch = async () => {
      const users = (await searchUsers(searchTerm.trim()))
        .filter(user =>
          user.username === searchTerm.trim() ||
          user.nickname === searchTerm.trim()
        );
      setFilteredUsers(users);

      const allPosts = await loadTimeline();
      const keywordPosts = allPosts.filter(
        post => post.title === searchTerm
      ).map(post => ({
        ...post,
        imageUrl: post.image_url,
      }));

      let userPosts = [];
      for (const user of users) {
        const posts = await getPostsByUserId(user.id);
        userPosts = userPosts.concat(posts.map(post => ({
          ...post,
          imageUrl: post.image_url,
        })));
      }

      // Combinar y eliminar duplicados por id
      const combinedPosts = [...keywordPosts, ...userPosts].filter(
        (post, index, self) =>
          index === self.findIndex((p) => p.id === post.id)
      );

      setFilteredPosts(combinedPosts);
    };

    doSearch();
  }, [searchTerm]);

  const handleSearch = () => {};

  return {
    searchTerm,
    setSearchTerm,
    filteredPosts,
    filteredUsers,
    activeMenuPostId,
    setActiveMenuPostId,
    handleSearch,
  };
};

export function useGallery() {
  const [activeTab, setActiveTab] = useState('Category');
  const [categories, setCategories] = useState([]);
  const [stylesData, setStylesData] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, stylesData] = await Promise.all([
          fetchCategories(),
          fetchStyles(),
        ]);
        setCategories(categoriesData || []);
        setStylesData(stylesData || []);
        setActiveFilter((categoriesData?.[0]?.id) || null);
      } catch (e) {
        // Manejo de error opcional
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!activeFilter) {
        setPosts([]);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchPostsByFilter({
          filterType: activeTab,
          filterId: activeFilter,
        });
        const postsWithDimensions = await Promise.all(
          (data || []).map(
            (post) =>
              new Promise((resolve) => {
                Image.getSize(
                  post.image_url,
                  (width, height) => {
                    resolve({ ...post, width, height });
                  },
                  () => {
                    resolve({ ...post, width: 200, height: 300 });
                  }
                );
              })
          )
        );
        setPosts(postsWithDimensions);
      } catch (e) {
        setPosts([]);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [activeFilter, activeTab]);

  const getFilters = useCallback(
    () => (activeTab === 'Category' ? categories : stylesData),
    [activeTab, categories, stylesData]
  );

  return {
    activeTab,
    setActiveTab,
    categories,
    stylesData,
    activeFilter,
    setActiveFilter,
    posts,
    loading,
    getFilters,
  };
}

export default useSearchPosts;