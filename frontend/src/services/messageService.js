import api from './api';

const messageService = {
  sendMessage: async (messageData) => {
    // messageData: { property_id, message, sender_name, sender_email, sender_phone }
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  getInbox: async () => {
    const response = await api.get('/messages/my-inbox');
    return response.data;
  },

  getSentMessages: async () => {
    const response = await api.get('/messages/my-sent');
    return response.data;
  }
};

export default messageService;
