import React, { useEffect, useState } from "react";
import "./App.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import MultiModal from "./Components/Modal";
import { PiPizza } from "react-icons/pi";
import { IoCarSportOutline } from "react-icons/io5";
import { BiMovie } from "react-icons/bi";
import { RxCrossCircled } from "react-icons/rx";
import { FiEdit2 } from "react-icons/fi";
import { useSnackbar } from "notistack";

const App = () => {
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem("balance");
    return savedBalance ? parseFloat(savedBalance) : 5000;
  });
  const [expense, setExpense] = useState(() => {
    const savedExpense = localStorage.getItem("expenses");
    return savedExpense ? JSON.parse(savedExpense) : [];
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "income" or "expense"
  const [editTransaction, setEditTransaction] = useState(null);

  const { enqueueSnackbar } = useSnackbar();
  const addIncome = () => {
    setModalType("income");
    setModalIsOpen(true);
  };

  const addExpense = () => {
    setModalType("expense");
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    localStorage.setItem("balance", balance);
  }, [balance]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expense));
  }, [expense]);

  const data = {
    labels: ["Food", "Entertainment", "Travel"],

    datasets: [
      {
        label: "Expenses",
        data: [
          expense
            .filter((exp) => exp.category === "Food")
            .reduce((acc, item) => acc + item.amount, 0),
          expense
            .filter((exp) => exp.category === "Entertainment")
            .reduce((acc, item) => acc + item.amount, 0),
          expense
            .filter((exp) => exp.category === "Travel")
            .reduce((acc, item) => acc + item.amount, 0),
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
  );

  const handleAddExpense = (newExpense) => {
    if (newExpense.amount > balance) {
      enqueueSnackbar("Expense amount cannot be greater than balance!", {
        variant: "error",
      });
      return;
    }
    setExpense((prev) => [...prev, newExpense]);

    setBalance((prevBalance) => prevBalance - newExpense.amount);
  };

  const getAllTransactions = () => {
    const transactions = [];
    Object.keys(expense).forEach((category) => {
      expense[category].forEach((item) => {
        transactions.push({
          ...item,
          category,
        });
      });
    });

    // Sort by date (newest first)
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Food":
        return <PiPizza size={24} />;
      case "Travel":
        return <IoCarSportOutline size={24} />;
      case "Entertainment":
        return <BiMovie size={24} />;
      default:
        return null;
    }
  };

  const handleDeleteTransaction = (index) => {
    setExpense((prev) => {
      const amountToRestore = prev[index].amount;
      setBalance((b) => b + amountToRestore);
      return prev.filter((_, idx) => idx !== index);
    });

    enqueueSnackbar("Transaction deleted successfully!", {
      variant: "success",
    });
  };

  const handleEditTransaction = (index) => {
    const transactionToEdit = expense[index];
    setEditTransaction({
      ...transactionToEdit,
      index,
    });
    setModalType("edit");
    setModalIsOpen(true);
  };

  const handleUpdateExpense = (updatedExpense) => {
    const { index } = editTransaction;
    const oldAmount = expense[index].amount;
    const balanceDifference = oldAmount - updatedExpense.amount;
    const newBalance = balance + balanceDifference;

    if (newBalance < 0) {
      enqueueSnackbar("Not enough balance for this update!", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    setExpense((prev) =>
      prev.map((exp, idx) => (idx === index ? updatedExpense : exp))
    );

    setBalance(newBalance);
    setEditTransaction(null);
  };

  const handleAddBalance = (amount) => {
    const newAmount = parseFloat(amount);
    if (isNaN(newAmount) || newAmount <= 0) {
      enqueueSnackbar("Please enter a valid amount!", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }
    setBalance((prevBalance) => prevBalance + newAmount);
    enqueueSnackbar("Balance added successfully!", {
      variant: "success",
      autoHideDuration: 2000,
    });
  };

  return (
    <div className="App">
      <h1>Expense Tracker</h1>

      {modalIsOpen && (
        <MultiModal
          modalIsOpen={modalIsOpen}
          closeModal={closeModal}
          modalType={modalType}
          onAddExpense={handleAddExpense}
          onUpdateExpense={handleUpdateExpense}
          onAddBalance={handleAddBalance}
          editTransaction={editTransaction}
          balance={balance}
        />
      )}
      <div className="top-container">
        <div className="balance">
          <h3>
            Wallet Balance: <span>₹{balance}</span>
          </h3>
          <button onClick={addIncome}>+ Add Income</button>
        </div>
        <div className="expense">
          <h3>
            Expense:{" "}
            <span>
              ₹{expense.reduce((acc, item) => acc + item.amount, 0)}
            </span>
          </h3>
          <button onClick={addExpense}>+ Add Expense</button>
        </div>
        <div className="chart">
          <Pie
            data={data}
            options={{
              plugins: {
                legend: {
                  display: false,
                },
              },
              maintainAspectRatio: false,
              responsive: true,
            }}
            style={{ width: "100%", height: "100%" }}
          />
          <div className="custom-legend">
            {data.labels.map((label, idx) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "4px 0",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    width: 16,
                    height: 16,
                    backgroundColor: data.datasets[0].backgroundColor[idx],
                    border: `2px solid ${data.datasets[0].borderColor[idx]}`,
                    marginRight: 8,
                  }}
                />
                <span style={{ color: "#fff" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bottom-container">
        <div className="transactions">
          <h2>Transactions</h2>
          <ul className="transaction-list">
             {expense.length === 0 ? (
            <li>No transactions!</li>
          ) : (
            expense.map((transaction, index) => (
              <li key={index} className="transaction-item">
                <div className="transaction-info">
                  <div className="transaction-detail">
                    <div className="transaction-category">
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div className="transaction-meta">
                      <h4 className="transaction-title">
                        {transaction.title}
                      </h4>
                      <span className="transaction-date">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="transaction-actions">
                  <p className="transaction-amount">₹{transaction.amount}</p>
                  <button
                    onClick={() => handleDeleteTransaction(index)}
                    className="action-btn delete-btn"
                  >
                    <RxCrossCircled />
                  </button>
                  <button
                    onClick={() => handleEditTransaction(index)}
                    className="action-btn edit-btn"
                  >
                    <FiEdit2 />
                  </button>
                </div>
              </li>
            ))
          )}
          </ul>
        </div>
        <div className="top-expense">
          <h2>Top Expenses</h2>
          <div className="chart-container">
            <Bar
              data={data}
              options={{
                indexAxis: "y",
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      stepSize: 100, // <-- yahan gap set karo
                      display: false, // x-axis ke labels hide karne ke liye
                    },
                  },
                  y: { grid: { display: false } },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                layout: { padding: 10 },
              }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
