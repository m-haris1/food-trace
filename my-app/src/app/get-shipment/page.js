'use client';

import { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useRouter } from 'next/navigation';

export default function GetShipment() {
  const router = useRouter();
  const { contract } = useWeb3();
  const [shipmentId, setShipmentId] = useState('');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGetShipment = async (e) => {
    e.preventDefault();
    if (!contract || !shipmentId) return;

    setLoading(true);
    try {
      const product = await contract.methods.getProduct(shipmentId).call();
      const history = await contract.methods.getTrackingHistory(shipmentId).call();

      setShipment({
        ...product,
        history: history.map(h => ({
          ...h,
          timestamp: new Date(parseInt(h.timestamp) * 1000).toLocaleString()
        }))
      });
    } catch (error) {
      console.error('Error fetching shipment:', error);
      alert('Error fetching shipment. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Get Shipment Details</h1>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleGetShipment} className="mb-8">
            <div className="flex space-x-4">
              <input
                type="number"
                value={shipmentId}
                onChange={(e) => setShipmentId(e.target.value)}
                placeholder="Enter Shipment ID"
                className="flex-1 p-2 border rounded-md"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Get Details'}
              </button>
            </div>
          </form>

          {shipment && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold mb-4">Shipment Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">{shipment.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Description</p>
                    <p className="font-medium">{shipment.description}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Manufacturer</p>
                    <p className="font-medium break-all">{shipment.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Current Owner</p>
                    <p className="font-medium break-all">{shipment.currentOwner}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-medium">{shipment.isVerified ? 'Verified' : 'Pending'}</p>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold mb-4">Tracking History</h2>
                <div className="space-y-4">
                  {shipment.history.map((event, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600">Status</p>
                          <p className="font-medium">{event.status}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Time</p>
                          <p className="font-medium">{event.timestamp}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Location</p>
                          <p className="font-medium break-all">{event.location}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Note</p>
                          <p className="font-medium">{event.verificationNote}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 