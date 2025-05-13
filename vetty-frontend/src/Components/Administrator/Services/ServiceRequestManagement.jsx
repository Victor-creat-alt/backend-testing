import React, { useState, useEffect } from 'react';
import Card from '../../ui/card';
import { Button } from '../../ui/buttons';
import './ServiceRequestManagement.css';

const BASE_API_URL = '/api';

const ServiceRequestManagement = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServiceRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_API_URL}/service_requests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch service requests');
      const data = await response.json();
      setServiceRequests(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const updateStatus = async (id, action) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = `${BASE_API_URL}/service_requests/${id}/status`;
      const statusValue = action === 'approve' ? 'approved' : 'disapproved';
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: statusValue }),
      });
      if (!response.ok) throw new Error(`Failed to ${action} service request`);
      await fetchServiceRequests();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-blue-800 mb-4">Service Request Management</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4">
        {serviceRequests.map(request => (
          <Card key={request.id} className="shadow-md">
            <div>
              <h3 className="font-semibold text-blue-900">{request.service?.name || request.service_id}</h3>
              <p className="text-sm text-gray-600">Client: {request.user_id}</p>
              <p className="text-sm">Appointment: {new Date(request.appointment_time).toLocaleString()}</p>
              <p className="text-sm">
                Status: <span className={request.status === 'approved' ? 'text-green-600' : 'text-red-600'}>{request.status}</span>
              </p>
              {request.status !== 'approved' && (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => updateStatus(request.id, 'approve')}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(request.id, 'disapprove')}>Disapprove</Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceRequestManagement;
