const input = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const uploadBtn = document.getElementById('uploadBtn');
const output = document.getElementById('output');
let selectedFile = null;

input.addEventListener('change', () => {
  const file = input.files[0];
  if (!file) return;
  selectedFile = file;
  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.style.display = 'block';
  uploadBtn.disabled = false;
});

uploadBtn.addEventListener('click', () => {
  if (!selectedFile) return;
  uploadBtn.disabled = true;
  output.textContent = '⏳ Analyzing...';

  const form = new FormData();
  form.append('image', selectedFile);

  fetch('https://your-replit-url/ocr', { // replace with your actual Replit URL
    method: 'POST',
    body: form
  })
  .then(res => res.json())
  .then(data => {
    output.textContent = JSON.stringify(data, null, 2);
    uploadBtn.disabled = false;
  })
  .catch(err => {
    output.textContent = '⚠️ Error: ' + err;
    uploadBtn.disabled = false;
  });
});
