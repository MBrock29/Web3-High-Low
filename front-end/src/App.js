import { useState, useEffect, useRef } from "react";
import "./App.css";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { randomiser_CONTRACT_ADDRESS, abi } from "./constants/index";
import s from "./styles/app.module.scss";
import Header from "./components/header/Header";

function App() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [betAmount, setBetAmount] = useState("");
  const [randomNumber, setRandomNumber] = useState(20);
  const [walletConnected, setWalletConnected] = useState(false);
  const [resultIn, setResultIn] = useState(false);
  const web3ModalRef = useRef();
  const [account, setAccount] = useState(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      console.log("please change network");
      setWrongNetwork(true);
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      setBalance(0);
      const provider = await getProviderOrSigner(true);
      setWalletConnected(true);
      const address = await provider.getAddress();
      setAccount(address);
      getBalance(address);
      getRandomNumber();
    } catch (err) {
      console.error(err);
    }
  };

  const getBalance = async (id) => {
    try {
      const provider = await getProviderOrSigner();
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      setBalance(
        ethers.utils.formatUnits(await randomiserContract.getBalance(id), 0)
      );
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getRandomNumber = async () => {
    try {
      const provider = await getProviderOrSigner();
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const rand = await randomiserContract.getRandomNumber();
      setRandomNumber(ethers.utils.formatUnits(rand, 0));
    } catch (err) {
      console.error(err);
    }
  };

  const betHigh = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const transaction = await randomiserContract.betHigh(betAmount);
      setLoading(true);
      await transaction.wait();
      setResultIn(true);
      await getRandomNumber();
      await getBalance(account);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  console.log(balance);

  const betLow = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const transaction = await randomiserContract.betLow(betAmount);
      setLoading(true);
      await transaction.wait();
      setResultIn(true);
      await getRandomNumber();
      await getBalance(account);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const deposit = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const transaction = await randomiserContract.deposit({
        value: ethers.utils.parseUnits("0.1", "ether"),
      });
      setLoading(true);
      await transaction.wait();
      await getBalance(account);
    } catch (err) {
      console.error(err);
    }
  };

  const withdraw = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const withdrawAmount = (balance * 1000000000000000).toString();
      const transaction = await randomiserContract.withdraw(withdrawAmount);
      setLoading(true);
      await transaction.wait();
      await getBalance(account);
    } catch (err) {
      console.error(err);
    }
  };

  const betDisabled =
    parseInt(betAmount) > parseInt(balance) || betAmount < 0.01;

  const betInvalid = betAmount === "";

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  const withdrawalAllowed = balance > 0;

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }
  });

  if (loading)
    return (
      <div className={s.spinnerContainer}>
        <div className={s.spinner}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  return (
    <div className={s.app}>
      <Header
        deposit={deposit}
        withdraw={withdraw}
        withdrawalAllowed={withdrawalAllowed}
        address={account}
        balance={balance}
      />
      <div className={s.background}>
        <div className={s.header}>
          <h3>
            Stake an amount and choose whether you think the random number will
            be high or low.
            <br />
            Double your stake if you win!
          </h3>
        </div>
        <div className={s.balanceContainer}></div>
        <div className={s.buttonsContainer}>
          <button className={s.button} onClick={betLow} disabled={betDisabled}>
            Bet 1-50
          </button>
          <button className={s.button} onClick={betHigh} disabled={betDisabled}>
            Bet 51-100
          </button>
          <input
            className={s.input}
            type="number"
            placeholder="Enter bet amount"
            max={balance}
            onChange={(e) => setBetAmount(e.target.value)}
          />
        </div>
        <div>
          {betDisabled && !betInvalid ? <h3>Bet amount invalid</h3> : <h3></h3>}
        </div>
        {resultIn && (
          <div>
            <h1>
              Result is... <br />
              <span style={{ fontSize: 72 }}>{randomNumber}</span>
            </h1>
          </div>
        )}
      </div>
      {wrongNetwork && (
        <div>
          <h1>Network error. Please connect to Rinkeby test network.</h1>
        </div>
      )}
    </div>
  );
}

export default App;
