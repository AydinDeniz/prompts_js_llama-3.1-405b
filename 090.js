function displayRichText(text) {
  // Create a container element to hold the rich text
  const container = document.createElement('div');
  container.classList.add('rich-text-container');

  // Use a library like DOMPurify to sanitize the user-generated text
  const sanitizedText = DOMPurify.sanitize(text);

  // Use a library like markdown-it to convert Markdown to HTML
  const markdown = markdownit();
  const html = markdown.render(sanitizedText);

  // Set the inner HTML of the container element to the rendered HTML
  container.innerHTML = html;

  // Allow customization by adding classes or styles to the container element
  container.classList.add('custom-class');
  container.style.color = 'blue';

  // Append the container element to the webpage
  document.body.appendChild(container);
}

// Example usage:
const userText = '**Bold text**, *italic text*, [link](https://example.com)';
displayRichText(userText);

// Create a text editor instance
const editor = new Quill('#editor', {
  modules: {
    toolbar: ['bold', 'italic', 'link'],
  },
  placeholder: 'Type some text...',
  theme: 'snow',
});

// Get the user-generated text from the editor
const text = editor.getText();

// Display the rich text on the webpage
displayRichText(text);

// Client-side validation
function validateInput(text) {
  // Check for malicious input
  if (text.includes('<script>')) {
    return false;
  }
  return true;
}

// Server-side validation (using Node.js and Express)
app.post('/submit-text', (req, res) => {
  const text = req.body.text;
  // Check for malicious input
  if (!validateInput(text)) {
    return res.status(400).send('Invalid input');
  }
  // Sanitize the input text
  const sanitizedText = DOMPurify.sanitize(text);
  // Display the rich text on the webpage
  displayRichText(sanitizedText);
  res.send('Text submitted successfully');
});