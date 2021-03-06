import { utils } from 'ethers';
import Auth from '../Auth/Auth.js';
import { HttpService } from '../../services/httpService.js';
import { NFT_API_URL } from '../NFT/constants.js';
import ContractFactory from '../NFT/contractFactory.js';
import { errorLogger, ERROR_LOG } from '../error/handler.js';

export default class SDK {
  /* Private property */
  #auth;

  #apiPath;

  #httpClient;

  constructor(auth) {
    if (!(auth instanceof Auth)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.SDK_constructor,
          message: ERROR_LOG.message.invalid_auth_instance,
        }),
      );
    }
    this.#auth = auth;

    this.#apiPath = `/networks/${this.#auth.getChainId()}`;
    this.#httpClient = new HttpService(NFT_API_URL, this.#auth.getApiAuth());
  }

  /** Get provider
   * @returns {Promise<object>} return the provider
   */
  async getProvider() {
    return this.#auth.getSigner();
  }

  /**
   * Deploy Contract on the blockchain
   * @param {string} template name of the template to use (ERC721Mintable, ...)
   * @param {object} params template parameters (name, symbol, contractURI, ...)
   * @returns {Promise<ERC721Mintable>} Contract instance
   */
  async deploy({ template, params }) {
    if (!template) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.SDK_deploy,
          message: ERROR_LOG.message.no_template_type_supplied,
        }),
      );
    }
    if (Object.keys(params).length === 0) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.SDK_deploy,
          message: ERROR_LOG.message.no_parameters_supplied,
        }),
      );
    }

    const signer = await this.getProvider();
    const contract = ContractFactory.factory(template, signer);

    await contract.deploy(params);
    return contract;
  }

  /**
   * Load a contract from an existing contract address and a template
   * @param {string} template name of the template to use (ERC721Mintable, ...)
   * @param {string} contractAddress address of the contract to load
   * @returns {Promise<ERC721Mintable>} Contract instance
   */
  async loadContract({ template, contractAddress }) {
    if (!template) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.SDK_loadContract,
          message: ERROR_LOG.message.no_template_type_supplied,
        }),
      );
    }

    if (!contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.SDK_loadContract,
          message: ERROR_LOG.message.no_address_supplied,
        }),
      );
    }

    const signer = await this.getProvider();
    const contract = ContractFactory.factory(template, signer);

    await contract.loadContract({ contractAddress });
    return contract;
  }

  /**
   * Get contract metadata by contract address
   * @param {string} contractAddress
   * @returns {Promise<object>} Contract metadata object
   */
  async getContractMetadata({ contractAddress }) {
    if (!contractAddress || !utils.isAddress(contractAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.SDK_getContractMetadata,
          message: ERROR_LOG.message.invalid_contract_address,
        }),
      );
    }

    const apiUrl = `${this.#apiPath}/nfts/${contractAddress}`;
    const {
      data: { symbol, name, tokenType },
    } = await this.#httpClient.get(apiUrl);

    return { symbol, name, tokenType };
  }

  /**
   * Get NFTs by an account address
   * @param  {string} address Account address
   * @param  {string} [includeMetadata=false] flag to include the metadata object in the results
   * @returns {Promise<object>} List of NFTs with metadata if 'includeMetadata' flag is true
   */
  async getNFTs({ publicAddress, includeMetadata = false }) {
    if (!publicAddress || !utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.SDK_getNFTs,
          message: ERROR_LOG.message.invalid_account_address,
        }),
      );
    }

    const apiUrl = `${this.#apiPath}/accounts/${publicAddress}/assets/nfts`;

    const { data } = await this.#httpClient.get(apiUrl);

    if (!includeMetadata) {
      return {
        ...data,
        assets: data.assets.map(asset => {
          const { metadata, ...rest } = asset;
          return rest;
        }),
      };
    }

    return data;
  }

  /** Get list of NFTs for the specified contract address
   * @param {string} contractAddress address of the contract to get the list of NFTs
   * @returns {Promise<object>} List of NFTs with metadata
   */
  async getNFTsForCollection({ contractAddress }) {
    if (!contractAddress || !utils.isAddress(contractAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.SDK_getNFTsForCollection,
          message: ERROR_LOG.message.invalid_contract_address,
        }),
      );
    }
    const apiUrl = `${this.#apiPath}/nfts/${contractAddress}/tokens`;

    const { data } = await this.#httpClient.get(apiUrl);
    return data;
  }

  /** Get a token metadata
   * @param {string} contractAddress address of the contract which holds the token
   * @param {number} tokenId ID of the token
   * @returns {Promise<object>} Token metadata
   */
  async getTokenMetadata({ contractAddress, tokenId }) {
    if (!contractAddress || !utils.isAddress(contractAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.SDK_getTokenMetadata,
          message: ERROR_LOG.message.invalid_contract_address,
        }),
      );
    }

    if (!Number.isFinite(tokenId)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.SDK_getTokenMetadata,
          message: ERROR_LOG.message.no_tokenId_supplied,
        }),
      );
    }

    const apiUrl = `${this.#apiPath}/nfts/${contractAddress}/tokens/${tokenId}`;

    const { data } = await this.#httpClient.get(apiUrl);
    return data;
  }

  /** Get tx status
   * @param {string} txHash hash of the transaction
   * @param {number} tokenId ID of the token
   * @returns {Promise<object>} Transaction information
   */
  async getStatus({ txHash }) {
    if (!utils.isHexString(txHash)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.SDK_getStatus,
          message: ERROR_LOG.message.invalid_transaction_hash,
        }),
      );
    }

    const signer = await this.getProvider();
    return signer.provider.getTransactionReceipt(txHash);
  }
}
