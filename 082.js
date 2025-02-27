function evaluateFormula(formula, variables) {
  try {
    // Use a regular expression to validate the formula and extract variable names
    const variableNames = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);

    // Replace variable names with their corresponding values
    variableNames.forEach((variableName) => {
      if (!variables[variableName]) {
        throw new Error(`Undefined variable: ${variableName}`);
      }

      formula = formula.replace(new RegExp(variableName, 'g'), variables[variableName]);
    });

    // Use the Function constructor to create a new function that evaluates the formula
    const evaluator = new Function(`return ${formula};`);

    // Call the evaluator function to get the result
    const result = evaluator();

    // Check if the result is a number
    if (typeof result !== 'number') {
      throw new Error(`Invalid formula: ${formula}`);
    }

    return result;
  } catch (error) {
    // Handle errors and provide a meaningful error message
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid formula syntax: ${formula}`);
    }

    throw error;
  }
}

// Example usage:
const variables = {
  x: 10,
  y: 20,
};

const formula = '(x + y) * 2';

try {
  const result = evaluateFormula(formula, variables);
  console.log(`Result: ${result}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
}