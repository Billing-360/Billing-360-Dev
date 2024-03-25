import React, {useEffect, useState, useContext} from 'react';
import './AddInvoice.css';
import axios from 'axios';
import {initialState} from './initialState';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchableDropdown from './SearchableDropdown';
import ReactLoading from "react-loading";
import AuthContext from '../../AuthContext';

const AddNewInvoice = () => {
  const [invoiceData, setInvoiceData] = useState(initialState);
  const [incInvoiceID, setIncInvoiceID] = useState(false);
  const [totalChange, setTotalChange] = useState(false);
  const [items, setAllItems] = useState([]);
  const [currItem, setCurrItem] = useState();
  const [updatePage, setUpdatePage] = useState(true);
  const [isPaid, setIsPaid] = useState(true);
  const [availableQuantity, setAvailableQuantity] = useState(1000000000000000);
  const [showLoading, setShowLoading] = useState(false); 
  const authContext = useContext(AuthContext);
  const [userData, setUserData] = useState({firstname: '', lastname: '', email: '', password: '', gstno: '', shopname: '', shopaddress: ''}); 
  const [optionList, setOptionList] = useState([]);


  
  const handleItemSelection = (selectedItem) => {
    setAvailableQuantity(selectedItem.quantity);
    const filteredOptions = items.filter(
      (item) => !invoiceData.itemList.some((selectedItem) => selectedItem._id === item._id)
    );
    setOptionList(filteredOptions);
  };
  useEffect(() => {
    const filteredOptions = items.filter(
      (item) => !invoiceData.itemList.some((selectedItem) => selectedItem._id === item._id)
    );
    setOptionList(filteredOptions);
  }, [items, invoiceData]);

  const handleInputChange = async(event, index, fieldName) => {
    const { value } = event.target;
    if(value != null){
      const updatedItemList = [...invoiceData.itemList];
      if(fieldName==='itemName'){
        updatedItemList[index].itemName = value['itemName'];
        updatedItemList[index].costPrice = value['costPrice'];
        updatedItemList[index].rate=value['salePrice'];
        updatedItemList[index].gst=value['itemGST'];
        updatedItemList[index]._id=value['_id'];
        handleItemSelection(value);
        // console.log((updatedItemList[index].quantity));
        let quantity = (isNaN(updatedItemList[index].quantity) || updatedItemList[index].quantity)?parseFloat(updatedItemList[index].quantity):0;
        if(quantity > value['quantity']) {
          alert("Quantity entered exceeds available stock !");
          updatedItemList[index].quantity = 0;
          quantity = 0;
        };
        const rate = parseFloat(updatedItemList[index].rate.toFixed(2));
        const gst = parseFloat(updatedItemList[index].gst.toFixed(2));
        const amount = (quantity * rate) + ((quantity * rate) * gst) / 100;
        updatedItemList[index].amount = parseFloat(amount.toFixed(2));
        // setTotalChange(true);
      }
      if (fieldName === 'quantity') { 
        let quantity = (value === '') ? 0 : value;
        if(quantity > availableQuantity) {
          alert("Quantity entered exceeds available stock !");
          updatedItemList[index].quantity = 0;
          quantity = 0;
        };
        quantity = quantity <= 0 ? '' : quantity;
        const rate = parseFloat(updatedItemList[index].rate.toFixed(2));
        const gst = parseFloat(updatedItemList[index].gst.toFixed(2));
        const amount = (quantity * rate) + ((quantity * rate) * gst) / 100;
        updatedItemList[index].amount = isNaN(amount) ? 0 : parseFloat(amount.toFixed(2));
        updatedItemList[index].quantity = quantity;
      }
      setInvoiceData({
        ...invoiceData,
        userID: authContext.user,
        itemList: updatedItemList,
        // discount: 0,
      });
    }
    setTotalChange(true);
  };

  const handleInputChangeCust = async(event, fieldName) => {
    const { value } = event.target;
    if(fieldName === 'discount'){
      let discount = (value === '') ? 0 : value;
      discount = discount <= 0 ? '' : discount;
      discount = discount >=100 ? 100 : discount;
      setInvoiceData((prevData) => {
        const updatedItemList = [...prevData.itemList];
        const arr = updatedItemList;
        var subTotal = 0;
        for(var i=0; i<arr.length; i++){
          subTotal = subTotal + parseFloat(arr[i].amount.toFixed(2));
        }
        var total = 0;
        const temp = parseFloat((subTotal - (subTotal*prevData.discount)/100).toFixed(2));
        // total = (isNaN(temp)) ? 0 : parseFloat(temp.toFixed(2));
        total = temp.toFixed(2);
        return {
          ...prevData,
          itemList: updatedItemList,
          totalAmount: total,
          discount: discount,
          // invoiceID: invoiceData.invoiceID,
          // discount: invoiceData.discount
        };
        // ...prevData,
        // [fieldName] : discount,
        // [fieldName] : isNaN(value) ? 0 : value,
      });
    } else {
      setInvoiceData((prevData) => ({
        ...prevData,
        [fieldName] : value,
      }));
    }
    
    setTotalChange(true);
  };
  const calculateTotal = () => {
    const arr = invoiceData.itemList;
    var subTotal = 0;
    for(var i=0; i<arr.length; i++){
      subTotal = subTotal + parseFloat(arr[i].amount.toFixed(2));
    }
    const temp = parseFloat((subTotal - (subTotal*invoiceData.discount)/100).toFixed(2));
    invoiceData.totalAmount = (isNaN(temp)) ? 0 : parseFloat(temp.toFixed(2));
  }
  setInterval(()=>{calculateTotal()}, 50);

  useEffect(()=>{
    const arr = invoiceData.itemList;
    var subTotal = 0;
    for(var i=0; i<arr.length; i++){
      subTotal = subTotal + parseFloat(arr[i].amount.toFixed(2));
    }
    const temp = parseFloat((subTotal - (subTotal*invoiceData.discount)/100));
    // console.log(subTotal);
    // invoiceData.totalAmount = (isNaN(temp)) ? 0 : parseFloat(temp.toFixed(2));
    invoiceData.totalAmount = temp.toFixed(2);
    setTotalChange(false);
  }, [totalChange]);

  const handleAddField = (e) => {
    e.preventDefault()
    setInvoiceData((prevState) => ({...prevState,userID:authContext.user, itemList: [...prevState.itemList,  {itemName: '', quantity:0, costPrice:0, rate:0, gst:0, amount:0}]}))
    
  }

  const handleDeleteRow = (index) => {
    console.log(invoiceData.discount);
    setInvoiceData((prevData) => {
      const updatedItemList = [...prevData.itemList];
      updatedItemList.splice(index, 1);

      // setTotalChange(true);
      // calculateTotal();
      const arr = updatedItemList;
      var subTotal = 0;
      for(var i=0; i<arr.length; i++){
        subTotal = subTotal + parseFloat(arr[i].amount.toFixed(2));
      }
      var total = 0;
      const temp = parseFloat((subTotal - (subTotal*prevData.discount)/100).toFixed(2));
      // total = (isNaN(temp)) ? 0 : parseFloat(temp.toFixed(2));
      total = temp.toFixed(2);
      return {
        itemList: updatedItemList,
        totalAmount: total,
        discount: invoiceData.discount
        
      };
    });
  };

  const handleGenerateBill = async () => {
    try {
      setShowLoading(true);

      await addInvoice();
      await updateInventory();
      // await downloadPdf();
    } catch (error) {
      console.error('Error generating bill:', error);
    } finally {
      setShowLoading(false);
      // window.location.reload(); 
    }
  };
  
  const addInvoice = () => {
    getUserData()
    .then(() => {
      // Logic for PDF creation
      const requestData = {
        invoiceData: invoiceData,
        userData: userData
      };
        return requestData;
    })
    .then((requestData)=>{
      console.log("requestdata: ", requestData);
      fetch("https://billing-360-dev.onrender.com/api/invoice/sendmail", {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ requestData }),
      })
    })
    .then((result) => {
      fetch("https://billing-360-dev.onrender.com/api/invoice/add", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      })
        .then((result) => {
          alert("Invoice ADDED");
          setInvoiceData(initialState);
          setCurrItem(null);
        })
        .then(() => {
          setIncInvoiceID(true);
          window.location.reload(); 
        })
        .catch((err) => console.log(err));

        setUpdatePage(false);
    })}
    

    const getUserData = () => {
      return new Promise((resolve, reject) => {
        console.log(authContext.user);
        fetch(`https://billing-360-dev.onrender.com/api/user/get/${authContext.user}`, {
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        })
       
        .then(response => {
          console.log(response);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // console.log(data);
          // setUserData(data);
          userData.firstname = data.firstname;
          userData.lastname = data.lastname;
          userData.email = data.email;
          userData.password = data.password;
          userData.gstno = data.gstno;
          userData.shopname = data.shopname;
          userData.shopaddress = data.shopaddress;
          resolve(data); // Resolve the promise with the user data
        })
        .catch(error => {
          console.log('There was a problem with the fetch operation:', error);
          reject(error); // Reject the promise with the error
        });
      });
    }
    
    const generatePdf = () =>{
      setShowLoading(true);
      getUserData()
        .then(() => {
          // Logic for PDF creation
          const requestData = {
            invoiceData: invoiceData,
            userData: userData
          };
          return axios.post('https://billing-360-dev.onrender.com/api/generate-pdf', requestData, { responseType: 'blob'});
        })
        // .then(() => axios.get('https://billing-360-dev.onrender.com/api/fetch-pdf', ))
        .then((res) => {
          const pdfBlob = new Blob([res.data], { type: 'application/pdf' });
          setShowLoading(false);
          const pdfUrl = URL.createObjectURL(pdfBlob);
          window.open(pdfUrl,'_blank');
        })
        .catch((error) => {
          setShowLoading(false); // Hide loading in case of error
          console.error('Error creating PDF:', error);
        });
      }

    const updateInventory = () => {
      fetch("https://billing-360-dev.onrender.com/api/inventory/updateItemQuantity",{
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(invoiceData.itemList),
      })
      .then(() => {
        setUpdatePage(false);
        // window.location.reload(); // Reload the webpage
      })

    }

    const getInvoiceCount = async() =>{
      fetch(`https://billing-360-dev.onrender.com/api/invoice/count/${authContext.user}`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      })
        .then(response => {
          if(!response.ok){
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // console.log(data.count);
          setInvoiceData({...invoiceData, invoiceID: data.count})
        })
        .catch(error => {
          console.log('There was a problem with the fetch operation:', error);
        })
    }
    useEffect(() => {
      // if(incInvoiceID){
        getInvoiceCount(invoiceData.userID)
        .then(() => setIncInvoiceID(false))
      // }
      
    },[incInvoiceID, invoiceData.userID]);

    useEffect(() => {
      fetchItemsData();
      // fetchSalesData();
      setInvoiceData(initialState);
    }, [updatePage]);
    // const userId='user';

    const fetchItemsData = () => {
      fetch(`https://billing-360-dev.onrender.com/api/inventory/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllItems(data);
      })
      .catch((err) => console.log(err));
    };

    const togglePaymentMode = () => {
      setInvoiceData(prevData => ({
        ...prevData,
        paymentMode: isPaid ? 'Credit' : 'Paid'
      }));
      setIsPaid(prevState => !prevState);
    };


    return (
      <>
      {showLoading && ( 
       <div className="loading-overlay">
       <ReactLoading type="spin" color="#000" height={50} width={50} />
     </div>
    )}
        <div className="customer-details">
          <table id="customerTable">
            <tbody>
              <tr>
                <td className="input-box"><input type="text" autocomplete="one-time-code" value={invoiceData.customerName} onChange={(e) => handleInputChangeCust(e, 'customerName')} placeholder='Customer Name' /></td>
                <td className="input-box">InvoiceID : {invoiceData.invoiceID}</td>
              </tr>
              <tr>
                <td className="input-box"><input type="text" autocomplete="one-time-code" value={invoiceData.customerEmail} onChange={(e) => handleInputChangeCust(e, 'customerEmail')} placeholder='Customer Email' /></td>
                <td className="input-box"><input type="text" autocomplete="one-time-code" value={invoiceData.phoneNo} onChange={(e) => handleInputChangeCust(e, 'phoneNo')} placeholder='Customer Phone No' /></td>
              </tr>
            </tbody>
          </table>
        </div>
      <div className="main-container">
      <div className='itemListContainer'>
    <table id="invoiceTable">
      <thead>
        <tr class="headers">
          <th>Item Details</th>
          <th>Quantity</th>
          <th>Price (per unit)</th>
          <th>GST (%)</th>
          <th>Amount (&#8377;)</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
      {invoiceData.itemList.map((item, index) => (
        <tr key={index}>
          <td placeholder='Select Item'>
            <SearchableDropdown
              options={optionList}
              label="itemName"
              id={index}
              selectedVal={currItem}
              handleChange={(selectedItem) => {
                handleInputChange({ target:{ value: selectedItem } }, index, 'itemName');
              }}
              props={invoiceData}
            />
            {/* {item.itemName} */}
            </td>
          <td><input type="number"
                    className="no-scroll"
                    value={item.quantity} 
                    onChange={(e) => handleInputChange(e, index, 'quantity')}
                    // onWheel={(e) => e.preventDefault()}
                    onWheel={event => event.target.blur()}
                    placeholder='Quantity'/></td>
          <td>{item.rate}</td>
          <td>{item.gst}</td>
          <td>{item.amount}</td>

          <td>
              <DeleteIcon
                style={{ color: 'red', cursor: 'pointer' }}
                onClick={() => handleDeleteRow(index)}
              />
            </td>
        </tr>
      ))}

      </tbody>
    </table>
      <div className="bottom-controls">
        <button id="add-new-item" type="button" onClick={handleAddField}><strong> Add New Row </strong> </button>
        <div className='discount-input'>
          Discount (%): <input type="number" autocomplete="one-time-code" value={invoiceData.discount} onChange={(e) => handleInputChangeCust(e, 'discount')} placeholder='Discount (%)' onWheel={event => event.target.blur()}/>
        </div>
      </div>
      <div className="customer-notes">
        <label htmlFor="customerNotes">Customer Notes:</label><br />
        <textarea id="customerNotes" value={invoiceData.notes} onChange={(e) => handleInputChangeCust(e, 'notes')} placeholder="Enter notes here..." rows="4" cols="50"></textarea>
      </div>
      <div className="total-amt-box" style={{ fontSize: '24px' }}>Total Amount: &#8377; {invoiceData.totalAmount}</div>
    </div>
      <div className="bill-buttons">
        <button id="add-as-credit" type = "button" onClick={togglePaymentMode}> <strong> {isPaid ? 'Add as Credit' : 'Set as Paid'} </strong> </button>
        <button id="preview-bill" type = "button" onClick={generatePdf}> <strong> Preview Bill </strong> </button>
        <button
          id="generate-bill-button"
          type="button"
          onClick={handleGenerateBill}
          disabled={showLoading} // Disable the button when loading
        >
          <strong> Generate Bill </strong>
        </button>
      </div>
    
    </div>
    </>
    )
}

export default AddNewInvoice;