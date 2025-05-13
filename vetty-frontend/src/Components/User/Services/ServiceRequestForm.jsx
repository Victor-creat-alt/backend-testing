import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createServiceRequest } from '../../../redux/serviceRequestSlice';
import { fetchServices, selectFilteredAndSortedServices } from '../../../redux/servicesSlice';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ErrorMessage from '../../ui/ErrorMessage';
import { addItemToCart } from '../../../redux/cartSlice';
import './ServiceRequestForm.css';

const ServiceRequestForm = ({ service, onClose }) => {
  const dispatch = useDispatch();
  const services = useSelector(selectFilteredAndSortedServices);
  const servicesStatus = useSelector(state => state.services.status);
  const servicesError = useSelector(state => state.services.error);

  const [serviceId, setServiceId] = useState(service ? service.id.toString() : '');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [formError, setFormError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, loading, succeeded, failed
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (servicesStatus === 'idle') {
      dispatch(fetchServices());
    }
  }, [servicesStatus, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitError(null);

    if (!serviceId) {
      setFormError('Please select a service.');
      return;
    }
    if (!appointmentTime) {
      setFormError('Please select an appointment time.');
      return;
    }

    // Ensure appointmentTime includes seconds for ISO conversion
    let appointmentTimeWithSeconds = appointmentTime;
    if (appointmentTime.length === 16) { // "YYYY-MM-DDTHH:mm"
      appointmentTimeWithSeconds = appointmentTime + ':00';
    }

    // Convert appointmentTime (local datetime string) to ISO string with UTC timezone
    const localDate = new Date(appointmentTimeWithSeconds);
    const isoAppointmentTime = localDate.toISOString();

    setSubmitStatus('loading');
    try {
      const resultAction = await dispatch(createServiceRequest({ service_id: parseInt(serviceId), appointment_time: isoAppointmentTime, status: 'pending' }));
      if (createServiceRequest.fulfilled.match(resultAction)) {
        setSubmitStatus('succeeded');
        alert('Service request created successfully.');
        // Add the created service request to cart
        const createdServiceRequest = resultAction.payload;
        dispatch(addItemToCart({ service: createdServiceRequest, quantity: 1 }));
        setServiceId('');
        setAppointmentTime('');
        if (onClose) onClose();
      } else {
        setSubmitStatus('failed');
        const error = resultAction.payload || resultAction.error.message || 'Failed to create service request.';
        setSubmitError(error);
      }
    } catch (err) {
      setSubmitStatus('failed');
      setSubmitError(err.message || 'Failed to create service request.');
    }
  };

  return (
    <div className="service-request-form-container">
      <h2>Book a Service Appointment</h2>
      {servicesStatus === 'loading' && <LoadingSpinner />}
      {servicesError && <ErrorMessage message={servicesError} />}
      <form onSubmit={handleSubmit} className="service-request-form">
        <div className="form-group">
          <label htmlFor="service">Service:</label>
          <select
            id="service"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            required
          >
            <option value="">-- Select a Service --</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} (${service.price.toFixed(2)})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="appointmentTime">Appointment Time:</label>
          <input
            type="datetime-local"
            id="appointmentTime"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            required
            min={new Date().toISOString().slice(0,16)} // prevent past times
          />
        </div>
        {formError && <p className="form-error">{formError}</p>}
        {submitError && <ErrorMessage message={submitError} />}
        <button type="submit" disabled={submitStatus === 'loading'}>
          {submitStatus === 'loading' ? 'Booking...' : 'Book Appointment'}
        </button>
        {onClose && (
          <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        )}
      </form>
    </div>
  );
};

export default ServiceRequestForm;
