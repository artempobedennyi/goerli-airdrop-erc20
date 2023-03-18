import { useEffect, useState } from "react";
import {
  VStack,
  useDisclosure,
  Button,
  Text,
  HStack,
  Tooltip,
  Box,
  Input, 
  InputGroup, 
  InputRightElement
} from "@chakra-ui/react";
import { CheckIcon, CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import SelectWalletModal from "./components/SelectWalletModal";
import { useWeb3React } from "@web3-react/core";
import { truncateAddress } from "./components/Utils";
import { formatEther } from "@ethersproject/units";
import Web3 from 'web3';
import AirdropComponent from "./components/AirdropComponent";

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAirdropOpen, onOpen: onAirdropOpen, onClose: onAirdropClose } = useDisclosure();
  const {
    library,
    chainId,
    account,
    deactivate,
    active
  } = useWeb3React();

  const [balance, setBalance]= useState(0);
  const [isTokenAddressValid, setIsTokenAddressValid] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");


  useEffect(() => {
    if(active && account) {
      const web3 = new Web3(library);

      web3.eth.getBalance(account).then((result)=>{
        setBalance(parseFloat(Number(formatEther(result))).toFixed(3))
      })
    }
  },);

  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);
    setIsTokenAddressValid(false);    
  };

  const disconnect = () => {
    refreshState();
    deactivate();    
  };

  const updateTokenContract= (e) => {
    if(account) {
      const web3 = new Web3(library);
      if(web3.utils.isAddress(e.target.value)) {
          setIsTokenAddressValid(true); 
          setTokenAddress(e.target.value);
      } else {
          setIsTokenAddressValid(false);
      }
    }
  }

  const tryAirdrop = () => {
    if(isTokenAddressValid) {
      onAirdropOpen();
    }
  }
  
  return (
    <>
      <VStack bg="gray.900" justifyContent="center" alignItems="center" h="100vh" w="100%">     
        <HStack>
          {!active ? (
            <Button size="lg" onClick={onOpen}>Connect Wallet</Button>
          ) : (
            <Button size="lg" onClick={disconnect}>Disconnect Wallet</Button>
          )}
        </HStack> 
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text color="white">{`Connection Status: `}</Text>
            {active ? (
              <CheckCircleIcon color="green" />
            ) : (
              <WarningIcon color="#cd5700" />
            )}
          </HStack>
          { active ? (
            <>
              <Tooltip label={account} placement="right">
                <Text color="white">{`Account: ${truncateAddress(account)}`}</Text>
              </Tooltip>
              <Text color="white">{`Network ID: ${chainId ? chainId : "No Network"}`}</Text>
              <Text color="white">{`Balance: ${balance ? balance : "0"}`} ETH</Text>
              <Box mt="40px !important" width="100%">
                <VStack>
                  <Text color="white">ERC-20 Token Address</Text>
                  <InputGroup>
                      <Input width="500px" size="lg" bg="white" border="1px solid #2B6CB0" type="text" defaultValue="" onChange={updateTokenContract} />
                      {isTokenAddressValid ? (
                          <InputRightElement children={<CheckIcon color='green.500' />} />
                      ) : (
                          <InputRightElement children={<WarningIcon color='red.500' />} />
                      )}
                  </InputGroup>
                </VStack>
              </Box>
              <Box mt="10px !important">
                <Button onClick={tryAirdrop}>Airdrop</Button>
              </Box>
            </>) : (<></>)
          }
          { active && isTokenAddressValid ? <AirdropComponent tokenAddress={tokenAddress} isOpen={isAirdropOpen} closeModal={onAirdropClose} /> : <></> }
        </VStack>
      </VStack>
      <SelectWalletModal isOpen={isOpen} closeModal={onClose} />
    </>
  );
}

export default App;
