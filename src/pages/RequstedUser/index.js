import { useNavigate } from "react-router-dom";
import TableFilter from "./tableFilter";
import { useEffect } from "react";

function RequstedUser() {
  const navigate = useNavigate();

  return (
    <>
      <div className="content-wrapper">
        <div
          className="content-heading d-flex
                          justify-content-between"
        >
          <div>Members Waiting for Approval</div>
        </div>
        {/* <TableFilter /> */}
      </div>
    </>
  );
}

export default RequstedUser;
