import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { fetchChallengeById, fetchChallengePosts, fetchChallengeWithPosts, loadChallengePosts } from '../services/challengesService';
import { getImageSize } from '../services/getImages';

export function useCreateChallenge() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [posting, setPosting] = useState(false);

  const handleCreateChallenge = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill all the required fields.');
      return;
    }

    setPosting(true);

    const { error } = await supabase.from('challenges').insert([{
      title,
      description,
      image_url: imageUrl,
    }]);

    if (error) {
      console.error('Error creating challenge:', error);
      Alert.alert('Error', 'Could not create challenge.');
    } else {
      Alert.alert('Success', 'Challenge created successfully!');
      resetForm();
    }

    setPosting(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl(null);
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    imageUrl,
    setImageUrl,
    posting,
    handleCreateChallenge,
  };
}

export function useLoadChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const { data, error } = await supabase.from('challenges').select('*').order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading challenges:', error);
        } else {
          setChallenges(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  return { challenges, loading };
}

export function useChallenge(challengeId) {
  const [challenge, setChallenge] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChallenge = useCallback(async () => {
    setLoading(true);
    try {
      const challengeData = await fetchChallengeById(challengeId);
      setChallenge(challengeData);
      const postsData = await fetchChallengePosts(challengeId);
      setPosts(postsData);
    } catch (e) {
      // Manejo de error opcional
    }
    setLoading(false);
  }, [challengeId]);

  return { challenge, posts, loading, loadChallenge };
}

export function useLoadedChallenge(challengeId) {
  const [challenge, setChallenge] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChallengeAndPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { challengeData, postsData } = await loadChallengePosts(challengeId);

      setChallenge(challengeData);

      const processedPosts = await Promise.all(
        postsData.map(async (post) => {
          if (post.image_url) {
            try {
              const { width, height } = await getImageSize(post.image_url);
              return { ...post, imageUrl: post.image_url, width, height };
            } catch (error) {
              return { ...post, imageUrl: post.image_url };
            }
          }
          return post;
        })
      );

      setPosts(processedPosts);
    } catch (error) {
      setChallenge(null);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  return { challenge, posts, loading, fetchChallengeAndPosts };
}