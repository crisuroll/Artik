import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/supabaseClient';

const UploadFile = ({ onUploadSuccess }) => {
  const [fileName, setFileName] = useState(null);
  const [previewUri, setPreviewUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('Selección de documento cancelada');
        return;
      }

      console.log('Archivo seleccionado:', result);

      const file = result.assets[0];

      setFileName(file.name);
      setPreviewUri(file.uri);

      setUploading(true);

      const response = await fetch(file.uri);
      const blob = await response.blob();

      const fileExt = file.name.split('.').pop();
      const filePath = `posts/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('posts')
        .upload(filePath, blob, {
          contentType: blob.type || 'image/jpeg',
        });

      if (error) {
        console.error('Error subiendo archivo:', error);
        return;
      }

      console.log('Archivo subido:', data);

      const { data: urlData, error: urlError } = supabase
        .storage
        .from('posts')
        .getPublicUrl(filePath);

      if (urlError) {
        console.error('Error obteniendo URL pública:', urlError);
        return;
      }

      console.log('URL pública obtenida:', urlData.publicUrl);

      if (onUploadSuccess) {
        onUploadSuccess(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Error al seleccionar o subir el documento:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.uploadContainer} onPress={pickDocument}>
        {uploading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <View style={styles.uploadDesign}>
            <Ionicons name="cloud-upload-outline" size={50} color="#525252" style={styles.icon} />
            <Text style={styles.browseButtonText}>Upload</Text>
            {fileName && <Text style={styles.fileName}>Archivo: {fileName}</Text>}
          </View>
        )}
      </TouchableOpacity>

      {previewUri && (
        <Image source={{ uri: previewUri }} style={styles.previewImage} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadContainer: {
    backgroundColor: '#ddd',
    padding: 30,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#525252',
    borderStyle: 'dashed',
    height: 180,
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadDesign: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  browseButtonText: {
    fontSize: 16,
    color: '#525252',
    marginBottom: 5,
  },
  fileName: {
    marginTop: 10,
    fontSize: 14,
    color: '#525252',
  },
  previewImage: {
    width: 200,
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
});

export default UploadFile;