import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../supabase/supabaseClient';

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

    const { error } = await supabase.from('posts').insert([{
      user_id: user.id,
      title,
      description,
      image_url: imageUrl,
      category_id: parseInt(selectedCategory.value),
      style_id: parseInt(selectedArtstyle.value),
      is_challenge: challengeChecked,
      challenge_id: challengeChecked && selectedChallenge ? parseInt(selectedChallenge.value) : null,
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