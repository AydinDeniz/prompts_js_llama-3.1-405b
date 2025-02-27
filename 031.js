// Smart contract code (Solidity)
pragma solidity ^0.8.0;

contract IdentityManager {
  struct Identity {
    address owner;
    string did;
    string[] credentials;
  }

  mapping(address => Identity) public identities;

  function createIdentity(string memory _did, string[] memory _credentials) public {
    Identity memory identity;
    identity.owner = msg.sender;
    identity.did = _did;
    identity.credentials = _credentials;
    identities[msg.sender] = identity;
  }

  function verifyIdentity(address _owner, string memory _did) public view returns (bool) {
    Identity memory identity = identities[_owner];
    return identity.did == _did;
  }

  function addCredential(address _owner, string memory _credential) public {
    Identity memory identity = identities[_owner];
    identity.credentials.push(_credential);
    identities[_owner] = identity;
  }

  function removeCredential(address _owner, string memory _credential) public {
    Identity memory identity = identities[_owner];
    for (uint256 i = 0; i < identity.credentials.length; i++) {
      if (keccak256(bytes(identity.credentials[i])) == keccak256(bytes(_credential))) {
        identity.credentials[i] = identity.credentials[identity.credentials.length - 1];
        identity.credentials.pop();
        break;
      }
    }
    identities[_owner] = identity;
  }
}

// Front-end JavaScript code (React.js)
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { IdentityManager } from './IdentityManager.json';

function App() {
  const [account, setAccount] = useState('');
  const [did, setDid] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    async function init() {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      const contractAddress = '0x...';
      const contractAbi = IdentityManager.abi;
      const contract = new web3.eth.Contract(contractAbi, contractAddress);
      setContract(contract);
    }
    init();
  }, []);

  async function createIdentity() {
    await contract.methods.createIdentity(did, credentials).send({ from: account });
  }

  async function verifyIdentity() {
    const result = await contract.methods.verifyIdentity(account, did).call();
    console.log(result);
  }

  async function addCredential() {
    const credential = document.getElementById('credential').value;
    await contract.methods.addCredential(account, credential).send({ from: account });
  }

  async function removeCredential() {
    const credential = document.getElementById('credential').value;
    await contract.methods.removeCredential(account, credential).send({ from: account });
  }

  return (
    <div>
      <h1>Decentralized Identity Management System</h1>
      <input type="text" value={did} onChange={(e) => setDid(e.target.value)} placeholder="DID" />
      <input type="text" value={credentials} onChange={(e) => setCredentials(e.target.value.split(','))} placeholder="Credentials" />
      <button onClick={createIdentity}>Create Identity</button>
      <button onClick={verifyIdentity}>Verify Identity</button>
      <input type="text" id="credential" placeholder="Credential" />
      <button onClick={addCredential}>Add Credential</button>
      <button onClick={removeCredential}>Remove Credential</button>
    </div>
  );
}

export default App;

// DID generation code
function generateDid() {
  const did = `did:example:${Math.random().toString(36).substr(2, 9)}`;
  return did;
}

// Verifiable credential generation code
function generateVerifiableCredential(did, credential) {
  const vc = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    issuer: did,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: did,
      [credential]: true,
    },
  };
  return vc;
}