import useContract from "./useContract";

import airdropContractAbi from "../abis/airdropContractAbi.json";

const useAirdropContract = () =>
  useContract(process.env.REACT_APP_AIRDROP_CONTRACT_ADDRESS, airdropContractAbi, true);

export default useAirdropContract;
