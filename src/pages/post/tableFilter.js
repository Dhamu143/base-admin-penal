import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import Select from "react-select";
import { appGetAllSanstha } from "../../store/sanstha";
import { appAllGetHubs } from "../../store/hubs";
import { appDeletePost, appGetAllPost, appUpdatePost } from "../../store/post";
import PostPreview from "../../components/PostPreview/PostPreview";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const post = useSelector((state) => state?.postReducer.post);
  // console.log(post)
  const isloder = useSelector((state) => state?.postReducer.isloder);
  const paginate = useSelector((state) => state.postReducer.paginate);
  const isdeleted = useSelector((state) => state?.postReducer?.isdeleted);
  const { hub } = useSelector((state) => state.hubReducer);
  const { sanstha } = useSelector((state) => state.sansthaReducer);
  const [page, setPage] = useState(params.page || 1);
  const [selectedFilters, setSelectedFilters] = useState({
    hub: null,
    sanstha: null,
    categoryOptions: null,
    approval_required: null,
  });
  const [activeFilters, setActiveFilters] = useState({});

  const categoryOptions = [
    { value: "Announcement", label: "Announcement" },
    { value: "Inspiration", label: "Inspiration" },
    { value: "Achievement", label: "Achievement" },
    { value: "Activity", label: "Activity" },
    { value: "Photo Update", label: "Photo Update" },
    { value: "Devotional", label: "Devotional" },
    { value: "Awareness", label: "Awareness" },
    // { value: "other", label: "Other" },
  ];

  useEffect(() => {
    dispatch(appGetAllPost({ page: 1, limit: 10 }));
    navigate(`/post/${page}`);
  }, [page, dispatch]);

  // useEffect(() => {
  //   dispatch(appGetAllPost({ page: 1, limit: 10 }));
  // }, []);

  useEffect(() => {
    dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
    dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
  }, [page]);

  useEffect(() => {
    if (isdeleted) {
      dispatch(appGetAllPost({ page: 1, limit: 10 }));
    }
  }, [isdeleted, dispatch, page]);

  const handleDeletePost = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this Post?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeletePost(id));
        // .then(()=> {
        //    dispatch(appGetAllPost({ page: 1, limit: 10 }));
        // })
      }
    });
  };

  const handleacceptPost = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to accept this Post?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appUpdatePost({ id, approval_required: false })).then(() => {
          dispatch(appGetAllPost({ page: 1, limit: 10 }));
        });
      }
    });
  };

  useEffect(() => {
    const searchParams = {
      ...activeFilters,
      page,
      limit: 10,
    };
    // console.log(searchParams, "searchParams")
    dispatch(appGetAllPost(searchParams));
    navigate(`/post/${page}`);
  }, [page, activeFilters]);

  const handleSearch = useCallback(() => {
    const filters = {};
    if (selectedFilters.hub) {
      filters.hub = selectedFilters.hub.value;
    }
    if (selectedFilters.sanstha) {
      filters.sanstha = selectedFilters.sanstha.value;
    }
    if (selectedFilters.categoryOptions) {
      filters.categoryOptions = selectedFilters.categoryOptions.value;
    }
    if (selectedFilters.approval_required) {
      filters.approval_required = selectedFilters.approval_required;
    }
    setActiveFilters(filters);
    setPage(1);
  }, [selectedFilters]);

  return (
    <>
      {isloder && <PageLoader />}
      <div className="card dataTables_wrapper">
        <div className="card-body">
          <div className="row">
            <div className="col-md-2">
              <div className="form-group">
                <label>Community</label>
                <Select
                  options={
                    Array.isArray(hub.data)
                      ? hub.data.map((hub) => ({
                          value: hub._id,
                          label: hub.name,
                        }))
                      : []
                  }
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      hub: option,
                    }));
                  }}
                  // onChange={handleHubChange}
                  // value={
                  //   Array.isArray(hub?.data)
                  //     ? hub?.data
                  //         .filter(
                  //           (option) => option._id === formik?.values?.hub
                  //         )
                  //         .map((option) => ({
                  //           value: option._id,
                  //           label: option.name,
                  //         }))[0]
                  //     : null
                  // }
                  value={selectedFilters.hub}
                  placeholder="Select Community.."
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                />
              </div>
            </div>

            <div className="col-md-2">
              <div className="form-group">
                <label>Sanstha</label>
                <Select
                  options={
                    Array.isArray(sanstha)
                      ? sanstha.map((sanstha) => ({
                          value: sanstha._id,
                          label: sanstha.name,
                        }))
                      : []
                  }
                  // onChange={handleSansthaChange}
                  // value={
                  //   Array.isArray(sanstha)
                  //     ? sanstha.filter(
                  //         (option) => option._id === formik?.values?.sanstha
                  //       ).map((option) => ({
                  //         value: option._id,
                  //         label: option.name,
                  //       }))[0]
                  //     : null
                  // }
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      sanstha: option,
                    }));
                  }}
                  value={selectedFilters.sanstha}
                  placeholder="Select Sanstha.."
                  getOptionLabel={(option) => option?.name || option?.label}
                  getOptionValue={(option) => option?._id || option?.value}
                />
              </div>
            </div>
            <div className="col-md-2">
              <label>Category </label>
              <Select
                name="category"
                options={categoryOptions}
                // onChange={(opt) => formik.setFieldValue("category", opt?.value)}
                onChange={(option) => {
                  setSelectedFilters((prev) => ({
                    ...prev,
                    categoryOptions: option,
                  }));
                }}
                value={selectedFilters.categoryOptions}
                placeholder="Select category..."
              />
            </div>
            <div className="col-md-2">
              <div className="form-group">
                <label>Filter based on check</label>
                <select
                  className="form-control"
                  name="approval_required"
                  value={
                    selectedFilters.approval_required === true
                      ? "Pending for approval"
                      : selectedFilters.approval_required === false
                      ? "All"
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedFilters((prev) => ({
                      ...prev,
                      approval_required:
                        val === "All"
                          ? false
                          : val === "Pending for approval"
                          ? true
                          : null,
                    }));
                  }}
                >
                  <option value="">Select option</option>
                  <option value="All">All</option>
                  <option value="Pending for approval">
                    {" "}
                    Pending for Check
                  </option>{" "}
                </select>
              </div>
            </div>

            <div
              className="d-flex"
              style={{ alignItems: "center", marginTop: "12px" }}
            >
              <button
                className="btn btn-primary mr-2"
                onClick={handleSearch}
                style={{ marginRight: "8px" }}
              >
                <em className="fas fa-search"></em> Search
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedFilters({
                    hub: null,
                    sanstha: null,
                    categoryOptions: null,
                    approval_required: null,
                  });
                  setPage(1);
                  setActiveFilters({});
                }}
              >
                <em className="fas fa-redo"></em> Reset
              </button>
            </div>
          </div>

          <div className="table-responsive bootgrid">
            <table className="table table-hover" id="bootgrid-command">
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Post Title</th>
                  {/* <th>Description </th> */}
                  <th>Category </th>
                  <th>Community</th>
                  <th>Sanstha</th>
                  <th>Created Date</th>
                  <th>Posted By </th>
                  <th
                    data-column-id="commands"
                    data-formatter="commands"
                    data-sortable="false"
                  >
                    <div></div>
                  </th>
                </tr>
              </thead>
              {post.data &&
                post.data.map((value, index) => {
                  return (
                    <tbody key={index}>
                      <tr>
                        <PostPreview value={value} />
                        {/* <td>
                          {value?.file?.endsWith(".mp4") ||
                          value?.file?.endsWith(".webm") ? (
                            <video
                              src={value.file}
                              width="50"
                              height="50"
                              style={{ borderRadius: "50%" }}
                              controls
                            />
                          ) : (
                            <img
                              src={value.file}
                              alt="post"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                        </td> */}
                        <td
                          style={{
                            maxWidth: "150px",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            textTransform: "capitalize",
                          }}
                        >
                          {value?.title}
                        </td>
                        {/* <td>{value.description}</td> */}
                        <td>{value.category}</td>
                        <td
                          style={{
                            maxWidth: "150px",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            textTransform: "capitalize",
                          }}
                        >
                          {value?.hub ? (
                            <>
                              {value.hub.image && (
                                <img
                                  src={value.hub.image}
                                  alt="community"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                              <br />
                              {value.hub.name || "—"}
                            </>
                          ) : (
                            ""
                          )}
                        </td>
                        <td
                          style={{
                            maxWidth: "150px",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            textTransform: "capitalize",
                          }}
                        >
                          {value?.sanstha ? (
                            <>
                              {value.sanstha.image && (
                                <img
                                  src={value.sanstha.image}
                                  alt="sanstha"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                              <br />
                              {value.sanstha.name || "—"}
                            </>
                          ) : (
                            ""
                          )}
                        </td>
                        <td>
                          {new Date(value.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="text-center align-middle">
                          {value?.user && (
                            <>
                              <img
                                src={value.user.profilePic || "/img/user.jpg"}
                                alt="user"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                              <br />
                              {`${value.user.firstName} ${value.user.lastName}`}{" "}
                              <br />{" "}
                            </>
                          )}
                          {value?.approval_required ? (
                            <small>User</small>
                          ) : (
                            <small>Super Admin</small>
                          )}
                        </td>
                        {/* <td className="text-center align-middle">
                          {value?.userId ? (
                            <>
                              {value?.userId && (
                                <img
                                  src={value.userId.profilePic}
                                  alt="user"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                              <br />
                              {value.userId.firstName} {value.userId.lastName}
                            </>
                          ) : (
                            <span> Admin</span>
                          )}
                        </td> */}

                        <td>
                          {value?.approval_required && (
                            <button
                              type="button"
                              className="btn btn-sm btn-green command-delete ml-1 mr-2"
                              data-row-id="10253"
                              onClick={() => handleacceptPost(value?._id)}
                            >
                              <i className="fa fa-check" aria-hidden="true"></i>
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-info mr-2 command-edit"
                            data-row-id="10253"
                            onClick={() => navigate(`/post/edit/${value?._id}`)}
                          >
                            <em className="fa fa-edit fa-fw"></em>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger command-delete"
                            data-row-id="10253"
                            onClick={() => handleDeletePost(value?._id)}
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
          {paginate && (
            <Paginate paginate={paginate} page={page} setPage={setPage} />
          )}
        </div>
      </div>
    </>
  );
}

export default TableFilter;
