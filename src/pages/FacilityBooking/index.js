import { useNavigate } from "react-router-dom";
import TableFilter from "./tableFilter";

function FacilityBooking() {
  // const navigate = useNavigate();
  return (
    <>
      <div className="content-wrapper">
        <div
          className="content-heading d-flex
                          justify-content-between"
        >
          <div>Facility Booking</div>
          <div>
           
          </div>
        </div>
        <TableFilter />
      </div>
    </>
  );
}

export default FacilityBooking;
