import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const res = await api.get('/admin/total-users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTotalUsers(res.data.totalUsers);
      } catch (err) {
        console.error('Failed to fetch total users:', err);
      }
    };

    fetchTotalUsers();
  }, [token]);

  return (
    <div className="p-4">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold">Total Registered Users</h2>
        <p className="text-3xl font-bold mt-2">{totalUsers}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
