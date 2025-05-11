import React, { useState, useEffect } from 'react';
import Card from '../../ui/card';
import { Button } from '../../ui/buttons';
import dayjs from 'dayjs';
import './ServiceHistory.css';

const API_BASE_URL = 'http://localhost:5000/admin/service_requests';

const ServiceHistory = () => {
  const [servicesHistory, setServicesHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServiceHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch service history');
      const data = await response.json();
      setServicesHistory(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServiceHistory();
  }, []);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(servicesHistory, null, 2)], {
      type: 'application/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'service-history.json';
    document.body.appendChild(element);
    element.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-bold text-blue-800">Service History</h2>
        <div>
          <Button onClick={handleDownload} size="sm" className="mr-2">
            Download History
          </Button>
          <Button onClick={handlePrint} size="sm">
            Print History
          </Button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4">
        {servicesHistory.map(service => (
          <Card key={service.id} className="shadow-md">
            <div>
              <h3 className="font-semibold text-blue-900">{service.service?.name || service.service_id}</h3>
              <p className="text-sm text-gray-600">Client: {service.user_id}</p>
              <p className="text-sm">Date: {dayjs(service.appointment_time).format('MMM D, YYYY')}</p>
              <p className="text-sm">
                Status: <span className="text-green-600">{service.status}</span>
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceHistory;
