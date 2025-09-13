import { useFormik } from "formik";
import * as Yup from "yup";
import {
  appCreateSponsor,
  appDeleteSponsor,
  appGetAllSponsor,
  appUpdateSponsor,
  uploadSponsorImage,
} from "../../store/sponsor";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Paginate from "../pagination/paginate";
import Select from "react-select";
import ImageUpload from "../ImageUpload";
import swal from "sweetalert";

function Sponsor({ sansthaDetails, hubDetails,users, hideSansthaField,isHubPage , sponsor, sponsorList ,sponsorpage ,setSponsorPage}) {
  // console.log(sansthaDetails, "sansthaDetails");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const params = useParams();
  const { id } = useParams();
  // console.log(id, "id");
  // const [page, setPage] = useState(params.page || 1);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [editSponsorMode, setEditSponsorMode] = useState(false);
  const [editSponsorId, setEditSponsorId] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
  const sponsorpaginate = useSelector((state) => state.sponsorReducer.paginate);
  // const users = useSelector((state) => state?.usersReducer.users);
//  const sponsor = useSelector((state) => state.sponsorReducer.sponsor);
  // console.log(sponsor)

//   useEffect(() => {
//     if (isHubPage && hubDetails) {
//          dispatch(appGetAllSponsor({ page: page, limit: 10, hub: hubDetails?._id , admin: true}));
//     } else if (!isHubPage && sansthaDetails) {
//       console.log(sansthaDetails, "sansthaDetails");
//         dispatch(appGetAllSponsor({ page: page, limit: 10, sanstha: id }));
//     }

// }, [dispatch, page, isHubPage, hubDetails?._id]);


  // Formik validation schema for sponsor
  const sponsorValidationSchema = Yup.object({
    // name: Yup.string().required("Name is required"),
    // description: Yup.string().required("Description is required"),
    // hub: Yup.string().required("Hub is required"),
    // sanstha: Yup.string().required("Sanstha is required"),
    // image: Yup.string().required("Required"),
    image: Yup.string()
      .required("Image is required")
      .test("is-valid-url", "Invalid image", (value) => {
        return value && value !== "/img/default-placeholder.jpg";
      }),
  });

  // Formik form initialization for sponsor
  const sponsorFormik = useFormik({
    initialValues: {
      name: "",
      description: "",
      sanstha: id,
      hub: "",
      image: "",
      user: "",
      startDate: "",
      endDate: "",
    },
    validationSchema: sponsorValidationSchema,
    onSubmit: (values) => {
      console.log(values);
      const temp_obj = {
        name: values?.name,
        image: values?.image,
        // sanstha:
        //   typeof values?.sanstha === "object"
        //     ? values?.sanstha._id
        //     : values?.sanstha,
        hub: typeof values?.hub === "object" ? values?.hub._id : values?.hub,
        user: values?.user,
        startDate: values.startDate,
        endDate: values.endDate,
        description: values?.description,
        navigate: navigate,
      };

      if (!isHubPage) {
        temp_obj.sanstha =
          typeof values?.sanstha === "object"
            ? values?.sanstha._id
            : values?.sanstha;
      }
      // Remove empty fields
      const filtered_obj = Object.fromEntries(
        Object.entries(temp_obj).filter(
          ([key, value]) =>
            value !== "" &&
            value !== null &&
            value !== undefined &&
            key !== "navigate"
        )
      );
      filtered_obj.navigate = navigate;
      // if (editSponsorMode && editSponsorId) {
      //   dispatch(appUpdateSponsor({ ...filtered_obj, id: editSponsorId }))
      //   .then(() => {
      //     dispatch(appGetAllSponsor({ page: 1, limit: 10, hub: hubDetails?._id , admin: true}));
      //     dispatch(appGetAllSponsor({ page: 1, limit: 10, sanstha: sansthaDetails?._id }));
      //   })
      // } else {
      //   dispatch(appCreateSponsor(filtered_obj))
      //   .then(() => {
      //     dispatch(appGetAllSponsor({ page: 1, limit: 10, hub: hubDetails?._id , admin: true}));
      //     dispatch(appGetAllSponsor({ page: 1, limit: 10, sanstha: sansthaDetails?._id }));
      //   })
      // }
      if (editSponsorMode && editSponsorId) {
        dispatch(appUpdateSponsor({ ...filtered_obj, id: editSponsorId }))
          .then(() => {
            if (isHubPage && hubDetails?._id) {
              dispatch(appGetAllSponsor({ page: 1, limit: 10, hub: hubDetails?._id, admin: true }));
            } else if (!isHubPage && sansthaDetails?._id) {
              dispatch(appGetAllSponsor({ page: 1, limit: 10, sanstha: id }));
            }
          });
      } else {
        dispatch(appCreateSponsor(filtered_obj))
          .then(() => {
            if (isHubPage && hubDetails?._id) {
              dispatch(appGetAllSponsor({ page: 1, limit: 10, hub: hubDetails?._id, admin: true }));
            } else if (!isHubPage && sansthaDetails?._id) {
              dispatch(appGetAllSponsor({ page: 1, limit: 10, sanstha: id }));
            }
          });
      }
      
      setShowSponsorModal(false);
      setEditSponsorMode(false);
      setEditSponsorId(null);
      sponsorFormik.resetForm();
    },
  });

  const handleEditSponsor = (sponsor) => {
    console.log(sponsor, "sponsor");
    setEditSponsorMode(true);
    setEditSponsorId(sponsor._id);
    setShowSponsorModal(true);
    sponsorFormik.setValues({
      name: sponsor.name,
      description: sponsor.description,
      hub: hubDetails?._id,
      sanstha: id,
      image: sponsor.image,
      user: sponsor.user._id,
    });
    if (sponsor?.startDate) {
      const date = new Date(sponsor.startDate);
      setStartDate(date);
      sponsorFormik.setFieldValue(
        "startDate",
        date.toISOString().split("T")[0]
      );
    }
    if (sponsor?.endDate) {
      const date = new Date(sponsor.endDate);
      setEndDate(date);
      sponsorFormik.setFieldValue("endDate", date.toISOString().split("T")[0]);
    }
  };

  const handleAddNewSponsor = () => {
    setEditSponsorMode(false);
    setEditSponsorId(null);
    sponsorFormik.resetForm();
    sponsorFormik.setValues({
      name: "",
      description: "",
      hub: hubDetails?._id,
      sanstha: id,
      image: "",
    });
    setShowSponsorModal(true);
  };
  const handleDeleteSponsor = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this sponsor?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteSponsor(id));
      }
    });
  };
  return (
    <div>
      <div className="mb-3 mr-2 d-flex justify-content-between align-items-center">
        <h4 className="ml-2">Total Sponsors: {sponsorList?.length || 0}</h4>
        <button className="btn btn-primary" onClick={handleAddNewSponsor}>
          <i className="far fa-plus"></i> Add New Sponsor
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="">
            <tr>
              <th>Sr. No.</th>
              <th>Sponsor</th>
              <th>User</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sponsor?.length > 0 ? (
              sponsor.map((sponsor, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={sponsor.image}
                      alt="sponsor"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                      }}
                    />
                    <br />
                    {sponsor?.name}{" "}
                  </td>
                  <td>
                    {sponsor?.user?.firstName} {sponsor?.user?.lastName}
                  </td>
                  {/* <td>{sponsor?.startDate}-{sponsor?.endDate}</td> */}
                  <td>
                    {" "}
                    {new Date(sponsor?.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(sponsor?.endDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary mr-2"
                      title="Edit"
                      onClick={() => handleEditSponsor(sponsor)}
                    >
                      <i className="far fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      title="Delete"
                      onClick={() => handleDeleteSponsor(sponsor?._id)}
                    >
                      <i className="far fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No sponsors data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sponsorpaginate && (
        <Paginate paginate={sponsorpaginate} page={sponsorpage} setPage={setSponsorPage} />
      )}

      {/* Sponsor Creation Modal */}
      {showSponsorModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            marginTop: "35px",
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editSponsorMode ? "Edit Sponsor" : "Create New Sponsor"}
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => {
                    setShowSponsorModal(false);
                    setEditSponsorMode(false);
                    setEditSponsorId(null);
                    sponsorFormik.resetForm();
                  }}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
              >
                <form onSubmit={sponsorFormik.handleSubmit}>
                  <div className="row">
                    {!hideSansthaField && (
                      <div className="col-md-6">
                      <div className="form-group">
                        <label>Sanstha *</label>
                        <Select
                          name="_id"
                          options={[
                            {
                              value: id,
                              label: sansthaDetails?.name,
                            },
                          ]}
                          onChange={(option) => {
                            sponsorFormik.setFieldValue(
                              "sanstha",
                              option?.value
                            );
                          }}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          value={[
                            {
                              value: id,
                              label: sansthaDetails?.name,
                            },
                          ]}
                          placeholder="Select.."
                          isDisabled={true}
                        />
                        {sponsorFormik.touched.hub &&
                        sponsorFormik.errors.hub ? (
                          <div style={{ color: "red" }}>
                            {sponsorFormik.errors.hub}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    )}
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Community *</label>
                        <Select
                          name="_id"
                          options={[
                            {
                              value: hubDetails?._id,
                              label: hubDetails?.name,
                            },
                          ]}
                          onChange={(option) => {
                            sponsorFormik.setFieldValue("hub", option?.value);
                          }}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          value={{
                            value: hubDetails?._id,
                            label: hubDetails?.name || "No Hub Name",
                          }}
                          placeholder="Select.."
                          isDisabled={true}
                        />
                        {sponsorFormik.touched.hub &&
                        sponsorFormik.errors.hub ? (
                          <div style={{ color: "red" }}>
                            {sponsorFormik.errors.hub}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <ImageUpload
                        uploadFunction={uploadSponsorImage}
                        fieldName="image"
                        value={sponsorFormik.values.image}
                        onChange={(value) =>
                          sponsorFormik.setFieldValue("image", value.url)
                        }
                        error={
                          sponsorFormik.touched.image &&
                          sponsorFormik.errors.image
                            ? sponsorFormik.errors.image
                            : null
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Select Users</label>
                        <Select
                          options={
                            Array.isArray(users)
                              ? users.map((user) => ({
                                  value: user._id,
                                  label: user.firstName,
                                }))
                              : []
                          }
                          onChange={(option) => {
                            sponsorFormik.setFieldValue("user", option?.value);

                            const selectedUser = Array.isArray(users)
                              ? users.find((u) => u._id === option?.value)
                              : null;
                            if (selectedUser) {
                              sponsorFormik.setFieldValue(
                                "name",
                                selectedUser.firstName
                              );
                            }
                          }}
                          value={
                            Array.isArray(users)
                              ? users
                                  .filter(
                                    (user) =>
                                      user._id === sponsorFormik.values.user
                                  )
                                  .map((user) => ({
                                    value: user._id,
                                    label: user.firstName,
                                  }))[0] || null
                              : null
                          }
                          placeholder="Select User..."
                        />

                        {/* {sponsorFormik.touched.user && sponsorFormik.errors.user ? (
                        <div style={{ color: "red" }}>
                         {sponsorFormik.errors.user}
                         </div>
                     : null} */}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          className="form-control"
                          name="name"
                          type="text"
                          onChange={sponsorFormik.handleChange}
                          onBlur={sponsorFormik.handleBlur}
                          value={sponsorFormik.values.name}
                        />
                        {sponsorFormik.touched.name &&
                        sponsorFormik.errors.name ? (
                          <div style={{ color: "red" }}>
                            {sponsorFormik.errors.name}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="row" style={{ padding: "0 0 15px 0" }}>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Start Date </label>
                        <input
                          type="date"
                          className="form-control"
                          // value={
                          //   sponsorFormik.values.startDate
                          //     ? sponsorFormik.values.startDate
                          //     : startDate ? startDate.toISOString().split("T")[0] : ""
                          // }
                          value={sponsorFormik.values.startDate || ""}
                          onChange={(e) => {
                            if (!e.target.value) {
                              sponsorFormik.setFieldValue("startDate", "");
                              sponsorFormik.setFieldValue("endDate", "");
                              setStartDate(null);
                              setEndDate(null);
                              return;
                            }
                            const dateValue = new Date(e.target.value);
                            if (isNaN(dateValue.getTime())) {
                              return;
                            }
                            setStartDate(dateValue);
                            let dateOnly = dateValue
                              .toISOString()
                              .split("T")[0];
                            sponsorFormik.setFieldValue("startDate", dateOnly);

                            const nextYear = new Date(dateValue);
                            nextYear.setFullYear(nextYear.getFullYear() + 1);
                            setEndDate(nextYear);
                            sponsorFormik.setFieldValue(
                              "endDate",
                              nextYear.toISOString().split("T")[0]
                            );
                          }}
                        />
                        {/* {sponsorFormik.touched.startDate && sponsorFormik.errors.startDate ? (
                      <div style={{ color: "red" }}>
                        {sponsorFormik.errors.startDate}
                      </div>
                    ) : null} */}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>End Date </label>
                        <input
                          type="date"
                          className="form-control"
                          // value={
                          //   sponsorFormik.values.endDate
                          //     ? sponsorFormik.values.endDate
                          //     : endDate ? endDate.toISOString().split("T")[0] : ""
                          // }
                          value={sponsorFormik.values.endDate || ""}
                          readOnly
                        />
                        {/* {sponsorFormik.touched.endDate && sponsorFormik.errors.endDate ? (
                      <div style={{ color: "red" }}>
                        {sponsorFormik.errors.endDate}
                      </div>
                    ) : null} */}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label>Description *</label>
                        <textarea
                          className="form-control"
                          name="description"
                          onChange={sponsorFormik.handleChange}
                          onBlur={sponsorFormik.handleBlur}
                          value={sponsorFormik.values.description}
                          rows="3"
                        />
                        {sponsorFormik.touched.description &&
                        sponsorFormik.errors.description ? (
                          <div style={{ color: "red" }}>
                            {sponsorFormik.errors.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-labeled btn-success"
                      type="submit"
                    >
                      <span className="btn-label">
                        <i className="fa fa-check"></i>
                      </span>
                      {editSponsorMode ? "Update" : "Create"}
                    </button>
                    <button
                      className="btn btn-labeled btn-secondary ml-2"
                      type="button"
                      onClick={() => {
                        setShowSponsorModal(false);
                        setEditSponsorMode(false);
                        setEditSponsorId(null);
                        sponsorFormik.resetForm();
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
    </div>
  );
}
export default Sponsor;
