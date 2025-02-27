// Get the file input element
const fileInput = document.getElementById('file-input');

// Add event listener to the file input element
fileInput.addEventListener('change', (e) => {
  const file = fileInput.files[0];
  compressImage(file, 0.5); // Compress the image to 50% of its original size
});

// Function to compress the image
function compressImage(file, compressionLevel) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = image.width * compressionLevel;
      canvas.height = image.height * compressionLevel;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob], file.name, {
          type: file.type,
        });
        downloadFile(compressedFile);
      }, file.type, compressionLevel);
    };
    image.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Function to download the compressed file
function downloadFile(file) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(a.href);
}