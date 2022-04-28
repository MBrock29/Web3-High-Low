import { useState, useEffect, useRef } from "react";
import "./App.css";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { randomiser_CONTRACT_ADDRESS, abi } from "./constants/index";
import s from "./styles/app.module.scss";

function App() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [betAmount, setBetAmount] = useState("");
  const [randomNumber, setRandomNumber] = useState(20);
  const [walletConnected, setWalletConnected] = useState(false);
  const [resultIn, setResultIn] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();
    // const address = await signer.getAddress();
    // setAddress(address);
    // const balance = await signer.getBalance();
    // const balanceInEth = ethers.utils.formatEther(balance);
    // setUserBalance(balanceInEth);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 31337) {
      console.log("please change network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
      getBalance();
      getRandomNumber();
    } catch (err) {
      console.error(err);
    }
  };

  const getBalance = async () => {
    try {
      const provider = await getProviderOrSigner();
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      setBalance(
        ethers.utils.formatUnits(await randomiserContract.getBalance(), 0)
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
      console.log(randomNumber);
      console.log(outcome);
      if (randomNumber < 51) {
        setOutcome(false);
      } else {
        setOutcome(true);
      }
      await getBalance();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

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
      if (randomNumber < 51) {
        setOutcome(true);
      } else {
        setOutcome(false);
      }
      await getBalance();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const resetBalance = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const randomiserContract = new ethers.Contract(
        randomiser_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const transaction = await randomiserContract.resetBalance();
      setLoading(true);
      await transaction.wait();
      await getBalance();
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
        network: "ropsten",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

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
      <div className={s.header}>
        <h1>
          Stake an amount and choose whether you think the random number will be
          high or low.
          <br />
          Double your stake if you win!
        </h1>
      </div>
      <div className={s.balanceContainer}>
        <h1>Balance: {balance}</h1>
        <p className={s.reset} onClick={resetBalance}>
          Reset
        </p>
      </div>
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
          {/* <br />
          <h1>{outcome ? "Congrats, you won!" : "Sorry, you lost"}</h1> */}
        </div>
      )}
    </div>
  );
}

export default App;
