import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && window.ethereum) {
  web3 = new Web3(window.ethereum);
} else {
  // Fallback for server-side rendering
  const provider = new Web3.providers.HttpProvider(
    process.env.NEXT_PUBLIC_ETHEREUM_NETWORK || 'http://localhost:8545'
  );
  web3 = new Web3(provider);
}

export default web3; 