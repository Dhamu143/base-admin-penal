import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
// import DatePicker from "react-datepicker";
import Select from "react-select";
import {
  appCreateSanstha,
  appGetAllSanstha,
  appUpdateSanstha,
  uploadSansthaImage,
} from "../../store/sanstha";
import { appAllGetHubs } from "../../store/hubs";
import ImageUpload from "../../components/ImageUpload";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import axios from "axios";

function NewSanstha() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const Hub = useSelector((state) => state?.hubReducer?.hub) || [];
  const sanstha = useSelector((state) => state?.sansthaReducer?.sanstha);
  // console.log(sanstha)
  const [editorValues, setValues] = useState(EditorState.createEmpty());
  const [selectedSansthaType, setSelectedSansthaType] = useState("");
  const [otherSansthaType, setOtherSansthaType] = useState("");
  const [selectedAct, setSelectedAct] = useState("");
  const [otherAct, setOtherAct] = useState("");
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [areaList, setAreaList] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);

  const sansthaData = [
    // {
    //   sansthaType: "Unregistered( no docs)",
    //   acts: ["NA"],
    // },
    {
      sansthaType: "Not registered(AOP)",
      acts: ["NA"],
    },
    {
      sansthaType: "Charitable, Religious Trust",
      acts: [
        "Indian Trusts Act, 1882",
        "Maharashtra Public Trust Act 1950 (earlier Bombay Public Trusts Act, 1950)",
        "Gujarat Public Trusts Act, 2011 (earlier Bombay Public Trusts Act, 1950)",
        "THE RAJASTHAN PUBLIC TRUST ACT, 1959",
        "Andhra Pradesh Charitable and Hindu Religious Institutions and Endowments Act, 1987",
        "Bihar Hindu Religious Trusts Act, 1950",
        "Karnataka Hindu Religious Institutions and Charitable Endowments Act, 1997",
        "Kerala Travancore-Cochin Hindu Religious Institutions Act, 1950",
        "Orissa Hindu Religious Endowments Act, 1951",
        "Tamil Nadu Hindu Religious and Charitable Endowments Act, 1959",
        "Uttar Pradesh Charitable Endowments (Extension of Powers) Act, 1950",
        "Charitable Endowments (U.P. Amendment) Act, 1952",
        "Religious Endowments (Uttar Pradesh Amendment) Act, 1951",
        "Uttar Pradesh Hindu Religious Institutions (Prevention of Dissipation of Properties) (Repeal) Act, 2000",
        "The Madhya Pradesh Public Trusts Act, 1951",
      ],
    },
    {
      sansthaType: "NGO",
      acts: ["COMPANIES ACT 2013"],
    },
    {
      sansthaType: "Company",
      acts: ["COMPANIES ACT, 1956"],
    },
    {
      sansthaType: "Society",
      acts: [
        "Societies Registration Act, 1860",
        "Multi-State Societies Registration Bill, 2012",
        "The Karnataka Societies Registration Act, 1960",
        "The West Bengal Societies Registration Act, 1961",
        "The Tamil Nadu Societies Registration Act, 1975",
        "Manipur Societies Registration Act, 1989",
        "The Jammu – Kashmir Societies Registration Act, 1998",
        "Societies Registration (Uttar Pradesh Amendment) Act, 2000",
      ],
    },
    {
      sansthaType: "Registered (AOP)",
      acts: [
        "Registration Act, 1908",
        "Indian Stamp Act, 1899",
        "The Madhya Pradesh Registration Adhiniyam, 1961",
      ],
    },
    {
      sansthaType: "Trust, Wakf",
      acts: [
        "Mussalman Wakf Act, 1923",
        "Mussalman Wakf Validating Act,1913",
        "Wakf Act, 1995",
        "Mussalman Wakf Validating Act, 1930",
      ],
    },
  ];

  const actOptions = (() => {
    const found = sansthaData.find(
      (item) => item.sansthaType === selectedSansthaType
    );
    const acts = found?.acts || [];
    return selectedSansthaType ? [...acts, "Other"] : [];
  })();

  useEffect(() => {
    // Get all data without pagination for dropdowns
    dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
    dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
  }, []);

  useEffect(() => {
    if (sanstha && id) {
      const selectedsanstha = Array.isArray(sanstha)
        ? sanstha.find((c) => c._id === id)
        : sanstha;
      console.log(selectedsanstha);
      if (selectedsanstha) {
        formik.setFieldValue("name", selectedsanstha?.name || "");
        formik.setFieldValue("hub", selectedsanstha?.hub?._id || "");
        formik.setFieldValue("description", selectedsanstha?.description || "");
        formik.setFieldValue("sansthaPincode", selectedsanstha?.sansthaPincode || "");
        formik.setFieldValue("sansthaArea", selectedsanstha?.sansthaArea || "");
        formik.setFieldValue("sansthaState", selectedsanstha?.sansthaState || "");
        formik.setFieldValue("sansthaDistrict", selectedsanstha?.sansthaDistrict || "");
        formik.setFieldValue("sansthaBlock", selectedsanstha?.sansthaBlock || "");
        formik.setFieldValue("sansthaCountry", selectedsanstha?.sansthaCountry || "");
        formik.setFieldValue("sansthaPlaceAddress", selectedsanstha?.sansthaPlaceAddress || "");
        formik.setFieldValue("image", selectedsanstha?.image || "");
        formik.setFieldValue("active", selectedsanstha?.active ?? false);
        formik.setFieldValue("verified", selectedsanstha?.verified ?? false);
        formik.setFieldValue(
          "aadhaarnumber",
          selectedsanstha?.aadhaarnumber || ""
        );
        formik.setFieldValue(
          "pancardnumber",
          selectedsanstha?.pancardnumber || ""
        );
        formik.setFieldValue(
          "isRegistered",
          selectedsanstha?.isRegistered || false
        );
        formik.setFieldValue(
          "registrationNumber",
          selectedsanstha?.registrationNumber || ""
        );
        formik.setFieldValue(
          "registrationDate",
          selectedsanstha?.registrationDate || ""
        );
        formik.setFieldValue("sansthaType", selectedsanstha?.sansthaType || "");
        const isCustomSansthaType = !sansthaData.some(
          (type) => type.sansthaType === selectedsanstha.sansthaType
        );

        if (isCustomSansthaType) {
          setSelectedSansthaType("Other");
          setOtherSansthaType(selectedsanstha.sansthaType);
        } else {
          setSelectedSansthaType(selectedsanstha.sansthaType);
          setOtherSansthaType("");
        }
        const isCustomSansthaAct = !sansthaData.some(
          (type) => type.Act === selectedsanstha.Act
        );

        if (isCustomSansthaAct) {
          setSelectedAct("Other");
          setOtherAct(selectedsanstha.Act);
        } else {
          setSelectedAct(selectedsanstha.Act);
          setOtherAct("");
        }
        formik.setFieldValue("Act", selectedsanstha?.Act || "");
        formik.setFieldValue(
          "sansthaPanCardNumber",
          selectedsanstha?.sansthaPanCardNumber || ""
        );
        formik.setFieldValue(
          "authorityLetters",
          selectedsanstha?.authorityLetters || ""
        );
        formik.setFieldValue(
          "aadhaarFront",
          selectedsanstha?.aadhaarFront || ""
        );
        formik.setFieldValue("aadhaarBack", selectedsanstha?.aadhaarBack || "");
        formik.setFieldValue(
          "panCardImage",
          selectedsanstha?.panCardImage || ""
        );
        formik.setFieldValue(
          "sansthaCertificate",
          selectedsanstha?.sansthaCertificate || ""
        );
        formik.setFieldValue(
          "sansthaPanCardImage",
          selectedsanstha?.sansthaPanCardImage || ""
        );
        formik.setFieldValue(
          "verifiedAadharCard",
          selectedsanstha?.verifiedAadharCard || false
        );
        formik.setFieldValue(
          "verifiedPancard",
          selectedsanstha?.verifiedPancard || false
        );
        formik.setFieldValue(
          "verifiedRegistrationNumber",
          selectedsanstha?.verifiedRegistrationNumber || false
        );
        formik.setFieldValue(
          "verifiedSansthaPancard",
          selectedsanstha?.verifiedSansthaPancard || false
        );
      }
    }
  }, [sanstha, id]);

  const onEditorStateChange = (editorState) => {
    formik.setFieldValue(
      "description",
      draftToHtml(convertToRaw(editorState.getCurrentContent()))
    );
    setValues(editorState);
  };

  const populateData = () => {
    if (sanstha) {
      // console.log(sanstha,"sanstha")
      const selectedsanstha = Array.isArray(sanstha)
        ? sanstha.find((c) => c._id === id)
        : sanstha;
      // console.log(selectedsanstha);

      if (selectedsanstha?.description) {
        const blocksFromHtml = htmlToDraft(selectedsanstha?.description);
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
  }, [sanstha]);

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

  const formik = useFormik({
    initialValues: {
      name: "",
      image: "",
      hub: "",
      description: "",
      sansthaPincode: "",
      sansthaArea: "",
      sansthaState: "",
      sansthaDistrict: "",
      sansthaBlock: "",
      // sansthaCountry: "",
      sansthaPlaceAddress: "",
      active: false,
      verified: false,
      aadhaarnumber: "",
      pancardnumber: "",
      sansthaPlace: "",
      isRegistered: false,
      registrationNumber: "",
      registrationDate: "",
      sansthaType: "",
      Act: "",
      sansthaPanCardNumber: "",
      authorityLetters: "",
      acceptingnewmember: true,
      // admin: "userId",
      aadhaarFront: "",
      aadhaarBack: "",
      panCardImage: "",
      sansthaCertificate: "",
      sansthaPanCardImage: "",
      sansthaType:
        selectedSansthaType === "Other"
          ? otherSansthaType
          : selectedSansthaType?.sansthaType,
      Act: selectedAct === "Other" ? otherAct : selectedAct,
      verifiedAadharCard: false,
      verifiedPancard: false,
      verifiedRegistrationNumber: false,
      verifiedSansthaPancard: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is Required"),
      hub: Yup.string().required("Community is Required"),
      // description: Yup.string().required("Description is required"),
      image: Yup.string()
        .required("Image is required")
        .test("is-valid-url", "Invalid image", (value) => {
          return value && value !== "/img/default-placeholder.jpg";
        }),
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

        sansthaPincode: Yup.string()
        .required('Pincode is required')
        .matches(/^[0-9]{6}$/, 'Pincode must be a 6-digit number'),
    
      sansthaArea: Yup.string().required('Area is required'),
    
      sansthaState: Yup.string().required('State is required'),
    
      sansthaDistrict: Yup.string().required('District is required'),
    
      sansthaBlock: Yup.string().required('Taluka is required'),
    
      sansthaPlaceAddress: Yup.string()
        .required('Sanstha Address is required'),

      active: Yup.boolean(),
      verified: Yup.boolean(),

      aadhaarnumber: Yup.string()
        .required("Aadhaar card number is required")
        .matches(/^[2-9]{1}[0-9]{11}$/, "Invalid Aadhaar card number"),
      pancardnumber: Yup.string()
        .required("PAN card number is required")
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Enter a valid PAN card number"),
      aadhaarFront: Yup.string()
        .required("Image is required")
        .test("is-valid-url", "Invalid image", (value) => {
          return value && value !== "/img/default-placeholder.jpg";
        }),
      aadhaarBack: Yup.string()
        .required("Image is required")
        .test("is-valid-url", "Invalid image", (value) => {
          return value && value !== "/img/default-placeholder.jpg";
        }),
      panCardImage: Yup.string()
        .required("Image is required")
        .test("is-valid-url", "Invalid image", (value) => {
          return value && value !== "/img/default-placeholder.jpg";
        }),

      isRegistered: Yup.boolean(),

      registrationNumber: Yup.string().when("isRegistered", {
        is: true,
        then: Yup.string().required("Registration Number is required"),
        otherwise: Yup.string().notRequired(),
      }),

      registrationDate: Yup.string().when("isRegistered", {
        is: true,
        then: Yup.string().required("Registration Date is required"),
        otherwise: Yup.string().notRequired(),
      }),

      sansthaType: Yup.string().when("isRegistered", {
        is: true,
        then: Yup.string().required("Sanstha Type is required"),
        otherwise: Yup.string().notRequired(),
      }),

      Act: Yup.string().when("isRegistered", {
        is: true,
        then: Yup.string().required("Sanstha Act is required"),
        otherwise: Yup.string().notRequired(),
      }),

      sansthaPanCardNumber: Yup.string().when("isRegistered", {
        is: true,
        then: Yup.string()
          .required("PAN card number is required")
          .matches(
            /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            "Enter a valid PAN card number"
          ),
        otherwise: Yup.string().notRequired(),
      }),

      authorityLetters: Yup.string().when("isRegistered", {
        is: true,
        then: Yup.string()
          .required("Image is required")
          .test("is-valid-url", "Invalid image", (value) => {
            return value && value !== "/img/default-placeholder.jpg";
          }),
        otherwise: Yup.string().notRequired(),
      }),

      sansthaCertificate: Yup.string().when("isRegistered", {
        is: true,
        then: Yup.string()
          .required("Image is required")
          .test("is-valid-url", "Invalid image", (value) => {
            return value && value !== "/img/default-placeholder.jpg";
          }),
        otherwise: Yup.string().notRequired(),
      }),

      sansthaPanCardImage: Yup.string().when("isRegistered", {
        is: true,
        then: Yup.string()
          .required("Image is required")
          .test("is-valid-url", "Invalid image", (value) => {
            return value && value !== "/img/default-placeholder.jpg";
          }),
        otherwise: Yup.string().notRequired(),
      }),
    }),
    onSubmit: (values) => {
      // const temp_obj = {
      //   name: values?.name,
      //   image: values?.image,
      //   hub: values?.hub,
      //   description: values?.description,
      //   active: values?.active,
      //   verified: values?.verified,
      //   isRegistered: values?.isRegistered,
      //   navigate: navigate,
      // };
      const temp_obj = {
        name: values?.name,
        image: values?.image,
        hub: values?.hub,
        description: values?.description,
        sansthaPincode: values?.sansthaPincode,
        sansthaArea: values?.sansthaArea,
        sansthaState: values?.sansthaState,
        sansthaDistrict: values?.sansthaDistrict,
        sansthaBlock: values?.sansthaBlock,
        sansthaCountry: values?.sansthaCountry,
        sansthaPlaceAddress: values?.sansthaPlaceAddress,
        active: values?.active,
        verified: values?.verified,
        sansthaPlace: values?.sansthaPlace,
        isRegistered: values?.isRegistered,
        navigate: navigate,

        aadhaarnumber: values?.aadhaarnumber,
        pancardnumber: values?.pancardnumber,
        aadhaarFront: values?.aadhaarFront,
        aadhaarBack: values?.aadhaarBack,
        panCardImage: values?.panCardImage,

        // ...(values?.isRegistered && {
        registrationNumber: values?.registrationNumber,
        registrationDate: values?.registrationDate,
        sansthaType: values?.sansthaType,
        Act: values?.Act,
        sansthaPanCardNumber: values?.sansthaPanCardNumber,
        authorityLetters: values?.authorityLetters,
        sansthaCertificate: values?.sansthaCertificate,
        sansthaPanCardImage: values?.sansthaPanCardImage,
        // }),
        acceptingnewmember: values?.acceptingnewmember,

        verifiedAadharCard: values?.verifiedAadharCard,
        verifiedPancard: values?.verifiedPancard,
        verifiedRegistrationNumber: values?.verifiedRegistrationNumber,
        verifiedSansthaPancard: values?.verifiedSansthaPancard,
      };

      console.log(temp_obj);

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

      if (id) {
        console.log(id);
        console.log(filtered_obj, "filtered_obj");
        dispatch(appUpdateSanstha({ ...filtered_obj, id })).then(() => {
          navigate("/sanstha");
        });
      } else {
        console.log(filtered_obj);
        dispatch(appCreateSanstha(filtered_obj));
        formik.resetForm();
      }
    },
  });

  useEffect(() => {
    const fetchAreaOnEdit = async () => {
      if (sanstha && id) {
        const selectedsanstha = Array.isArray(sanstha)
          ? sanstha.find((c) => c._id === id)
          : sanstha;
  
        if (selectedsanstha?.sansthaPincode) {
          const postOffices = await fetchPincodeDetails(selectedsanstha.sansthaPincode);
          setAreaList(postOffices);
        }
      }
    };
  
    fetchAreaOnEdit();
  }, [sanstha, id]);
  

  const checkAllDocumentsVerified = () => {
    const requiredFields = [
      formik.values.verifyAadharFront,
      formik.values.verifiedPancard,
    ];

    if (formik.values.isRegistered) {
      requiredFields.push(
        formik.values.verifiedSansthaPancard,
        formik.values.verifiedRegistrationNumber
      );
    }

    return requiredFields.every(Boolean);
  };

  return (
    <>
      <div className="content-wrapper">
        <div className="content-heading">
          <div>
            <span>
              <Link to="/sanstha">Sanstha</Link>
            </span>{" "}
            <span>/ {id ? "Edit Sanstha" : "New Sanstha"}</span>
          </div>
        </div>
        <div className="card card-default">
          <div className="card-body">
            <form onSubmit={formik.handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>
                      Community <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      name="_id"
                      options={
                        Array.isArray(Hub?.data)
                          ? Hub?.data.map((place) => ({
                              value: place._id,
                              label: place.name,
                            }))
                          : []
                      }
                      onChange={(option) => {
                        formik.setFieldValue("hub", option?.value);
                      }}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      value={
                        Array.isArray(Hub?.data)
                          ? Hub?.data
                              .filter(
                                (option) => option._id === formik?.values?.hub
                              )
                              .map((option) => ({
                                value: option._id,
                                label: option.name,
                              }))[0]
                          : null
                      }
                      placeholder="Select.."
                    />
                    {formik.touched.hub && formik.errors.hub ? (
                      <div style={{ color: "red" }}>{formik.errors.hub}</div>
                    ) : null}
                  </div>
                </div>

                <div className="col-md-6">
                  <ImageUpload
                    uploadFunction={uploadSansthaImage}
                    fieldName="image"
                    value={formik.values.image}
                    onChange={(value) => formik.setFieldValue("image", value.url)}
                    error={
                      formik.touched.image && formik.errors.image
                        ? formik.errors.image
                        : null
                    }
                    label="Sanstha Image *"
                  />
                </div>
              </div>
              <div className="row" style={{padding: "0 0 15px 0"}}>
           {/* Sanstha Name */}
              <div className="col-md-6 mb-3">
                  <label>
                    Sanstha Name <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    name="name"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-danger">{formik.errors.name}</div>
                  )}
                </div>
              </div>

              <div className="row" style={{ padding: "0 0 15px 0" }}>
            
                {/* Pincode */}
                <div className="col-md-6 mb-3">
                  <label>Pincode <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    name="sansthaPincode"
                    type="number"
                    onChange={formik.handleChange}
                    onBlur={handlePincodeBlur}
                    value={formik.values.sansthaPincode}
                  />
               {formik.touched.sansthaPincode &&
                    formik.errors.sansthaPincode && (
                      <div className="text-danger">
                        {formik.errors.sansthaPincode}
                      </div>
                    )}
                </div>

                {/* Select Area */}
                <div className="col-md-6 mb-3">
                  <label>Select Area</label>
                  <select
                    className="form-control"
                    name="sansthaArea"
                    onChange={(e) => {
                      const selected = areaList.find(
                        (a) => a.Name === e.target.value
                      );
                      setSelectedArea(selected);
                      formik.setFieldValue("sansthaArea", e.target.value);
                      formik.setFieldValue("sansthaState", selected?.State || "");
                      formik.setFieldValue(
                        "sansthaDistrict",
                        selected?.District || ""
                      );
                      formik.setFieldValue("sansthaBlock", selected?.Block  || "");
                    }}
                    value={formik.values.sansthaArea || ""}
                  >
                    <option value="">Select Area</option>
                    {areaList.map((area) => (
                      <option key={area.Name} value={area.Name}>
                        {area.Name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.sansthaArea &&
                    formik.errors.sansthaArea && (
                      <div className="text-danger">
                        {formik.errors.sansthaArea}
                      </div>
                    )}
                </div>

                {/* State */}
                <div className="col-md-6 mb-3">
                  <label>State</label>
                  <input
                    className="form-control"
                    name="sansthaState"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.sansthaState}
                  />
                   {formik.touched.sansthaState &&
                    formik.errors.sansthaState && (
                      <div className="text-danger">
                        {formik.errors.sansthaState}
                      </div>
                    )}
                </div>

                {/* District */}
                <div className="col-md-6 mb-3">
                  <label>District</label>
                  <input
                    className="form-control"
                    name="sansthaDistrict"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.sansthaDistrict}
                  />
                   {formik.touched.sansthaDistrict &&
                    formik.errors.sansthaDistrict && (
                      <div className="text-danger">
                        {formik.errors.sansthaDistrict}
                      </div>
                    )}
                </div>

                {/* Taluka */}
                <div className="col-md-6 mb-3">
                  <label>Taluka</label>
                  <input
                    className="form-control"
                    name="sansthaBlock"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.sansthaBlock}
                  />
                   {formik.touched.sansthaBlock &&
                    formik.errors.sansthaBlock && (
                      <div className="text-danger">
                        {formik.errors.sansthaBlock}
                      </div>
                    )}
                </div>

                {/* Sanstha Address */}
                <div className="col-md-12 mb-3">
                  <label>
                    Sanstha Address <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    name="sansthaPlaceAddress"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.sansthaPlaceAddress}
                  />
                  {formik.touched.sansthaPlaceAddress &&
                    formik.errors.sansthaPlaceAddress && (
                      <div className="text-danger">
                        {formik.errors.sansthaPlaceAddress}
                      </div>
                    )}
                </div>
              </div>

              <div className="row" style={{ padding: "0 0 15px 0" }}>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>
                      Admin user Aadhar card number{" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      className="form-control"
                      name="aadhaarnumber"
                      type="text"
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "");
                        formik.setFieldValue("aadhaarnumber", numericValue);
                      }}
                      onBlur={formik.handleBlur}
                      value={formik.values.aadhaarnumber}
                    />
                    {formik.touched.aadhaarnumber &&
                    formik.errors.aadhaarnumber ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.aadhaarnumber}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>
                      Admin user PAN card number{" "}
                      <span style={{ color: "red" }}>*</span>
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
                    />
                    {formik.touched.pancardnumber &&
                    formik.errors.pancardnumber ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.pancardnumber}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* <div className="row">
                <div className="col-md-6">
                  <ImageUpload
                    uploadFunction={uploadSansthaImage}
                    fieldName="aadhaarFront"
                    value={formik.values.aadhaarFront}
                    onChange={(value) =>
                      formik.setFieldValue("aadhaarFront", value)
                    }
                    error={
                      formik.touched.aadhaarFront && formik.errors.aadhaarFront
                        ? formik.errors.aadhaarFront
                        : null
                    }
                    label="Aadhaar Front"
                  />
                </div>

                <div className="col-md-6">
                  <ImageUpload
                    uploadFunction={uploadSansthaImage}
                    fieldName="aadhaarBack"
                    value={formik.values.aadhaarBack}
                    onChange={(value) =>
                      formik.setFieldValue("aadhaarBack", value)
                    }
                    error={
                      formik.touched.aadhaarBack && formik.errors.aadhaarBack
                        ? formik.errors.aadhaarBack
                        : null
                    }
                    label="Aadhaar Back"
                  />
                </div>
                <div className="col-md-6">
                  <ImageUpload
                    uploadFunction={uploadSansthaImage}
                    fieldName="panCardImage"
                    value={formik.values.panCardImage}
                    onChange={(value) =>
                      formik.setFieldValue("panCardImage", value)
                    }
                    error={
                      formik.touched.panCardImage && formik.errors.panCardImage
                        ? formik.errors.panCardImage
                        : null
                    }
                    label="PAN Card Image"
                  />
                </div>
              </div> */}

              <div className="row">
                {/* Column 1: About */}
                <div className="col-md-6">
                  <div className="form-group">
                    <label>
                      About <span style={{ color: "red" }}>*</span>
                    </label>
                    <Editor
                      editorClassName="form-control"
                      editorState={editorValues}
                      onEditorStateChange={onEditorStateChange}
                      editorStyle={{ height: 300 }}
                    />
                    {formik.touched.description &&
                      formik.errors.description && (
                        <div style={{ color: "red" }}>
                          {formik.errors.description}
                        </div>
                      )}
                  </div>
                </div>

                {/* Column 2: Documents */}
                <div className="col-md-6">
                  <div className="" style={{ width: "100%" }}>
                    <div className="card">
                      <h4 className="mb-3">Sanstha Documents </h4>

                      <table className="table table-bordered">
                        <thead
                          style={{
                            backgroundColor: "#f5f5f5",
                            color: "#191717",
                          }}
                        >
                          <tr style={{ fontWeight: "bold" }}>
                            <th style={{ width: "20%", color: "#474040" }}>
                              Document Name
                            </th>
                            <th style={{ width: "40%", color: "#474040" }}>
                              Upload / Preview
                            </th>
                            <th style={{ width: "15%", color: "#474040" }}>
                              Download
                            </th>
                            <th style={{ width: "15%", color: "#474040" }}>
                              Verified
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Aadhar Front */}
                          <tr>
                            <td>
                              Admin user Aadhar card front Image{" "}
                              <span style={{ color: "red" }}>*</span>
                            </td>
                            <td>
                              <ImageUpload
                                uploadFunction={uploadSansthaImage}
                                fieldName="aadhaarFront"
                                value={formik.values.aadhaarFront}
                                onChange={(value) =>
                                  formik.setFieldValue("aadhaarFront", value.url)
                                }
                                label=""
                                error={
                                  formik.touched.aadhaarFront &&
                                  formik.errors.aadhaarFront
                                    ? formik.errors.aadhaarFront
                                    : null
                                }
                                icon={<i className="fa fa-upload"></i>}
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {formik.values.aadhaarFront && (
                                <a
                                  href={formik.values.aadhaarFront}
                                  target="_blank"
                                  download
                                  className="btn btn-outline-secondary btn-sm"
                                >
                                  <i className="fa fa-download"></i>
                                </a>
                              )}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <div className="custom-control custom-switch">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id="verifyAadharFront"
                                  checked={formik.values.verifyAadharFront}
                                  onChange={() =>
                                    formik.setFieldValue(
                                      "verifyAadharFront",
                                      !formik.values.verifyAadharFront
                                    )
                                  }
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor="verifyAadharFront"
                                ></label>
                              </div>
                            </td>
                          </tr>

                          {/* Aadhar Back */}
                          <tr>
                            <td>
                              Admin user Aadhar card back Image{" "}
                              <span style={{ color: "red" }}>*</span>
                            </td>
                            <td>
                              <ImageUpload
                                uploadFunction={uploadSansthaImage}
                                fieldName="aadhaarBack"
                                value={formik.values.aadhaarBack}
                                onChange={(value) =>
                                  formik.setFieldValue("aadhaarBack", value.url)
                                }
                                label=""
                                error={
                                  formik.touched.aadhaarBack &&
                                  formik.errors.aadhaarBack
                                    ? formik.errors.aadhaarBack
                                    : null
                                }
                                icon={<i className="fa fa-upload"></i>}
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {formik.values.aadhaarBack && (
                                <a
                                  href={formik.values.aadhaarBack}
                                  target="_blank"
                                  download
                                  className="btn btn-outline-secondary btn-sm"
                                >
                                  <i className="fa fa-download"></i>
                                </a>
                              )}
                            </td>
                            <td></td>
                          </tr>

                          {/* PAN Card */}
                          <tr>
                            <td>
                              Admin user PAN card Image{" "}
                              <span style={{ color: "red" }}>*</span>
                            </td>
                            <td>
                              <ImageUpload
                                uploadFunction={uploadSansthaImage}
                                fieldName="panCardImage"
                                value={formik.values.panCardImage}
                                onChange={(value) =>
                                  formik.setFieldValue("panCardImage", value.url)
                                }
                                label=""
                                error={
                                  formik.touched.panCardImage &&
                                  formik.errors.panCardImage
                                    ? formik.errors.panCardImage
                                    : null
                                }
                                icon={<i className="fa fa-upload"></i>}
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {formik.values.panCardImage && (
                                <a
                                  href={formik.values.panCardImage}
                                  target="_blank"
                                  download
                                  className="btn btn-outline-secondary btn-sm"
                                >
                                  <i className="fa fa-download"></i>
                                </a>
                              )}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <div className="custom-control custom-switch">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id="verifiedPancard"
                                  checked={formik.values.verifiedPancard}
                                  onChange={() =>
                                    formik.setFieldValue(
                                      "verifiedPancard",
                                      !formik.values.verifiedPancard
                                    )
                                  }
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor="verifiedPancard"
                                ></label>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* <div className="card mb-3 p-3"> */}
                  {/* <h4 className="mb-3">Documents</h4>
      <div className="row mb-2 align-items-center">
  <div className="col-md-3 font-weight-bold">
    Aadhar Front:
  </div>

  <div className="col-md-5 d-flex align-items-center gap-2">
    <ImageUpload
      uploadFunction={uploadSansthaImage}
      fieldName="aadhaarFront"
      value={formik.values.aadhaarFront}
      onChange={(value) => formik.setFieldValue("aadhaarFront", value)}
      label=""
      error={
        formik.touched.aadhaarFront && formik.errors.aadhaarFront
          ? formik.errors.aadhaarFront
          : null
      }
      icon={<i className="fa fa-upload"></i>}
    />

    {formik.values.aadhaarFront && (
      <a
        href={formik.values.aadhaarFront}
        target="_blank"
        download
        className="btn btn-outline-secondary btn-sm"
        title="Download"
      >
        <i className="fa fa-download"></i>
      </a>
    )}
  </div>

  <div className="col-md-4 text-end">
    <div className="form-check form-switch">
    <div className="form-group d-flex align-items-center">
                <div className="custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="aadhaarFront"
                    checked={formik.values.verifyAadharFront}
                    onChange={() =>
                      formik.setFieldValue(
                        "verifyAadharFront",
                        !formik.values.verifyAadharFront
                      )
                    }
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="aadhaarFront"
                  ></label>
                </div>
              </div>
      <label className="form-check-label" htmlFor="verifyAadharFront">
        Verified
      </label>
    </div>
  </div>
</div> */}

                  {/* <div className="row">
              <div className="col-md-2">
                  <div className="form-group">
                    <label>Active</label>
                    <br />
                    <input
                      type="checkbox"
                      name="active"
                      checked={formik.values.active}
                      onChange={(e) =>
                        formik.setFieldValue("active", e.target.checked)
                      }
                    />
                  </div>
                </div>
                </div> */}
                  <div className="form-group d-flex align-items-center">
                    <label className="mr-3 mb-1" htmlFor="active">
                      Make this Sanstha Active{" "}
                      <small style={{ color: "red" }}>
                        {" "}
                        (Active sanstha will be visible to users)
                      </small>
                    </label>
                    <div className="custom-control custom-switch">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="active"
                        checked={formik.values.active}
                        onChange={() =>
                          formik.setFieldValue("active", !formik.values.active)
                        }
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="active"
                      ></label>
                    </div>
                  </div>

                  <div className="form-group d-flex align-items-center">
                    <label
                      className="mr-3 mb-0"
                      htmlFor="durationSwitch"
                      style={{ fontSize: "18px" }}
                    >
                      Is this Sanstha is Registered ?
                    </label>
                    <div className="custom-control custom-switch">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="durationSwitch"
                        checked={formik.values.isRegistered}
                        onChange={() =>
                          formik.setFieldValue(
                            "isRegistered",
                            !formik.values.isRegistered
                          )
                        }
                        // checked={isDurationEnabled}
                        // onChange={() => setIsDurationEnabled((prev) => !prev)}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="durationSwitch"
                      ></label>
                    </div>
                  </div>

                  {formik.values.isRegistered && (
                    <div className="" style={{ width: "100%" }}>
                      <div className="card">
                        <table className="table table-bordered">
                          <thead
                            style={{
                              backgroundColor: "#f5f5f5",
                              color: "#191717",
                            }}
                          >
                            <tr style={{ fontWeight: "bold" }}>
                              <th style={{ width: "20%", color: "#474040" }}>
                                Document Name
                              </th>
                              <th style={{ width: "40%", color: "#474040" }}>
                                Upload
                              </th>
                              <th style={{ width: "15%", color: "#474040" }}>
                                Download
                              </th>
                              <th style={{ width: "15%", color: "#474040" }}>
                                Verified
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Authority Letter */}
                            <tr>
                              <td>
                                Authority Letter{" "}
                                <span style={{ color: "red" }}>*</span>
                              </td>
                              <td>
                                <ImageUpload
                                  uploadFunction={uploadSansthaImage}
                                  fieldName="authorityLetters"
                                  value={formik.values.authorityLetters}
                                  onChange={(value) =>
                                    formik.setFieldValue(
                                      "authorityLetters",
                                      value.url
                                    )
                                  }
                                  label=""
                                  error={
                                    formik.touched.authorityLetters &&
                                    formik.errors.authorityLetters
                                      ? formik.errors.authorityLetters
                                      : null
                                  }
                                  icon={<i className="fa fa-upload"></i>}
                                />
                              </td>
                              <td>
                                {formik.values.authorityLetters && (
                                  <a
                                    href={formik.values.authorityLetters}
                                    target="_blank"
                                    download
                                    className="btn btn-outline-secondary btn-sm"
                                  >
                                    <i className="fa fa-download"></i>
                                  </a>
                                )}
                              </td>
                              <td>-</td>
                            </tr>

                            {/* Sanstha Pancard */}
                            <tr>
                              <td>
                                Sanstha Pan card
                                <span style={{ color: "red" }}>*</span>
                              </td>
                              <td>
                                <ImageUpload
                                  uploadFunction={uploadSansthaImage}
                                  fieldName="sansthaPanCardImage"
                                  value={formik.values.sansthaPanCardImage}
                                  onChange={(value) =>
                                    formik.setFieldValue(
                                      "sansthaPanCardImage",
                                      value.url
                                    )
                                  }
                                  label=""
                                  error={
                                    formik.touched.sansthaPanCardImage &&
                                    formik.errors.sansthaPanCardImage
                                      ? formik.errors.sansthaPanCardImage
                                      : null
                                  }
                                  icon={<i className="fa fa-upload"></i>}
                                />
                              </td>
                              <td>
                                {formik.values.sansthaPanCardImage && (
                                  <a
                                    href={formik.values.sansthaPanCardImage}
                                    target="_blank"
                                    download
                                    className="btn btn-outline-secondary btn-sm"
                                  >
                                    <i className="fa fa-download"></i>
                                  </a>
                                )}
                              </td>
                              <td>
                                <div className="col-md-4 text-end">
                                  <div className="form-check form-switch">
                                    <div className="form-group d-flex align-items-center">
                                      <div className="custom-control custom-switch">
                                        <input
                                          type="checkbox"
                                          className="custom-control-input"
                                          id="verifiedSansthaPancard"
                                          checked={
                                            formik.values.verifiedSansthaPancard
                                          }
                                          onChange={() =>
                                            formik.setFieldValue(
                                              "verifiedSansthaPancard",
                                              !formik.values
                                                .verifiedSansthaPancard
                                            )
                                          }
                                        />
                                        <label
                                          className="custom-control-label"
                                          htmlFor="verifiedSansthaPancard"
                                        ></label>
                                      </div>
                                    </div>
                                    {/* <label className="form-check-label" htmlFor="verifyAadharFront">
      Verified
    </label> */}
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Sanstha Certificate */}
                            <tr>
                              <td>
                                Sanstha Certificate{" "}
                                <span style={{ color: "red" }}>*</span>
                              </td>
                              <td>
                                <ImageUpload
                                  uploadFunction={uploadSansthaImage}
                                  fieldName="sansthaCertificate"
                                  value={formik.values.sansthaCertificate}
                                  onChange={(value) =>
                                    formik.setFieldValue(
                                      "sansthaCertificate",
                                      value.url
                                    )
                                  }
                                  label=""
                                  error={
                                    formik.touched.sansthaCertificate &&
                                    formik.errors.sansthaCertificate
                                      ? formik.errors.sansthaCertificate
                                      : null
                                  }
                                  icon={<i className="fa fa-upload"></i>}
                                />
                              </td>
                              <td>
                                {formik.values.sansthaCertificate && (
                                  <a
                                    href={formik.values.sansthaCertificate}
                                    target="_blank"
                                    download
                                    className="btn btn-outline-secondary btn-sm"
                                  >
                                    <i className="fa fa-download"></i>
                                  </a>
                                )}
                              </td>
                              <td>
                                <div className="col-md-4 text-end">
                                  <div className="form-check form-switch">
                                    <div className="form-group d-flex align-items-center">
                                      <div className="custom-control custom-switch">
                                        <input
                                          type="checkbox"
                                          className="custom-control-input"
                                          id="verifiedRegistrationNumber"
                                          checked={
                                            formik.values
                                              .verifiedRegistrationNumber
                                          }
                                          onChange={() =>
                                            formik.setFieldValue(
                                              "verifiedRegistrationNumber",
                                              !formik.values
                                                .verifiedRegistrationNumber
                                            )
                                          }
                                        />
                                        <label
                                          className="custom-control-label"
                                          htmlFor="verifiedRegistrationNumber"
                                        ></label>
                                      </div>
                                    </div>
                                    {/* <label className="form-check-label" htmlFor="verifyAadharFront">
      Verified
    </label> */}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* {formik.values.isRegistered && (
              <>
    <div className="row mb-2 align-items-center">
      <div className="col-md-3 font-weight-bold">
        Sanstha Type:
      </div>
      <div className="col-6">
        {selectedsanstha?.sansthaType || (
          <span className="text-muted">N/A</span>
        )}
      </div>
    </div>
    <div className="row mb-2 align-items-center">
      <div className="col-md-3 font-weight-bold">Sanstha Act:</div>
      <div className="col-6">
        {selectedsanstha?.Act || (
          <span className="text-muted">N/A</span>
        )}
      </div>
    </div>

    <div className="row mb-2 align-items-center">
<div className="col-md-3 font-weight-bold">
  Sanstha Authority Letter:
</div>

<div className="col-md-5 d-flex align-items-center gap-2">
  <ImageUpload
  uploadFunction={uploadSansthaImage}
  fieldName="authorityLetters"
  value={formik.values.authorityLetters}
  onChange={(value) =>
    formik.setFieldValue("authorityLetters", value)
  }
  label="" 
  error={
    formik.touched.authorityLetters &&
    formik.errors.authorityLetters
      ? formik.errors.authorityLetters
      : null
  }
  icon={<i className="fa fa-upload"></i>}
/>

{formik.values.authorityLetters && (
  <a
    href={formik.values.authorityLetters}
    target="_blank"
    download
    className="btn btn-outline-secondary btn-sm"
    title="Download"
  >
    <i className="fa fa-download"></i>
  </a>
)}
</div>
</div>

 
    <div className="row mb-2 align-items-center">
<div className="col-md-3 font-weight-bold">
  Sanstha Pancard:
</div>

<div className="col-md-5 d-flex align-items-center gap-2">
  <ImageUpload
  uploadFunction={uploadSansthaImage}
  fieldName="sansthaPanCardImage"
  value={formik.values.sansthaPanCardImage}
  onChange={(value) =>
    formik.setFieldValue("sansthaPanCardImage", value)
  }
  label="" 
  error={
    formik.touched.sansthaPanCardImage &&
    formik.errors.sansthaPanCardImage
      ? formik.errors.sansthaPanCardImage
      : null
  }
  icon={<i className="fa fa-upload"></i>}
/>

{formik.values.sansthaPanCardImage && (
  <a
    href={formik.values.sansthaPanCardImage}
    target="_blank"
    download
    className="btn btn-outline-secondary btn-sm"
    title="Download"
  >
    <i className="fa fa-download"></i>
  </a>
)}
</div>

<div className="col-md-4 text-end">
  <div className="form-check form-switch">
  <div className="form-group d-flex align-items-center">
              <div className="custom-control custom-switch">
                <input
                    type="checkbox"
                    className="custom-control-input"
                    id="verifiedSansthaPancard"
                    checked={formik.values.verifiedSansthaPancard}
                    onChange={() =>
                      formik.setFieldValue(
                        "verifiedSansthaPancard",
                        !formik.values.verifiedSansthaPancard
                      )
                    }
                  />
                <label
                  className="custom-control-label"
                  htmlFor="verifiedSansthaPancard"
                ></label>
              </div>
            </div>
    <label className="form-check-label" htmlFor="verifyAadharFront">
      Verified
    </label>
  </div>
</div>
</div>


<div className="row mb-2 align-items-center">
<div className="col-md-3 font-weight-bold">
  Sanstha Certificate:
</div>

<div className="col-md-5 d-flex align-items-center gap-2">
  <ImageUpload
  uploadFunction={uploadSansthaImage}
  fieldName="sansthaCertificate"
  value={formik.values.sansthaCertificate}
  onChange={(value) =>
    formik.setFieldValue("sansthaCertificate", value)
  }
  label="" 
  error={
    formik.touched.sansthaCertificate &&
    formik.errors.sansthaCertificate
      ? formik.errors.sansthaCertificate
      : null
  }
  icon={<i className="fa fa-upload"></i>}
/>

{formik.values.sansthaCertificate && (
  <a
    href={formik.values.sansthaCertificate}
    target="_blank"
    download
    className="btn btn-outline-secondary btn-sm"
    title="Download"
  >
    <i className="fa fa-download"></i>
  </a>
)}
</div>

<div className="col-md-4 text-end">
  <div className="form-check form-switch">
  <div className="form-group d-flex align-items-center">
              <div className="custom-control custom-switch">
                <input
                    type="checkbox"
                    className="custom-control-input"
                    id="verifiedRegistrationNumber"
                    checked={formik.values.verifiedRegistrationNumber}
                    onChange={() =>
                      formik.setFieldValue(
                        "verifiedRegistrationNumber",
                        !formik.values.verifiedRegistrationNumber
                      )
                    }
                  />
                <label
                  className="custom-control-label"
                  htmlFor="verifiedRegistrationNumber"
                ></label>
              </div>
            </div>
    <label className="form-check-label" htmlFor="verifyAadharFront">
      Verified
    </label>
  </div>
</div>
</div>
</>)} */}
                  {/* </div>  */}
                </div>
              </div>

              {/* <div className="form-group d-flex align-items-center">
                <label className="mr-3 mb-0" htmlFor="durationSwitch">
                  Is Registered?
                </label>
                <div className="custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="durationSwitch"
                    checked={formik.values.isRegistered}
                    onChange={() =>
                      formik.setFieldValue(
                        "isRegistered",
                        !formik.values.isRegistered
                      )
                    }
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="durationSwitch"
                  ></label>
                </div>
              </div> */}

              {formik.values.isRegistered && (
                <>
                  <div className="row" style={{ padding: "0 0 15px 0" }}>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>
                          Registration Number{" "}
                          <span style={{ color: "red" }}>*</span>
                        </label>

                        <input
                          className="form-control"
                          name="registrationNumber"
                          type="text"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.registrationNumber}
                        />
                        {formik.touched.registrationNumber &&
                        formik.errors.registrationNumber ? (
                          <div style={{ color: "red" }}>
                            {formik.errors.registrationNumber}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>
                          Sanstha Type <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                          className="form-control"
                          name="sansthaType"
                          value={selectedSansthaType}
                          // onChange={(e) => {
                          //   const value = e.target.value;
                          //   setSelectedSansthaType(value);
                          //   setSelectedAct('');
                          //   formik.setFieldValue("sansthaType", value);
                          // }}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedSansthaType(value);
                            setSelectedAct("");
                            setOtherSansthaType("");
                            formik.setFieldValue("sansthaType", value);
                          }}
                        >
                          <option value="">Select Sanstha Type</option>
                          {sansthaData.map((type) => (
                            <option
                              key={type.sansthaType}
                              value={type.sansthaType}
                            >
                              {type.sansthaType}
                            </option>
                          ))}
                          <option value="Other">Other</option>
                        </select>

                        {selectedSansthaType === "Other" && (
                          <input
                            className="form-control mt-2"
                            placeholder="Enter other Sanstha Type"
                            value={otherSansthaType}
                            onChange={(e) => {
                              setOtherSansthaType(e.target.value);
                              formik.setFieldValue(
                                "sansthaType",
                                e.target.value
                              );
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row" style={{ padding: "0 0 15px 0" }}>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>
                          Sanstha Act <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                          className="form-control"
                          name="Act"
                          value={selectedAct}
                          // onChange={(e) => {
                          //   const value = e.target.value;
                          //   setSelectedAct(value);
                          //   formik.setFieldValue("Act", value);
                          // }}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedAct(value);
                            setOtherSansthaType("");
                            formik.setFieldValue("Act", value);
                          }}
                          // disabled={!selectedSansthaType}
                        >
                          <option value="">Select Act</option>
                          {actOptions.map((act, idx) => (
                            <option key={idx} value={act}>
                              {act}
                            </option>
                          ))}
                        </select>

                        {selectedAct === "Other" && (
                          <input
                            className="form-control mt-2"
                            placeholder="Enter other Act"
                            value={otherAct}
                            onChange={(e) => {
                              setOtherAct(e.target.value);
                              formik.setFieldValue("Act", e.target.value);
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>
                          Date of registration{" "}
                          <span style={{ color: "red" }}>*</span>
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          value={formik.values.registrationDate || ""}
                          onChange={(e) => {
                            const rawValue = e.target.value;
                            if (!rawValue) {
                              formik.setFieldValue("registrationDate", "");
                              // setStartDate(null);
                              return;
                            }

                            const dateObj = new Date(rawValue);
                            if (isNaN(dateObj.getTime())) return;

                            formik.setFieldValue("registrationDate", rawValue);
                          }}
                        />
                        {formik.touched.registrationDate &&
                        formik.errors.registrationDate ? (
                          <div style={{ color: "red" }}>
                            {formik.errors.registrationDate}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label>
                          Sanstha Pan Card Number{" "}
                          <span style={{ color: "red" }}>*</span>{" "}
                        </label>

                        <input
                          className="form-control"
                          name="sansthaPanCardNumber"
                          type="text"
                          // onChange={formik.handleChange}
                          onChange={(e) => {
                            const upperCaseValue = e.target.value.toUpperCase();
                            formik.setFieldValue(
                              "sansthaPanCardNumber",
                              upperCaseValue
                            );
                          }}
                          onBlur={formik.handleBlur}
                          value={formik.values.sansthaPanCardNumber}
                        />
                        {formik.touched.sansthaPanCardNumber &&
                        formik.errors.sansthaPanCardNumber ? (
                          <div style={{ color: "red" }}>
                            {formik.errors.sansthaPanCardNumber}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* <div className="form-group d-flex align-items-center">
                <label className="mr-3 mb-0" htmlFor="durationSwitch">
                  Is Registered?
                </label>
                <div className="custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="durationSwitch"
                    checked={formik.values.isRegistered}
                    onChange={() =>
                      formik.setFieldValue(
                        "isRegistered",
                        !formik.values.isRegistered
                      )
                    }
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="durationSwitch"
                  ></label>
                </div>
              </div> */}

              <div className="form-group d-flex align-items-center">
                <label className="mr-3 mb-0" htmlFor="durationSwitch">
                  Have you Verified All the Documents ?
                </label>
                <div className="custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="verified"
                    checked={formik.values.verified}
                    // onChange={() =>
                    //   formik.setFieldValue(
                    //     "verified",
                    //     !formik.values.verified
                    //   )
                    // }
                    onChange={(e) => {
                      if (!checkAllDocumentsVerified()) {
                        setShowVerificationAlert(true);
                        e.preventDefault();
                      } else {
                        formik.setFieldValue(
                          "verified",
                          !formik.values.verified
                        );
                      }
                    }}
                    //disabled={!checkAllDocumentsVerified()}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="verified"
                  ></label>
                </div>
              </div>

              <div className="form-group d-flex align-items-center">
                <label className="mr-3 mb-0" htmlFor="durationSwitch">
                  Accepting New Member
                </label>
                <div className="custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="acceptingnewmember"
                    checked={formik.values.acceptingnewmember}
                    onChange={() =>
                      formik.setFieldValue(
                        "acceptingnewmember",
                        !formik.values.acceptingnewmember
                      )
                    }
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="acceptingnewmember"
                  ></label>
                </div>
              </div>

              {/* <div className="row">
                <div className="col-md-2">
                  <div className="form-group">
                    <label>Verified</label>
                    <br />
                    <input
                      type="checkbox"
                      name="verified"
                      checked={formik.values.verified}
                      onChange={(e) =>
                        formik.setFieldValue("verified", e.target.checked)
                      }
                    />
                  </div>
                </div>
                </div> */}

              {/* <div className="form-group">
                    <label>Accepting New Member</label>
                    <br />
                    <input
                      type="checkbox"
                      name="acceptingnewmember"
                      checked={formik.values.acceptingnewmember}
                      onChange={(e) =>
                        formik.setFieldValue("acceptingnewmember", e.target.checked)
                      }
                    />
                  </div> */}

              <div>
                <button
                  className="btn btn-labeled btn-success mb-2"
                  type="submit"
                  style={{ fontSize: "17px" }}
                >
                  <span className="btn-label">
                    <i className="fa fa-check"></i>
                  </span>
                  {id ? "Update" : "Create"}
                </button>
                <span style={{ padding: "0 10px" }}>or</span>
                <button
                  className="btn btn-labeled btn-secondary mb-2"
                  type="button"
                  style={{ fontSize: "17px" }}
                  onClick={() => navigate("/sanstha")}
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

      {showVerificationAlert && (
        <div
          className="modal"
          style={{
            display: "block",
            marginTop: "50px",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Verification Required</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowVerificationAlert(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Please verify all documents before marking as fully verified.
                </p>
                <ul>
                  {!formik.values.verifyAadharFront && (
                    <li>Admin user Aadhar card front</li>
                  )}
                  {!formik.values.verifiedPancard && (
                    <li>Admin user PAN card</li>
                  )}
                  {formik.values.isRegistered &&
                    !formik.values.verifiedSansthaPancard && (
                      <li>Sanstha PAN Card</li>
                    )}
                  {formik.values.isRegistered &&
                    !formik.values.verifiedRegistrationNumber && (
                      <li>Sanstha Certificate</li>
                    )}
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowVerificationAlert(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default NewSanstha;
