import { Image } from 'react-native';

export async function getImageSize(uri) {
  return new Promise((resolve) => {
    if (!uri) return resolve({ width: 200, height: 300 });
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      () => resolve({ width: 200, height: 300 })
    );
  });
}