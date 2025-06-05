import React, { useState, useRef, useEffect } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Modal } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/supabaseClient';
import Cropper from '../imgCropper/components/Cropper';

const UploadFile = ({ imageUrl, onUploadSuccess, bucketName, uploading, setUploading, style }) => {
  const [cropVisible, setCropVisible] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 300, height: 180 });
  const cropperRef = useRef(null);

  // NO BORRAR: Función para procesar la imagen con el backend
  const procesarImagenConBackend = async (file) => {
    let formData = new FormData();

    if (Platform.OS === 'web') {
      const blob = await fetch(file.uri).then(res => res.blob());
      formData.append('image', new File([blob], file.name, {
        type: file.mimeType || 'image/jpeg',
      }));
    } else {
      formData.append('image', {
        uri: file.uri,
        name: file.name || 'image.jpg',
        type: file.mimeType || 'image/jpeg',
      });
    }

    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error procesando imagen en el backend');
    }

    return await response.blob();
  };

  const getImageSize = (uri) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = uri;
    });
  };

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
      setCropVisible(true);
      setUploading(false);
    } catch (error) {
      setUploading(false);
      console.error('Error al seleccionar el documento:', error);
    }
  };

  const handleCropDone = async (cropRect) => {
    setCropVisible(false);
    setUploading(true);
    try {
      let croppedUri = imageToCrop;
      if (Platform.OS === 'web') {
        const img = new window.Image();
        img.src = imageToCrop;
        await new Promise(res => (img.onload = res));
        const canvas = document.createElement('canvas');
        canvas.width = cropRect.width;
        canvas.height = cropRect.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(
          img,
          cropRect.x, cropRect.y, cropRect.width, cropRect.height,
          0, 0, cropRect.width, cropRect.height
        );
        croppedUri = canvas.toDataURL('image/jpeg');
      } else {
        // En nativo, puedes usar react-native-image-editor o similar si necesitas recortar localmente
        // Por simplicidad, aquí se asume que el backend recorta si hace falta
      }

      const backendBlob = await procesarImagenConBackend({
        uri: croppedUri,
        name: 'cropped-image.jpg',
        mimeType: 'image/jpeg',
      });

      const fileExt = 'jpg';
      const filePath = `${bucketName}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, backendBlob, {
          contentType: backendBlob.type || 'image/jpeg',
        });

      if (error) {
        console.error('Error subiendo archivo:', error);
        return;
      }

      const { data: urlData, error: urlError } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (urlError) {
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

  const MAX_WIDTH = 350;
  const MAX_HEIGHT = 350;

  function getLimitedDimensions(width, height) {
    let ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height, 1);
    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio),
    };
  }

  useEffect(() => {
    if (imageUrl) {
      Image.getSize(
        imageUrl,
        (width, height) => {
          const limited = getLimitedDimensions(width, height);
          setImageDimensions(limited);
        },
        () => setImageDimensions({ width: 300, height: 180 })
      );
    }
  }, [imageUrl]);

  return (
    <View style={styles.container}>
      {/* Cropper para web y nativo */}
      {cropVisible && imageToCrop && (
        <Modal visible={cropVisible} animationType="slide">
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            <Cropper
              ref={cropperRef}
              uri={imageToCrop}
              getImageSize={getImageSize}
              onDone={handleCropDone}
              onCancel={() => setCropVisible(false)}
              aspectRatio={undefined}
              hideFooter={false}
            />
          </View>
        </Modal>
      )}

      {!imageUrl ? (
        <TouchableOpacity style={styles.uploadContainer} onPress={pickDocument}>
          {uploading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <View style={styles.uploadDesign}>
              <Ionicons name="cloud-upload-outline" size={30} color="#70c0b7" style={styles.icon} />
              <Text style={styles.browseButtonText}>Upload</Text>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={pickDocument}
          style={[
            styles.uploadedImageContainer,
            { width: imageDimensions.width, height: imageDimensions.height },
            style,
          ]}
        >
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.uploadedImage,
              { width: imageDimensions.width, height: imageDimensions.height },
              style,
            ]}
            resizeMode="cover"
          />
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
    padding: 30,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#70c0b7',
    borderStyle: 'dashed',
    height: 100,
    width: 150,
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
    color: '#70c0b7',
    marginBottom: 10,
    fontFamily: 'Nunito',
  },
});

export default UploadFile;
