import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../../ui/card';
import { Button } from '../../ui/buttons';
import './OrdersManagement.css';
import { fetchOrders, approveOrder, disapproveOrder } from '../../redux/orderSlice';

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleApprove = (id) => {
    dispatch(approveOrder(id));
  };

  const handleDisapprove = (id) => {
    dispatch(disapproveOrder(id));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-blue-800 mb-4">Order Management</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="shadow-md">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Order #{order.id}</h3>
                <p className="text-sm text-gray-600">Customer: {order.user_id}</p>
                <p className="text-sm">Total: ${order.total_price}</p>
                <p className="text-sm">
                  Status:{' '}
                  <span className={order.status === 'approved' ? 'text-green-600' : 'text-red-600'}>
                    {order.status}
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-2 justify-center items-end">
                {order.status !== 'approved' && (
                  <>
                    <Button size="sm" onClick={() => handleApprove(order.id)}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDisapprove(order.id)}>Disapprove</Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;
