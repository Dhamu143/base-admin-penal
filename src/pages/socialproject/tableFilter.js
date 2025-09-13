import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import Select from "react-select";
import { appGetAllSanstha } from "../../store/sanstha";
import { appAllGetHubs } from "../../store/hubs";
import { appDeletePost, appGetAllPost } from "../../store/post";
import { appDeleteProject, appGetAllProject } from "../../store/socialproject";
import { appGetAllProjectCategory } from "../../store/projectcategory";
import { appAllGetSocialProjectBooking } from "../../store/socialprojectbooking";

function TableFilter() {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const isloder = useSelector((state) => state?.socialprojectReducer.isloder);
  const paginate = useSelector((state) => state.socialprojectReducer.paginate);
  const isdeleted = useSelector(
    (state) => state?.socialprojectReducer?.isdeleted
  );
  const { hub } = useSelector((state) => state.hubReducer);
  const { sanstha } = useSelector((state) => state.sansthaReducer);
  const [page, setPage] = useState(params.page || 1);
  const [selectedFilters, setSelectedFilters] = useState({
    hub: null,
    sanstha: null,
    category: null,
    startDate: null,
    endDate: null,
    status: "",
  });
  const [error, setError] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const socialproject = useSelector(
    (state) => state.socialprojectReducer.socialproject
  );
  const projectcategory = useSelector(
    (state) => state?.projectcategoryReducer?.projectcategory
  );

  useEffect(() => {
    dispatch(appGetAllProject({ page: 1, limit: 10 }));
    navigate(`/social-project/${page}`);
  }, [page, dispatch]);

  // useEffect(() => {
  //   dispatch(appGetAllPost({ page: 1, limit: 10 }));
  // }, []);

  useEffect(() => {
    dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
    dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
    // dispatch(appGetAllPost({ page: 1, limit: 10 }));
    dispatch(appGetAllProjectCategory({ page: 1, limit: 1000 }));
  }, [page]);

  useEffect(() => {
    if (isdeleted) {
      dispatch(appGetAllProject({ page: 1, limit: 10 }));
    }
  }, [isdeleted, dispatch, page]);

  const handleDeletePost = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this social project?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteProject(id)).then(() => {
          dispatch(appGetAllProject({ page: 1, limit: 10 }));
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
    dispatch(appGetAllProject(searchParams));
    navigate(`/social-project/${page}`);
  }, [page, activeFilters]);

  const handleSearch = useCallback(() => {
    if (selectedFilters.startDate && !selectedFilters.endDate) {
      setError("Please select an end date.");
      return;
    }

    setError("");
    const filters = {};
    if (selectedFilters.hub) {
      filters.hub = selectedFilters.hub.value;
    }
    if (selectedFilters.sanstha) {
      filters.sanstha = selectedFilters.sanstha.value;
    }
    if (selectedFilters.category) {
      filters.category = selectedFilters.category.value;
    }
    if (selectedFilters.startDate) {
      filters.startDate = selectedFilters.startDate;
    }
    if (selectedFilters.endDate) {
      filters.endDate = selectedFilters.endDate;
    }
    if (selectedFilters.status) {
      filters.status = selectedFilters.status;
    }
    setActiveFilters(filters);
    setPage(1);
  }, [selectedFilters]);

  // const handleShowSocialProjectDetails = async (projectId) => {
  //   try {
  //     // Clear the previous data while loading
  //     setSelectedProject(null);
  //    const res= await dispatch(appGetAllProject({page:1, limit: 10, projectId:projectId}))
  //     const response = await dispatch(
  //       appAllGetSocialProjectBooking({ page: 1, limit: 1000, projectId })
  //     ).unwrap();

  //     if (response?.data?.length > 0) {
  //       setSelectedProject(response.data[0]);
  //       setShowProjectDetailsModal(true);
  //     } else {
  //       setSelectedProject({});
  //       setShowProjectDetailsModal(false);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching project details:", error);
  //   }
  // };

  //   const handleShowSocialProjectDetails = async (projectId) => {
  //     try {
  //       // Reset state while loading
  //       setSelectedProject(null);

  //       // Fetch project details
  //       const projectRes = await dispatch(
  //         appGetAllProject({ projectId })
  //       ).unwrap();

  //       const projectData =
  //         projectRes?.data?.length > 0 ? projectRes.data[0] : null;
  // console.log("projectData", projectData)
  //       // Fetch payment history
  //       const bookingRes = await dispatch(
  //         appAllGetSocialProjectBooking({ page: 1, limit: 1000, projectId })
  //       ).unwrap();
  //       console.log("bookingRes", bookingRes)

  //       // const bookingData =
  //       //   bookingRes?.data?.length > 0 ? bookingRes.data : null;

  //       // Merge the data
  //       const mergedData = {
  //         project: projectData || {},
  //         payments: bookingRes?.data || [],
  //       };
  // console.log("mergedData", mergedData)
  //       setSelectedProject(mergedData);
  //       console.log("selectedProject", selectedProject)
  //       setShowProjectDetailsModal(true);
  //     } catch (error) {
  //       console.error("Error fetching project details:", error);
  //     }
  //   };
  const handleShowSocialProjectDetails = async (projectId) => {
    try {
      // Reset previous selection
      setSelectedProject(null);

      // Find the project in existing data
      const projectData = socialproject.data.find(
        (project) => project._id === projectId
      );

      if (!projectData) {
        console.error("Project not found for ID:", projectId);
        return;
      }

      // console.log("projectData", projectData);

      // Fetch payment history
      const bookingRes = await dispatch(
        appAllGetSocialProjectBooking({ page: 1, limit: 1000, projectId })
      ).unwrap();

      const paymentData = bookingRes?.data || [];

      // Merge the data
      const selectedData = {
        project: projectData,
        payments: paymentData,
      };

      // Update state
      setSelectedProject(selectedData);

      // Log after setting using a timeout to reflect updated state
      setTimeout(() => {
        console.log("selectedProject (updated):", selectedData);
      }, 0);

      // Show modal
      setShowProjectDetailsModal(true);
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const handleCloseModal = () => {
    setShowProjectDetailsModal(false);
    setSelectedProject(null);
  };

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
              <div className="form-group">
                <label>Category</label>
                <Select
                  options={
                    Array.isArray(projectcategory?.data)
                      ? projectcategory?.data.map((category) => ({
                          value: category._id,
                          label: category.name,
                        }))
                      : []
                  }
                  onChange={(option) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      category: option,
                    }));
                  }}
                  styles={{
                    option: (provided) => ({
                      ...provided,
                      textTransform: "capitalize",
                    }),
                  }}
                  value={selectedFilters.category}
                  placeholder="Select category.."
                  getOptionLabel={(option) => option?.name || option?.label}
                  getOptionValue={(option) => option?._id || option?.value}
                />
              </div>
            </div>

            {/* <div className="col-md-2">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  max={new Date().toISOString().split("T")[0]}
                  value={selectedFilters.startDate || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedFilters((prev) => ({
                      ...prev,
                      startDate: value,
                      // Clear endDate if it's before the new startDate
                      endDate:
                        prev.endDate && prev.endDate < value
                          ? ""
                          : prev.endDate,
                    }));
                  }}
                />
              </div>
            </div> */}

            {/* <div className="col-md-2">
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  className="form-control"
                  min={selectedFilters.startDate || ""}
                  max={new Date().toISOString().split("T")[0]}
                  value={selectedFilters.endDate || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedFilters((prev) => ({
                      ...prev,
                      endDate: value,
                    }));
                    if (value) {
                      setError("");
                    }
                  }}
                />
                {error && <span className="text-danger">{error}</span>}
              </div>
            </div> */}

            <div className="col-md-2">
              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-control"
                  name="status"
                  value={selectedFilters.status}
                  onChange={(e) => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }));
                  }}
                >
                  <option value="">Select status</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
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
                    category: null,
                    status: "",
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
                  <th>Project Image</th>
                  <th>Project Title</th>
                  {/* <th>Description </th> */}
                  <th>Category </th>
                  <th>Community</th>
                  <th>Sanstha</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th
                    data-column-id="commands"
                    data-formatter="commands"
                    data-sortable="false"
                  >
                    <div></div>
                  </th>
                </tr>
              </thead>
              {socialproject?.data &&
                socialproject?.data.map((value, index) => {
                  return (
                    <tbody key={index}>
                      <tr>
                        <td>
                          {" "}
                          <img
                            src={value.file}
                            alt="project"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                            }}
                          />
                        </td>
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
                        <td style={{ textTransform: "capitalize" }}>
                          {value.category.name}
                        </td>
                        <td>
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
                              <img
                                src={value?.sanstha?.image}
                                alt="sanstha"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                }}
                              />
                              <br />
                              {value?.sanstha?.name}
                            </>
                          ) : null}
                        </td>
                        <td>
                          {" "}
                          {new Date(value.startDate).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              year: "numeric",
                              month: "short",
                            }
                          )}
                        </td>
                        <td>
                          {value.endDate
                            ? new Date(value.endDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : null}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              value?.status === "Upcoming"
                                ? "badge-warning"
                                : value?.status === "Active"
                                ? "badge-success"
                                : value?.status === "Completed"
                                ? "badge-danger"
                                : "badge-light"
                            }`}
                          >
                            {value?.status || "N/A"}
                          </span>
                        </td>

                        {/* <td>
                          {value?.status === "Upcoming" && (
                            <span className="badge badge-primary">
                              Upcoming
                            </span>
                          )}
                          {value?.status === "Active" && (
                            <span className="badge badge-success">Active</span>
                          )}
                          {value?.status === "Completed" && (
                            <span className="badge badge-primary">
                              Completed
                            </span>
                          )}
                        </td> */}
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-info mr-2 command-edit"
                            data-row-id="10253"
                            onClick={() =>
                              navigate(`/social-project/edit/${value?._id}`)
                            }
                          >
                            <em className="fa fa-edit fa-fw"></em>
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleShowSocialProjectDetails(value?._id);
                            }}
                            className="btn btn-sm btn-primary mr-2"
                            title="Details"
                          >
                            <em className="fa fa-eye fa-fw"></em>
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

      {showProjectDetailsModal && selectedProject && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            marginTop: "35px",
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content shadow-lg rounded-3">
              {/* Modal Header */}
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Project Payment Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseModal}
                ></button>
              </div>

              {/* Modal Body */}
             <div
                className="modal-body"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                {/* Project Title */}
                <div className="text-center mb-4">
                  <h4 className="fw-bold text-primary">
                    <strong>Social Project:</strong>{" "}
                    {selectedProject.project?.title}
                  </h4>
                  <div
                    style={{ flex: 1, fontSize: "16px" }}
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedProject.project?.description ||
                        "<i>No description available</i>",
                    }}
                  />
                  {/* <p className="text-muted"  dangerouslySetInnerHTML={{
                        __html:
                          hubDetails?.description ||
                          "<i>No description available</i>",
                      }}>
                    {selectedProject.project?.description}
                  </p> */}
                </div>

                {/* Hub, Sanstha, and User Info */}
                <div className="row text-center mb-4">
                  {/* Hub */}
                  <div className="col-md-6 mb-3">
                    {selectedProject?.project?.hub && (
                      <>
                        <img
                          src={selectedProject?.project.hub?.image}
                          alt="Hub Logo"
                          className="rounded-circle border border-2"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                        <p className="fw-bold mt-2 mb-0">
                          {selectedProject?.project?.hub?.name}
                        </p>
                        <small className="text-muted">Community</small>
                      </>
                    )}
                  </div>

                  {/* Sanstha */}
                  <div className="col-md-6 mb-3">
                    {selectedProject?.project?.sanstha && (
                      <>
                        <img
                          src={selectedProject?.project?.sanstha?.image}
                          alt="Sanstha Logo"
                          className="rounded-circle border border-2"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                        <p className="fw-bold mt-2 mb-0">
                          {selectedProject?.project?.sanstha?.name}
                        </p>
                        <small className="text-muted">Sanstha</small>
                      </>
                    )}
                  </div>

                  {/* User */}
                  {/* <div className="col-md-4 mb-3">
                    <img
                      src={
                        selectedProject.userId?.profilePic
                          ? selectedProject.userId?.profilePic
                          : "/img/user.jpg"
                      }
                      alt="User"
                      className="rounded-circle border border-2"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                    <p className="fw-bold mt-2 mb-0">
                      {selectedProject.userId?.firstName}{" "}
                      {selectedProject.userId?.lastName}
                    </p>
                    <small className="text-muted">
                      {selectedProject.userId?.mobile}
                    </small>
                  </div> */}
                </div>

                {/* Payment Screenshot & Status */}
                <div className="row align-items-center  p-3 mb-3">
                  {/* Payment Screenshot */}
                  <div className="col-md-6 mb-3 mb-md-0 text-center">
                    {selectedProject?.project?.file?.startsWith("http") ? (
                      <>
                        <strong className="d-block mb-2">
                          Payment Screenshot:
                        </strong>

                        <img
                          src={selectedProject?.project?.file}
                          alt="Payment Screenshot"
                          className="img-fluid "
                          style={{ maxHeight: "100px", objectFit: "contain" }}
                        />
                      </>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </div>
                  <div className="col-md-6 text-center">
                    <span className="d-block mb-2">
                      Category : {selectedProject?.project?.category?.name}
                    </span>
                  </div>
                  {/* Payment Status */}
                  {/* <div className="col-md-6 text-center">
    <strong className="d-block mb-2">Status:</strong>
    <span
      className={`badge px-4 py-2 fs-6 ${
        selectedProject.status === "Accepted"
          ? "bg-success"
          : selectedProject.status === "Pending"
          ? "bg-warning text-dark"
          : "bg-secondary"
      }`}
    >
      {selectedProject.status || "N/A"}
    </span>
  </div> */}
                </div>

                {/* Payment Table */}
                {selectedProject?.payments?.length > 0 && (
                  <div className="table-responsive mt-4">
                    <h6 className="fw-bold text-primary mb-3">
                      Payment History
                    </h6>
                    <table className="table table-bordered table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>User</th>
                          <th>Amount</th>
                          <th>Mode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProject.payments &&
                          selectedProject.payments.length > 0 &&
                          selectedProject.payments.map((payment, index) => (
                            <tr key={index}>
                              <td>
                                {new Date(
                                  payment.resolveDate
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td>
                                <img
                                  src={
                                    payment.userId?.profilePic ||
                                    "/img/user.jpg"
                                  }
                                  alt="user"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                  }}
                                />
                                <br />
                                {payment.userId.firstName}{" "}
                                {payment.userId.lastName}
                                <br />
                                <small>{payment.userId.mobile}</small>
                              </td>
                              <td>₹{payment.amount}</td>
                              <td>
                                {" "}
                                {payment.isOffline ? "Offline" : "Online"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary px-4"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TableFilter;
