import { useEffect, useState } from "react";
import {
    VStack,
    HStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    Button,
    Text,
    Heading,
    Textarea,
    Box,
    Input, InputGroup, InputRightElement,
    Spinner,
    useDisclosure
} from "@chakra-ui/react";
import { Show, Hide } from '@chakra-ui/react'
import { CheckIcon, WarningIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { Image } from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import { formatEther } from "@ethersproject/units";
import { useAirdropContract, useContract } from "../hooks";
import Web3 from 'web3';
import csv from '../img/csv.png';
import airdrop from '../img/airdrop.png';
import { MdPlayArrow } from "react-icons/md";
import Papa from "papaparse";
import baseTokenAbi from "../abis/baseTokenAbi.json";

export default function AirdropComponent({ tokenAddress, isOpen, closeModal }) {
    const {
        account, library
    } = useWeb3React();

    const { isOpen: isAlertModalOpen, onOpen: onErrorModalOpen, onClose: onAlertModalClose } = useDisclosure();
    
    const baseTokenContract = useContract(tokenAddress, baseTokenAbi, true);
    const airdropContract = useAirdropContract();

    const [isLoading, setIsLoading]= useState(false);
    const [alertMsg, setAlertMsg]= useState("");
    const [alertStatus, setAlertStatus]= useState(false);
    const [ethBalance, setEthBalance]= useState(0);
    const [tokenBalance, setTokenBalance]= useState(0);
    const [addressList, setAddressList] = useState([]);
    const [amountList, setAmountList] = useState([]);
    const [displayList, setDisplayList] = useState("");
    const [airdropTokenCount, setAirdropTokenCount] = useState(0);

    const web3 = new Web3(library);

    if(account) {
        web3.eth.getBalance(account).then((result)=>{
            setEthBalance(parseFloat(Number(formatEther(result))).toFixed(3))
        })
    }

    useEffect(() => {
        const fetchTokenBalance = async () => {
            const tokenBalance = await baseTokenContract.methods
                .balanceOf(account)
                .call();
            
            setTokenBalance(parseFloat(Number(formatEther(tokenBalance))).toFixed(3))
        }

        if(account && baseTokenContract) 
            fetchTokenBalance();        
    }, [isLoading]);

    const parseCSV = (e) => {
        if(e.target.files === undefined || !e.target.files.length)
            return;
        Papa.parse(e.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const addressList = [];
                const amountList = [];
                results.data.map((value, index) => {
                    if(index === 0 && web3.utils.isAddress(Object.keys(value)[0]))  {
                        addressList.push(Object.keys(value)[0]);
                        amountList.push(parseInt(Object.keys(value)[1]));
                    }

                    if(web3.utils.isAddress(Object.values(value)[0])) {
                        addressList.push(Object.values(value)[0]);
                        amountList.push(parseInt(Object.values(value)[1]));
                    }
                });
                
                let strTextarea = "";
                let nTokenSum = 0;
                for(var i=0; i<addressList.length; i++) {
                    strTextarea += addressList[i];
                    strTextarea += " => "
                    strTextarea += amountList[i];
                    strTextarea += "\n";
                    nTokenSum += parseInt(amountList[i]);
                }
                setAddressList(addressList);
                setAmountList(amountList);
                setAirdropTokenCount(nTokenSum);
                setDisplayList(strTextarea);
            },
        }); 
    }

    const clearData = () => {
        setAddressList([]);
        setAirdropTokenCount(0);
        setDisplayList("");
        setIsLoading(false);
        closeModal();
    }

    const handleAirdrop = async () => {
        if(!addressList.length || !amountList.length || !airdropTokenCount)
            return;

        if(addressList.length !== amountList.length)
            return;

        setIsLoading(true);

        const airdropAmount = parseInt(web3.utils.toWei(airdropTokenCount.toString(), "Ether"));

        const allowance = await baseTokenContract.methods
            .allowance(account, process.env.REACT_APP_AIRDROP_CONTRACT_ADDRESS)
            .call({ from: account });

        if(airdropAmount > allowance) {
            setIsLoading(false);
            showAlertModal("Invalid allowance!", false);
            return;
        }

        const weiAmountList = [];
        amountList.forEach((e) => {
            weiAmountList.push(web3.utils.toWei(e.toString(), "Ether"));
        })

        let resultHash = "";

        const transaction = await airdropContract.methods
            .airdrop(tokenAddress, addressList, weiAmountList)
            .send({ from: account }, (error, transactionHash) => {
                if(transactionHash === undefined) {
                    setIsLoading(false);
                    return;
                } else {
                    resultHash = transactionHash;
                }
            });
        
        console.log(transaction);  

        const resultMsg = "Airdrop is completed! Transaction Hash: " + resultHash;
        showAlertModal(resultMsg, true);

        setIsLoading(false);
    }

    const showAlertModal = (msg, flag) => {
        setAlertMsg(msg);
        setAlertStatus(flag);
        onErrorModalOpen();
    }

    return (
        <>
            <Modal closeOnOverlayClick={false} size="xl" isOpen={isOpen} onClose={clearData} isCentered>
                <ModalOverlay bg="black" />
                <ModalContent w="100%">
                <ModalHeader>
                    <HStack w="100%" justifyContent="start">
                        <Image
                            src={airdrop}
                            alt="Airdrop Function Logo"
                            width={25}
                            height={25}
                            borderRadius="3px"
                        />  
                        <Text textStyle="h2">AIRDROP</Text>
                        <Text textStyle="h3" size="sm" color="purple">({ethBalance} ETH)</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton
                    _focus={{
                    boxShadow: "none"
                    }}
                />
                <ModalBody paddingBottom="1.5rem">
                    <VStack>
                        <Box variant="outline" w="100%"> 
                            <HStack w="100%" justifyContent="space">
                                <Text textStyle="h3" size="sm">Token:</Text>
                                <InputGroup>
                                    <Input readOnly border="1px solid #2B6CB0" type="text" value={tokenAddress} />
                                    <InputRightElement children={<CheckIcon color='green.500' />} />
                                </InputGroup>
                            </HStack>
                        </Box> 
                        <Box
                            variant="outline"
                            w="100%"
                        >   
                            <HStack mt={2} w="100%" justifyContent="center">
                                <Text textStyle="h3" size="sm">Current Balance: </Text>
                                <Text textStyle="h3" size="sm" color="purple">{tokenBalance}</Text>
                            </HStack>
                        </Box>
                        <Input
                            border="1px solid #2B6CB0" 
                            p={3}
                            h={50}
                            placeholder="Select csv file"
                            size="md"
                            type="file"
                            accept=".csv"
                            onChange={parseCSV}
                        />                
                        <Box w="100%" border="1px solid #2B6CB0" borderRadius="8px">
                            <Textarea    
                                colorScheme="blue"
                                w="100%" 
                                h="300px"
                                variant="outline" 
                                readOnly 
                                value={displayList}
                                placeholder="Please fill this with address list"
                            />
                        </Box>
                        <Box w="100%" p={2}>   
                            <HStack w="100%" justifyContent="space">
                                <Box variant="outline" w="50%"> 
                                    <HStack w="100%" justifyContent="space">
                                        <Text textStyle="h3" size="sm">Address:</Text>
                                        <Input readOnly type="number" value={addressList.length} />
                                    </HStack>
                                </Box>  
                                <Box variant="outline" w="50%"> 
                                    <HStack w="100%" justifyContent="space">
                                        <Text textStyle="h3" size="sm">Count:</Text>
                                        <Input readOnly type="number" value={airdropTokenCount} />
                                    </HStack>
                                </Box> 
                            </HStack>
                        </Box>
                        <Button
                            colorScheme="pink"
                            variant="solid"
                            w="100%"
                            h={16}
                            border="1px solid gray" borderRadius="8px"
                            onClick={handleAirdrop}
                        >
                            <HStack w="100%" justifyContent="center">
                                { isLoading ? (
                                    <Spinner
                                    thickness='4px'
                                    speed='0.65s'
                                    size='md'
                                  />
                                ) : (<MdPlayArrow size={36} /> ) }
                                <Text>AIRDROP</Text>
                            </HStack>
                        </Button>
                    </VStack>
                </ModalBody>
                </ModalContent>
            </Modal>
            { isLoading ? (
                <Modal isOpen={isLoading} isCentered>
                    <ModalOverlay 
                         bg='blackAlpha.900'
                          />
                    <ModalContent w="100%" bg="none" boxShadow="none">
                        <VStack>
                            <Spinner
                                thickness='4px'
                                speed='1.25s'
                                emptyColor='gray.200'
                                color='blue.500'
                                size='xl'
                            />
                        </VStack>
                    </ModalContent>
                </Modal>
                ) : (<></>) 
            }
            <Modal isOpen={isAlertModalOpen} onClose={onAlertModalClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                <ModalHeader>
                    <HStack>
                        { alertStatus ? (<CheckIcon color='green.500' />) : (<WarningTwoIcon color='red.500' />) }
                        { alertStatus ? (<Text>Success</Text>) : (<Text>Error</Text>) }
                    </HStack></ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                   <VStack>
                        <div style={{lineBreak:"anywhere"}}>{alertMsg}</div> 
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='blue' mr={3} onClick={onAlertModalClose}>
                        Close
                    </Button>
                </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}