import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import swal from "sweetalert";
import { useFormik } from "formik";
import * as Yup from "yup";
import { appGetAllSanstha } from "../../store/sanstha";
import { appAllGetHubs } from "../../store/hubs";
import Paginate from "../pagination/paginate";
import ImageUpload from "../ImageUpload";
import { uploadSponsorImage } from "../../store/sponsor";
import {
  appCreateProject,
  appDeleteProject,
  appGetAllProject,
  appUpdateProject,
} from "../../store/socialproject";
import { appAllGetSocialProjectBooking } from "../../store/socialprojectbooking";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import { useParams } from "react-router-dom";
import axios from "axios";
import MultipleMediaUpload from "../MultipleMediaUpload";

function SocialProjectTab({
  socialproject,
  projectcategory,
  projectPage,
  setProjectPage,
  hubDetails,
  sansthaDetails,
  hideSansthaField,
}) {
  const dispatch = useDispatch();
    const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const { hub } = useSelector((state) => state.hubReducer);
  const { sanstha } = useSelector((state) => state.sansthaReducer);
  const paginate = useSelector((state) => state.socialprojectReducer.paginate);
  const [areaList, setAreaList] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editorValues, setValues] = useState(EditorState.createEmpty());

  const CategoryOptions = useMemo(() => {
    return (projectcategory?.data || []).map((cat) => ({
      value: cat._id,
      label: cat.name,
    }));
  }, [projectcategory]);
  useEffect(() => {
    if (hubDetails?._id) {
      dispatch(
        appGetAllSanstha({ hubId: hubDetails._id, page: 1, limit: 1000 })
      );
    } else if (sansthaDetails?._id) {
      dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
      dispatch(
        appGetAllSanstha({
          page: 1,
          limit: 1000,
          sansthaId: sansthaDetails._id,
        })
      );
    } else {
      dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
      dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
    }
  }, [dispatch, hubDetails, sansthaDetails]);

  const hubOptions = useMemo(() => {
    if (hubDetails?._id) {
      return [{ value: hubDetails._id, label: hubDetails.name }];
    }

    if (sansthaDetails?.hub) {
      const hubObj = Array.isArray(hub?.data)
        ? hub.data.find((h) => h._id === sansthaDetails.hub)
        : null;
      return hubObj
        ? [{ value: hubObj._id, label: hubObj.name }]
        : [{ value: sansthaDetails.hub, label: "Unknown Hub" }];
    }

    return Array.isArray(hub?.data)
      ? hub.data.map((place) => ({ value: place._id, label: place.name }))
      : [];
  }, [hub, hubDetails, sansthaDetails]);

  const sansthaOptions = useMemo(() => {
    if (!sanstha) return [];

    if (hubDetails?._id) {
      return sanstha
        .filter((s) => s.hub?._id === hubDetails._id)
        .map((s) => ({ value: s._id, label: s.name }));
    }

    if (sansthaDetails?._id) {
      return [{ value: sansthaDetails._id, label: sansthaDetails.name }];
    }
  }, [sanstha, hubDetails, sansthaDetails]);
  const validationSchema = Yup.object({
    title: Yup.string().required("Post title is required"),
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
    // hub: Yup.string().required("Community is required"),
    sanstha: Yup.string().when("$hideSansthaField", {
      is: false,
      then: (schema) => schema.required("Sanstha is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    category: Yup.string().required("Category is required"),
     file: Yup.string()
            .nullable()
            .required("Image is required")
            .test("is-valid-url", "Invalid image", (value) => {
              return value && value !== "/img/default-placeholder.jpg";
            }),
        // file: Yup.string({
        //     url: Yup.string()
        //       .url()
        //       .required("File URL is required"),
        //     type: Yup.string().required("File type is required"),
        //   }).required("Please upload a file"),
    startDate: Yup.date().required("Start date is required"),
    isOngoing: Yup.boolean().default(false),
    endDate: Yup.mixed().when("isOngoing", {
      is: true,
      then: (schema) =>
        schema
          .transform(() => null)
          .nullable()
          .notRequired()
          .strip(),
      otherwise: Yup.date()
        .transform((val, orig) => (orig === "" ? null : val))
        .typeError("Invalid end date")
        .required("End date is required")
        .min(Yup.ref("startDate"), "End date must be after start date"),
    }),
  });

const onEditorStateChange = (editorState) => {
    formik.setFieldValue(
      "description",
      draftToHtml(convertToRaw(editorState.getCurrentContent()))
    );
    setValues(editorState);
  };

  const populateData = () => {
    if (socialproject.data) {
      const selectedsocialproject = Array.isArray(socialproject.data)
        ? socialproject.data.find((h) => h._id === id)
        : socialproject.data;

      if (selectedsocialproject?.description) {
        const blocksFromHtml = htmlToDraft(selectedsocialproject?.description);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        setValues(EditorState.createWithContent(contentState));
      }
    }
  };
  useEffect(() => {
    populateData();
  }, [socialproject]);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      hub: hubDetails?._id || sansthaDetails?.hub?._id || "",
      sanstha: sansthaDetails?._id || "",
      file: null,
      category: "",
      status: "",
      isOngoing: false,
      visibility_private: false,
      startDate: "",
      endDate: "",
      goalamount: null,
      pincode: "",
      area: "",
      state: "",
      district: "",
      block: "",
      placeAddress: "",
      eligibility80G: false,
      allowDonations: false,
      upload_report: [],
      pancardnumber: null
    },
    validationSchema,
    validationContext: { hideSansthaField },
    onSubmit: (values) => {
      console.log(values);
      const payload = {
        title: values.title,
        file: values.file,
        description: values.description,
        category: values.category,
        status: values.status,
        isOngoing: values.isOngoing,
        visibility_private: values.visibility_private,
        startDate: new Date(values.startDate).toISOString(),
        endDate: values.isOngoing
          ? null
          : values.endDate
          ? new Date(values.endDate).toISOString()
          : null,
        goalamount: values?.allowDonations ? values.goalamount : null,
        pincode: values?.pincode,
        area: values?.area,
        state: values?.state,
        district: values?.district,
        block: values?.block,
        placeAddress: values?.placeAddress,
        eligibility80G: values?.eligibility80G,
        allowDonations: values?.allowDonations,
        upload_report: values.upload_report,
         pancardnumber: values?.eligibility80G ? values.pancardnumber : null,
        hub: hubDetails?._id || sansthaDetails?.hub,
        sanstha: values.sanstha
        // navigate,
      };
  console.log(payload)
  const filtered_obj = Object.fromEntries(
        Object.entries(payload).filter(
          ([key, value]) =>
            value !== "" &&
            value !== null &&
            value !== undefined &&
            key !== "navigate"
        )
      );
      const action = editId
        ? appUpdateProject({ ...filtered_obj, id: editId })
        : appCreateProject(filtered_obj);

      dispatch(action).then(() => {
        if (hubDetails?._id) {
          console.log("hub");
          dispatch(
            appGetAllProject({ page: 1, limit: 10, hub: hubDetails._id })
          );
        } else if (sansthaDetails?._id) {
          dispatch(
            appGetAllProject({
              page: 1,
              limit: 10,
              sanstha: sansthaDetails._id,
            })
          );
        }
      });

      formik.resetForm();
      setShowModal(false);
      setEditId(null);
    },

    //     onSubmit: (values) => {
    //       const payload = {
    //     title: values.title,
    //         file: values.file,
    //         description: values.description,
    //         category: values.category,
    //         sanstha: values.sanstha,
    //         hub: values.hub,
    //         isOngoing: values.isOngoing,
    //         visibility_private: values.visibility_private,
    //         startDate: new Date(values.startDate).toISOString(),
    //         endDate: new Date(values.endDate).toISOString(),
    //          goalamount: values.goalamount,
    //         pincode: values?.pincode,
    //         area: values?.area,
    //         state: values?.state,
    //         district: values?.district,
    //         block: values?.block,
    //         placeAddress: values?.placeAddress,
    //         eligibility80G: values?.eligibility80G,
    //         allowDonations: values?.allowDonations,
    //         navigate,
    //       };
    // console.log(payload)
    //       if (editId) {
    //         dispatch(appUpdateProject({ ...payload, id: editId }))
    //              .then(()=> {
    //             if (hubDetails?._id) {
    //                           dispatch(appGetAllProject({ page: 1, limit: 10 , hub: hubDetails?._id}));
    //                       } else if (sansthaDetails?._id) {
    //                          dispatch(appGetAllProject({ page: 1, limit: 10 , sanstha: sansthaDetails?._id}));
    //                       }
    //         })
    //       } else {
    //         dispatch(appCreateProject(payload))
    //         .then(()=> {
    //             if (hubDetails?._id) {
    //                           dispatch(appGetAllProject({ page: 1, limit: 10 , hub: hubDetails?._id}));
    //                       } else if (sansthaDetails?._id) {
    //                          dispatch(appGetAllProject({ page: 1, limit: 10 , sanstha: sansthaDetails?._id}));
    //                       }
    //         })
    //       }

    //       formik.resetForm();
    //       setShowModal(false);
    //       setEditId(null);
    //     },
  });
  const fetchPincodeDetails = async (pincode) => {
    try {
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = response.data[0];

      if (data.Status === "Success") {
        return data.PostOffice;
      }
      return [];
    } catch (error) {
      console.error("Error fetching pincode details:", error);
      return [];
    }
  };
  const handlePincodeBlur = async (e) => {
    formik.handleBlur(e);

    const pincode = e.target.value;
    console.log(pincode);
    if (pincode && pincode.length === 6) {
      const postOffices = await fetchPincodeDetails(pincode);
      setAreaList(postOffices);
    }
  };

  const handleAddNewPost = () => {
    setEditId(null);
    formik.resetForm();
    formik.setValues({
      hub: hubDetails?._id || sansthaDetails?.hub?._id || "",
      sanstha: sansthaDetails?._id || "",
      title: "",
      description: "",
      category: "",
      isOngoing: "",
      file: "",
      isOngoing: false,
      visibility_private: false,
      startDate: "",
      endDate: "",
      goalamount: "",
      status: "",
      pincode: "",
      area: "",
      state: "",
      district: "",
      block: "",
      placeAddress: "",
      eligibility80G: false,
      allowDonations: false,
      upload_report: [],
      pancardnumber: "",
    });
     setValues(EditorState.createEmpty());
    setShowModal(true);
  };

  const handleEditProject = (project) => {
    // console.log(project);
    setEditId(project._id);
    setShowModal(true);
    formik.setValues({
      hub: project.hub?._id || "",
      sanstha: project.sanstha?._id || "",
      title: project.title,
       description: project.description,
      category: project.category._id,
      isOngoing: project.isOngoing || "",
      visibility_private: project.visibility_private,
      file: project.file,
      startDate: project?.startDate
        ? new Date(project.startDate).toISOString().slice(0, 10)
        : "",
      endDate: project?.endDate
        ? new Date(project.endDate).toISOString().slice(0, 10)
        : "",
      // goalamount: project.goalamount,
          goalamount: project?.allowDonations
        ? project?.goalamount || null
        : null,
           pancardnumber: project?.eligibility80G
        ? project?.pancardnumber || null
        : null,
      pincode: project.pincode,
      status: project.status,
      area: project.area,
      state: project.state,
      district: project.district,
      block: project.block,
      placeAddress: project.placeAddress,
      eligibility80G: project.eligibility80G,
      allowDonations: project.allowDonations,
      upload_report: project?.upload_report
    });
     if (project?.description) {
    const blocksFromHtml = htmlToDraft(project.description);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(
      contentBlocks,
      entityMap
    );
    setValues(EditorState.createWithContent(contentState));
  } else {
    setValues(EditorState.createEmpty());
  }
    //  const blocksFromHtml = htmlToDraft(project?.description);
    //     const { contentBlocks, entityMap } = blocksFromHtml;
    //     const contentState = ContentState.createFromBlockArray(
    //       contentBlocks,
    //       entityMap
    //     );
    //     setValues(EditorState.createWithContent(contentState));
  };

  const handleDeleteProject = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this project?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteProject(id)).then(() => {
          if (hubDetails?._id) {
            dispatch(
              appGetAllProject({ page: 1, limit: 10, hub: hubDetails?._id })
            );
          } else if (sansthaDetails?._id) {
            dispatch(
              appGetAllProject({
                page: 1,
                limit: 10,
                sanstha: sansthaDetails?._id,
              })
            );
          }
        });
      }
    });
  };
 const handleShowSocialProjectDetails = async (projectId) => {
     try {
       setSelectedProject(null);
 
       const projectData = socialproject.data.find(
         (project) => project._id === projectId
       );
 
       if (!projectData) {
         console.error("Project not found for ID:", projectId);
         return;
       }
 
       const bookingRes = await dispatch(
         appAllGetSocialProjectBooking({ page: 1, limit: 1000, projectId })
       ).unwrap();
 
       const paymentData = bookingRes?.data || [];
 
       const selectedData = {
         project: projectData,
         payments: paymentData,
       };
 
       setSelectedProject(selectedData);
 
 
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
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h4></h4>
        <button className="btn btn-primary" onClick={handleAddNewPost}>
          Add social Project
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              {/* <th>Description </th> */}
              <th>Category </th>
              <th>Community</th>
              <th>Sanstha</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(socialproject.data || []).map((value, index) => (
              <tr key={index}>
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
                <td>{value.category.name}</td>

                <td>
                  {value?.hub ? (
                    <>
                      <img
                        src={value.hub.image}
                        alt="community"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                        }}
                      />
                      <br />
                      {value.hub.name}
                    </>
                  ) : null}
                </td>
                <td>
                  {value?.sanstha ? (
                    <>
                      <img
                        src={value.sanstha.image}
                        alt="sanstha"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                        }}
                      />
                      <br />
                      {value.sanstha.name}
                    </>
                  ) : null}
                </td>

                <td>
                  {" "}
                  {new Date(value.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td>
                  {" "}
                  {value.endDate
                    ? new Date(value.endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : null}
                </td>
                <td><span
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
                          </span></td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-info mr-2 command-edit"
                    data-row-id="10253"
                    onClick={() => handleEditProject(value)}
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
                    onClick={() => handleDeleteProject(value?._id)}
                  >
                    <em className="fa fa-trash fa-fw"></em>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Paginate
        paginate={paginate}
        page={projectPage}
        setPage={setProjectPage}
      />

      {showModal && (
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
              <form onSubmit={formik.handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editId ? "Edit Social Project" : "Add Social Project"}
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
                  style={{ maxHeight: "70vh", overflowY: "auto" }}
                >
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>Community *</label>
                      <Select
                        name="hub"
                        options={hubOptions}
                        value={hubOptions}
                        // value={hubOptions.find((opt) => opt.value === formik.values.hub) || null}
                        onChange={(opt) =>
                          formik.setFieldValue("hub", opt?.value)
                        }
                        placeholder="Select community..."
                        isDisabled
                      />
                      {/* {formik.touched.hub && formik.errors.hub && (
                        <div className="text-danger">{formik.errors.hub}</div>
                      )} */}
                    </div>

                    {!hideSansthaField && (
                      <div className="col-md-6">
                        <label>Sanstha *</label>
                        <Select
                          name="sanstha"
                          options={sansthaOptions}
                          value={
                            sansthaOptions.find(
                              (o) => o.value === formik.values.sanstha
                            ) || null
                          }
                          onChange={(opt) =>
                            formik.setFieldValue("sanstha", opt?.value)
                          }
                          placeholder="Select sanstha..."
                        />
                        {formik.touched.sanstha && formik.errors.sanstha && (
                          <div className="text-danger">
                            {formik.errors.sanstha}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>Social Project Title *</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                      />
                      {formik.touched.title && formik.errors.title && (
                        <div className="text-danger">{formik.errors.title}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label> Social Project Description *</label>
                      <Editor
                        editorClassName="form-control"
                        editorState={editorValues}
                        onEditorStateChange={onEditorStateChange}
                        onBlur={() => formik.setFieldTouched("description", true)}
                        editorStyle={{ height: 300 }}
                      />
                      {formik.touched.description &&
                        formik.errors.description && (
                          <div className="text-danger">
                            {formik.errors.description}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                       <ImageUpload
                    fieldName="file"
                    label="Media Upload * "
                    value={formik.values.file}
                    onChange={(value) =>
                      formik.setFieldValue("file", value.url)
                    }
                    multiple={false}
                    uploadFunction={uploadSponsorImage}
                    error={
                      formik.touched.file && formik.errors.file
                        ? formik.errors.file
                        : null
                    }
                  />
                    </div>
                    <div className="col-md-6">
                      <label>Category *</label>
                      <Select
                        name="category"
                        options={CategoryOptions}
                        onChange={(opt) =>
                          formik.setFieldValue("category", opt?.value)
                        }
                        value={
                          CategoryOptions.find(
                            (o) => o.value === formik.values.category
                          ) || null
                        }
                        placeholder="Select category..."
                      />
                      {formik.touched.category && formik.errors.category && (
                        <div className="text-danger">
                          {formik.errors.category}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        className="form-control"
                        value={formik.values.startDate}
                        onChange={(e) => {
                          const value = e.target.value;
                          formik.setFieldValue("startDate", value);
                          if (
                            formik.values.endDate &&
                            formik.values.endDate < value
                          ) {
                            formik.setFieldValue("endDate", "");
                          }
                        }}
                      />
                      {formik.touched.startDate && formik.errors.startDate && (
                        <div className="text-danger">
                          {formik.errors.startDate}
                        </div>
                      )}
                    </div>
              <div className="col-md-6">
                    <div className=" form-check">
                      <div className="form-group">
                        <input
                          type="checkbox"
                          name="isOngoing"
                          checked={formik.values.isOngoing}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            formik.setFieldValue("isOngoing", checked);
                            if (checked) {
                              formik.setFieldValue("endDate", null);
                              formik.setFieldTouched("endDate", false);
                            }
                          }}
                          className="form-check-input"
                          id="isOngoing"
                        />
                      </div>
                      <label className="form-check-label" htmlFor="isOngoing">
                        Ongoing Project?
                      </label>
                    </div>
                    </div>
                  </div>
                  {!formik.values.isOngoing && (
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label>
                          End Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          className="form-control"
                          value={formik.values.endDate}
                          // onChange={handleChange}
                          // onChange={(e) => {
                          //   const value = e.target.value;
                          //   formik.setFieldValue((prev) => ({
                          //     ...prev,
                          //     endDate: value,
                          //   }));
                          //   if (value) {
                          //     setError("");
                          //   }
                          // }}
                          onChange={(e) => {
                            const value = e.target.value;
                            formik.setFieldValue("endDate", value);
                          }}
                        />
                        {formik.touched.endDate && formik.errors.endDate && (
                          <div className="text-danger">
                            {formik.errors.endDate}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                

                  <div className="row" style={{ padding: "0 0 15px 0" }}>
                    {/* Pincode */}
                    <div className="col-md-6 mb-3">
                      <label>Pincode</label>
                      <input
                        className="form-control"
                        name="pincode"
                        type="number"
                        onChange={formik.handleChange}
                        onBlur={handlePincodeBlur}
                        value={formik.values.pincode}
                      />
                      {formik.touched.pincode && formik.errors.pincode && (
                        <div className="text-danger">
                          {formik.errors.pincode}
                        </div>
                      )}
                    </div>

                    {/* Select Area */}
                    <div className="col-md-6 mb-3">
                      <label>Select Area</label>
                      <select
                        className="form-control"
                        name="area"
                        onChange={(e) => {
                          const selected = areaList.find(
                            (a) => a.Name === e.target.value
                          );
                          setSelectedArea(selected);
                          formik.setFieldValue("area", e.target.value);
                          formik.setFieldValue("state", selected?.State || "");
                          formik.setFieldValue(
                            "district",
                            selected?.District || ""
                          );
                          formik.setFieldValue("block", selected?.Block || "");
                        }}
                        value={formik.values.area || ""}
                      >
                        <option value="">Select Area</option>
                        {areaList.map((area) => (
                          <option key={area.Name} value={area.Name}>
                            {area.Name}
                          </option>
                        ))}
                      </select>
                      {formik.touched.area && formik.errors.area && (
                        <div className="text-danger">{formik.errors.area}</div>
                      )}
                    </div>

                    {/* State */}
                    <div className="col-md-6 mb-3">
                      <label>State</label>
                      <input
                        className="form-control"
                        name="state"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.state}
                      />
                      {formik.touched.state && formik.errors.state && (
                        <div className="text-danger">{formik.errors.state}</div>
                      )}
                    </div>

                    {/* District */}
                    <div className="col-md-6 mb-3">
                      <label>District</label>
                      <input
                        className="form-control"
                        name="district"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.district}
                      />
                      {formik.touched.district && formik.errors.district && (
                        <div className="text-danger">
                          {formik.errors.district}
                        </div>
                      )}
                    </div>

                    {/* Taluka */}
                    <div className="col-md-6 mb-3">
                      <label>Taluka</label>
                      <input
                        className="form-control"
                        name="block"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.block}
                      />
                      {formik.touched.block && formik.errors.block && (
                        <div className="text-danger">{formik.errors.block}</div>
                      )}
                    </div>

                    {/*  Address */}
                    <div className="col-md-12 mb-3">
                      <label>Address</label>
                      <input
                        className="form-control"
                        name="placeAddress"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.placeAddress}
                      />
                      {formik.touched.placeAddress &&
                        formik.errors.placeAddress && (
                          <div className="text-danger">
                            {formik.errors.placeAddress}
                          </div>
                        )}
                    </div>
                  </div>

                   <div className="row mb-3">
                {/* Online Donations */}
                <div className="col-md-6">
                  <label className="form-label">Online Donations</label>
                  <div>
                    <label className="mr-3">
                      <input
                        type="radio"
                        name="allowDonations"
                        checked={formik.values.allowDonations === true}
                        onChange={() =>
                          formik.setFieldValue("allowDonations", true)
                        }
                      />{" "}
                      Yes
                    </label>
                    <label className="ml-3">
                      <input
                        type="radio"
                        name="allowDonations"
                        checked={formik.values.allowDonations === false}
                        onChange={() =>{
                          formik.setFieldValue("allowDonations", false)
                           formik.setFieldValue("goalamount", null);
                        }}
                      />{" "}
                      No
                    </label>
                  </div>
                </div>
                {formik.values.allowDonations && (
                  <div className="col-md-6">
                    <label>Goal Amount</label>
                    <input
                      type="number"
                      name="goalamount"
                      className="form-control"
                      value={formik.values.goalamount}
                      onChange={formik.handleChange}
                      placeholder="Enter Goal Amount"
                    />
                    {formik.touched.goalamount && formik.errors.goalamount && (
                      <div className="text-danger">
                        {formik.errors.goalamount}
                      </div>
                    )}
                  </div>
                )}
              </div>

                   <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">80G Eligibility Flag</label>
                  <div>
                    <label className="me-3">
                      <input
                        type="radio"
                        name="eligibility80G"
                        checked={formik.values.eligibility80G === true}
                        onChange={() =>
                          formik.setFieldValue("eligibility80G", true)
                        }
                      />{" "}
                      Yes
                    </label>
                    <label className="ml-3">
                      <input
                        type="radio"
                        name="eligibility80G"
                        checked={formik.values.eligibility80G === false}
                        onChange={() =>{
                          formik.setFieldValue("eligibility80G", false)
                           formik.setFieldValue("pancardnumber", null);
                        }}
                      />{" "}
                      No
                    </label>
                  </div>
                </div>

                {formik.values.eligibility80G && (
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                       PAN card number{" "}
                      </label>

                      <input
                        className="form-control"
                        name="pancardnumber"
                        type="text"
                        // onChange={formik.handleChange}
                        onChange={(e) => {
                          const upperCaseValue = e.target.value.toUpperCase();
                          formik.setFieldValue("pancardnumber", upperCaseValue);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.pancardnumber}
                         placeholder="Enter Pancard number"
                      />
                      {formik.touched.pancardnumber &&
                      formik.errors.pancardnumber ? (
                        <div style={{ color: "red" }}>
                          {formik.errors.pancardnumber}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>


              <div className="row">
                <div className="col-md-6">
                  <MultipleMediaUpload
                    uploadFunction={uploadSponsorImage}
                    value={formik.values.upload_report}
                    fieldName="multiMedia"
                    label="Upload progress report or photo "
                    onChange={(newFiles) => {
                      const currentFiles = formik.values.upload_report || [];

                      const filesToAdd = Array.isArray(newFiles)
                        ? newFiles
                        : [newFiles];

                      const mergedFiles = [
                        ...currentFiles,
                        ...filesToAdd,
                      ].filter(
                        (file, index, self) =>
                          index === self.findIndex((f) => f.url === file.url)
                      );

                      formik.setFieldValue("upload_report", mergedFiles);
                    }}
                  />
                </div>
              </div>
                 
                </div>

                <div className="modal-footer">
                  <button type="submit" className="btn btn-success">
                     <span><i className="fa fa-check"></i> {" "}</span> 
                      {editId ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    <i className="fa fa-times"></i> Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

export default SocialProjectTab;
