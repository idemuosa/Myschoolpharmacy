import api from './api';
import { db, addToSyncQueue } from './db';

const getCategories = async () => {
    try {
        const response = await api.get('categories/');
        const categories = response.data.results || response.data;
        if (Array.isArray(categories)) {
            await db.categories.bulkPut(categories);
        }
        return { data: categories };
    } catch (error) {
        console.error("Network failed, fetching categories from local DB", error);
        try {
            const localCategories = await db.categories.toArray();
            return { data: localCategories };
        } catch (dbError) {
            throw dbError;
        }
    }
};

const addCategory = async (data) => {
    try {
        const response = await api.post('categories/', data);
        await db.categories.add(response.data);
        return response;
    } catch (error) {
        console.error("Offline category addition", error);
        const id = await db.categories.add(data);
        await addToSyncQueue('CREATE', 'categories', { ...data, id });
        return { data: { ...data, id }, status: 201 };
    }
};

const updateCategory = async (id, data) => {
    try {
        const response = await api.put(`categories/${id}/`, data);
        await db.categories.put({ ...data, id });
        return response;
    } catch (error) {
        console.error("Offline category update", error);
        await db.categories.put({ ...data, id });
        await addToSyncQueue('UPDATE', 'categories', { ...data, id });
        return { data: { ...data, id }, status: 200 };
    }
};

const deleteCategory = async (id) => {
    try {
        await api.delete(`categories/${id}/`);
        await db.categories.delete(id);
    } catch (error) {
        console.error("Offline category delete", error);
        await addToSyncQueue('DELETE', 'categories', { id });
        await db.categories.delete(id);
    }
    return { status: 204 };
};

export default {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
};
