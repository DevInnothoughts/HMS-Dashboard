import React, { useState, useEffect } from 'react';
import MaterialTable from '@material-table/core'; // Replace the old DataTable import
import axios from 'axios'; // For making API calls
import '../../styles/styles.css'; // Add this import at the top

const InsuranceDueReport = () => {
  // State for form inputs and data
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle Find button click
  const handleFindClick = async () => {
    if (!fromDate || !toDate) {
      alert('Please Enter all fields details..');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching data...'); // Debug log
      const response = await axios.post('/receptionist/InsuranceDueDetails', {
        Fromdate: fromDate,
        Todate: toDate
      });
      console.log('Response:', response.data); // Debug log
      setTableData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // DataTable columns configuration
  const columns = [
    { title: 'Sr No', field: 'invoice_id' },
    { 
      title: 'Date', 
      field: 'creationdate',
      render: (rowData) => {
        const [year, month, day] = rowData.creationdate.split('-');
        return `${day}-${month}-${year}`;
      }
    },
    { title: 'Patient Name', field: 'patientname' },
    { title: 'Company Name', field: 'companyname' },
    { title: 'Invoice No', field: 'invoiceid' },
    { title: 'Total Amt', field: 'totalamt' },
    { title: 'Approved Amt', field: 'authoamt' },
    { 
      title: 'Received Amt',
      render: (rowData) => {
        const val = parseInt(rowData.receivedamt) + parseInt(rowData.tdsamt);
        return isNaN(val) ? 0 : val;
      }
    },
    {
      title: 'Due Amt',
      render: (rowData) => {
        const value = parseInt(rowData.authoamt) - (parseInt(rowData.receivedamt) + parseInt(rowData.tdsamt));
        return isNaN(value) ? 0 : value;
      }
    }
  ];

  return (
    <div className="box">
      <div className="box-content padded">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <i className="icon-info-sign"></i>
          <h3 style={{ margin: '0 0 0 10px' }}>Manage InsuranceDueReport</h3>
        </div>

        <div className="row" style={{ marginBottom: '20px' }}>
          <div className="col-md-3">
            <div className="form-group">
              <label className="control-label">From Date</label>
              <input
                type="date"
                className="form-control"
                placeholder="dd-mm-yyyy"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="form-group">
              <label className="control-label">To Date</label>
              <input
                type="date"
                className="form-control"
                placeholder="dd-mm-yyyy"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="form-group" style={{ marginTop: '25px' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleFindClick}
                disabled={isLoading}
                style={{
                  padding: '8px 20px',
                  fontSize: '14px',
                  backgroundColor: '#007bff',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {isLoading ? 'Loading...' : 'Find'}
              </button>
            </div>
          </div>
        </div>

        {!isLoading && tableData.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            color: '#666',
            fontSize: '14px'
          }}>
            No data available. Please select dates and click Find.
          </div>
        )}

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading...
          </div>
        )}

        {!isLoading && tableData.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <MaterialTable
              data={tableData}
              columns={columns}
              options={{
                sorting: true,
                exportButton: true,
                exportAllData: true,
                exportFileName: 'InsuranceDueReport',
                pageSize: 10,
                pageSizeOptions: [10, 20, 50],
                headerStyle: {
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold',
                },
                searchFieldStyle: {
                  marginLeft: '20px',
                },
                actionsColumnIndex: -1,
                tableLayout: 'fixed',
              }}
              style={{
                width: '100%',
                boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                borderRadius: '4px',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceDueReport;
