import React, { useState, useEffect } from 'react';
import Card from '../../ui/card';
import { Button } from '../../ui/buttons';
import dayjs from 'dayjs';
import './PurchaseHistory.css';

const PurchaseHistory = () => {
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPurchaseHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch purchase history');
      const data = await response.json();
      setPurchaseHistory(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPurchaseHistory();
  }, []);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(purchaseHistory, null, 2)], {
      type: 'application/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'purchase-history.json';
    document.body.appendChild(element);
    element.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-bold text-blue-800">Purchase History</h2>
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
        {purchaseHistory.map(purchase => (
          <Card key={purchase.id} className="shadow-md">
            <div>
              <h3 className="font-semibold text-blue-900">{purchase.product?.name || purchase.product_id}</h3>
              <p className="text-sm text-gray-600">Customer: {purchase.user_id}</p>
              <p className="text-sm">Date: {dayjs(purchase.created_at).format('MMM D, YYYY')}</p>
              <p className="text-sm">Amount: {purchase.quantity || purchase.amount}</p>
              <p className="text-sm font-medium">Total: ${purchase.total_price || purchase.total}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PurchaseHistory;
