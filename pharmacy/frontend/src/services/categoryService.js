import api from './api';

const getCategories = () => {
    return api.get('categories/');
};

const addCategory = (data) => {
    return api.post('categories/', data);
};

const updateCategory = (id, data) => {
    return api.put(`categories/${id}/`, data);
};

const deleteCategory = (id) => {
    return api.delete(`categories/${id}/`);
};

export default {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
};
