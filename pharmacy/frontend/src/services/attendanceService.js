import api from './api';

const attendanceService = {
    getAttendance: async (config = {}) => {
        return await api.get('attendance/', config);
    },
    clockIn: async (staffId) => {
        return await api.post('attendance/clock-in/', { staff_id: staffId });
    },
    clockOut: async (staffId) => {
        return await api.post('attendance/clock-out/', { staff_id: staffId });
    }
};

export default attendanceService;
