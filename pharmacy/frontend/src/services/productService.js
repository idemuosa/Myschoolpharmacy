import api from './api';

const productService = {
    getProducts: (config = {}) => api.get('products/', config),
    getProduct: (id) => api.get(`products/${id}/`),
    addProduct: (data) => api.post('products/', data),
    updateProduct: (id, data) => api.put(`products/${id}/`, data),
    deleteProduct: (id) => api.delete(`products/${id}/`)
};

export default productService;
