import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import { appDeleteReligion, appGetAllReligion } from "../../store/religion/index";
import PageLoader from "../../components/PageLoader/PageLoader";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const religion = useSelector((state) => state?.religionReducer.religion);
  const isloder = useSelector((state) => state?.religionReducer.isloder);
  const isdeleted = useSelector((state) => state?.religionReducer?.isdeleted);
  const [page, setPage] = useState(params.page || 1);

  useEffect(() => {
    dispatch(appGetAllReligion({page:page, limit:10}));
    navigate(`/religion/${page}`);
  }, [page, dispatch]);
  useEffect(() => {
    if (isdeleted) {
      dispatch(appGetAllReligion({page:page, limit:10}));
    }
  }, [isdeleted, dispatch, page]);

  const handleDeleteReligion = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this religion?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteReligion(id));
      }
    });
  };

  return (
    <>
      {isloder && <PageLoader />}
      <div className="card dataTables_wrapper">
        <div className="card-body">
          <div className="table-responsive bootgrid">
            <table className="table table-hover" id="bootgrid-command">
              <thead>
                <tr>
                  <th>Name</th>
                  {/* <th data-column-id="received" data-order="desc">
                    createdAt
                  </th> */}
                  <th
                    data-column-id="commands"
                    data-formatter="commands"
                    data-sortable="false"
                  >
                    <div></div>
                  </th>
                </tr>
              </thead>
              {religion &&
                religion.map((value, index) => {
                  return (
                    <tbody key={index}>
                      <tr>
                      <td style={{textTransform:"capitalize"}}>{value?.name}</td>
                        {/* <td>{value?.createdAt}</td> */}
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-info mr-2 command-edit"
                            data-row-id="10253"
                            onClick={() =>
                              navigate(
                                `/religion/edit/${value?._id}`
                              )
                            }
                          >
                            <em className="fa fa-edit fa-fw"></em>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger command-delete"
                            data-row-id="10253"
                            onClick={() => handleDeleteReligion(value?._id)}
                          >
                            <em className="fa fa-trash fa-fw"></em>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  );
                })}
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default TableFilter;
