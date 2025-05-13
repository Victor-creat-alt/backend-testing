import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../api/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PurchaseHistory = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.message);
    }
    setLoadingUsers(false);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setError(null);
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (err) {
      setError(err.message);
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

  // Sum total_price per user
  const totalPaidByUser = orders.reduce((acc, order) => {
    acc[order.user_id] = (acc[order.user_id] || 0) + order.total_price;
    return acc;
  }, {});

  // Prepare data for line chart
  const labels = users.map((user) => user.username);
  const dataValues = users.map((user) => totalPaidByUser[user.id] || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Total Amount Paid',
        data: dataValues,
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.6)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Total Amount Paid by Users' },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Amount Paid' },
      },
      x: {
        title: { display: true, text: 'Usernames' },
      },
    },
  };

  return (
    <div style={{ width: '80%', margin: 'auto', paddingTop: '20px' }}>
      {loadingUsers || loadingOrders ? (
        <p>Loading data...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <Line data={data} options={options} />
      )}
    </div>
  );
};

export default PurchaseHistory;
