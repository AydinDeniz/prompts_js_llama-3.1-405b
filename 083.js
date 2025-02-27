function redirectToSection(url) {
  // Parse the URL to extract query parameters
  const urlParams = new URLSearchParams(url.split('?')[1]);

  // Define a mapping of section names to their corresponding anchors
  const sectionAnchors = {
    'overview': '#overview',
    'settings': '#settings',
    'reports': '#reports',
  };

  // Get the section name from the URL query parameters
  const sectionName = urlParams.get('section');

  // Validate the section name
  if (!sectionName || !sectionAnchors[sectionName]) {
    throw new Error(`Invalid section name: ${sectionName}`);
  }

  // Get the anchor for the specified section
  const sectionAnchor = sectionAnchors[sectionName];

  // Redirect to the specified section
  try {
    // Use the window.location.href property to redirect to the specified section
    window.location.href = sectionAnchor;
  } catch (error) {
    // Handle errors and provide a meaningful error message
    throw new Error(`Failed to redirect to section: ${sectionName}`);
  }
}

// Example usage:
const url = 'https://example.com/dashboard?section=overview';

try {
  redirectToSection(url);
} catch (error) {
  console.error(`Error: ${error.message}`);
}

// To make it more robust, you can add more validation and error handling
function getSectionName(url) {
  const urlParams = new URLSearchParams(url.split('?')[1]);
  return urlParams.get('section');
}

function isValidSectionName(sectionName) {
  return ['overview', 'settings', 'reports'].includes(sectionName);
}

function getSectionAnchor(sectionName) {
  const sectionAnchors = {
    'overview': '#overview',
    'settings': '#settings',
    'reports': '#reports',
  };
  return sectionAnchors[sectionName];
}

function redirectToSection(url) {
  const sectionName = getSectionName(url);

  if (!sectionName) {
    throw new Error('Missing section name');
  }

  if (!isValidSectionName(sectionName)) {
    throw new Error(`Invalid section name: ${sectionName}`);
  }

  const sectionAnchor = getSectionAnchor(sectionName);

  try {
    window.location.href = sectionAnchor;
  } catch (error) {
    throw new Error(`Failed to redirect to section: ${sectionName}`);
  }
}