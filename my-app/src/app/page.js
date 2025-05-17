'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import web3 from '../utils/web3';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { contract, account } = useWeb3();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [shipmentsCount, setShipmentsCount] = useState(0);

  const fetchProducts = async () => {
    if (!contract) return;
    try {
      const productCount = await contract.methods.productCount().call();
      setShipmentsCount(productCount);
      const fetchedProducts = [];

      for (let i = 1; i <= productCount; i++) {
        const product = await contract.methods.getProduct(i).call();
        const trackingHistory = await contract.methods.getTrackingHistory(i).call();
        
        fetchedProducts.push({
          id: product.id,
          name: product.name,
          description: product.description,
          price: web3.utils.fromWei(product.price, 'ether'),
          manufacturer: product.manufacturer,
          currentOwner: product.currentOwner,
          timestamp: new Date(parseInt(product.timestamp) * 1000).toLocaleString(),
          isAvailable: product.isAvailable,
          isVerified: product.isVerified,
          verifiers: product.verifiers,
          trackingHistory: trackingHistory.map(h => ({
            ...h,
            timestamp: new Date(parseInt(h.timestamp) * 1000).toLocaleString()
          }))
        });
      }
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    console.log('Web3 account:', account);
    fetchProducts();
  }, [contract]);

  const createProduct = async (e) => {
    e.preventDefault();
    if (!contract || !account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const priceInWei = web3.utils.toWei(newProduct.price.toString(), 'ether');
      await contract.methods
        .createProduct(newProduct.name, newProduct.description, priceInWei)
        .send({ from: account });
      
      setNewProduct({ name: '', description: '', price: '' });
      setShowCreateForm(false);
      alert('Product created successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      alert(`Error creating product: ${error.message}`);
    }
  };

  const handleCardClick = (action) => {
    switch (action) {
      case 'complete':
        router.push('/complete-shipment');
        break;
      case 'get':
        router.push('/get-shipment');
        break;
      case 'start':
        router.push('/start-shipment');
        break;
      case 'profile':
        router.push('/profile');
        break;
      case 'send':
        setShowCreateForm(true);
        break;
      default:
        break;
    }
  };

  const getStatus = (product, history) => {
    if (!history || history.length === 0) return 'Created';
    
    // Get the latest status from tracking history
    const latestStatus = history[history.length - 1].status;
    
    // If the latest status starts with "Delivered", show it as completed
    if (latestStatus.startsWith('Delivered')) {
      return 'Completed';
    }
    
    // If the latest status starts with "In Transit", show it as in transit
    if (latestStatus.startsWith('In Transit')) {
      return 'In Transit';
    }
    
    // For all other cases, show the latest status
    return latestStatus;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Created':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Supply Chain Management</h1>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Complete Shipment Card */}
          <div 
            className="bg-black text-white p-8 rounded-lg shadow-lg cursor-pointer hover:bg-gray-900 transition-colors"
            onClick={() => handleCardClick('complete')}
          >
            <h2 className="text-2xl font-bold text-center">COMP SHIPMENT</h2>
          </div>

          {/* Get Shipment Card */}
          <div 
            className="bg-black text-white p-8 rounded-lg shadow-lg cursor-pointer hover:bg-gray-900 transition-colors"
            onClick={() => handleCardClick('get')}
          >
            <h2 className="text-2xl font-bold text-center">GET SHIPMENT</h2>
          </div>

          {/* Start Shipment Card */}
          <div 
            className="bg-black text-white p-8 rounded-lg shadow-lg cursor-pointer hover:bg-gray-900 transition-colors"
            onClick={() => handleCardClick('start')}
          >
            <h2 className="text-2xl font-bold text-center">START SHIPMENT</h2>
          </div>

          {/* User Profile Card */}
          <div 
            className="bg-black text-white p-8 rounded-lg shadow-lg cursor-pointer hover:bg-gray-900 transition-colors"
            onClick={() => handleCardClick('profile')}
          >
            <h2 className="text-2xl font-bold text-center">USER PROFILE</h2>
          </div>

          {/* Shipments Count Card */}
          <div className="bg-black text-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center">SHIPMENTS COUNT</h2>
            <p className="text-4xl font-bold text-center mt-4">{shipmentsCount}</p>
          </div>

          {/* Send Shipment Card */}
          <div 
            className="bg-black text-white p-8 rounded-lg shadow-lg cursor-pointer hover:bg-gray-900 transition-colors"
            onClick={() => handleCardClick('send')}
          >
            <h2 className="text-2xl font-bold text-center">SEND SHIPMENT</h2>
          </div>
        </div>

        {/* Create Shipment Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-black mb-6">Create New Shipment</h2>
              <form onSubmit={createProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black">Product Name</label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    placeholder="Enter product description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className=" text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-black block text-sm font-medium ">Price (in ETH)</label>
                  <input
                    color='black'
                    type="number"
                    step="0.000000000000000001"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Shipment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products/Shipments List */}
        {products.length > 0 && (
          <div className="bg-white text-black rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">Recent Shipments</h2>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-800">{product.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Price: {product.price} ETH</p>
                    <p>Status: {getStatus(product, product.trackingHistory)}</p>
                    <p>Created: {product.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}