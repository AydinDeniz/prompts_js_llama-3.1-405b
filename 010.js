function debounce(wait, fn) {
  let timeout = null;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      fn.apply(context, args);
    }, wait);
  };
}

function throttle(wait, fn) {
  let timeout = null;
  return function() {
    const context = this;
    const args = arguments;
    if (!timeout) {
      timeout = setTimeout(function() {
        timeout = null;
        fn.apply(context, args);
      }, wait);
    }
  };
}

// Example usage:
const debouncedResizeHandler = debounce(500, function() {
  console.log('Debounced resize handler called');
});

const throttledScrollHandler = throttle(200, function() {
  console.log('Throttled scroll handler called');
});

window.addEventListener('resize', debouncedResizeHandler);
window.addEventListener('scroll', throttledScrollHandler);