import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  appCreateFacility,
  appDeleteFacility,
  appGetAllFacility,
  appUpdateFacility,
  uploadFacilityImage,
} from "../../store/facilities";
import { useEffect, useState } from "react";
import { Formik, useFormik } from "formik";
import * as Yup from "yup";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import Select from "react-select";
import ImageUpload from "../../components/ImageUpload";
import swal from "sweetalert";

const facilityCategories = [
  {
    category: "Venue",
    facilities: [
      "Marriage Hall / Banquet Hall",
      "Open Ground / Wadi",
      "Community Dining Hall / Bhojanshala",
      "Meeting Hall / Seminar Room",
    ],
  },
  {
    category: "Accommodation",
    facilities: ["Dormitory / Guest House / Dharmshala"],
  },
  {
    category: "Event Setup",
    facilities: ["Stage & Mandap Setup", "Event Lighting Equipment"],
  },
  {
    category: "Audio/Visual",
    facilities: [
      "Sound System / PA Setup",
      "Projector & Screen / Event Display Tools",
      "Photo/Video Kit (Camera, Tripod, etc.)",
    ],
  },
  {
    category: "Catering",
    facilities: [
      "Utensil Bank / Crockery Set",
      "Catering Equipment (Gas stove, Bhagona, etc.)",
    ],
  },
  {
    category: "Education",
    facilities: [
      "School Classroom (for rent during non-hours)",
      "Computer Lab / Digital Classroom",
      "Library / Study Room",
    ],
  },
  {
    category: "Transport",
    facilities: ["Bus / Van (for events or group travel)"],
  },
  {
    category: "Health",
    facilities: [
      "Ambulance (free or subsidized for emergencies)",
      "Health Check-up Equipment / Mobile Clinic Setup",
    ],
  },
  {
    category: "Utility",
    facilities: [
      "Water Filter / RO Facility (for refilling)",
      "Generator / Power Backup Unit",
    ],
  },
];

