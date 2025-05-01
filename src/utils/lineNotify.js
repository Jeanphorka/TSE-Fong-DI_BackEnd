const axios = require('axios');

exports.pushLineMessage = async (uid, message) => {
  await axios.post(
    'https://api.line.me/v2/bot/message/push',
    {
      to: uid,
      messages: [message],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
};
