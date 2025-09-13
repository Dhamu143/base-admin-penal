import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import { appDeleteFaq, appGetAllFaq } from "../../store/faq";

function TableFilter() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const [page, setPage] = useState(params.page || 1);
  const [search, setSearch] = useState("");
 
  const paginate = useSelector((state) => state.faqReducer.paginate);
  const isloder = useSelector((state) => state.faqReducer.isloder);
  const isdeleted = useSelector((state) => state.faqReducer.isdeleted);
const faq = useSelector((state) => state.faqReducer.faq)
  useEffect(() => {
    dispatch(appGetAllFaq({ page:1 , limit:10}));
    navigate(`/faq/${page}`);
  }, [page, isdeleted]);

  const handleDeleteFaq = (id) => {
    swal({
      title: "Are you sure?",
  text: "You want to delete this faq?",

      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteFaq(id));
      }
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    dispatch(appGetAllFaq({ page: 1, limit: 10, search }));
  };

  const handleReset = () => {
    setSearch("");
    setPage(1);
    dispatch(appGetAllFaq({ page: 1, limit: 10 }));
  };

  return (
    <>
      {isloder && <PageLoader />}
      <div className="card dataTables_wrapper">
        <div className="card-body">
          <div className="table-responsive bootgrid">
            <form onSubmit={handleSearch} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search FAQ..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '0.5rem', width: '250px', marginRight: '0.5rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ marginRight: '0.5rem' }}>Search</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>Reset</button>
            </form>
            <table className="table table-hover" id="bootgrid-command">
              <thead>
                <tr>
                  <th>Question</th>
                  <th data-column-id="sender">Answer</th>
                  {/* <th data-column-id="received" data-order="desc">
                    Language Name
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Native Place
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Religion Name
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

              {faq.map((item) => (
                <tbody>
                  <tr>
                    <td>{item.question}</td>
                    <td>{item.answer}</td>
                    {/* <td>{item.caste?.language?.[0]?.name}</td>
                    <td>{item.caste?.nativeplace?.[0]?.name}</td>
                    <td>{item.caste?.religion?.name}</td> */}
                    <td>
                    <button
                          type="button"
                          className="btn btn-sm btn-info mr-2 command-edit"
                          onClick={() => navigate(`/faq/edit/${item?._id}`)}
                        >
                          <em className="fa fa-edit fa-fw"></em>
                        </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger command-delete"
                        data-row-id="10253"
                        onClick={() => handleDeleteFaq(item?._id)}
                      >
                        <em className="fa fa-trash fa-fw"></em>
                      </button>
                    </td>
                  </tr>
                </tbody>
              ))}
            </table>
          </div>
          {/* {paginate && (
            <Paginate paginate={paginate} page={page} setPage={setPage} />
          )} */}
        </div>
      </div>
    </>
  );
}

export default TableFilter;
