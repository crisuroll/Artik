import React, { useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Modal } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/supabaseClient';

let EasyCrop = null;
if (Platform.OS === 'web') {
  EasyCrop = require('react-easy-crop').default;
} else {
  var ImageCropper = require('expo-image-cropper').default;
}

const UploadFile = ({ imageUrl, onUploadSuccess, bucketName, uploading, setUploading }) => {
  const [cropVisible, setCropVisible] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [webImage, setWebImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const pickDocument = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setUploading(false);
        return;
      }

      const file = result.assets[0];
      setImageToCrop(file.uri);
      if (Platform.OS === 'web') {
        setWebImage(file);
      }
      setCropVisible(true);
      setUploading(false);
    } catch (error) {
      setUploading(false);
      console.error('Error al seleccionar el documento:', error);
    }
  };

  const handleCropMobile = async (croppedUri) => {
    setCropVisible(false);
    setUploading(true);
    try {
      const response = await fetch(croppedUri);
      const blob = await response.blob();

      const fileExt = 'jpg';
      const filePath = `${bucketName}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, blob, {
          contentType: blob.type || 'image/jpeg',
        });

      if (error) {
        setUploading(false);
        console.error('Error subiendo archivo:', error);
        return;
      }

      const { data: urlData, error: urlError } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (urlError) {
        setUploading(false);
        console.error('Error obteniendo URL pública:', urlError);
        return;
      }

      if (onUploadSuccess) {
        onUploadSuccess(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Error al subir la imagen recortada:', error);
    } finally {
      setUploading(false);
    }
  };

  const getCroppedImg = async (imageSrc, crop) => {
    const createImage = (url) =>
      new Promise((resolve, reject) => {
        const image = new window.Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
      });

    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleCropWeb = async () => {
    setCropVisible(false);
    setUploading(true);
    try {
      const blob = await getCroppedImg(imageToCrop, croppedAreaPixels);

      const fileExt = 'jpg';
      const filePath = `${bucketName}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
        });

      if (error) {
        setUploading(false);
        console.error('Error subiendo archivo:', error);
        return;
      }

      const { data: urlData, error: urlError } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (urlError) {
        setUploading(false);
        console.error('Error obteniendo URL pública:', urlError);
        return;
      }

      if (onUploadSuccess) {
        onUploadSuccess(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Error al subir la imagen recortada:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cropper para móvil */}
      {Platform.OS !== 'web' && cropVisible && (
        <Modal visible={cropVisible} animationType="slide">
          <ImageCropper
            imageUri={imageToCrop}
            onCancel={() => setCropVisible(false)}
            onDone={handleCropMobile}
            cropShape="round"
            aspectRatio={{ width: 1, height: 1 }}
          />
        </Modal>
      )}

      {/* Cropper para web */}
      {Platform.OS === 'web' && cropVisible && (
        <Modal visible={cropVisible} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: 300, height: 300, position: 'relative' }}>
              <EasyCrop
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                onZoomChange={setZoom}
              />
            </View>
            <TouchableOpacity style={{ marginTop: 20, backgroundColor: '#70c0b7', padding: 10, borderRadius: 8 }} onPress={handleCropWeb}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Recortar y subir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setCropVisible(false)}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {!imageUrl ? (
        <TouchableOpacity style={styles.uploadContainer} onPress={pickDocument}>
          {uploading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <View style={styles.uploadDesign}>
              <Ionicons name="cloud-upload-outline" size={50} color="#525252" style={styles.icon} />
              <Text style={styles.browseButtonText}>Upload</Text>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={pickDocument} style={styles.uploadedImageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.uploadedImage} resizeMode="cover" />
        </TouchableOpacity>
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
    marginBottom: 16,
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
  uploadedImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#70c0b7',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  uploadedImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
});

export default UploadFile;