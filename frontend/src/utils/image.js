export const optimizeImageFile = (
  rawFile,
  {
    thresholdBytes = 1.5 * 1024 * 1024,
    maxDimension = 1280,
    quality = 0.85,
  } = {}
) =>
  new Promise((resolve, reject) => {
    if (!rawFile?.type?.startsWith("image/")) {
      reject(new Error("El archivo seleccionado no es una imagen"));
      return;
    }
    if (rawFile.size <= thresholdBytes) {
      resolve(rawFile);
      return;
    }

    const url = URL.createObjectURL(rawFile);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("No se pudo optimizar la imagen"));
            return;
          }
          const optimizedFile = new File([blob], rawFile.name || "image.jpg", {
            type: "image/jpeg",
          });
          resolve(optimizedFile);
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
