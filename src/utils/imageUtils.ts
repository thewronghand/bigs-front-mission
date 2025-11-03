// 이미지 관련 상수
export const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB (서버 제한)
export const MAX_ORIGINAL_FILE_SIZE = 15 * 1024 * 1024; // 15MB (원본 파일 최대 크기, 메모리 보호)
export const RESIZE_DIMENSION = 1920; // 리사이징 기준 (1920px)
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// 이미지 리사이징 함수
export const resizeImage = (file: File, maxDimension: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { width, height } = img;

      // 리사이징이 필요없으면 원본 반환
      if (width <= maxDimension && height <= maxDimension) {
        resolve(file);
        return;
      }

      // 비율 유지하면서 리사이징
      let newWidth = width;
      let newHeight = height;

      if (width > height) {
        if (width > maxDimension) {
          newWidth = maxDimension;
          newHeight = (height * maxDimension) / width;
        }
      } else {
        if (height > maxDimension) {
          newHeight = maxDimension;
          newWidth = (width * maxDimension) / height;
        }
      }

      // Canvas로 리사이징
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context를 가져올 수 없습니다'));
        return;
      }

      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지 변환에 실패했습니다'));
            return;
          }

          // File 객체 생성
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          resolve(resizedFile);
        },
        file.type,
        0.75 // 품질 75% (1MB 서버 제한에 맞춤)
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지 로드에 실패했습니다'));
    };

    img.src = objectUrl;
  });
};

// 파일 크기 포맷팅 함수
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};
