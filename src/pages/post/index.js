import { useNavigate } from "react-router-dom";
import TableFilter from "./tableFilter";

function Post() {
  const navigate = useNavigate();
  return (
    <>
      <div className="content-wrapper">
        <div
          className="content-heading d-flex
                          justify-content-between"
        >
          <div>Posts</div>
          <div>
            <button
              className="btn btn-labeled btn-success"
              type="button"
              style={{ fontSize: "17px" }}
              onClick={() => navigate("/post/new")}
              >
              <span className="btn-label">
                <em className="fas fa-plus"></em>
              </span>
              New Post
            </button>
          </div>
        </div>
        {/* <TableFilter /> */}
      </div>
    </>
  );
}

export default Post;
