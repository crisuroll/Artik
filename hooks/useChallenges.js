import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../supabase/supabaseClient';

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