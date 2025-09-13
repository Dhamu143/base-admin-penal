import { useNavigate } from "react-router-dom";
import TableFilter from "./tableFilter";

function Projectcategory() {
  const navigate = useNavigate();
  return (
    <>
      <div className="content-wrapper">
        <div
          className="content-heading d-flex
                          justify-content-between"
        >
          <div>Project Category</div>
          <div>
            <button
              className="btn btn-labeled btn-success"
              type="button"
              style={{ fontSize: "17px" }}
              onClick={() => navigate("/project-category/new")}
              >
              <span className="btn-label">
                <em className="fas fa-plus"></em>
              </span>
              New Project Category
            </button>
          </div>
        </div>
        <TableFilter />
      </div>
    </>
  );
}

export default Projectcategory;
