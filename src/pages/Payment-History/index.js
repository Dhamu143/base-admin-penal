import { useNavigate } from "react-router-dom";
import TableFilter from "./tableFilter";

function PaymentHistory() {
  // const navigate = useNavigate();
  return (
    <>
      <div className="content-wrapper">
        <div
          className="content-heading d-flex
                          justify-content-between"
        >
          <div>Payment History</div>
          <div>
           
          </div>
        </div>
        {/* <TableFilter /> */}
      </div>
    </>
  );
}

export default PaymentHistory;
