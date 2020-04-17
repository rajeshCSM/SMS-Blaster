const windows1252 = require('windows-1252');
const utf8 = require('utf8');

// eslint-disable-next-line no-control-regex
const isUnicode = text => /[^\u0000-\u00ff]/.test(text);

const convertToUtf8 = (text) => {
  if (text == null) {
    return null;
  }
  const encoded = windows1252.encode(text);
  const decoded = utf8.decode(encoded);
  return decoded;
};

const sendSms = (from, to, text, apiKey, apiSecret, axios) => {
  const url = 'https://rest.nexmo.com/sms/json';
  const sanitizedText = convertToUtf8(text);
  const sanitizedType = isUnicode(sanitizedText) ? 'unicode' : 'text';
  const body = {
    api_key: apiKey,
    api_secret: apiSecret,
    from,
    to,
    text: sanitizedText,
    type: sanitizedType,
  };

  return axios.post(url, body)
    .catch((error) => {
      if (error.response != null && error.response.status === 429) {
          console.log('Too many request (429) detected, put back into queue');
          return sendSms(from, to, text, apiKey, apiSecret, axios);
      } else {
        console.error(error.message);
        console.error(error);
      }
    });
};

module.exports = {
  sendSms,
};