function Facility({
  FacilityList,
  sansthaDetails,
  editable = false,
  // onAddNewFacility,
  // onEditFacility,
  // onRemoveFacility
}) {
  const params = useParams();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showFacilityDetailsModal, setShowFacilityDetailsModal] = useState(false);
  const [selectedFacilityDetails, setSelectedFacilityDetails] = useState(null);
  const [editFacilityMode, setEditFacilityMode] = useState(false);
  const [editFacilityId, setEditFacilityId] = useState(null);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [termsInputType, setTermsInputType] = useState("file");
  const [facilityEditorState, setFacilityEditorState] = useState(EditorState.createEmpty());

  const categoryOptions = facilityCategories.map((cat) => ({
    value: cat.category,
    label: cat.category,
  }));

  const facilityOptions = selectedCategory
    ? facilityCategories
        .find((cat) => cat.category === selectedCategory.value)
        .facilities.map((fac) => ({ value: fac, label: fac }))
    : [];

  // const FacilityList = useSelector((state) => state.facilityReducer.facility);
  // useEffect(() => {
  //     dispatch(appGetAllFacility({ hub: id }));
  //   }, [dispatch, id]);

  // For Facility
  const facilityValidationSchema = Yup.object({
    category: Yup.string().required("Required"),
    facilityType: Yup.string().required("Required"),
    facilityLogo: Yup.string()
      .required("Required")
      .test(
        "is-valid-url",
        "Only JPG, JPEG, or PNG files are allowed",
        (value) => {
          if (!value || value === "/img/default-placeholder.jpg") return false;
          return /\.(jpg|jpeg|png)$/i.test(value);
        }
      ),

    facilityName: Yup.string().required("Required"),
    address: Yup.string().required("Required"),
    contactMobile: Yup.string()
      .required("Required")
      .matches(/^\d+$/, "Mobile number must contain only digits")
      .min(10, "Mobile number must be exactly 10 digits")
      .max(10, "Mobile number must be exactly 10 digits"),
    contactName: Yup.string().required("Required"),
    // description: Yup.string().required("Required"),
    description: Yup.string()
   .transform((value) => {
     if (!value) return "";
     return value
       .replace(/<[^>]+>/g, "")   
       .replace(/&nbsp;/gi, "")  
       .replace(/\s+/g, "")     
       .trim();
   })
   .test(
     "is-not-empty",
     "Description is Required",
     (value) => value && value.length > 0
   )
   .required("Description is Required"),

    form: Yup.string()
      .required("Required")
      .test("is-valid-url", "Invalid image", (value) => {
        return value && value !== "/img/default-placeholder.jpg";
      }),
    termsFile: Yup.mixed().when("termsInputType", {
      is: "file",
      then: Yup.mixed()
        .required("Please upload a file")
        .test(
          "fileFormat",
          "Only JPG, PNG, or PDF allowed",
          (value) =>
            value &&
            (["image/jpeg", "image/png", "application/pdf"].includes(
              value.type
            ) ||
              /\.(jpg|jpeg|png|pdf)$/i.test(value.name))
        ),
      otherwise: Yup.mixed().notRequired(),
    }),
    termsLink: Yup.string().when("termsInputType", {
      is: "link",
      then: Yup.string()
        .required("Please enter a link")
        .url("Enter a valid URL"),
      otherwise: Yup.string().notRequired(),
    }),
  });

  const facilityFormik = useFormik({
    initialValues: {
      category: "",
      facilityType: "",
      facilityName: "",
      facilityLogo: "",
      address: "",
      contactName: "",
      contactMobile: "",
      sansthName: "",
      sansthPlace: "",
      sanstha: id,
      description: "",
      form: "",
      terms: "",
      termsFile: "",
      termsLink: "",
      termsInputType: "file",
    },
    validationSchema: facilityValidationSchema,
    onSubmit: (values) => {
      // console.log("Form values:", values);

      const temp_obj = {
        category: selectedCategory?.value || "",
        facilityType: selectedFacility?.value || values?.facilityType || "",
        hub: sansthaDetails?.hub,
        facilityName: values.facilityName || "",
        facilityLogo: values.facilityLogo || "",
        sanstha: id,
        contactName: values?.contactName || "",
        address: values?.address || "",
        contactMobile: String(values?.contactMobile ?? ""),
        description: values?.description || "",
        form: values?.form || "",
        terms: termsInputType === "file" ? values.termsFile : values.termsLink,
        termsisfile: termsInputType === "file",
        navigate: navigate,
      };

      // console.log(temp_obj);

      if (editFacilityMode && editFacilityId) {
        dispatch(appUpdateFacility({ ...temp_obj, id: editFacilityId })).then(
          () => {
            dispatch(appGetAllFacility({ sanstha: id }));
          }
        );
      } else {
        dispatch(appCreateFacility(temp_obj)).then(() => {
          dispatch(appGetAllFacility({ sanstha: id }));
        });
      }

      setShowFacilityModal(false);
      setEditFacilityMode(false);
      setEditFacilityId(null);
      facilityFormik.resetForm();
      setSelectedCategory(null);
      setSelectedFacility(null);
      setFacilityEditorState(EditorState.createEmpty());
    },
  });

  const handleShowFacilityDetails = (facility) => {
    setSelectedFacilityDetails(facility);
    setShowFacilityDetailsModal(true);
  };

  const onFacilityEditorStateChange = (editorState) => {
    setFacilityEditorState(editorState);
    facilityFormik.setFieldValue(
      "description",
      draftToHtml(convertToRaw(editorState.getCurrentContent()))
    );
  };
  const handleAddNewFacility = () => {
    setEditFacilityMode(false);
    setEditFacilityId(null);
    facilityFormik.resetForm();
    facilityFormik.setValues({
      category: "",
      facilityType: "",
      facilityName: "",
      facilityLogo: "",
      address: "",
      contactName: "",
      contactMobile: "",
      sansthName: "",
      sansthPlace: "",
      sanstha: id,
      description: "",
      form: "",
      terms: "",
      termsFile: "",
      termsLink: "",
    });
    setSelectedCategory(null);
    setSelectedFacility(null);
    setFacilityEditorState(EditorState.createEmpty());
    setShowFacilityModal(true);
  };

  const handleEditFacility = (facility) => {
    // console.log(facility);
    setEditFacilityMode(true);
    setEditFacilityId(facility._id);
    setShowFacilityModal(true);

    // Set selectedCategory and selectedFacility
    const matchedCategory = facilityCategories.find(
      (cat) => cat.category === facility.category
    );
    const matchedFacilityOption = matchedCategory?.facilities?.find(
      (f) => f === facility.facilityType
    );

    setSelectedCategory(
      matchedCategory
        ? { value: matchedCategory.category, label: matchedCategory.category }
        : null
    );
    setSelectedFacility(
      matchedFacilityOption
        ? { value: matchedFacilityOption, label: matchedFacilityOption }
        : null
    );

    // Robustly determine if terms is a file or link
    const isFile =
      facility.termsisfile !== undefined
        ? facility.termsisfile === true || facility.termsisfile === "true"
        : facility.terms &&
          (facility.terms.endsWith(".pdf") ||
            facility.terms.endsWith(".jpg") ||
            facility.terms.endsWith(".jpeg") ||
            facility.terms.endsWith(".png") ||
            facility.terms.endsWith(".gif"));
    // console.log(isFile);
    setTermsInputType(isFile ? "file" : "link");

    facilityFormik.setValues({
      category: facility.category,
      facilityType: facility.facilityType,
      hub: facility.hub,
      facilityName: facility.facilityName,
      facilityLogo: facility.facilityLogo,
      sanstha: facility._id,
      contactName: facility.contactName,
      address: facility.address,
      contactMobile: String(facility.contactMobile ?? ""),
      description: facility.description,
      form: facility.form,
      terms: facility.terms,
      termsLink: !isFile ? facility.terms : "",
      termsFile: isFile ? facility.terms : null,
      termsisfile: isFile,
    });

    if (facility.description) {
      const blocksFromHtml = htmlToDraft(facility.description);
      if (blocksFromHtml) {
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        setFacilityEditorState(EditorState.createWithContent(contentState));
      }
    } else {
      setFacilityEditorState(EditorState.createEmpty());
    }
  };
  const handleRemoveFacility = (facilityId) => {
    if (facilityId) {
      swal({
        title: "Are you sure?",
        text: "Are you sure you want to remove this facility from the sanstha?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          dispatch(appDeleteFacility(facilityId));
        }
      });
    }
  };
  return (
    <>
      {/* <div className="tab-pane fade" role="tabpanel"> */}
      <div className=" mb-3 mr-2 d-flex justify-content-between align-items-center">
        <h4 className="ml-2">Total Facility: {FacilityList?.length || 0}</h4>
        {editable && (
          <button className="btn btn-primary" onClick={handleAddNewFacility}>
            <i className="far fa-plus"></i> Add New Facility
          </button>
        )}
      </div>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="">
            <tr>
              <th>Sr. No.</th>
              <th>Facility Logo</th>
              <th>Category</th>
              <th>Facility</th>
              <th>Address</th>
              <th>Booking Form</th>
              <th>Terms & Condition</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {FacilityList?.length > 0 ? (
              FacilityList.map((f, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={f.facilityLogo}
                      alt="Facility logo"
                      height={70}
                      width={70}
                    />
                  </td>
                  <td>{f.category}</td>
                  <td>{f.facilityName}</td>
                  <td>{f.address}</td>
                  <td>
                    {f.form ? (
                      f.form.toLowerCase().endsWith(".pdf") ? (
                        <a
                          href={f.form}
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
                          {/* <i
                              className="fa fa-download"
                            ></i> */}
                        </a>
                      ) : (
                        <>
                          <a
                            href={f.form}
                            target="_blank"
                            download
                            className="btn btn-outline-primary btn-sm"
                          >
                            <img
                              src={f.form}
                              alt="Facility logo"
                              height={70}
                              width={70}
                              style={{
                                display: "block",
                                marginBottom: "5px",
                                objectFit: "contain",
                              }}
                            />

                            {/* <i
                                className="fa fa-download"
                              ></i> */}
                          </a>
                        </>
                      )
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    {f.terms ? (
                      // If it's a PDF file
                      f.terms.endsWith(".pdf") ? (
                        <a
                          href={f.terms}
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
                          {/* <i
                              className="fa fa-download"
                            ></i> */}
                        </a>
                      ) : // If it's an image file
                      f.terms.endsWith(".jpg") ||
                        f.terms.endsWith(".jpeg") ||
                        f.terms.endsWith(".png") ||
                        f.terms.endsWith(".gif") ? (
                        <>
                          <a
                            href={f.terms}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm"
                          >
                            <img
                              src={f.terms}
                              alt="terms&condition"
                              height={70}
                              width={70}
                            />
                          </a>
                          {/* <a
                              href={f.terms}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary btn-sm"
                            >
                              <i
                                className="fa fa-download"
                              ></i>
                            </a> */}
                        </>
                      ) : // If it's a link (http/https)
                      f.terms.startsWith("http://") ||
                        f.terms.startsWith("https://") ? (
                        <a
                          href={f.terms}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {f.terms}
                        </a>
                      ) : (
                        // Fallback: just show as text
                        f.terms
                      )
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    {editable && (
                      <button
                        className="btn btn-sm btn-primary mr-2"
                        title="Edit"
                        onClick={() => handleEditFacility(f)}
                      >
                        <i className="far fa-edit"></i>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleShowFacilityDetails(f);
                      }}
                      className="btn btn-sm btn-primary mr-2"
                      title="Details"
                    >
                      <em className="fa fa-eye fa-fw"></em>
                    </button>
                    {editable && (
                      <button
                        className="btn btn-sm btn-danger"
                        title="Delete"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveFacility(f._id);
                        }}
                      >
                        <i className="far fa-trash-alt"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No Facility data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* </div> */}

      {/* Facility Details Modal */}
      {showFacilityDetailsModal && selectedFacilityDetails && (
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
                <h5 className="modal-title">Facility Details</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowFacilityDetailsModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="row mb-3 align-items-center">
                  <div className="col-md-2 text-center">
                    <img
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "2px solid #eee",
                      }}
                      src={selectedFacilityDetails.facilityLogo}
                      alt="Facility logo"
                    />
                  </div>
                  <div className="col-md-10">
                    <h4 className="mb-1">
                      {selectedFacilityDetails.facilityName}
                    </h4>
                    <p className="mb-1">
                      <strong>Category:</strong>{" "}
                      {selectedFacilityDetails.category}
                    </p>
                    <p className="mb-1">
                      <strong>Type:</strong>{" "}
                      {selectedFacilityDetails.facilityType}
                    </p>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <p>
                      <strong>Address:</strong>{" "}
                      {selectedFacilityDetails.address}
                    </p>
                    <p>
                      <strong>Sanstha:</strong>{" "}
                      {selectedFacilityDetails.sanstha?.name}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Contact Name:</strong>{" "}
                      {selectedFacilityDetails.contactName}
                    </p>
                    <p>
                      <strong>Contact Mobile:</strong>{" "}
                      {selectedFacilityDetails.contactMobile}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <strong>Description:</strong>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedFacilityDetails.description,
                    }}
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Booking Form:</strong>
                    <div>
                      {selectedFacilityDetails.form ? (
                        selectedFacilityDetails.form
                          .toLowerCase()
                          .endsWith(".pdf") ? (
                          <>
                            <div
                              style={{ marginLeft: "10px", marginTop: "5px" }}
                            >
                              <i
                                className="far fa-file-pdf"
                                style={{ fontSize: "25px", color: "#d9534f" }}
                              ></i>
                            </div>
                            <a
                              href={selectedFacilityDetails.form}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary btn-sm mt-2"
                            >
                              <i className="fa fa-download"></i>
                            </a>
                          </>
                        ) : (
                          <>
                            <img
                              src={selectedFacilityDetails.form}
                              alt="Booking Form"
                              style={{
                                maxWidth: "100%",
                                maxHeight: "120px",
                                marginTop: "8px",
                              }}
                            />
                            <a
                              href={selectedFacilityDetails.form}
                              download
                              className="btn btn-outline-primary btn-sm"
                              target="_blank"
                              style={{
                                display: "block",
                                marginTop: "8px",
                                minWidth: "32px",
                                width: "40px",
                                padding: "4px 8px",
                                marginLeft: "20px",
                              }}
                            >
                              <i className="fa fa-download"></i>
                            </a>
                          </>
                        )
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <strong>Terms &amp; Condition:</strong>
                    <div style={{ marginTop: "8px" }}>
                      {selectedFacilityDetails.terms ? (
                        selectedFacilityDetails.termsisfile === true ||
                        selectedFacilityDetails.termsisfile === "true" ? (
                          // File: image or PDF
                          selectedFacilityDetails.terms.match(/\.pdf$/i) ? (
                            <>
                              <div
                                style={{
                                  marginLeft: "10px",
                                  marginTop: "5px",
                                  marginBottom: "5px",
                                }}
                              >
                                <i
                                  className="far fa-file-pdf"
                                  style={{ fontSize: "25px", color: "#d9534f" }}
                                ></i>
                              </div>
                              <a
                                href={selectedFacilityDetails.terms}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary btn-sm"
                              >
                                <i className="fa fa-download"></i>
                              </a>
                            </>
                          ) : selectedFacilityDetails.terms.match(
                              /\.(jpg|jpeg|png|gif)$/i
                            ) ? (
                            <>
                              <img
                                src={selectedFacilityDetails.terms}
                                alt="Terms & Condition"
                                style={{ maxWidth: "100%", maxHeight: "120px" }}
                              />
                              <a
                                href={selectedFacilityDetails.terms}
                                download
                                className="btn btn-outline-primary btn-sm"
                                target="_blank"
                                style={{
                                  display: "block",
                                  marginTop: "8px",
                                  minWidth: "32px",
                                  width: "40px",
                                  padding: "4px 8px",
                                  marginLeft: "20px",
                                }}
                              >
                                <i className="fa fa-download"></i>
                              </a>
                            </>
                          ) : (
                            <a
                              href={selectedFacilityDetails.terms}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary btn-sm"
                            >
                              <i className="fa fa-download"></i>
                            </a>
                          )
                        ) : (
                          // Link
                          <a
                            href={selectedFacilityDetails.terms}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {selectedFacilityDetails.terms}
                          </a>
                        )
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowFacilityDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facility Creation Modal */}
      {showFacilityModal && (
        <>
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
                    {editFacilityMode ? "Edit Facility" : "Create New Facility"}
                  </h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => {
                      setShowFacilityModal(false);
                      setEditFacilityMode(false);
                      setEditFacilityId(null);
                      facilityFormik.resetForm();
                    }}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <div
                  className="modal-body"
                  style={{ maxHeight: "80vh", overflowY: "auto" }}
                >
                  <form onSubmit={facilityFormik.handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Category *</label>
                          <Select
                            options={categoryOptions}
                            value={selectedCategory}
                            onChange={(option) => {
                              setSelectedCategory(option);
                              setSelectedFacility(null);
                              facilityFormik.setFieldValue(
                                "category",
                                option.value
                              );
                            }}
                            placeholder="Select Category..."
                            isSearchable
                          />
                          {facilityFormik.touched.category &&
                          facilityFormik.errors.category ? (
                            <div style={{ color: "red" }}>
                              {facilityFormik.errors.category}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Type of facility *</label>
                          <Select
                            options={facilityOptions}
                            value={selectedFacility}
                            onChange={(option) => {
                              setSelectedFacility(option);
                              facilityFormik.setFieldValue(
                                "facilityType",
                                option.value
                              );
                            }}
                            placeholder="Select Facility..."
                            isSearchable
                          />

                          {facilityFormik.touched.facilityType &&
                          facilityFormik.errors.facilityType ? (
                            <div style={{ color: "red" }}>
                              {facilityFormik.errors.facilityType}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          {/* <Formik initialValues={{ image: "" }}> */}
                          {/* <Form> */}
                          <ImageUpload
                            label="Facility Logo *"
                            key={facilityFormik.values.facilityLogo || "empty"}
                            uploadFunction={uploadFacilityImage}
                            fieldName="image"
                            value={facilityFormik.values.facilityLogo}
                            onChange={(value) =>
                              facilityFormik.setFieldValue(
                                "facilityLogo",
                                value.url
                              )
                            }
                            // onChange={(value) => {
                            //   if (!value || !/\.(jpg|jpeg|png)$/i.test(value)) {
                            //     facilityFormik.setFieldError(
                            //       "facilityLogo",
                            //       "Only JPG, JPEG, or PNG files are allowed"
                            //     );
                            //   } else {
                            //     facilityFormik.setFieldError(
                            //       "facilityLogo",
                            //       ""
                            //     );
                            //     facilityFormik.setFieldValue(
                            //       "facilityLogo",
                            //       value
                            //     );
                            //   }
                            // }}
                            error={
                              facilityFormik.touched.facilityLogo &&
                              facilityFormik.errors.facilityLogo
                                ? facilityFormik.errors.facilityLogo
                                : null
                            }
                          />
                          {/* </Form> */}
                          {/* </Formik> */}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Facility Name *</label>
                          <input
                            className="form-control"
                            name="facilityName"
                            type="text"
                            onChange={facilityFormik.handleChange}
                            onBlur={facilityFormik.handleBlur}
                            value={facilityFormik.values.facilityName}
                          />
                          {facilityFormik.touched.facilityName &&
                          facilityFormik.errors.facilityName ? (
                            <div style={{ color: "red" }}>
                              {facilityFormik.errors.facilityName}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="row" style={{ padding: "0 0 15px 0" }}>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Sanstha Name *</label>
                          <Select
                            name="sanstha"
                            options={[
                              {
                                value: id,
                                label: sansthaDetails?.name,
                              },
                            ]}
                            onChange={(option) => {
                              facilityFormik.setFieldValue(
                                "sansthName",
                                option?.value
                              );
                            }}
                            value={{
                              value: facilityFormik.values.sanstha,
                              label: sansthaDetails?.name,
                            }}
                            isDisabled={true}
                          />
                          {facilityFormik.touched.sansthName &&
                          facilityFormik.errors.sansthName ? (
                            <div style={{ color: "red" }}>
                              {facilityFormik.errors.sansthName}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Sanstha Place </label>
                          <input
                            className="form-control"
                            name="sansthPlace"
                            type="text"
                            onChange={facilityFormik.handleChange}
                            // onBlur={facilityFormik.handleBlur}
                            value={facilityFormik.values.sansthPlace}
                            readOnly
                          />
                          {facilityFormik.touched.sansthPlace &&
                          facilityFormik.errors.sansthPlace ? (
                            <div style={{ color: "red" }}>
                              {facilityFormik.errors.sansthPlace}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          {/* <Formik initialValues={{ form: "" }}> */}
                          {/* <Form> */}
                          <ImageUpload
                            label="Booking Form *"
                            uploadFunction={uploadFacilityImage}
                            fieldName="form"
                            value={facilityFormik.values.form}
                            onChange={(value) =>
                              facilityFormik.setFieldValue("form", value.url)
                            }
                            error={
                              facilityFormik.touched.form &&
                              facilityFormik.errors.form
                                ? facilityFormik.errors.form
                                : null
                            }
                          />
                          {/* </Form> */}
                          {/* </Formik> */}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Terms & Condition *</label>
                          <div style={{ marginBottom: 8 }}>
                            <label style={{ marginRight: 10 }}>
                              <input
                                type="radio"
                                name="termsInputType"
                                value="file"
                                checked={termsInputType === "file"}
                                onChange={() => setTermsInputType("file")}
                              />{" "}
                              File
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="termsInputType"
                                value="link"
                                checked={termsInputType === "link"}
                                onChange={() => setTermsInputType("link")}
                              />{" "}
                              Link
                            </label>
                          </div>
                          {termsInputType === "file" ? (
                            // <Formik initialValues={{ image: "" }}>
                            <ImageUpload
                              label=""
                              uploadFunction={uploadFacilityImage}
                              fieldName="termsFile"
                              value={facilityFormik.values.termsFile}
                              onChange={(value) =>
                                facilityFormik.setFieldValue(
                                  "termsFile",
                                  value.url
                                )
                              }
                              error={
                                facilityFormik.touched.termsFile &&
                                facilityFormik.errors.termsFile
                                  ? facilityFormik.errors.termsFile
                                  : null
                              }
                            />
                          ) : (
                            // </Formik>
                            <>
                              <input
                                type="url"
                                className="form-control"
                                name="termsLink"
                                placeholder="Enter Terms & Condition link"
                                value={facilityFormik.values.termsLink || ""}
                                onChange={facilityFormik.handleChange}
                              />
                              {facilityFormik.errors.termsLink &&
                                facilityFormik.touched.termsLink && (
                                  <div className="text-danger">
                                    {facilityFormik.errors.termsLink}
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>Address *</label>
                          <textarea
                            className="form-control"
                            name="address"
                            onChange={facilityFormik.handleChange}
                            onBlur={facilityFormik.handleBlur}
                            value={facilityFormik.values.address}
                            rows="2"
                          />
                          {facilityFormik.touched.address &&
                          facilityFormik.errors.address ? (
                            <div style={{ color: "red" }}>
                              {facilityFormik.errors.address}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="row" style={{ padding: "0 0 15px 0" }}>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Contact Name *</label>
                          <input
                            className="form-control"
                            name="contactName"
                            type="text"
                            onChange={facilityFormik.handleChange}
                            onBlur={facilityFormik.handleBlur}
                            value={facilityFormik.values.contactName}
                          />
                          {facilityFormik.touched.contactName &&
                          facilityFormik.errors.contactName ? (
                            <div style={{ color: "red" }}>
                              {facilityFormik.errors.contactName}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Contact Number *</label>
                          <input
                            type="number"
                            className="form-control"
                            maxLength={10}
                            name="contactMobile"
                            onChange={facilityFormik.handleChange}
                            onBlur={facilityFormik.handleBlur}
                            value={facilityFormik.values.contactMobile}
                          />
                          {facilityFormik.touched.contactMobile &&
                          facilityFormik.errors.contactMobile ? (
                            <div style={{ color: "red" }}>
                              {facilityFormik.errors.contactMobile}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description *</label>
                      <Editor
                        editorClassName="form-control"
                        editorState={facilityEditorState}
                        onEditorStateChange={onFacilityEditorStateChange}
                        editorStyle={{ height: 300 }}
                      />
                      {facilityFormik.touched.description &&
                      facilityFormik.errors.description ? (
                        <div style={{ color: "red" }}>
                          {facilityFormik.errors.description}
                        </div>
                      ) : null}
                    </div>
                    <div className="modal-footer">
                      <button
                        className="btn btn-labeled btn-success"
                        type="submit"
                      >
                        <span className="btn-label">
                          <i className="fa fa-check"></i>
                        </span>
                        {editFacilityMode ? "Update" : "Create"}
                      </button>
                      <button
                        className="btn btn-labeled btn-secondary ml-2"
                        type="button"
                        onClick={() => {
                          setShowFacilityModal(false);
                          setEditFacilityMode(false);
                          setEditFacilityId(null);
                          facilityFormik.resetForm();
                          setSelectedCategory(null);
                          setSelectedFacility(null);
                          setFacilityEditorState(EditorState.createEmpty());
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
        </>
      )}
    </>
  );
}
export default Facility;
