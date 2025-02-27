function parseJsonRequestBody(requestBody) {
  // Check if the request body is a string
  if (typeof requestBody !== 'string') {
    throw new Error('Request body must be a string');
  }

  // Attempt to parse the JSON
  try {
    // Use JSON.parse to convert the JSON string into a JavaScript object
    const parsedJson = JSON.parse(requestBody);

    // Check if the parsed JSON is an object
    if (typeof parsedJson !== 'object') {
      throw new Error('Parsed JSON must be an object');
    }

    // Recursively traverse the parsed JSON to validate nested structures
    function validateNestedStructures(json) {
      // Check if the current value is an object
      if (typeof json === 'object') {
        // Iterate over the object's properties
        for (const key in json) {
          // Check if the property value is an object or array
          if (typeof json[key] === 'object') {
            // Recursively validate the nested structure
            validateNestedStructures(json[key]);
          }
        }
      }

      // Check if the current value is an array
      if (Array.isArray(json)) {
        // Iterate over the array's elements
        json.forEach((element) => {
          // Check if the element is an object or array
          if (typeof element === 'object') {
            // Recursively validate the nested structure
            validateNestedStructures(element);
          }
        });
      }
    }

    // Validate the parsed JSON
    validateNestedStructures(parsedJson);

    // Return the parsed and validated JSON
    return parsedJson;
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }

    // Handle other errors
    throw error;
  }
}

// Example usage:
const requestBody = `
{
  "name": "John Doe",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345"
  },
  "interests": [
    "reading",
    "hiking",
    "coding"
  ]
}
`;

try {
  const parsedJson = parseJsonRequestBody(requestBody);
  console.log(parsedJson);
} catch (error) {
  console.error(`Error: ${error.message}`);
}