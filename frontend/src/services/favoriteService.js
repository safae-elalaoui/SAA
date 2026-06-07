import api from './api';

const favoriteService = {
  toggleFavorite: async (propertyId) => {
    const response = await api.post('/favorites/toggle', { property_id: propertyId });
    return response.data; // returns { status: 'added' | 'removed', message }
  },

  getFavorites: async () => {
    const response = await api.get('/favorites');
    return response.data;
  }
};

export default favoriteService;
