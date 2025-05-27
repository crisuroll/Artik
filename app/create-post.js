import React, { useState } from 'react';
import { Image, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/supabaseClient';
import BackButton from '../components/BackButton';
import Dropdown from '../components/Dropdown';
import { useCreatePost } from '../hooks/useCreatePost';
import UploadFile from '../components/UploadFile';

export default function CreatePostPage() {
  const {
    categories, artstyles, challenges,
    selectedCategory, setSelectedCategory,
    selectedArtstyle, setSelectedArtstyle,
    selectedChallenge, setSelectedChallenge,
    challengeChecked, setChallengeChecked,
    title, setTitle, description, setDescription, tags, setTags,
    imageUrl, setImageUrl,
    loading, posting, handlePost
  } = useCreatePost();

  const [uploading, setUploading] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />

      <UploadFile
        imageUrl={imageUrl}
        onUploadSuccess={setImageUrl}
        bucketName="posts"
        uploading={uploading}
        setUploading={setUploading}
      />

      <TextInput
        placeholder="Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Description"
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />
      <View style={styles.row}>
        <View style={styles.halfInput}>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Dropdown
              data={categories}
              onChange={setSelectedCategory}
              placeholder="Select Category"
              value={selectedCategory}
            />
          )}
        </View>
        <View style={styles.halfInput}>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Dropdown
              data={artstyles}
              onChange={setSelectedArtstyle}
              placeholder="Select Style"
              value={selectedArtstyle}
            />
          )}
        </View>
      </View>

      <View style={[styles.row, { alignItems: 'center' }]}>
        <Text style={styles.challengeLabel}>Challenge?</Text>
        <TouchableOpacity
          style={[
            styles.checkbox,
            { backgroundColor: challengeChecked ? '#70c0b7' : '#fff', borderColor: '#70c0b7', borderWidth: 1 }
          ]}
          onPress={() => {
            const newChecked = !challengeChecked;
            setChallengeChecked(newChecked);
            if (!newChecked) setSelectedChallenge(null);
          }}
        />
      </View>

      {challengeChecked && (
        <View style={styles.challengeDropdownContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Dropdown
              data={challenges}
              onChange={setSelectedChallenge}
              placeholder="Select Challenge"
              value={selectedChallenge}
            />
          )}
        </View>
      )}

      <TextInput
        placeholder="Tags (optional)"
        style={styles.input}
        value={tags}
        onChangeText={setTags}
      />

      <TouchableOpacity style={styles.postButton} onPress={handlePost} disabled={posting}>
        {posting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.postButtonText}>Post</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16, 
    paddingBottom: 100 
  },
  input: { 
    backgroundColor: '#f2f2f2', 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 12 
  },
  textArea: { 
    height: 100 
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  halfInput: { 
    backgroundColor: '#f2f2f2', 
    padding: 12, 
    borderRadius: 10, 
    flex: 0.48 
  },
  challengeDropdownContainer: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 16,
  },
  checkbox: { 
    width: 24,
    height: 24,
    borderRadius: 6,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  challengeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  postButton: { 
    backgroundColor: '#70c0b7', 
    padding: 15, 
    borderRadius: 30, 
    alignItems: 'center', 
    elevation: 3, 
    marginTop: 20 
  },
  postButtonText: { 
    fontWeight: 'bold',
    color: 'white',
  },
  uploadedImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadedImage: {
    width: 300,
    height: 180,
    borderRadius: 20,
  },
  changeImageButton: {
    marginTop: 10,
    backgroundColor: '#70c0b7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changeImageText: {
    color: 'white',
    fontWeight: 'bold',
  },
  uploadContainer: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#70c0b7',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadDesign: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  browseButtonText: {
    color: '#525252',
    fontWeight: '500',
  },
});
