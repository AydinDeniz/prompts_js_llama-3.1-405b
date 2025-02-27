function deepMerge(target, source) {
  if (Array.isArray(target) && Array.isArray(source)) {
    const mergedArray = [...target];

    source.forEach((element, index) => {
      if (typeof element === 'object' && element !== null) {
        if (index < mergedArray.length && typeof mergedArray[index] === 'object' && mergedArray[index] !== null) {
          mergedArray[index] = deepMerge(mergedArray[index], element);
        } else {
          mergedArray.push(element);
        }
      } else {
        if (index < mergedArray.length) {
          mergedArray[index] = element;
        } else {
          mergedArray.push(element);
        }
      }
    });

    return mergedArray;
  }

  if (typeof target !== 'object' || typeof source !== 'object' || target === null || source === null) {
    return source;
  }

  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        if (typeof source[key] === 'object' && source[key] !== null) {
          result[key] = deepMerge(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}