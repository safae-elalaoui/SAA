import api from './api';

const propertyService = {
  getProperties: async (filters = {}) => {
    // Construct search parameters
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.city) params.append('city', filters.city);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
    if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);
    if (filters.query) params.append('query', filters.query);
    if (filters.sort) params.append('sort', filters.sort);

    const response = await api.get(`/properties?${params.toString()}`);
    return response.data;
  },

  getPropertyDetails: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  createProperty: async (formData) => {
    // Requires multipart/form-data for image uploads
    const response = await api.post('/properties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProperty: async (id, formData) => {
    const response = await api.put(`/properties/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProperty: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  }
};

export default propertyService;
