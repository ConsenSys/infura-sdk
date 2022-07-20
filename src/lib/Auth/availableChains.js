const Chains = {
  mainnet: 1,
  ropsten: 3,
  rinkeby: 4,
  goerli: 5,
  polygon: 137,
};

const chainsName = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli',
  137: 'polygon',
};

const chainUrls = {
  [Chains.mainnet]: 'https://mainnet.infura.io',
  [Chains.ropsten]: 'https://ropsten.infura.io',
  [Chains.rinkeby]: 'https://rinkeby.infura.io',
  [Chains.goerli]: 'https://goerli.infura.io',
  [Chains.polygon]: 'https://polygon-mainnet.infura.io',
};

const availableChains = [
  Chains.mainnet,
  Chains.goerli,
  Chains.ropsten,
  Chains.rinkeby,
  Chains.polygon,
];

const getChainName = chainId => chainsName[chainId];

export { availableChains, Chains, getChainName, chainUrls };
