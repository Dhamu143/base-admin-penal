import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import Select from "react-select";
import {
  appAllGetPermission,
  appAllGetTeams,
  appCreateTeams,
  appDeleteTeams,
  appUpdateTeams,
} from "../../store/teams";

function TableFilter() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const [page, setPage] = useState(params.page || 1);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    designation: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [permissionError, setPermissionError] = useState("");
  const [isDurationEnabled, setIsDurationEnabled] = useState(false);
  const [duration, setDuration] = useState({ from: "", to: "" });
  const [designationError, setDesignationError] = useState("");
  const [durationError, setDurationError] = useState("");
  const [mobileError, setMobileError] = useState("");

  const {isloder, teams : teamsList} = useSelector((state) => state.teamsReducer);
  const permissionList = useSelector((state) => state.teamsReducer.permission);
  const isdeleted = useSelector((state) => state.teamsReducer.isdeleted);

  const designationOptions = [
    { value: "president", label: "President" },
    { value: "vice president", label: "Vice President" },
    { value: "secratary", label: "Secratary" },
    { value: "joint secretary", label: "Joint secretary" },
    { value: "treasrer", label: "Treasrer" },
    { value: "joint Treasrer", label: "Joint Treasrer" },
    { value: "managing committee member ", label: "Managing committee Member" },
    { value: "managing trustee", label: "Managing Trustee" },
    { value: "trustee-secratary", label: "Trustee-Secratary" },
    { value: "trustee -joint secretary", label: "Trustee -Joint secretary" },
    { value: "trustee -treasrer", label: "Trustee -Treasrer" },
    { value: "trustee -joint treasrer", label: "Trustee -Joint Treasrer" },
    { value: "trustee", label: "Trustee" },
    { value: "executive trustee", label: "Executive Trustee" },
    { value: "chairman", label: "Chairman" },
    { value: "managing director", label: "Managing director" },
    { value: "director", label: "Director" },
    { value: "executive director", label: "Executive director" },
    { value: "nominated director", label: "Nominated director" },
  ];
  const designationIndex = designationOptions.findIndex(
    (opt) => opt.value === formData.designation
  );

  useEffect(() => {
    if (!teamsList || teamsList.length === 0) { 
      dispatch(appAllGetTeams({ page, limit: 10 }));
    }
    navigate(`/teams/${page}`);
  }, [page]);

  useEffect(() => {
    let userType = "platform";
    dispatch(appAllGetPermission(userType));
  }, []);

  useEffect(() => {
    if (isdeleted) {
      dispatch(appAllGetTeams({ page, limit: 10 }));
    }
  }, [isdeleted]);

  const handlePermissionChange = (permissionId, label) => {
    const newPermissions = {
      ...selectedPermissions,
      [permissionId]: !selectedPermissions[permissionId],
    };
    setSelectedPermissions(newPermissions);
    // Clear error if at least one permission is selected
    if (Object.values(newPermissions).some((value) => value)) {
      setPermissionError("");
    }
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  
    if (name === "mobile") {
      if (!/^\d{10}$/.test(value)) {
        setMobileError("Mobile number must be exactly 10 digits.");
      } else {
        setMobileError("");
      }
    }
  };
  

  const handleEdit = (item) => {
    console.log(item);
    setEditMode(true);
    setEditData(item);
    setFormData({
      firstName: item.firstName || "",
      lastName: item.lastName || "",
      email: item.email || "",
      mobile: item.mobile || "",
      designation: item.designation || "",
    });
    // Set selected permissions
    const initialPermissions = {};
    item.permissions.forEach((perm) => {
      initialPermissions[perm._id] = true;
    });
    setSelectedPermissions(initialPermissions);

    if (item.from && item.to) {
      setIsDurationEnabled(true);
      setDuration({
        from: item.from || "",
        to: item.to || "",
      });
    } else {
      setIsDurationEnabled(false);
      setDuration({ from: "", to: "" });
    }

    // if (item.duration) {
    //   setIsDurationEnabled(true);
    //   const [from, to] = item.duration.split("-");
    //   setDuration({
    //     from: from || "",
    //     to: to || "",
    //   });
    // } else {
    //   setIsDurationEnabled(false);
    //   setDuration({ from: "", to: "" });
    // }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedPerms = Object.entries(selectedPermissions)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      email: formData.email,
      permissions: [],
      designation: "",
      sort: 0,
      userType : "platform",
      inactive: false,
      // from: undefined,
      // to: undefined,
    };

    // Case 1: Previous Committees
    if (isDurationEnabled) {
      if (!formData.designation) {
        setDesignationError("Required ");
        return;
      }
      setDesignationError("");

      payload.designation = formData.designation;
      payload.sort = designationIndex;
      payload.permissions = [];
      payload.from = duration.from;
      payload.to = duration.to;
      payload.inactive = true;

      if (!duration.from || !duration.to) {
        setDurationError("Required");
        return;
      }
      // setDurationError("");
    } else {
      if (selectedPerms.length === 0) {
        setPermissionError("Please select at least one permission.");
        return;
      }
      setPermissionError("");

      payload.permissions = selectedPerms;
      payload.designation = formData.designation;
      payload.sort = designationIndex;
      // payload.from = undefined;
      // payload.to = undefined;
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      setMobileError(
        "Mobile number must be exactly 10 digits."
      );
      return;
    } else {
      setMobileError("");
    }

    if (editMode) {
      dispatch(appUpdateTeams({ id: editData._id, ...payload })).then(() => {
        dispatch(appAllGetTeams({ page, limit: 10 }));
      });
    } else {
      dispatch(appCreateTeams(payload))
        .then(() => dispatch(appAllGetTeams({ page, limit: 10 })))
        .catch((err) => {
          console.error("Create team error:", err);
        });
    }

    // Reset form
    setShowModal(false);
    setEditMode(false);
    setEditData(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      designation: "",
    });
    setSelectedPermissions({});
    setDuration({ from: "", to: "" });
    setPermissionError("");
    setDesignationError("");
  };

  const handleDeleteTeams = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this team?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteTeams(id)).then(() => {
          dispatch(appAllGetTeams({ page, limit: 10 }));
        });
      }
    });
  };

  return (
    <>
      {isloder && <PageLoader />}
      <div className="card dataTables_wrapper">
        <div className="card-body">
          <button
            className="btn btn-primary mb-3"
            onClick={() => {
              setEditMode(false);
              setEditData(null);
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                mobile: "",
              });
              setSelectedPermissions({});
              setIsDurationEnabled(false);
              setDuration({ from: "", to: "" });
              setShowModal(true);
            }}
          >
            Add Team
          </button>
          <div className="table-responsive bootgrid">
            <table className="table table-hover" id="bootgrid-command">
              <thead>
                <tr>
                  <th data-column-id="sender">Email</th>
                  <th>Mobile</th>
                  <th data-column-id="received" data-order="desc">
                    Permission
                  </th>
                  <th data-column-id="received" data-order="desc">
                  Previous Comittes
                  </th>
                  <th data-column-id="received" data-order="desc">
                  Designation
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Duration
                  </th>
                  <th data-column-id="received" data-order="desc">
                    Created Date
                  </th>
                  <th
                    data-column-id="commands"
                    data-formatter="commands"
                    data-sortable="false"
                  >
                    <div></div>
                  </th>
                </tr>
              </thead>

              {teamsList?.map((item) => (
                <tbody key={item._id}>
                  <tr>
                    <td>{item?.email}</td>
                    <td>{item?.mobile}</td>
                    <td
                      style={{
                        maxWidth: "250px",
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {item?.permissions.map((place, i) => (
                        <span key={i}>
                          {place.label}
                          {i < item?.permissions.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </td>

                    <td>
                        {item?.inactive ? (
                          <span className="badge badge-success">Previous Comittes</span>
                        ) : null
                        //(
                          // <span className="badge badge-danger">
                          //   Inactive
                          // </span>
                        //)
                        }
                      </td>
                    <td>{item?.designation}</td>
                    <td>{item.from}-{item.to}</td>

                    <td>
                      {item?.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-info mr-2 command-edit"
                        onClick={() => handleEdit(item)}
                      >
                        <em className="fa fa-edit fa-fw"></em>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger command-delete"
                        data-row-id="10253"
                        onClick={() => handleDeleteTeams(item?._id)}
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

      {showModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            marginTop: "35px",
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? "Edit Team" : "Add New Team"}
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => {
                    setShowModal(false);
                    setEditMode(false);
                    setEditData(null);
                    setFormData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      mobile: "",
                    });
                    setSelectedPermissions({});
                    setMobileError("");
                  }}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
              >
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>First Name </label>
                        <input
                          className="form-control"
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter first name"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Last Name </label>
                        <input
                          className="form-control"
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input
                          className="form-control"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Mobile Number </label>
                        <input
                             className={`form-control ${
                              mobileError ? "is-invalid" : ""
                            }`}
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter mobile number"
                        />
                             {mobileError && (
                          <div
                            className="invalid-feedback"
                            style={{ display: "block" }}
                          >
                            {mobileError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Designation </label>
                        <Select
                          options={designationOptions}
                          value={designationOptions.find(
                            (opt) => opt.value === formData.designation
                          )}
                          // onChange={(option) =>
                          //   setFormData((prev) => ({
                          //     ...prev,
                          //     designation: option.value,
                          //   }))
                          // }
                          onChange={(option) => {
                            setFormData((prev) => ({
                              ...prev,
                              designation: option.value,
                            }));
                            setDesignationError("");
                          }}
                          placeholder="Select Designation..."
                          isSearchable
                        />
                        {isDurationEnabled && designationError && (
                          <div className="text-danger mt-2">
                            {designationError}
                          </div>
                        )}
                      </div>
                      {/* <div className="form-group">
                        <label>Designation </label>
                        <Select
                          options={designationOptions}
                          value={designationOptions.find(
                            (opt) => opt.value === formData.designation
                          )}
                          onChange={(option) =>
                            setFormData((prev) => ({
                              ...prev,
                              designation: option.value,
                            }))
                          }
                          placeholder="Select Designation..."
                          isSearchable
                        />
                      </div> */}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="font-weight-bold mb-3">
                      Permissions *
                    </label>
                    <div
                      className="permissions-grid"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "10px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        borderRadius: "4px",
                      }}
                    >
                      {permissionList?.map((permission) => (
                        <div
                          key={permission._id}
                          className="custom-control custom-checkbox"
                        >
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`permission-${permission._id}`}
                            checked={
                              selectedPermissions[permission._id] || false
                            }
                            onChange={() =>
                              handlePermissionChange(
                                permission._id,
                                permission.label
                              )
                            }
                          />
                          <label
                            className="custom-control-label"
                            htmlFor={`permission-${permission._id}`}
                            style={{
                              cursor: "pointer",
                              padding: "2px 12px",
                            }}
                          >
                            {permission.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {permissionError && (
                      <div className="text-danger mt-2">{permissionError}</div>
                    )}
                  </div>
                  <div className="form-group d-flex align-items-center">
                    <label className="mr-3 mb-0" htmlFor="durationSwitch">
                      Previous Comittes
                    </label>
                    <div className="custom-control custom-switch">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="durationSwitch"
                        checked={isDurationEnabled}
                        onChange={() => setIsDurationEnabled((prev) => !prev)}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="durationSwitch"
                      ></label>
                    </div>
                  </div>
                  {isDurationEnabled && (
                    <>
                      {durationError && (
                        <div className="text-danger mt-2">{durationError}</div>
                      )}
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="durationFrom">From (Year)</label>
                            <input
                              type="number"
                              className="form-control"
                              id="durationFrom"
                              min="1900"
                              max="2099"
                              step="1"
                              value={duration.from}
                              onChange={(e) => {
                                const val = e.target.value
                                  .replace(/[^0-9]/g, "")
                                  .slice(0, 4);
                                setDuration((prev) => ({
                                  ...prev,
                                  from: val,
                                }));
                                setDurationError("");
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="durationTo">To (Year)</label>
                            <input
                              type="number"
                              className="form-control"
                              id="durationTo"
                              min="1900"
                              max="2099"
                              step="1"
                              // placeholder="enter year"
                              value={duration.to}
                              onChange={(e) => {
                                const val = e.target.value
                                  .replace(/[^0-9]/g, "")
                                  .slice(0, 4);
                                setDuration((prev) => ({
                                  ...prev,
                                  to: val,
                                }));
                                setDurationError("");
                              }}
                            />
                          </div>
                        </div>
                        {/* {durationError && (
                        <div className="text-danger mt-2">{durationError}</div>
                      )} */}
                      </div>
                    </>
                  )}
                  <div className="modal-footer">
                    <button
                      className="btn btn-labeled btn-success"
                      type="submit"
                    >
                      <span className="btn-label">
                        <i className="fa fa-check"></i>
                      </span>
                      {editMode ? "Update" : "Submit"}
                    </button>
                    <button
                      className="btn btn-labeled btn-secondary ml-2"
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditMode(false);
                        setEditData(null);
                        setFormData({
                          firstName: "",
                          lastName: "",
                          email: "",
                          mobile: "",
                        });
                        setSelectedPermissions({});
                        setMobileError("");
                      }}
                    >
                      <span className="btn-label">
                        <i className="fa fa-times"></i>
                      </span>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TableFilter;
