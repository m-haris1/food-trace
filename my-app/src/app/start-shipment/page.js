'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useRouter } from 'next/navigation';

export default function StartShipment() {
  const router = useRouter();
  const { contract, account } = useWeb3();
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [startForm, setStartForm] = useState({
    recipient: '',
    pickupTime: '',
    distance: '',
    price: ''
  });

  useEffect(() => {
    fetchAvailableProducts();
  }, [contract]);

  const fetchAvailableProducts = async () => {
    if (!contract) return;

    try {
      const productCount = await contract.methods.productCount().call();
      const products = [];

      for (let i = 1; i <= productCount; i++) {
        const product = await contract.methods.getProduct(i).call();
        if (product.isAvailable && !product.isVerified) {
          products.push({
            id: product.id,
            name: product.name,
            description: product.description,
            manufacturer: product.manufacturer
          });
        }
      }

      setAvailableProducts(products);
    } catch (error) {
      console.error('Error fetching available products:', error);
    }
  };

  const handleStartShipment = async (e) => {
    e.preventDefault();
    if (!contract || !account || !selectedProduct) return;

    try {
      const status = `In Transit - To: ${startForm.recipient}, ETA: ${startForm.pickupTime}, Distance: ${startForm.distance}km, Price: ${startForm.price} ETH`;

      await contract.methods
        .updateStatus(selectedProduct.id, status)
        .send({ from: account });

      alert('Shipment started successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error starting shipment:', error);
      alert(`Error starting shipment: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Start Shipment</h1>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {availableProducts.length === 0 ? (
            <p className="text-center text-gray-600">No available products to ship.</p>
          ) : (
            <form onSubmit={handleStartShipment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                <select
                  className="w-full p-2 border rounded-md text-black"
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = availableProducts.find((p) => p.id === e.target.value);
                    setSelectedProduct(product);
                  }}
                  required
                >
                  <option value="">Select a product</option>
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={startForm.recipient}
                  onChange={(e) => setStartForm({...startForm, recipient: e.target.value})}
                  className="w-full p-2 border rounded-md text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
                <input
                  type="datetime-local"
                  value={startForm.pickupTime}
                  onChange={(e) => setStartForm({...startForm, pickupTime: e.target.value})}
                  className="w-full p-2 border rounded-md text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km)</label>
                <input
                  type="number"
                  value={startForm.distance}
                  onChange={(e) => setStartForm({...startForm, distance: e.target.value})}
                  className="w-full p-2 border rounded-md text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (ETH)</label>
                <input
                  type="number"
                  step="0.000000000000000001"
                  value={startForm.price}
                  onChange={(e) => setStartForm({...startForm, price: e.target.value})}
                  className="w-full p-2 border rounded-md text-black"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Start Shipment
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
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