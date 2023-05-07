import MessageCard from "@/components/MessageCard";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/constants";
import { Biconomy } from "@biconomy/mexa";
import { ethers } from "ethers";
import { useState } from "react";
declare global {
  interface Window {
    ethereum: any;
  }
}

type Visitor = {
  from: string;
  message: string;
};

function index() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentAccount, setCurrentAccount] = useState<string>("");

  const [userMessage, setUserMessage] = useState<string>("");

  const [allVisitors, setAllVisitors] = useState<Visitor[]>([]);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please install an ethereum wallet");
        return;
      }
      const provider = new ethers.providers.Web3Provider(ethereum);
      const address = await provider.send("eth_requestAccounts", []);
      if (address) {
        setCurrentAccount(address[0]);
        setIsConnected(true);
        fetchAllMessages();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllMessages = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      const visitors = await contractInstance.getVisitors();
      console.log(visitors);
      setAllVisitors(visitors);
    } catch (error) {}
  };

  const sendGasLess = async () => {
    try {
      const biconomy = new Biconomy(window.ethereum, {
        apiKey: process.env.NEXT_PUBLIC_BICONOMY_KEY as string,
        debug: true,
        contractAddresses: [CONTRACT_ADDRESS],
      });
      await biconomy.init();
      const provider = biconomy.provider;
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        biconomy.ethersProvider
      );
      const { data } = await contractInstance.populateTransaction.addVisitor(
        userMessage,
        currentAccount
      );
      let txParams = {
        data: data,
        from: currentAccount,
        to: CONTRACT_ADDRESS,
        signatureType: "EIP712_SIGN",
        gasLimit: 5000000,
      };
      provider.send("eth_sendTransaction", [txParams]);
      biconomy.on("transactionHash", (hash) => {
        console.log(hash?.transactionId);
      });
      biconomy.on("txHashGenerated", (data) => {
        console.log(data?.hash);
      });
      biconomy.on("txMined", (data) => {
        console.log(data);
        fetchAllMessages();
      });
    } catch (error) {}
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      {isConnected ? (
        <>
          <p className="font-normal text-base  text-gray-700 dark:text-gray-400">
            Connectcted Account : {currentAccount}
          </p>
          <div className="mb-6 flex flex-row gap-6">
            <input
              id="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Type your message here"
              required
              onChange={(e) => {
                setUserMessage(e.target.value);
              }}
            />
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={sendGasLess}
              disabled={!userMessage}
            >
              Submit
            </button>
          </div>
          {allVisitors &&
            allVisitors.map((itm, index) => {
              return (
                <MessageCard
                  key={index}
                  from={itm.from}
                  message={itm.message}
                />
              );
            })}
        </>
      ) : (
        <button
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default index;
