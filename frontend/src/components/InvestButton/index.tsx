"use client";
import { FaMoneyBill } from "react-icons/fa";
import styles from "./InvestButton.module.scss";

interface InvestButtonProps {
    sm?: boolean;
}

const InvestButton: React.FC<InvestButtonProps> = ({ sm }) => {
  const handleInvest = () => {
    console.log("Investing...");
  };

  return (
    <button
      onClick={handleInvest}
      className={sm ? styles.sm : ""}
    >
      <FaMoneyBill />
    </button>
  );
};

export default InvestButton;
