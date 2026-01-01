import React from "react";
import PageBreadcrumb from "../../componets/PageBreadcrumb";
import { Row, Col, Card, Container, Table } from "react-bootstrap";
import SimpleBar from "simplebar-react";

// Static data for doctors
const doctorsData = [
    {
    id: 1,
    name: "SAROJ OJHA",
    phone: "9822030801",
    birthday: "21-02-1947",
    address: "WADGAONSHERI, PUNE"
  },
  {
    id: 2,
    name: "SAROJ OJHA",
    phone: "9822865075",
    birthday: "21-02-1947",
    address: "VADGAON SHERI,PUNE"
  },
  {
    id: 3,
    name: "LAXMAN LOKHANDE",
    phone: "9421836472",
    birthday: "21-02-1952",
    address: "BALEWADI ,PUNE"
  },
  {
    id: 4,
    name: "MR LAXMANRAO UTTAMRAO LOKHANDE",
    phone: "9421836479",
    birthday: "21-02-1952",
    address: "BALEWADI, PUNE"
  },
  {
    id: 5,
    name: "CHANDER PAL MADAD",
    phone: "9850578084",
    birthday: "21-02-1958",
    address: "VIMAN NAGAR , PUNE"
  },
  {
    id: 6,
    name: "C P MADAD",
    phone: "9850578084",
    birthday: "21-02-1958",
    address: "VIMAN NAGAR , PUNE"
  },
  {
    id: 7,
    name: "DILIP SETHI",
    phone: "9422702225",
    birthday: "21-02-1959",
    address: "MODEL COLONY, PUNE"
  },
  {
    id: 8,
    name: "RAJENDRA NIRANJANE",
    phone: "9822600545",
    birthday: "21-02-1959",
    address: "SHANKAR SETH ROAD , PUNE"
  },
  {
    id: 9,
    name: "MR DILIP SETHI",
    phone: "9422702225",
    birthday: "21-02-1959",
    address: "SHIVAJI NAGAR, PUNE"
  },
  {
    id: 10,
    name: "ASHOK PALVE",
    phone: "8275452358",
    birthday: "21-02-1965",
    address: "BANER , PUNE"
  },
  {
    id: 11,
    name: "SHIVAJI PATIL",
    phone: "8605287799",
    birthday: "21-02-1967",
    address: "ADHEGAON, SOLAPUR"
  },
  {
    id: 12,
    name: "MR BALU THOMBARE",
    phone: "9922332107",
    birthday: "21-02-1967",
    address: "KHARADI, PUNE"
  },
  {
    id: 13,
    name: "MR PRASHANT PANDURANG BOBADE",
    phone: "9623416163",
    birthday: "21-02-1968",
    address: "KOTHRUD, PUNE"
  },
  {
    id: 14,
    name: "SAPNA AGARWAL",
    phone: "9823138857",
    birthday: "21-02-1970",
    address: "KOREGAON ROAD, PUNE"
  },
  {
    id: 15,
    name: "SHAKIL NADAF",
    phone: "9850619523",
    birthday: "21-02-1972",
    address: "TADIWALA ROAD , PUNE"
  },
  {
    id: 16,
    name: "SUNANDA MHALASKAR",
    phone: "9673095454",
    birthday: "21-02-1972",
    address: "VADGAON, PUNE"
  },
  {
    id: 17,
    name: "HEMLATA DHANE",
    phone: "8767293987",
    birthday: "21-02-1972",
    address: "PADALI , SATARA"
  },
  {
    id: 18,
    name: "BINDESH MEHTA",
    phone: "9822202773",
    birthday: "21-02-1972",
    address: "YERWADA, PUNE"
  },
  {
    id: 19,
    name: "SUPRATIK DEY",
    phone: "8334804901",
    birthday: "21-02-1973",
    address: "AMANORA TOWERS, PUNE"
  },
  {
    id: 20,
    name: "SANDHYA KAMBLE",
    phone: "9604757935",
    birthday: "21-02-1973",
    address: "GHORPADI PETH, PUNE"
  },
  {
    id: 21,
    name: "ZAHEER ABBAS",
    phone: "9049898239",
    birthday: "21-02-1975",
    address: "WANOWRIE , PUNE"
  },
  {
    id: 22,
    name: "MR SRINIVAS YERRAMSETTY",
    phone: "7892716983",
    birthday: "21-02-1976",
    address: "VIJAYWADA, ANDHRA PRADESH"
  },
  {
    id: 23,
    name: "SUJATA BAGMARE",
    phone: "9922445594",
    birthday: "21-02-1977",
    address: "BHAWANI PETH,PUNE"
  },
  {
    id: 24,
    name: "CHANDRAKANT VYAWAHARE",
    phone: "7798575480",
    birthday: "21-02-1978",
    address: "WAGHOLI ,PUNE"
  },
  {
    id: 25,
    name: "MRS SUCHITA RAY",
    phone: "9922111200",
    birthday: "21-02-1978",
    address: "HADAPSAR, PUNE"
  },
  {
    id: 26,
    name: "TANAJI YAMULWAD",
    phone: "9011590622",
    birthday: "21-02-1982",
    address: "TARODA BK, NADED"
  },
  {
    id: 27,
    name: "SAGAR BEDMUTHA",
    phone: "9890999199",
    birthday: "21-02-1982",
    address: "KONDHWA ROAD, PUNE"
  },
  {
    id: 28,
    name: "MR NADEEM SAYYED",
    phone: "9850496680",
    birthday: "21-02-1982",
    address: "WADGAON SHERI, PUNE"
  },
  {
    id: 29,
    name: "SHEETAL YADAV",
    phone: "7798042495",
    birthday: "21-02-1982",
    address: "PANHALA , KOLHAPUR"
  },
  {
    id: 30,
    name: "ABHIJEET MADAKE",
    phone: "9764152369",
    birthday: "21-02-1984",
    address: "PARVATI,PUNE"
  },
  {
    id: 31,
    name: "ULHAS MALAWADE",
    phone: "9975563891",
    birthday: "21-02-1984",
    address: "HADAPSAR, PUNE"
  },
  {
    id: 32,
    name: "REETESH AGRAWAL",
    phone: "9850050472",
    birthday: "21-02-1984",
    address: "KHARADI , PUNE"
  },
  {
    id: 33,
    name: "TABASSUM ATTAR",
    phone: "9175051314",
    birthday: "21-02-1984",
    address: "PARVATI DARSHAN, PUNE"
  },
  {
    id: 34,
    name: "GANPAT YEWALE",
    phone: "9763168214",
    birthday: "21-02-1984",
    address: "PERNE , PUNE"
  },
  {
    id: 35,
    name: "JEEVAN JADHAV",
    phone: "8378977014",
    birthday: "21-02-1984",
    address: "SUSGAON , PUNE"
  },
  {
    id: 36,
    name: "JEEVAN JADHAV",
    phone: "8378977014",
    birthday: "21-02-1984",
    address: "SUSGAON , PUNE"
  },
  {
    id: 37,
    name: "HARSHVARDHAN TIWARI",
    phone: "9890332832",
    birthday: "21-02-1986",
    address: "PASHAN , PUNE"
  },
  {
    id: 38,
    name: "MADHURIKA BAFNA",
    phone: "9483660846",
    birthday: "21-02-1989",
    address: "SHANTINAGAR SOCIETY, PUNE"
  },
  {
    id: 39,
    name: "ROSHAN MOHITE",
    phone: "7507978594",
    birthday: "21-02-1989",
    address: "AUNDH , PUNE"
  },
  {
    id: 40,
    name: "NILESH WAGHMARE",
    phone: "9579950890",
    birthday: "21-02-1990",
    address: "RAVET, PUNE"
  },
  {
    id: 41,
    name: "NISHANT SAMAIYA",
    phone: "9266600536",
    birthday: "21-02-1990",
    address: "MAGARPATTA , PUNE"
  },
  {
    id: 42,
    name: "UTTARA TUPE",
    phone: "9561065010",
    birthday: "21-02-1990",
    address: "MAGARPATTA , PUNE"
  },
  {
    id: 43,
    name: "SANDHYA DAGLIA",
    phone: "9975554567",
    birthday: "21-02-1991",
    address: "MARKET YARD, PUNE"
  },
  {
    id: 44,
    name: "SUNIL GOUDA",
    phone: "9930900686",
    birthday: "21-02-1991",
    address: "WEST MUMBAI"
  },
  {
    id: 45,
    name: "NAGESH KUMBHAR",
    phone: "9075925267",
    birthday: "21-02-1991",
    address: "KARMALA, SOLAPUR"
  },
  {
    id: 46,
    name: "RAHUL GOHIRE",
    phone: "7823014994",
    birthday: "21-02-1992",
    address: "MUNDHWA ,PUNE"
  },
  {
    id: 47,
    name: "MR GANESH BORKAR",
    phone: "9762988963",
    birthday: "21-02-1992",
    address: "HADAPSAR,PUNE"
  },
  {
    id: 48,
    name: "MR RAJVEER SAINI",
    phone: "8087358080",
    birthday: "21-02-1992",
    address: "KATRAJ PUNE"
  },
  {
    id: 49,
    name: "SARITA GORE",
    phone: "9657149628",
    birthday: "21-02-1992",
    address: "WADMUKHWADI ,PUNE"
  },
  {
    id: 50,
    name: "ANUJA GAIKWAD",
    phone: "8554818554",
    birthday: "21-02-1993",
    address: "GHORPADI, PUNE"
  },
  {
    id: 51,
    name: "SAKSHI KHAR",
    phone: "8329357155",
    birthday: "21-02-1993",
    address: "BANER, PUNE"
  },
  {
    id: 52,
    name: "DIKSHA UMAP",
    phone: "9028563100",
    birthday: "21-02-1993",
    address: "VADGAON SHERI"
  },
  {
    id: 53,
    name: "ANUJA GAIKWAD",
    phone: "7579918417",
    birthday: "21-02-1993",
    address: "B.T KAWADE ROAD"
  },
  {
    id: 54,
    name: "TEJAS GANDHI",
    phone: "9408604020",
    birthday: "21-02-1994",
    address: "MANJRI, PUNE"
  },
  {
    id: 55,
    name: "RAHUL DOLE",
    phone: "9545741111",
    birthday: "21-02-1994",
    address: "MOSHI, PUNE"
  },
  {
    id: 56,
    name: "MR KUNAL BABAR",
    phone: "9823425353",
    birthday: "21-02-1994",
    address: "WAGGAONSHERI,PUNE"
  },
  {
    id: 57,
    name: "VAIBHAV GURAV",
    phone: "7972127657",
    birthday: "21-02-1994",
    address: "SATARA, MAHRASHTRA"
  },
  {
    id: 58,
    name: "ABDUL RAHEMAN SHAIKH",
    phone: "7709242845",
    birthday: "21-02-1994",
    address: "HADAPSAR, PUNE"
  },
  {
    id: 59,
    name: "PUJA SHAH",
    phone: "9665539396",
    birthday: "21-02-1995",
    address: "HINJEWADI , PUNE"
  },
  {
    id: 60,
    name: "MS SWATI DESAI",
    phone: "9623624971",
    birthday: "21-02-1995",
    address: "DHANORI , PUNE"
  },
  {
    id: 61,
    name: "ANJALI CHANGALE",
    phone: "7249511226",
    birthday: "21-02-1996",
    address: "OLD SANGVI, PUNE"
  },
  {
    id: 62,
    name: "SUPRIYA LUNGARE",
    phone: "7219329281",
    birthday: "21-02-1996",
    address: "KOTHRUD , PUNE"
  },
  {
    id: 63,
    name: "ANJALI CHANGALE",
    phone: "7249511226",
    birthday: "21-02-1996",
    address: "SANGVI , PUNE"
  },
  {
    id: 64,
    name: "MS RASHMI KUMARI",
    phone: "9755862672",
    birthday: "21-02-1996",
    address: "KESHAVNAGAR,PUNE"
  },
  {
    id: 65,
    name: "TIMAVVA BHANDARI",
    phone: "8862015499",
    birthday: "21-02-1997",
    address: "DAUND"
  },
  {
    id: 66,
    name: "VISHAKHA DESHMUKH",
    phone: "8767964574",
    birthday: "21-02-1997",
    address: "WADGAON SHERI, PUNE"
  },
  {
    id: 67,
    name: "MR AKSHAY JADHAV",
    phone: "8055503040",
    birthday: "21-02-1997",
    address: "AUNDH ROAD, PUNE"
  },
  {
    id: 68,
    name: "RAVINA SHINDE",
    phone: "9309928194",
    birthday: "21-02-1998",
    address: "VITTALWADI,PUNE"
  },
  {
    id: 69,
    name: "VAISHNAVI BELGE",
    phone: "7057368722",
    birthday: "21-02-1999",
    address: "SAVEDI, AHMEDNAGAR"
  },
  {
    id: 70,
    name: "MAHESH DANE",
    phone: "9834616477",
    birthday: "21-02-2000",
    address: "KARVE NAGAR ,PUNE"
  },
  {
    id: 71,
    name: "MR AMIT SARWADE",
    phone: "9284912270",
    birthday: "21-02-2002",
    address: "LATUR"
  },
  {
    id: 72,
    name: "KRISH BAJAJ",
    phone: "8799995274",
    birthday: "21-02-2004",
    address: "PIMPRI, PUNE"
  },
  {
    id: 73,
    name: "MS HUMERA TAMBOLI",
    phone: "8766641414",
    birthday: "21-02-2006",
    address: "YERWADA, PUNE"
  },
  {
    id: 74,
    name: "VEERTI JAIN",
    phone: "9272800800",
    birthday: "21-02-2010",
    address: "SALISBURY PARK , PUNE"
  },
  {
    id: 75,
    name: "MASTER ALVEERA WASIM SHAIKH",
    phone: "9112445545",
    birthday: "21-02-2017",
    address: "KEDGAON, AHMEDNAGAR"
  },
  {
    id: 76,
    name: "MAST VIRAT NITURE",
    phone: "8412814710",
    birthday: "21-02-2018",
    address: "UNDRI,PUNE"
  },
  {
    id: 77,
    name: "VIHAAN SEKSARIA",
    phone: "8105826688",
    birthday: "21-02-2023",
    address: "WAGHOLI,PUNE"
  }
];


