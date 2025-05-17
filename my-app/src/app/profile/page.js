'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';

export default function Profile() {
  const { account, contract } = useWeb3();
  const [userStats, setUserStats] = useState({
    totalShipments: 0,
    completedShipments: 0,
    pendingShipments: 0
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!contract || !account) return;

      try {
        const productCount = await contract.methods.productCount().call();
        let total = 0;
        let completed = 0;
        let pending = 0;

        for (let i = 1; i <= productCount; i++) {
          const product = await contract.methods.getProduct(i).call();
          if (product.manufacturer === account || product.currentOwner === account) {
            total++;
            if (product.isVerified) {
              completed++;
            } else {
              pending++;
            }
          }
        }

        setUserStats({
          totalShipments: total,
          completedShipments: completed,
          pendingShipments: pending
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchUserStats();
  }, [contract, account]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">User Profile</h1>

        {account ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl text-black font-semibold mb-2">Wallet Address</h2>
              <p className="text-gray-600 break-all">{account}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-black mb-2">Total Shipments</h3>
                <p className="text-4xl font-bold text-blue-600">{userStats.totalShipments}</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-black mb-2">Completed</h3>
                <p className="text-4xl font-bold text-green-600">{userStats.completedShipments}</p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-black mb-2">Pending</h3>
                <p className="text-4xl font-bold text-yellow-600">{userStats.pendingShipments}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xl text-gray-600">Please connect your wallet to view your profile.</p>
          </div>
        )}
      </div>
    </div>
  );
} 