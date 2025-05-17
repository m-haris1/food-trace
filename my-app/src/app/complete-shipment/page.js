'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useRouter } from 'next/navigation';

export default function CompleteShipment() {
  const router = useRouter();
  const { contract, account } = useWeb3();
  const [inTransitProducts, setInTransitProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [completeForm, setCompleteForm] = useState({
    deliveryTime: '',
    temperature: '',
    quality: 'Good',
    note: ''
  });

  useEffect(() => {
    fetchInTransitProducts();
  }, [contract]);

  const fetchInTransitProducts = async () => {
    if (!contract) return;

    try {
      const productCount = await contract.methods.productCount().call();
      const products = [];

      for (let i = 1; i <= productCount; i++) {
        const product = await contract.methods.getProduct(i).call();
        const history = await contract.methods.getTrackingHistory(i).call();
        
        // Check if the product is in transit and not completed
        const isInTransit = history.some(h => h.status.startsWith('In Transit'));
        const isCompleted = history.some(h => h.status.startsWith('Delivered'));
        
        if (product.isAvailable && isInTransit && !isCompleted) {
          products.push({
            id: product.id,
            name: product.name,
            description: product.description,
            manufacturer: product.manufacturer,
            currentOwner: product.currentOwner
          });
        }
      }

      setInTransitProducts(products);
    } catch (error) {
      console.error('Error fetching in-transit products:', error);
    }
  };

  const handleCompleteShipment = async (e) => {
    e.preventDefault();
    if (!contract || !account || !selectedProduct) return;

    try {
      // Create a detailed delivery status that includes all information
      const deliveryStatus = `Delivered - Time: ${completeForm.deliveryTime}, Temp: ${completeForm.temperature}°C, Quality: ${completeForm.quality}${completeForm.note ? `, Notes: ${completeForm.note}` : ''}`;

      // Update the status to delivered with all details
      await contract.methods
        .updateStatus(selectedProduct.id, deliveryStatus)
        .send({ from: account });

      // Transfer the product to mark it as delivered (optional)
      if (selectedProduct.manufacturer !== account) {
        await contract.methods
          .transferProduct(selectedProduct.id, selectedProduct.manufacturer)
          .send({ from: account });
      }

      alert('Shipment completed successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error completing shipment:', error);
      alert(`Error completing shipment: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Complete Shipment</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Fill in the delivery details to complete the shipment and update the product status in the blockchain.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {inTransitProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-blue-100 mb-6">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Shipments in Transit</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">There are currently no shipments that need to be completed. Check back later for new shipments.</p>
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleCompleteShipment} className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Select Shipment
                </h2>
                <select
                  className="w-full p-4 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = inTransitProducts.find(p => p.id === e.target.value);
                    setSelectedProduct(product);
                  }}
                  required
                >
                  <option value="">Choose a shipment to complete</option>
                  {inTransitProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Delivery Time
                  </label>
                  <input
                    type="datetime-local"
                    value={completeForm.deliveryTime}
                    onChange={(e) => setCompleteForm({...completeForm, deliveryTime: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={completeForm.temperature}
                    onChange={(e) => setCompleteForm({...completeForm, temperature: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Quality
                  </label>
                  <select
                    value={completeForm.quality}
                    onChange={(e) => setCompleteForm({...completeForm, quality: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Additional Notes
                  </label>
                  <textarea
                    value={completeForm.note}
                    onChange={(e) => setCompleteForm({...completeForm, note: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Enter any additional delivery notes..."
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium shadow-lg hover:shadow-xl"
                >
                  Complete Shipment
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex-1 bg-gray-100 text-gray-800 py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 