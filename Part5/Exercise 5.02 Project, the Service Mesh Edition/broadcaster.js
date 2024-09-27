const { connect } = require('nats');
const axios = require('axios');

const natsUrl = process.env.NATS_URL || 'nats://my-nats.default.svc.cluster.local:4222';
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL; // Webhook URL

(async () => {
  try {
    // Connect to NATS
    const natsClient = await connect({ servers: [natsUrl] });
    console.log('Connected to NATS');

    // Subscribe to NATS
    natsClient.subscribe('todo.status.updated', async (msg) => {
    try {
      const data = JSON.parse(msg.data.toString());
      console.log(`Received message from NATS: ${JSON.stringify(data)}`);
      const content = `Todo ${data.done ? 'completed' : 'not completed'}: ID ${data.id}`;

      // Send message to Discord via webhook
      await axios.post(discordWebhookUrl, {
        content: content
      });
      console.log('Message sent to Discord channel');
    } catch (err) {
      console.error('Error sending message to Discord:', err.message);
    }
  });
    console.log('Broadcaster service is running');
  } catch (err) {
    console.error('Error:', err.message);
  }
})();

