import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import ImageUpload from "../../components/ImageUpload";
import { appAllGetCompliance, appCreateCompliance, appDeleteCompliance, appUpdateCompliance, uploadComplianceImage } from "../../store/compliances";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import swal from "sweetalert";

function Compliance({ compliancesList, sansthaDetails }) {
    const dispatch= useDispatch()
    const navigate = useNavigate();
  const [editComplianceMode, setEditComplianceMode] = useState(false);
  const [editComplianceId, setEditComplianceId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // compliance
  const formik = useFormik({
    initialValues: {
      name: "",
      documenttype: "",
      file: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      documenttype: Yup.string().required("Required"),
      file: Yup.string()
        .required("Required")
        .test("is-valid-url", "Invalid image", (value) => {
          return value && value !== "/img/default-placeholder.jpg";
        }),
    }),
    onSubmit: (values) => {
      const temp_obj = {
        name: values?.name,
        documenttype: values?.documenttype,
        file: values?.file,
        sanstha: sansthaDetails?._id,
        navigate: navigate,
      };
      if (editComplianceMode && editComplianceId) {
        // console.log(temp_obj);
        // console.log(editComplianceId)
        dispatch(
          appUpdateCompliance({ ...temp_obj, id: editComplianceId })
        ).then(() => {
          setShowModal(false);
          setEditComplianceMode(false);
          setEditComplianceId(null);
          formik.resetForm();
          dispatch(appAllGetCompliance());
        });
      } else {
        dispatch(appCreateCompliance(temp_obj)).then(() => {
          setShowModal(false);
          formik.resetForm();
          dispatch(appAllGetCompliance());
        });
      }
    },
  });
  const handleAddNewCompliance = () => {
    setEditComplianceMode(false);
    setEditComplianceId(null);
    formik.resetForm();
    setShowModal(true);
  };
  const handleEditCompliance = (compliance) => {
    setEditComplianceMode(true);
    setEditComplianceId(compliance._id);
    setShowModal(true);
    formik.setValues({
      name: compliance.name || "",
      documenttype: compliance.documenttype || "",
      file: compliance.file || "",
    });
  };
  const handleRemoveCompliance = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this Compliance?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteCompliance(id));
      }
    });
  };

  return (
    <div>
      <div className="mb-3 mr-2 d-flex justify-content-between align-items-center">
        <h4 className="ml-2">
          Total Compliance: {compliancesList?.length || 0}
        </h4>
        <button className="btn btn-primary" onClick={handleAddNewCompliance}>
          <i className="far fa-plus"></i> Add New Compliance
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="">
            <tr>
              <th>Sr. No.</th>
              <th>Name</th>
              <th>Document Type</th>
              <th>File</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {compliancesList && compliancesList.length > 0 ? (
              compliancesList.map((compliance, index) => (
                <tr key={compliance._id || index}>
                  <td>{index + 1}</td>
                  <td>{compliance.name}</td>
                  <td>{compliance.documenttype}</td>
                  <td>
                    {compliance.file ? (
                      compliance.file.toLowerCase().endsWith(".pdf") ? (
                        <a
                          href={compliance.file}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm"
                        >
                          <i
                            className="far fa-file-pdf"
                            style={{
                              fontSize: "20px",
                              color: "#d9534f",
                            }}
                          ></i>
                        </a>
                      ) : (
                        <>
                          <a
                            href={compliance.file}
                            target="_blank"
                            download
                            className="btn btn-outline-primary btn-sm"
                          >
                            <img
                              src={compliance.file}
                              alt="Facility logo"
                              height={70}
                              width={70}
                              style={{
                                display: "block",
                                marginBottom: "5px",
                                objectFit: "contain",
                              }}
                            />
                          </a>
                        </>
                      )
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary mr-2"
                      title="Edit"
                      onClick={() => handleEditCompliance(compliance)}
                    >
                      <i className="far fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      title="Delete"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveCompliance(compliance._id);
                      }}
                    >
                      <i className="far fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No compliance data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                  {editComplianceMode ? "Edit Compliance" : "Add Compliance"}
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
              >
                <form>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          className="form-control"
                          name="name"
                          type="text"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.name}
                        />
                        {formik.touched.name && formik.errors.name ? (
                          <div style={{ color: "red" }}>
                            {formik.errors.name}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <ImageUpload
                        label="File*"
                        uploadFunction={uploadComplianceImage}
                        fieldName="file"
                        value={formik.values.file}
                        onChange={(value) =>
                          formik.setFieldValue("file", value.url)
                        }
                        error={
                          formik.touched.file && formik.errors.file
                            ? formik.errors.file
                            : null
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Document Type *</label>
                        <input
                          className="form-control"
                          name="documenttype"
                          type="text"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.documenttype}
                        />
                        {formik.touched.documenttype &&
                        formik.errors.documenttype ? (
                          <div style={{ color: "red" }}>
                            {formik.errors.documenttype}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    formik.resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={formik.handleSubmit}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Compliance;
