import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import {
  appCreateMembership,
  appDeleteMembership,
  appGetSansthaById,
  appUpdateMembership,
  appUpdateSanstha,
} from "../../store/sanstha";
import swal from "sweetalert";
import { toast } from "react-toastify";

function MembershipPaymentdetailsTab({
  sansthaDetails,
}) {
  // console.log(sansthaDetails);
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  // const params = useParams();
  // const [page, setPage] = useState(params.page || 1);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editSansthaId, setEditSansthaId] = useState(null);
  const isdeleted = useSelector((state) => state?.sansthaReducer?.isdeleted);

  // useEffect(() => {
  //   // dispatch(appGetAllSanstha({page:1, limit:1000, sanstha: id }));
  //   dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
  // }, [dispatch, page]);

  const Formik = useFormik({
    initialValues: {
      membershipType: "",
      membershipfee: "",
      honoraryReason: "",
      upi_id: sansthaDetails?.upi_id,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
       membershipType: Yup.string().required("Select duration"),
       // membershipfee: Yup.number().required("Enter fee"),
      upi_id: Yup.string().when([], {
        is: () => !showModal, 
        then: Yup.string()
          .required("UPI ID is required")
          .matches(/^[\w.-]+@[\w.-]+$/, "Enter a valid UPI ID"),
        otherwise: Yup.string().notRequired(),
      }),
      honoraryReason: Yup.string().when("membershipType", {
        is: (val) =>
          val === "Honorary Voting Right" || val === "Honorary Non Voting Right",
        then: Yup.string().required("Honorary reason is required"),
        otherwise: Yup.string().notRequired(),
      }),
        membershipfee: Yup.number().when("membershipType", {
    is: (val) =>
      val !== "Honorary Voting Right" &&
      val !== "Honorary Non Voting Right",
    then: Yup.number().required("Membership fee is required"),
    otherwise: Yup.number().notRequired(),
  }),
    }),
    // onSubmit: (values) => {
    //   console.log(values);

    //   const membershipPayload = {
    //     membershipType: values.membershipType,
    //     membershipfee: values.membershipfee,
    //   };
    // console.log(membershipPayload)
    //   const basePayload = {
    //     sansthaId: sansthaDetails?._id,
    //     membership: membershipPayload,
    //   };
    // console.log(basePayload)
    //   if (editMode && editSansthaId ) {
    //     const payload = {
    //       ...basePayload,
    //       membershipId: editSansthaId,
    //     };
    // console.log(payload)
    //     dispatch(appUpdateMembership(payload)).then(() => {
    //       dispatch(appGetSansthaById(sansthaDetails?._id));
    //     });
    //   } else {
    //     console.log(basePayload)
    //     dispatch(appCreateMembership(basePayload)).then(() => {
    //       dispatch(appGetSansthaById(sansthaDetails?._id));
    //      });
    //   }

    //   setShowModal(false);
    //   setEditMode(false);
    //   setEditSansthaId(null);
    //   // setEditMembershipId(null);
    //   Formik.resetForm();
    // }

    onSubmit: async (values) => {
      const selectedType = values.membershipType;
      
      const existingTypes =
        sansthaDetails?.membership?.map((m) => m.membershipType) || [];
      const isDuplicate = existingTypes.includes(selectedType);

      if (!editMode && isDuplicate) {
        toast.error(`${selectedType} membership already exists.`);
        return;
      }
      const isHonorary =
  selectedType === "Honorary Voting Right" ||
  selectedType === "Honorary Non Voting Right";
      const membershipPayload = {
        membershipType: selectedType,
        membershipfee: values.membershipfee,
        ...(isHonorary
          ? { honoraryReason: values.honoraryReason  }
          : { membershipfee: values.membershipfee }),
      };
   console.log(membershipPayload, "membershipPayload")
      const basePayload = {
        sansthaId: sansthaDetails?._id,
        membership: membershipPayload,
      };
      console.log(basePayload, "basePayload");
      try {
        if (editMode && editSansthaId) {
          const payload = {
            ...basePayload,
            membershipId: editSansthaId,
          };
          console.log(payload, "payload");

          dispatch(appUpdateMembership(payload)).then(() => {
            dispatch(appGetSansthaById(sansthaDetails?._id));
          });
        } else {
          console.log(basePayload);
          dispatch(appCreateMembership(basePayload)).then(() => {
            dispatch(appGetSansthaById(sansthaDetails?._id));
          });
        }

        // Refresh data after success
        //dispatch(appGetSansthaById(sansthaDetails?._id));

        // Reset modal + form
        setShowModal(false);
        setEditMode(false);
        setEditSansthaId(null);
        Formik.resetForm();
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        console.error("Membership create/update error:", error);
      }
    },
  }); 

  // useEffect(() => {
  //   if (sansthaDetails) {
  //     // const selectedLanguage = Array.isArray(languageData) ? languageData.find(l => l._id === id) : languageData;
  //     if (sansthaDetails) {
  //       Formik.setFieldValue("upi_id", sansthaDetails.upi_id);
  //     }
  //   }
  // }, [sansthaDetails]);

  const handleEditMembership = (sanstha) => {
    console.log(sanstha);
    setEditMode(true);
    setEditSansthaId(sanstha?._id || null);

    Formik.setValues({
      membershipType: sanstha?.membershipType || "",
      membershipfee: sanstha?.membershipfee || "",
      honoraryReason: sanstha.honoraryReason || "",
    });

    setShowModal(true);
  };

  // useEffect(() => {
  //   if (isdeleted) {
  //     dispatch(appGetSansthaById(sansthaDetails?._id));
  //   }
  // }, [isdeleted, dispatch]);

  const handleDeleteMembership = (membershipId) => {
    console.log(membershipId);
    swal({
      title: "Are you sure?",
      text: "You want to delete this Membership?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(
          appDeleteMembership({
            sansthaId: sansthaDetails?._id,
            membershipId,
          })
        ).then(() => {
          dispatch(appGetSansthaById(sansthaDetails?._id));
        });
      }
    });
  };

  const handleAddNewMembership = () => {
    setEditMode(false);
    setEditSansthaId(null);
    Formik.resetForm();
    Formik.setValues({
      membershipType: "",
      membershipfee: "",
      honoraryReason: "",
    });
    setShowModal(true);
  };

  const handlesaveupiid = () => {
    const payload = {
      id: sansthaDetails?._id,
      upi_id: Formik.values.upi_id,
    };

    dispatch(appUpdateSanstha(payload));
  };

  return (
    <div>
      <div className="mb-3 d-flex justify-content-between align-items-center">
  {/* Centered UPI ID + Save */}
  <div className="d-flex justify-content-center flex-grow-1">
    <div className="d-flex align-items-end" style={{ gap: "10px" }}>
      <div className="form-group mb-0" style={{ position: "relative" }}>
        <label>UPI ID *</label>
        <input
          type="text"
          className="form-control"
          name="upi_id"
          value={Formik.values.upi_id}
          onChange={Formik.handleChange}
          onBlur={Formik.handleBlur}
        />
        {Formik.touched.upi_id && Formik.errors.upi_id && (
    <div
      className="text-danger"
      style={{ position: "absolute", top: "100%", fontSize: "12px" }}
    >
      {Formik.errors.upi_id}
    </div>
  )}
      </div>
      <button
        className="btn btn-primary"
        type="button"
        // onClick={handlesaveupiid}
        onClick={async () => {
          await Formik.validateField('upi_id'); 
          Formik.setFieldTouched('upi_id', true);
        
          if (!Formik.errors.upi_id && Formik.values.upi_id) {
            handlesaveupiid();
          }
        }}
      >
        Save
      </button>
    </div>
  </div>

  {/* Right aligned Add button */}
  <div>
    <button className="btn btn-primary" onClick={handleAddNewMembership}>
      <i className="far fa-plus"></i> Add New Membership & Payment
    </button>
  </div>
</div>

      {/* <div className="mb-3 mr-2 d-flex justify-content-between align-items-center">
     

        <div className="mb-3 ml-3 mr-2 d-flex justify-content-between align-items-end">
          <div className="d-flex flex-grow-1 align-items-end mr-3">
            <div className="form-group mb-0 mr-2" style={{ width: "100%" }}>
              <label>UPI ID *</label>
              <input
                type="text"
                className="form-control"
                name="upi_id"
                value={Formik.values.upi_id || sansthaDetails?.upi_id}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
              />
              {Formik.touched.upi_id && Formik.errors.upi_id && (
                <div className="text-danger">{Formik.errors.upi_id}</div>
              )}
            </div>

            <button
              className="btn btn-primary"
              onClick={handlesaveupiid}
              type="submit"
            >
              Save
            </button>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleAddNewMembership}>
          <i className="far fa-plus"></i> Add New Membership type & Payment
        </button>
      </div> */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="">
            <tr>
              <th>Sr. No.</th>
              <th>Membership Duration </th>
              <th>Membership Fee/Reason</th>

              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sansthaDetails?.membership &&
            sansthaDetails.membership.length > 0 ? (
              sansthaDetails.membership.map((membership, index) => (
                <tr key={membership._id || index}>
                  <td>{index + 1}</td>
                  <td>{membership.membershipType}</td>
                  {/* <td>{membership.membershipfee}</td> */}
                  <td>
                    {membership.membershipType === "Honorary Voting Right" ||
                    membership.membershipType === "Honorary Non Voting Right"
                      ? membership.honoraryReason
                      : membership.membershipfee}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary mr-2"
                      title="Edit"
                      onClick={() => handleEditMembership(membership)}
                    >
                      <i className="far fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      title="Delete"
                      onClick={() => handleDeleteMembership(membership?._id)}
                    >
                      <i className="far fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No membership data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Membership and Payment Details Creation Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            marginTop: "35px",
          }}
        >
          <div className="modal-dialog modal-lg" style={{ marginTop: "200px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode
                    ? "Edit Membership type and Payment Details(UPI ID)"
                    : "Create New Membership type and Payment Details(UPI ID)"}
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => {
                    setShowModal(false);
                    setEditMode(false);
                    setEditSansthaId(null);
                    Formik.resetForm();
                  }}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
              >
                <form onSubmit={Formik.handleSubmit}>
                  <div className="row">
                    {/* Membership Duration */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Membership Duration *</label>
                        <select
                          className="form-control"
                          name="membershipType"
                          value={Formik.values.membershipType}
                          onChange={Formik.handleChange}
                          onBlur={Formik.handleBlur}
                        >
                          <option value="">Select Duration</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                          <option value="Lifetime">Lifetime</option>
                          <option value="Honorary Voting Right">
                            Honorary Voting Right
                          </option>
                          <option value="Honorary Non Voting Right">
                            Honorary Non Voting Right
                          </option>
                        </select>
                        {Formik.touched.membershipType &&
                        Formik.errors.membershipType ? (
                          <div className="text-danger">
                            {Formik.errors.membershipType}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Membership Fee */}
                    <div className="col-md-6">
                      <div className="form-group">
                        {Formik.values.membershipType ===
                          "Honorary Voting Right" ||
                        Formik.values.membershipType ===
                          "Honorary Non Voting Right" ? (
                          <>
                            <label> Reason *</label>
                            <input
                              type="text"
                              className="form-control"
                              name="honoraryReason"
                              value={Formik.values.honoraryReason || ""}
                              onChange={Formik.handleChange}
                              onBlur={Formik.handleBlur}
                            />
                            {Formik.touched.honoraryReason &&
                            Formik.errors.honoraryReason ? (
                              <div className="text-danger">
                                {Formik.errors.honoraryReason}
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <>
                            <label>Membership Fee *</label>
                            <input
                              type="number"
                              className="form-control"
                              name="membershipfee"
                              value={Formik.values.membershipfee}
                              onChange={Formik.handleChange}
                              onBlur={Formik.handleBlur}
                            />
                            {Formik.touched.membershipfee &&
                            Formik.errors.membershipfee ? (
                              <div className="text-danger">
                                {Formik.errors.membershipfee}
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                    {/* <div className="col-md-6">
                      <div className="form-group">
                        <label>Membership Fee *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="membershipfee"
                          value={Formik.values.membershipfee}
                          onChange={Formik.handleChange}
                          onBlur={Formik.handleBlur}
                        />
                        {Formik.touched.membershipfee &&
                        Formik.errors.membershipfee ? (
                          <div className="text-danger">
                            {Formik.errors.membershipfee}
                          </div>
                        ) : null}
                      </div>
                    </div> */}

                    {/* <div className="col-md-6">
                      <div className="form-group">
                        <label>UPI ID *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="upi_id"
                          value={Formik.values.upi_id}
                          onChange={Formik.handleChange}
                          onBlur={Formik.handleBlur}
                        />
                        {Formik.touched.upi_id && Formik.errors.upi_id ? (
                          <div className="text-danger">
                            {Formik.errors.upi_id}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <ImageUpload
                        uploadFunction={uploadSansthaImage}
                        fieldName="qr_code"
                        value={Formik.values.qr_code}
                        onChange={(value) =>
                          Formik.setFieldValue("qr_code", value)
                        }
                        error={
                          Formik.touched.qr_code && Formik.errors.qr_code
                            ? Formik.errors.qr_code
                            : null
                        }
                        label="QR Code *"
                      />
                    </div> */}
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-labeled btn-success"
                      type="submit"
                      onClick={Formik.handleSubmit}
                    >
                      <span className="btn-label">
                        <i className="fa fa-check"></i>
                      </span>
                      {editMode ? "Update" : "Create"}
                    </button>
                    <button
                      className="btn btn-labeled btn-secondary ml-2"
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditMode(false);
                        setEditSansthaId(null);
                        Formik.resetForm();
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
export default MembershipPaymentdetailsTab;
