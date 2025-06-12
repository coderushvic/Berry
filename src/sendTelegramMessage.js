// sendTelegramMessage.js
export const sendTelegramMessage = async (chatId, message) => {
    const botToken = process.env.BOT_TOKEN; // Make sure to set your bot token in environment variables
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
  
    const data = await response.json();
    if (!data.ok) {
      console.error(`Error sending message to ${chatId}:`, data.description);
    }
  };  