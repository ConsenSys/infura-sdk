import { ethers } from 'ethers';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);

const smartContractArtifact = JSON.parse(
  fs.readFileSync(path.join(dirname(filename), 'ERC721.json')),
);

export default class ERC721Mintable {
  contractAddress;

  #contractDeployed;

  #signer;

  constructor(signer) {
    this.#signer = signer;
  }

  async deploy(params) {
    if (this.contractAddress || this.#contractDeployed) {
      throw new Error('[ERC721Mintable.deploy] The contract has already been deployed!');
    }

    if (!this.#signer) {
      throw new Error(
        '[ERC721Mintable.deploy] Signer instance is required to interact with contract.',
      );
    }

    if (!params.name) {
      throw new Error('[ERC721Mintable.deploy] Name cannot be empty');
    }

    if (params.symbol === undefined) {
      throw new Error('[ERC721Mintable.deploy] symbol cannot be undefined');
    }

    if (params.contractURI === undefined) {
      throw new Error('[ERC721Mintable.deploy] contractURI cannot be undefined');
    }

    try {
      const factory = new ethers.ContractFactory(
        smartContractArtifact.abi,
        smartContractArtifact.bytecode,
        this.#signer,
      );

      // TODO remove rest parameter for destructuring (more secure)
      const contract = await factory.deploy(...Object.values(params));

      this.#contractDeployed = await contract.deployed();

      this.contractAddress = contract.address;
    } catch (error) {
      throw new Error(`[ERC721Mintable.deploy] An error occured: ${error}`);
    }
  }

  async mint(publicAddress, tokenURI) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721Mintable.mint] A contract should be deployed or loaded first');
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error('[ERC721Mintable.mint] A valid address is required to mint.');
    }

    if (!tokenURI) {
      throw new Error('[ERC721Mintable.mint] A tokenURI is required to mint.');
    }
    try {
      return await this.#contractDeployed.mintWithTokenURI(publicAddress, tokenURI);
    } catch (error) {
      throw new Error(`[ERC721Mintable.mint] An error occured: ${error}`);
    }
  }

  async loadContract(contractAddress) {
    if (this.contractAddress || this.#contractDeployed) {
      throw new Error('[ERC721Mintable.loadContract] The contract has already been loaded!');
    }

    if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
      throw new Error(
        '[ERC721Mintable.loadContract] A valid contract address is required to load a contract.',
      );
    }

    try {
      this.#contractDeployed = new ethers.Contract(
        contractAddress,
        smartContractArtifact.abi,
        this.#signer,
      );

      this.contractAddress = contractAddress;
    } catch (error) {
      throw new Error(`[ERC721Mintable.loadContract] An error occured: ${error}`);
    }
  }
}
