export const blobToBase64 = (blob, callback) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    callback(reader.result); // Calls getText with base64 audio
  };
  reader.readAsDataURL(blob);
};