import React, { useState, useEffect } from "react";
import Modal from "react-modal";

const UpdateAmt = ({
  isVisible,
  onCancel,
  entryType,
  operationType,
  entryID,
  handlePageUpdate,
}) => {
  const [DisplayData, setDisplayData] = useState({
    amount: 0,
  });

  const [Data, setData] = useState({
    amount: 0,
  });

  const handleInputChange = (key, value) => {
    setData({ ...Data, [key]: value });
    setDisplayData({ ...DisplayData, [key]: value });
    console.log(Data);
  };

  const setAmountSign = () => {
    if (operationType === "Subtraction")
      setData({
        ...Data,
        amount: Data.amount < 0 ? Data.amount : -Data.amount,
      });
  };

  useEffect(() => {
    setAmountSign();
  }, [DisplayData]);

  const updateAmount = () => {
    onCancel();
    if (DisplayData.amount > 0) {
      setDisplayData({ amount: 0 });
      if (entryType === "Customer") updateCustAmount();
      //entryType === "Supplier"
      else updateSuppAmount();
    }
  };

  const updateCustAmount = () => {
    const { amount } = Data;
    fetch("http://localhost:5050/api/pendingTransactions/updateCustAmt", {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        _id: entryID,
        amount,
      }),
    })
      .then((result) => {
        alert("Transaction successful!");
        handlePageUpdate();
        fetch("http://localhost:5050/api/invoice/add", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            userID: result.body.userID,
            invoiceID: 0,
            customerName: result.body.name,
            phoneNo: result.body.phoneNo,
            customerEmail: result.body.email,
            totalAmount: Data.amount < 0 ? -Data.amount : Data.amount,
            notes:
              Data.amount < 0 ? "Amount received" : "Amount added to credit",
            paymentMode: Data.amount < 0 ? "Paid" : "Credit",
            discount: 0,
            itemList: [],
            createdAt: new Date(),
          }),
        })
          .then((result) => {
            alert("Invoice ADDED");
            console.log(result);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  };

  const updateSuppAmount = () => {
    const { amount } = Data;
    fetch("http://localhost:5050/api/pendingTransactions/updateSuppAmt", {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        _id: entryID,
        amount,
      }),
    })
      .then((result) => {
        alert("Transaction successful!");
        handlePageUpdate();
      })
      .catch((err) => console.log(err));
  };

  return (
    <Modal
      isOpen={isVisible}
      contentLabel="Update Amount Dialog"
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.7)", // Adjust overlay opacity as needed
        },
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          width: "400px", // Adjust modal width as desired
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "5px",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.3)",
        },
      }}
    >
      <h2>Amount:</h2> {/* Heading */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateAmount();
          onCancel();
        }}
      >
        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label htmlFor="amount">Enter Amount (in Rupees):</label>
          <input
            type="number"
            autocomplete="one-time-code"
            value={DisplayData.amount}
            name="amount"
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className="form-control"
            style={{
              width: "90%",
              padding: "5px 10px",
              border: "1px solid #ccc",
              borderRadius: "3px",
            }}
          />
        </div>

        <div
          className="button-group"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "10px 0 5px",
          }}
        >
          <button
            type="submit"
            style={{
              width: "45%",
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              width: "45%",
              backgroundColor: "#eee",
              color: "#333",
              border: "1px solid #ccc",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>

        {/* <button type="submit">
              Submit
            </button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button> */}
      </form>
    </Modal>
  );
};

export default UpdateAmt;
