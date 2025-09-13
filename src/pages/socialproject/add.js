import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { appGetAllSanstha } from "../../store/sanstha";
import { appAllGetHubs } from "../../store/hubs";
import { appGetAllPost } from "../../store/post";
import { uploadSponsorImage } from "../../store/sponsor";
import {
  appCreateProject,
  appGetAllProject,
  appUpdateProject,
} from "../../store/socialproject";
import { appGetAllProjectCategory } from "../../store/projectcategory";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import axios from "axios";
import ImageUpload from "../../components/ImageUpload";
import MultipleMediaUpload from "../../components/MultipleMediaUpload";

function NewSocialProject() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { socialproject, isloder } = useSelector(
    (state) => state.socialprojectReducer
  );
  const { hub } = useSelector((state) => state.hubReducer);
  const { sanstha } = useSelector((state) => state.sansthaReducer);
  const projectcategory = useSelector(
    (state) => state?.projectcategoryReducer?.projectcategory
  );
  const [editorValues, setValues] = useState(EditorState.createEmpty());
  const [areaList, setAreaList] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);

  const CategoryOptions = useMemo(() => {
    return (projectcategory?.data || []).map((cat) => ({
      value: cat._id,
      label: cat.name,
    }));
  }, [projectcategory]);

  useEffect(() => {
    dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
    dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
    dispatch(appGetAllPost({ page: 1, limit: 1000 }));
    dispatch(appGetAllProject({ page: 1, limit: 1000 }));
    dispatch(appGetAllProjectCategory({ page: 1, limit: 1000 }));
  }, [dispatch]);

  const onEditorStateChange = (editorState) => {
    formik.setFieldValue(
      "description",
      draftToHtml(convertToRaw(editorState.getCurrentContent()))
    );
    setValues(editorState);
  };

  const populateData = () => {
    if (socialproject?.data) {
      const selectedHub = Array.isArray(socialproject.data)
        ? socialproject.data.find((h) => h._id === id)
        : socialproject.data;

      if (selectedHub?.description) {
        const blocksFromHtml = htmlToDraft(selectedHub?.description);
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
  useEffect(() => {
    const fetchAreaOnEdit = async () => {
      if (socialproject?.data && id) {
        const selectedsocialproject = Array.isArray(socialproject?.data)
          ? socialproject?.data.find((c) => c._id === id)
          : socialproject?.data;

        if (selectedsocialproject?.pincode) {
          const postOffices = await fetchPincodeDetails(
            selectedsocialproject?.pincode
          );
          setAreaList(postOffices);
        }
      }
    };

    fetchAreaOnEdit();
  }, [socialproject?.data, id]);

  const selectedProject = useMemo(() => {
    if (!id || !socialproject?.data) return null;
    return Array.isArray(socialproject.data)
      ? socialproject.data.find((r) => r._id === id)
      : socialproject.data;
  }, [socialproject, id]);
  console.log(selectedProject);

  // const handleOngoingChange = (checked) => {
  //   setFieldValue("isOngoing", checked);
  //   if (checked) {
  //     setFieldValue("endDate", "");
  //   }
  // };

  const formik = useFormik({
    initialValues: {
      title: selectedProject?.title || "",
      description: selectedProject?.description || "",
      hub: selectedProject?.hub?._id || "",
      sanstha: selectedProject?.sanstha?._id || "",
      file: selectedProject?.file || "",
      category: selectedProject?.category._id || "",
      // status: selectedProject?.status || "Upcoming",
      isOngoing: selectedProject?.isOngoing || false,
      visibility_private: selectedProject?.visibility_private || false,
      startDate: selectedProject?.startDate
        ? new Date(selectedProject.startDate).toISOString().slice(0, 10)
        : "",
      endDate: selectedProject?.endDate
        ? new Date(selectedProject.endDate).toISOString().slice(0, 10)
        : null,
      // endDate: selectedProject?.isOngoing ? "" : selectedProject?.endDate || "",
      // goalamount: selectedProject?.goalamount || "",
      goalamount: selectedProject?.allowDonations
        ? selectedProject?.goalamount || null
        : null,
      pincode: selectedProject?.pincode || "",
      area: selectedProject?.area || "",
      state: selectedProject?.state || "",
      district: selectedProject?.district || "",
      block: selectedProject?.block || "",
      placeAddress: selectedProject?.placeAddress || "",
      eligibility80G: selectedProject?.eligibility80G || false, 
      allowDonations: selectedProject?.allowDonations || false,
      upload_report: selectedProject?.upload_report || [],
      // pancardnumber: selectedProject?.pancardnumber || "",
      pancardnumber: selectedProject?.eligibility80G
        ? selectedProject?.pancardnumber || null
        : null,
    },
    enableReinitialize: false,
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
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
      hub: Yup.string().required("Community is required"),
      // sanstha: Yup.string().required("Sanstha is required"),
      category: Yup.string().required("Category is required"),
      // file: Yup.string({
      //   url: Yup.string()
      //     .url()
      //     .required("File URL is required"),
      //   type: Yup.string().required("File type is required"),
      // }).required("Please upload a file"),
       file: Yup.string()
        .nullable()
        .required("Image is required")
        .test("is-valid-url", "Invalid image", (value) => {
          return value && value !== "/img/default-placeholder.jpg";
        }),
      startDate: Yup.date().required("Start date is required"),
      // pancardnumber: Yup.string().matches(
      //   /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      //   "Enter a valid PAN card number"
      // ),
      isOngoing: Yup.boolean().default(false),
      endDate: Yup.date().when("isOngoing", {
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
    }),

    onSubmit: (values) => {
      const temp_obj = {
        title: values.title,
        file: values.file,
        description: values.description,
        category: values.category,
        sanstha: values.sanstha,
        hub: values.hub,
        status: values.status,
        isOngoing: values.isOngoing,
        // goalamount: values.goalamount,
        goalamount: values?.allowDonations ? values.goalamount : null,
        pincode: values?.pincode,
        area: values?.area,
        state: values?.state,
        district: values?.district,
        block: values?.block,
        placeAddress: values?.placeAddress,
        eligibility80G: values?.eligibility80G,
        allowDonations: values?.allowDonations,
        visibility_private: values.visibility_private,
        upload_report: values.upload_report,
        // pancardnumber: values.pancardnumber,
        pancardnumber: values?.eligibility80G ? values.pancardnumber : null,
        startDate: new Date(values.startDate).toISOString(),
        // endDate: new Date(values.endDate).toISOString(),
        // endDate:
        //   values.isOngoing || !values.endDate
        //     ? ""
        //     : new Date(values.endDate).toISOString(),
        endDate: values.isOngoing
          ? null
          : values.endDate
          ? new Date(values.endDate).toISOString()
          : null,
        navigate,
      };

      const filtered_obj = Object.fromEntries(
        Object.entries(temp_obj).filter(
          ([key, value]) =>
            value !== "" &&
            // value !== null &&
            value !== undefined &&
            key !== "navigate"
        )
      );
      if (id) {
        dispatch(appUpdateProject({ ...filtered_obj, id })).then(() => {
          navigate("/social-project");
        });
      } else {
        dispatch(appCreateProject(filtered_obj)).then(() => {
          navigate("/social-project");
        });
        formik.resetForm();
      }
    },
  });

  const hubOptions = useMemo(
    () =>
      Array.isArray(hub?.data)
        ? hub.data.map((place) => ({ value: place._id, label: place.name }))
        : [],
    [hub]
  );

  const sansthaOptions = useMemo(
    () =>
      Array.isArray(sanstha)
        ? sanstha.map((s) => ({ value: s._id, label: s.name }))
        : [],
    [sanstha]
  );

  return (
    <>
      {isloder && <div className="loading">Loading...</div>}
      <div className="content-wrapper">
        <div className="content-heading">
          <div>
            <Link to="/social-project">Social Project</Link> /{" "}
            {id ? "Edit Social Project" : "New Social Project"}
          </div>
        </div>

        <div className="card card-default">
          <div className="card-body">
            <form onSubmit={formik.handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label>
                    Community <span className="text-danger">*</span>
                  </label>
                  <Select
                    name="hub"
                    options={hubOptions}
                    onChange={(opt) => formik.setFieldValue("hub", opt?.value)}
                    value={
                      hubOptions.find((o) => o.value === formik.values.hub) ||
                      null
                    }
                    placeholder="Select community..."
                  />
                  {formik.touched.hub && formik.errors.hub && (
                    <div className="text-danger">{formik.errors.hub}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label>
                    Social Project Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    placeholder="Enter Social Project title"
                  />
                  {formik.touched.title && formik.errors.title && (
                    <div className="text-danger">{formik.errors.title}</div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <label>Sanstha</label>
                  <Select
                    name="sanstha"
                    options={sansthaOptions}
                    onChange={(opt) =>
                      formik.setFieldValue("sanstha", opt?.value)
                    }
                    value={
                      sansthaOptions.find(
                        (o) => o.value === formik.values.sanstha
                      ) || null
                    }
                    placeholder="Select Sanstha..."
                  />
                  {/* {formik.touched.sanstha && formik.errors.sanstha && (
                    <div className="text-danger">{formik.errors.sanstha}</div>
                  )} */}
                </div>

                <div className="col-md-6">
                  <label>
                    Social Project Description{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <Editor
                    editorClassName="form-control"
                    editorState={editorValues}
                    onEditorStateChange={onEditorStateChange}
                    onBlur={() => formik.setFieldTouched("description", true)}
                    editorStyle={{ height: 300 }}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="text-danger">
                      {formik.errors.description}
                    </div>
                  )}
                </div>
              </div>
              <div className="row mb-3">
                <div className="mb-3 col-md-6">
                  {/* <ImageUpload
                    fieldName="file"
                    value={formik.values.file || ""}
                    label="Media Upload *"
                    uploadFunction={uploadSponsorImage}
                    onChange={(value) => formik.setFieldValue("file", value)}
                    error={
                      formik.touched.file && formik.errors.file
                        ? formik.errors.file
                        : null
                    }
                  /> */}
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
                {/* <div className="col-md-6">
                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      className="form-control"
                      name="status"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="">Select Status</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Active ">Active </option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div> */}
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label>
                    Category <span className="text-danger">*</span>
                  </label>
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
                    <div className="text-danger">{formik.errors.category}</div>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label>
                    Start Date <span className="text-danger">*</span>
                  </label>
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
                    <div className="text-danger">{formik.errors.startDate}</div>
                  )}
                </div>
                <div className="mb-3 col-md-6">
                  <div className="form-check">
                    <div className="form-group">
                      <input
                        type="checkbox"
                        name="isOngoing"
                        checked={formik.values.isOngoing}
                        // onChange={handleOngoingChange}
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
                      <div className="text-danger">{formik.errors.endDate}</div>
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
                    <div className="text-danger">{formik.errors.pincode}</div>
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
                    <div className="text-danger">{formik.errors.district}</div>
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

              {/* <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label"> Online Donations</label>
                  <div>
                    <label className="mr-3">
                      <input
                        type="radio"
                        name="allowDonations"
                        value="yes"
                        checked={formik.values.allowDonations === yes}
                        onChange={() =>
                          formik.setFieldValue("allowDonations", yes)
                        }
                      />{" "}
                      Yes
                    </label>
                    <label className="ml-3">
                      <input
                        type="radio"
                        name="allowDonations"
                        value="no"
                        checked={formik.values.allowDonations === no}
                        onChange={() =>
                          formik.setFieldValue("allowDonations", no)
                        }
                      />{" "}
                      No
                    </label>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">80G Eligibility Flag</label>
                  <div>
                    <label className="me-3">
                      <input
                        type="radio"
                        name="eligibility80G"
                        value="yes"
                        checked={formik.values.eligibility80G === yes}
                        onChange={() =>
                          formik.setFieldValue("eligibility80G", yes)
                        }
                      />{" "}
                      Yes
                    </label>
                    <label className="ml-3">
                      <input
                        type="radio"
                        name="eligibility80G"
                        value="no"
                        checked={formik.values.eligibility80G === no}
                        onChange={() =>
                          formik.setFieldValue("eligibility80G", no)
                        }
                      />{" "}
                      No
                    </label>
                  </div>
                </div>
              </div> */}
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
                        onChange={() => {
                          formik.setFieldValue("allowDonations", false);
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
                          formik.setFieldValue("eligibility80G", false);
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
                      <label>PAN card number </label>

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
                  {/* <ImageUpload
                    fieldName="upload_report"
                    value={formik.values.upload_report}
                    label="Upload progress reports or photos "
                    uploadFunction={uploadSponsorImage}
                    onChange={(value) => formik.setFieldValue("upload_report", value)}
                  /> */}
                  {/* <ImageUpload
                    formik={formik}
                    fieldName="upload_report"
                    value={formik.values.upload_report}
                    label="Upload Progress Reports or Photos"
                    uploadFunction={uploadSponsorImage}
                    onChange={(urls) =>
                      formik.setFieldValue("upload_report", urls)
                    }
                    multiple={true}
                  /> */}
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
                  {/* <MediaUpload
                    fieldName="files"
                    value={formik.values.upload_report}
                    label="Upload Multiple Files"
                    uploadFunction={uploadSponsorImage}
                      onChange={(newFile) => {
                        const currentFiles =
                          formik.values.upload_report || [];
                        formik.setFieldValue("upload_report", [
                          ...currentFiles,
                          newFile,
                        ]);
                      }}
                    multiple={true}
                  /> */}
                </div>
              </div>

              <div>
                <button type="submit" className="btn btn-success mr-2">
                  <i className="fa fa-check me-1"></i>
                  {id ? " Update" : " Create"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/social-project")}
                >
                  <i className="fa fa-times me-1"></i> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
export default NewSocialProject;
