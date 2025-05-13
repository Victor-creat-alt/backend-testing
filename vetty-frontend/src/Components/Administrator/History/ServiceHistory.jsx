import React, { useState, useEffect } from 'react';
import Card from '../../ui/card';
import dayjs from 'dayjs';
import api from '../../api/api';
import './ServiceHistory.css';

const ServiceHistory = () => {
  const [serviceHistory, setServiceHistory] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServiceHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/service_requests/');
      setServiceHistory(response.data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const fetchServices = async () => {
    setError(null);
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchServiceHistory();
    fetchServices();
  }, []);

  const getServiceById = (service_id) => {
    return services.find((service) => service.id === service_id);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-blue-800 mb-4">Service History</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4">
        {serviceHistory.map((record) => {
          const service = getServiceById(record.service_id);
          return (
            <Card key={record.id} className="shadow-md">
              <div className="flex items-center gap-4">
                {service && (
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-blue-900">{record.client || record.user_id}</h3>
                  {service && (
                    <>
                      <p className="text-sm text-gray-600">Service: {service.name}</p>
                      <p className="text-sm text-gray-600">Category: {service.category || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Duration: {service.duration || 'N/A'}</p>
                      <p className="text-sm">{service.description}</p>
                    </>
                  )}
                  {!service && <p className="text-sm">Service ID: {record.service_id}</p>}
                  <p className="text-sm">Date & Time: {dayjs(record.appointment_time).format('MMM D, YYYY [at] h:mm A')}</p>
                  <p className="text-sm">
                    Status:{' '}
                    <span
                      className={`font-medium ${
                        record.status === 'completed'
                          ? 'text-green-600'
                          : record.status === 'cancelled'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceHistory;
