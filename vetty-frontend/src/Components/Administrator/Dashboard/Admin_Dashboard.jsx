import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import api from '../../api/api'; // Import the shared Axios instance
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const generateColors = (num) => {
  const colors = [];
  const hueStep = Math.floor(360 / num);
  for (let i = 0; i < num; i++) {
    colors.push(`hsl(${i * hueStep}, 70%, 50%)`);
  }
  return colors;
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      // const token = localStorage.getItem('token'); // Token handled by api instance
      const response = await api.get('/admin/users'); // Use Axios instance
      // if (!response.ok) { // Axios throws for non-2xx
      //   throw new Error('Failed to fetch users');
      // }
      // const data = await response.json(); // Axios response.data is already JSON
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch users');
    }
    setLoadingUsers(false);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setError(null);
    try {
      // const token = localStorage.getItem('token'); // Token handled by api instance
      const response = await api.get('/admin/orders'); // Use Axios instance
      // if (!response.ok) {
      //   throw new Error('Failed to fetch orders');
      // }
      // const data = await response.json();
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch orders');
    }
    setLoadingOrders(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchOrders();
  }, []);

  // Map user id to username for label display
  const userIdToName = users.reduce((acc, user) => {
    acc[user.id] = user.username;
    return acc;
  }, {});

  // Count orders per user
  const ordersCountByUser = orders.reduce((acc, order) => {
    acc[order.user_id] = (acc[order.user_id] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for bar chart
  const labels = users.map((user) => user.username);
  const dataValues = users.map((user) => ordersCountByUser[user.id] || 0);
  const colors = generateColors(users.length);

  const data = {
    labels,
    datasets: [
      {
        label: 'Number of Orders',
        data: dataValues,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Users and Their Orders' },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Orders' },
      },
      x: {
        title: { display: true, text: 'Users' },
      },
    },
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {(loadingUsers || loadingOrders) && <p>Loading data...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loadingUsers && !loadingOrders && users.length > 0 && (
        <Bar data={data} options={options} />
      )}
      {!loadingUsers && !loadingOrders && users.length === 0 && <p>No users found.</p>}
    </div>
  );
};

export default AdminDashboard;
