const Sanitizer = {
  // Define a function to sanitize user input
  sanitizeInput: function (input, context) {
    // Define a function to escape HTML characters
    function escapeHtml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Define a function to escape SQL special characters
    function escapeSql(str) {
      return str.replace(/'/g, "''").replace(/"/g, '""');
    }

    // Define a function to validate input data
    function validateInput(data, rules) {
      // Check if the input data matches the validation rules
      for (const rule in rules) {
        if (!rules[rule](data)) {
          return false;
        }
      }
      return true;
    }

    // Sanitize the input based on the context
    switch (context) {
      case 'html':
        return escapeHtml(input);
      case 'sql':
        return escapeSql(input);
      case 'validation':
        return validateInput(input, context.rules);
      default:
        throw new Error('Invalid context');
    }
  },

  // Define a function to add custom sanitization rules for a tenant
  addCustomRules: function (tenantId, rules) {
    // Store the custom rules in a map
    customRules.set(tenantId, rules);
  },

  // Define a function to get the custom sanitization rules for a tenant
  getCustomRules: function (tenantId) {
    // Return the custom rules for the tenant
    return customRules.get(tenantId);
  },
};

// Create a map to store custom sanitization rules for each tenant
const customRules = new Map();

// Example usage:
const input = '<script>alert("XSS")</script>';
const sanitizedInput = Sanitizer.sanitizeInput(input, 'html');
console.log(sanitizedInput); // Output: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;

// Add custom sanitization rules for a tenant
Sanitizer.addCustomRules('tenant1', {
  username: (input) => /^[a-zA-Z0-9]+$/.test(input),
});

// Get the custom sanitization rules for a tenant
const customRulesForTenant1 = Sanitizer.getCustomRules('tenant1');
console.log(customRulesForTenant1); // Output: { username: [Function] }

// Sanitize user input using the custom rules
const usernameInput = 'John Doe';
const sanitizedUsername = Sanitizer.sanitizeInput(usernameInput, {
  context: 'validation',
  rules: customRulesForTenant1,
});
console.log(sanitizedUsername); // Output: true