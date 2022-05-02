import React from "react";
import s from "./Header.module.scss";

function Header({ deposit, withdraw, withdrawalAllowed, balance }) {
  return (
    <div className={s.cashierContainer}>
      <div className={s.balance}>
        <div>
          <p>Balance: {balance}</p>
        </div>
      </div>{" "}
      <button className={s.cashierButton} onClick={deposit}>
        Deposit
      </button>
      <button
        className={s.cashierButton}
        disabled={!withdrawalAllowed}
        onClick={withdraw}
      >
        Withdraw
      </button>
      <p>Deposit costs 0.1 ETH for 100 chips</p>
    </div>
  );
}

export default Header;
