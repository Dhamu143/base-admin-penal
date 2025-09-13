import { useNavigate } from "react-router-dom";
import TableFilter from "./tableFilter";

function HubRequested() {
  // const navigate = useNavigate();
  return (
    <>
      <div className="content-wrapper">
        <div
          className="content-heading d-flex
                          justify-content-between"
        >
          <div>Community & Caste Requested</div>
          <div>
           
          </div>
        </div>
        <TableFilter />
      </div>
    </>
  );
}

export default HubRequested;
