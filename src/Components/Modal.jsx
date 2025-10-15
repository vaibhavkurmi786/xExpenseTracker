import React from "react";
import ReactModal from "react-modal";
import "./Moda.css";
import { useSnackbar } from "notistack";

const MultiModal = ({
  modalIsOpen,
  closeModal,
  modalType,
  onAddExpense,
  onUpdateExpense,
  onAddBalance,
  editTransaction,
  balance,
}) => {
  console.log("Modal Type:", modalType); // Debugging line
  console.log("Modal Open State:", modalIsOpen); // Debugging line

  const { enqueueSnackbar } = useSnackbar();


 
  const handleAddBalance = (e) => {
    e.preventDefault();
    const amount = e.target.income.value;
    if (!amount || amount.trim() === '') {
      enqueueSnackbar('Please enter an amount!', { 
        variant: 'error'
      });
      return;
    }
    onAddBalance(amount);
    closeModal();
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const amount = parseFloat(e.target.amount.value);
    const category = e.target.category.value;
    const date = e.target.date.value;

    if (amount > balance) {
      enqueueSnackbar("Expense amount cannot be greater than balance!", {
        variant: "error"
      });
      return;
    }
    const expenseData = {
      title,
      amount,
      date,
      category,
    };

    if (modalType === "edit") {
      onUpdateExpense(expenseData);
    } else {
      onAddExpense(expenseData);
    }

    closeModal();
  };

  return (
    <div>
      <ReactModal
        className={"Modal"}
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
      >
        {modalType === "income" ? (
          <>
            <h1>Add Income</h1>
            <form onSubmit={handleAddBalance}>
              <input type="number" name="income" placeholder="Income Amount" min="1" required />
              <button id="add-income" type="submit">
                Add Balance
              </button>
              <button type="button" onClick={closeModal}>Close</button>
            </form>
          </>
        ) : modalType === "expense" || modalType === "edit" ? (
          <>
            <h1>{modalType === "edit" ? "Edit Expense" : "Add Expense"}</h1>
            <form onSubmit={handleExpenseSubmit}>
              <div>
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  required
                  defaultValue={editTransaction?.title || ""}
                />
                <input
                  type="number"
                  name="amount"
                  placeholder="Price"
                  required
                  defaultValue={editTransaction?.amount || ""}
                />
              </div>
              <div>
                <select
                  name="category"
                  required
                  defaultValue={editTransaction?.category || ""}
                >
                  <option value="">Select Category</option>
                  <option value="Food">Food</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Travel">Travel</option>
                </select>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={editTransaction?.date || ""}
                />
              </div>
              <div>
                <button type="submit" id="add-expense">
                  {modalType === "edit" ? "Update Expense" : "Add Expense"}
                </button>
                <button type="button" onClick={closeModal}>Close</button>
              </div>
            </form>
          </>
        ) : null}
      </ReactModal>
    </div>
  );
};

export default MultiModal;
