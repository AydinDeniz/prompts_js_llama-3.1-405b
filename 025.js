// Smart contract code (Solidity)
pragma solidity ^0.8.0;

contract VotingSystem {
  struct Candidate {
    string name;
    uint256 voteCount;
  }

  mapping(address => bool) public voters;
  mapping(string => Candidate) public candidates;

  function addCandidate(string memory _name) public {
    candidates[_name] = Candidate(_name, 0);
  }

  function vote(string memory _candidate) public {
    require(!voters[msg.sender], "You have already voted");
    require(candidates[_candidate].voteCount >= 0, "Candidate does not exist");
    voters[msg.sender] = true;
    candidates[_candidate].voteCount++;
  }

  function getVoteCount(string memory _candidate) public view returns (uint256) {
    return candidates[_candidate].voteCount;
  }
}

// Front-end JavaScript code (React.js)
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import IPFS from 'ipfs-core';

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    async function init() {
      const web3 = new Web3(window.ethereum);
      const contractAddress = '0x...';
      const contractAbi = [...];
      const contract = new web3.eth.Contract(contractAbi, contractAddress);
      setWeb3(web3);
      setContract(contract);
    }
    init();
  }, []);

  async function addCandidate(name) {
    const ipfs = await IPFS.create();
    const file = await ipfs.add(name);
    const hash = file.cid.toString();
    contract.methods.addCandidate(hash).send({ from: web3.eth.accounts[0] });
  }

  async function vote() {
    contract.methods.vote(selectedCandidate).send({ from: web3.eth.accounts[0] });
  }

  async function getVoteCount() {
    const count = await contract.methods.getVoteCount(selectedCandidate).call();
    setVoteCount(count);
  }

  return (
    <div>
      <h1>Blockchain-Based Voting System</h1>
      <input type="text" value={selectedCandidate} onChange={(e) => setSelectedCandidate(e.target.value)} />
      <button onClick={addCandidate}>Add Candidate</button>
      <button onClick={vote}>Vote</button>
      <button onClick={getVoteCount}>Get Vote Count</button>
      <p>Vote Count: {voteCount}</p>
    </div>
  );
}

export default App;

// Back-end JavaScript code (Node.js)
const express = require('express');
const app = express();
const Web3 = require('web3');
const IPFS = require('ipfs-core');

const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/YOUR_PROJECT_ID'));
const contractAddress = '0x...';
const contractAbi = [...];
const contract = new web3.eth.Contract(contractAbi, contractAddress);

app.post('/add-candidate', (req, res) => {
  const name = req.body.name;
  const ipfs = IPFS.create();
  ipfs.add(name).then((file) => {
    const hash = file.cid.toString();
    contract.methods.addCandidate(hash).send({ from: web3.eth.accounts[0] });
    res.send(`Candidate added: ${name}`);
  });
});

app.post('/vote', (req, res) => {
  const candidate = req.body.candidate;
  contract.methods.vote(candidate).send({ from: web3.eth.accounts[0] });
  res.send(`Voted for: ${candidate}`);
});

app.get('/get-vote-count', (req, res) => {
  const candidate = req.query.candidate;
  contract.methods.getVoteCount(candidate).call().then((count) => {
    res.send(`Vote count: ${count}`);
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});