const BirthdayAlert = () => {
  return (
    <div
      className="themebody-wrap"
      style={{
        padding: "20px",
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* Breadcrumb */}
      <PageBreadcrumb pagename="Birthday Alert" />

      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row className="justify-content-center">
            <Col md={12}>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "4px solid #00bcd4",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    backgroundColor: "#e3f2fd",
                    borderBottom: "2px solid #0288d1",
                    padding: "1rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    fontSize: "16px",
                  }}
                >
                  <h4>Birthday Alert - 02-01-2025</h4>
                </Card.Header>
                <Card.Body
                  style={{
                    padding: "25px",
                  }}
                >
                  {/* Birthday Alert Table */}
                  <Table
                    bordered
                    responsive
                    className="table-striped"
                    style={{
                      border: "1px solid #90caf9",
                      textAlign: "center",
                    }}
                  >
                    <thead
                      style={{
                        backgroundColor: "#0288d1",
                        color: "white",
                        fontSize: "16px",
                      }}
                    >
                      <tr>
                        <th>Sr. No</th>
                        <th>Name</th>
                        <th>Phone No</th>
                        <th>Birthday Date</th>
                        <th style={{ textAlign: "center" }}>Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorsData.map((doctor, index) => (
                        <tr key={doctor.id}>
                          <td style={{ padding: "10px" }}>{index + 1}</td>
                          <td>{doctor.name}</td>
                          <td>{doctor.phone}</td>
                          <td>{doctor.birthday}</td>
                          <td style={{ textAlign: "center" }}>
                            {doctor.address}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
    </div>
  );
};

export default BirthdayAlert;
