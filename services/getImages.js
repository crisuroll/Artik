import { Image } from 'react-native';

export const getImageSize = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      imageUrl,
      (width, height) => resolve({ width, height }),
      (error) => {
        console.error('Error obteniendo tamaño de imagen:', error.message);
        reject(error);
      }
    );
  });
};
