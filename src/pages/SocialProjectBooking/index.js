import { useNavigate } from "react-router-dom";
import TableFilter from "./tableFilter";

function SocialProjectBooking() {
  // const navigate = useNavigate();
  return (
    <>
      <div className="content-wrapper">
        <div
          className="content-heading d-flex
                          justify-content-between"
        >
          <div>Social Project Donation</div>
          <div>
           
          </div>
        </div>
        <TableFilter />
      </div>
    </>
  );
}

export default SocialProjectBooking;
