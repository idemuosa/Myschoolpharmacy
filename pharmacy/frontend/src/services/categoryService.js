import axios from 'axios';

const API_URL = 'http://localhost:8000/api/categories/';

const getCategories = () => {
    return axios.get(API_URL);
};

const addCategory = (data) => {
    return axios.post(API_URL, data);
};

const updateCategory = (id, data) => {
    return axios.put(`${API_URL}${id}/`, data);
};

const deleteCategory = (id) => {
    return axios.delete(`${API_URL}${id}/`);
};

export default {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
};
