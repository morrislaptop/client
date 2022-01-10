import { address } from '@darkforest_eth/serde';
import { EthAddress } from '@darkforest_eth/types';
import { utils } from 'ethers';
import stringify from 'json-stable-stringify';

/**
 * Represents an account with which the user plays the game.
 * 
 * Score address = contractAddress ?? address
 */
export interface Account {
  address: EthAddress;
  contractAddress?: EthAddress;
  privateKey: string;
}

/**
 * This is the key in local storage in which we keep an array of all the public addresses of the
 * accounts that have been imported/generated into this client.
 */
const ADDRESS_LOCAL_STORAGE_KEY = 'KNOWN_ADDRESSES';

/**
 * In-memory representation of all the accounts in this client.
 */
const accounts: Account[] = load();

/**
 * Store all of the accounts in local storage.
 */
function save() {
  localStorage.setItem(
    ADDRESS_LOCAL_STORAGE_KEY,
    stringify(accounts.map((account) => account.address))
  );

  for (const account of accounts) {
    localStorage.setItem(`skey-${account.address}`, account.privateKey);
  }

  for (const account of accounts) {
    if (account.contractAddress) localStorage.setItem(`caddr-${account.address}`, account.contractAddress);
  }
}

/**
 * Load all of the accounts from local storage.
 */
function load(): Account[] {
  const knownAddresses: EthAddress[] = [];
  const accounts: Account[] = [];

  // first we load the public addresses
  const serializedAddresses = localStorage.getItem(ADDRESS_LOCAL_STORAGE_KEY);
  if (serializedAddresses !== null) {
    const addresses = JSON.parse(serializedAddresses) as string[];
    for (const addressStr of addresses) {
      knownAddresses.push(address(addressStr));
    }
  }

  // then we load the private keys
  for (const addy of knownAddresses) {
    const skey = localStorage.getItem(`skey-${addy}`);
    const caddr = localStorage.getItem(`caddr-${addy}`);

    if (skey !== null) {
      accounts.push({
        address: addy,
        contractAddress: caddr ? address(caddr) : undefined,
        privateKey: skey,
      });
    }
  }

  return accounts;
}

/**
 * Returns the list of accounts that are logged into the game.
 */
export function getAccounts(): Account[] {
  return [...accounts];
}

/**
 * Adds the given account, and saves it to localstorage.
 */
export function addAccount(privateKey: string) {
  accounts.push({
    address: address(utils.computeAddress(privateKey)),
    privateKey,
  });

  save();
}

export function getContractAddressForAccount(addr: string) {
  const account = accounts.find(account => account.address === addr);
  return account?.contractAddress;
}

export function setContractAddressForAccount(addr: string, contractAdress: string) {
  const account = accounts.find(account => account.address === addr);
  
  if (account) {
    account.contractAddress = address(contractAdress);
    save();
  }
}
