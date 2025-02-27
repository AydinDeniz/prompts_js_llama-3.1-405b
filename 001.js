function jsonToCsv(jsonData) {
  const headers = getHeaders(jsonData);
  const rows = getRows(jsonData, headers);
  return [headers.join(',')].concat(rows.map(row => row.join(','))).join('\n');
}

function getHeaders(jsonData) {
  const headers = [];
  collectHeaders(jsonData, headers, '');
  return headers;
}

function collectHeaders(obj, headers, prefix) {
  Object.keys(obj).forEach(key => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object') {
      collectHeaders(obj[key], headers, newKey);
    } else {
      headers.push(newKey);
    }
  });
}

function getRows(jsonData, headers) {
  return jsonData.map(obj => getRow(obj, headers));
}

function getRow(obj, headers) {
  return headers.map(header => getCellValue(obj, header));
}

function getCellValue(obj, header) {
  const path = header.split('.');
  let value = obj;
  for (const key of path) {
    value = value[key];
    if (value === undefined) return '';
  }
  return value;
}