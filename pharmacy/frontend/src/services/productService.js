import api from './api';
import { db, addToSyncQueue } from './db';

const productService = {
    getProducts: async (config = {}) => {
        try {
            const response = await api.get('products/', config);
            const items = response.data.results || response.data;
            if (Array.isArray(items)) {
                await db.products.bulkPut(items);
            }
            return { data: items };
        } catch (error) {
            console.error("Network failed, fetching products from local DB", error);
            try {
                const localItems = await db.products.toArray();
                return { data: localItems };
            } catch (dbError) {
                console.error("Local DB fetch failed:", dbError);
                throw dbError;
            }
        }
    },

    getProduct: async (id) => {
        try {
            return await api.get(`products/${id}/`);
        } catch (error) {
            console.error("Network failed", error);
            const item = await db.products.get(id);
            return { data: item };
        }
    },

    addProduct: async (data) => {
        try {
            const response = await api.post('products/', data);
            await db.products.add(response.data);
            return response;
        } catch (error) {
            console.error("Online product addition failed, fallback to offline", error);
            const id = await db.products.add(data);
            await addToSyncQueue('CREATE', 'products', { ...data, id });
            return { data: { ...data, id }, status: 201 };
        }
    },

    updateProduct: async (id, data) => {
        try {
            const response = await api.put(`products/${id}/`, data);
            await db.products.put({ ...data, id });
            return response;
        } catch (error) {
            console.error("Online product update failed", error);
            await db.products.put({ ...data, id });
            await addToSyncQueue('UPDATE', 'products', { ...data, id });
            return { data: { ...data, id }, status: 200 };
        }
    },

    deleteProduct: async (id) => {
        try {
            await api.delete(`products/${id}/`);
            await db.products.delete(id);
        } catch (error) {
            console.error("Online delete failed, queueing", error);
            await addToSyncQueue('DELETE', 'products', { id });
            await db.products.delete(id);
        }
        return { status: 204 };
    }
};

export default productService;
