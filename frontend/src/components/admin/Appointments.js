import React, { useState, useEffect } from 'react';
import Card from '../../ui/card';
import { Button } from '../../ui/buttons';
import dayjs from 'dayjs';
import './Appointments.css';

const API_BASE_URL = 'http://localhost:5000/service_requests';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleApprove = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/admin/service_requests/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to approve appointment');
      await fetchAppointments();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDecline = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/admin/service_requests/${id}/disapprove`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to decline appointment');
      await fetchAppointments();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-bold text-blue-800">Appointments</h2>
        <div className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          Pending: {appointments.filter((a) => a.status === 'pending').length}
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4">
        {appointments.map((appt) => (
          <Card key={appt.id} className="shadow-md">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{appt.client || appt.user_id}</h3>
                <p className="text-sm text-gray-600">Service: {appt.service?.name || appt.service_id}</p>
                <p className="text-sm">Date & Time: {dayjs(appt.appointment_time).format('MMM D, YYYY [at] h:mm A')}</p>
                <p className="text-sm">
                  Status:{' '}
                  <span
                    className={`font-medium ${
                      appt.status === 'approved'
                        ? 'text-green-600'
                        : appt.status === 'disapproved'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                  </span>
                </p>
              </div>
              {appt.status === 'pending' && (
                <div className="flex flex-col gap-2 justify-center items-end">
                  <Button size="sm" onClick={() => handleApprove(appt.id)}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDecline(appt.id)}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Appointments;
