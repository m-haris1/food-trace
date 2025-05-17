'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChain from '../contracts/SupplyChain.json';

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = SupplyChain.networks[networkId];
          
          if (!deployedNetwork) {
            throw new Error(`Contract not deployed to network ${networkId}`);
          }

          const contractInstance = new web3Instance.eth.Contract(
            SupplyChain.abi,
            deployedNetwork.address
          );

          setWeb3(web3Instance);
          setContract(contractInstance);
          setAccount(accounts[0]);

          // Handle account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
          });

          // Handle network changes
          window.ethereum.on('chainChanged', async () => {
            const newNetworkId = await web3Instance.eth.net.getId();
            const newDeployedNetwork = SupplyChain.networks[newNetworkId];
            
            if (!newDeployedNetwork) {
              throw new Error(`Contract not deployed to network ${newNetworkId}`);
            }

            const newContractInstance = new web3Instance.eth.Contract(
              SupplyChain.abi,
              newDeployedNetwork.address
            );

            setContract(newContractInstance);
          });

        } catch (error) {
          console.error("Error initializing Web3:", error);
          alert(`Error connecting to Web3: ${error.message}`);
        }
      } else {
        alert('Please install MetaMask!');
      }
    };

    initWeb3();

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  return (
    <Web3Context.Provider value={{ web3, contract, account }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
} 