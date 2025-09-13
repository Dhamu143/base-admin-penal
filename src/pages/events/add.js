import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { appGetAllSanstha } from "../../store/sanstha";
import { appAllGetHubs } from "../../store/hubs";
import ImageUpload from "../../components/ImageUpload";
import { uploadSponsorImage } from "../../store/sponsor";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import { appGetAllUser } from "../../store/user";
import axios from "axios";
import {
  appCreateEvent,
  appGetAllEvent,
  appGetEventDetails,
  appUpdateEvent,
  setEmptyEvent,
} from "../../store/event";
import MultipleMediaUpload from "../../components/MultipleMediaUpload";

function NewEvent() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { event, isloder } = useSelector((state) => state.eventReducer);
  const Hub = useSelector((state) => state.hubReducer.hub);
  // console.log(Hub)
  const Sanstha = useSelector((state) => state?.sansthaReducer?.sanstha);
  const users = useSelector((state) => state?.usersReducer.users);
  const [editorValues, setValues] = useState(EditorState.createEmpty());
  const [areaList, setAreaList] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const eventDetails = useSelector((state) => state.eventReducer.eventDetails);

  // const handleHubChange = (option) => {
  //   formik.setFieldValue("hub", option?.value);
  //   dispatch(appGetAllSanstha({ page: 1, limit: 1000, hub: option?.value }));
  //   dispatch(appGetAllUser({ page: 1, limit: 1000, hub: option?.value }));
  // };

  // const handleSansthaChange = (option) => {
  //   formik.setFieldValue("sanstha", option?.value);
  //   dispatch(appGetAllUser({ page: 1, limit: 1000, sansthaId: option?.value }));
  // };

  const handleHubChange = (option) => {
    formik.setFieldValue("hub", option?.value);
    dispatch(appGetAllSanstha({ page: 1, limit: 1000, hub: option?.value }));
    dispatch(appGetAllUser({ page: 1, limit: 1000, hub: option?.value }));
  };
  const handleSansthaChange = (option) => {
    formik.setFieldValue("sanstha", option?.value);
    dispatch(appGetAllUser({ page: 1, limit: 1000, sansthaId: option?.value }));
  };

  useEffect(() => {
    dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
    dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
    // dispatch(appGetAllPost({ page: 1, limit: 1000 }));
    dispatch(appGetAllEvent({ page: 1, limit: 1000 }));
    dispatch(appGetAllUser({ page: 1, limit: 1000 }));
    if (id) {
      dispatch(appGetEventDetails(id));
    }
    return () => {
      dispatch(setEmptyEvent());
    };
  }, [dispatch, id]);

  const onEditorStateChange = (editorState) => {
    formik.setFieldValue(
      "description",
      draftToHtml(convertToRaw(editorState.getCurrentContent()))
    );
    setValues(editorState);
  };

  const populateData = () => {
    if (event.data) {
      const selectedHub = Array.isArray(event.data)
        ? event.data.find((h) => h._id === id)
        : event.data;

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
  }, [event]);

  const categoryOptions = [
    { value: "Cultural", label: "Cultural" },
    { value: "Religious", label: "Religious" },
    { value: "Wedding", label: "Wedding" },
    { value: "General Meeting", label: "General Meeting" },
    { value: "Medical Camp", label: "Medical Camp" },
    { value: "Workshop", label: "Workshop" },
    { value: "Sports", label: "Sports" },
    { value: "Talent Show", label: "Talent Show" },
    { value: "Donation Drive", label: "Donation Drive" },
    { value: "Matrimonial Meet", label: "Matrimonial Meet" },
    { value: "Family Gathering", label: "Family Gathering" },
    { value: "Felicitation", label: "Felicitation" },
    { value: "Blood Donation Camp", label: "Blood Donation Camp" },
    { value: "Free Eye Checkup", label: "Free Eye Checkup" },
    { value: "Housewarming", label: "Housewarming" },
    { value: "Anniversary", label: "Anniversary" },
    { value: "Personal Puja", label: "Personal Puja" },
  ];

  // const selectedEvent = useMemo(() => {
  //   if (!id || !event?.data) return null;
  //   return Array.isArray(event.data)
  //     ? event.data.find((r) => r._id === id)
  //     : event.data;
  // }, [event, id]);
  //  console.log(selectedEvent)

  // const categoryValues = categoryOptions
  //   .map((opt) => opt.value)
  //   .filter((val) => val !== "other");

  // const isCustomCategory =
  //   selectedEvent?.category && !categoryValues.includes(selectedEvent.category);

  const formik = useFormik({
    initialValues: {
      title: eventDetails?.title || "",
      description: eventDetails?.description || "",
      sanstha: eventDetails?.sanstha?._id || "",
      hub: eventDetails?.hub?._id || "",
      file: eventDetails?.file || null,
      fileType: null,
      category: eventDetails?.category || "",
      // otherCategory: isCustomCategory ? eventDetails?.otherCategory : "",
      startDate: eventDetails?.startDate
        ? new Date(
            new Date(eventDetails.startDate).setDate(
              new Date(eventDetails.startDate).getDate() + 1
            )
          )
            .toISOString()
            .slice(0, 10)
        : "",
      endDate: eventDetails?.endDate
        ? new Date(eventDetails.endDate).toISOString().slice(0, 10)
        : "",
      volunteers: eventDetails?.volunteers || [],
      // RSVPenabled: eventDetails?.RSVPenabled || false,
      //Waitlistenabled: eventDetails?.Waitlistenabled || false,
      locationType: eventDetails?.locationType || "",
      virtualLink: eventDetails?.virtualLink || "",
      nativePlacePincode: eventDetails?.nativePlacePincode || "",
      nativeArea: eventDetails?.nativeArea || "",
      nativeState: eventDetails?.nativeState || "",
      nativeDistrict: eventDetails?.nativeDistrict || "",
      nativeBlock: eventDetails?.nativeBlock || "",
      // nativeCountry: eventDetails?.nativeCountry || "",
      nativePlaceAddress: eventDetails?.nativePlaceAddress || "",
      RSVP_Enabled: eventDetails?.RSVP_Enabled || false,
      Waitlist_Enabled: eventDetails?.Waitlist_Enabled || false,
      RSVP_deadline: eventDetails?.RSVP_deadline
        ? new Date(eventDetails.RSVP_deadline).toISOString().slice(0, 10)
        : null,
      RSVP_limit: eventDetails?.RSVP_limit || "",
      //event_purpose: "",
      //visibility_type: "",
      upi_id: eventDetails?.upi_id || "",
      Allow_Vlonteers: eventDetails?.Allow_Vlonteers || false,
      allow_photo_upload: eventDetails?.allow_photo_upload || false,
      payment_mode_enabled: eventDetails?.payment_mode_enabled || false,
      boli_items: eventDetails?.boli_items || [],
      event_photo_upload: eventDetails?.event_photo_upload || [],
    },

    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string().required("Event title is required"),
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
      file: Yup.string()
        .required("Please upload a file")
        .test("is-valid-url", "Invalid image", (value) => {
          return value && value !== "/img/default-placeholder.jpg";
        }),
      // file: Yup.mixed()
      //   .required("Image or video is required")
      //   .test("is-valid-file", "Invalid file type", (value) => {
      //     if (!value) return false;
      //     if (value instanceof File) {
      //       return ["image/jpeg", "image/png", "video/mp4"].includes(
      //         value.type
      //       );
      //     }
      //     return typeof value === "string";
      //   }),
      startDate: Yup.date()
        .nullable()
        .required("Start date is required"),
      endDate: Yup.date()
        .nullable()
        .required("End date is required"),
    }),

    onSubmit: (values) => {
      console.log(values);
      const temp_obj = {
        title: values.title,
        description: values.description,
        sanstha: values.sanstha,
        hub: values.hub,
        file: values.file,
        // fileType: values.fileType,
        category: values.category,
        startDate: values.startDate,
        endDate: values.endDate,
        volunteers: values.volunteers,
        locationType: values.locationType,
        virtualLink: values.virtualLink,
        nativePlacePincode: values.nativePlacePincode,
        nativeArea: values.nativeArea,
        nativeState: values.nativeState,
        nativeDistrict: values.nativeDistrict,
        nativeBlock: values.nativeBlock,
        nativePlaceAddress: values.nativePlaceAddress,
        RSVP_Enabled: values.RSVP_Enabled,
        Waitlist_Enabled: values.Waitlist_Enabled,
        RSVP_deadline: values.RSVP_Enabled ? values.RSVP_deadline : null,
        RSVP_limit: values.RSVP_Enabled ? values.RSVP_limit : "",
        upi_id: values.payment_mode_enabled ? values.upi_id : "",
        Allow_Vlonteers: values.Allow_Vlonteers,
        allow_photo_upload: values.allow_photo_upload,
        payment_mode_enabled: values.payment_mode_enabled,
        boli_items: values.payment_mode_enabled ? values.boli_items : [],
        event_photo_upload: values.allow_photo_upload ? values.event_photo_upload : "",
        navigate: navigate,
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
      console.log(filtered_obj);
      if (id) {
        dispatch(appUpdateEvent({ ...filtered_obj, id })).then(() => {
          navigate("/event");
        });
      } else {
        dispatch(appCreateEvent(filtered_obj)).then(() => {
          navigate("/event");
          formik.resetForm();
        });
      }
    },
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
    // console.log(pincode);
    if (pincode && pincode.length === 6) {
      const postOffices = await fetchPincodeDetails(pincode);
      setAreaList(postOffices);
    }
  };

  useEffect(() => {
    const fetchAreaOnEdit = async () => {
      if (eventDetails && id) {
        // const selectedevent = Array.isArray(event?.data)
        //   ? event?.data.find((c) => c._id === id)
        //   : event?.data;

        if (eventDetails?.nativePlacePincode) {
          const postOffices = await fetchPincodeDetails(
            eventDetails?.nativePlacePincode
          );
          setAreaList(postOffices);
        }
      }
    };

    fetchAreaOnEdit();
  }, [eventDetails, id]);

  return (
    <>
      {isloder && <div className="loading">Loading...</div>}
      <div className="content-wrapper">
        <div className="content-heading">
          <div>
            <Link to="/event">Event</Link> / {id ? "Edit Event" : "New Event"}
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
                    name="_id"
                    options={
                      Array.isArray(Hub?.data)
                        ? Hub?.data.map((place) => ({
                            value: place._id,
                            label: place.name,
                          }))
                        : []
                    }
                    // onChange={(option) => {
                    //   formik.setFieldValue("hub", option?.value);
                    // }}
                    onChange={handleHubChange}
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
                    placeholder="Select Community.."
                  />
                  {formik.touched.hub && formik.errors.hub ? (
                    <div style={{ color: "red" }}>{formik.errors.hub}</div>
                  ) : null}
                </div>
                <div className="col-md-6">
                  <label>
                    Event Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    placeholder="Enter event title"
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
                    options={
                      Array.isArray(Sanstha)
                        ? Sanstha.map((place) => ({
                            value: place._id,
                            label: place.name,
                          }))
                        : []
                    }
                    onChange={handleSansthaChange}
                    value={
                      Array.isArray(Sanstha)
                        ? Sanstha.filter(
                            (option) => option._id === formik?.values?.sanstha
                          ).map((option) => ({
                            value: option._id,
                            label: option.name,
                          }))[0]
                        : null
                    }
                    placeholder="Select Sanstha.."
                  />
                  {formik.touched.sanstha && formik.errors.sanstha && (
                    <div className="text-danger">{formik.errors.sanstha}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label>
                    Event Description <span className="text-danger">*</span>
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
                <div className="mb-3 col-md-6">
                  {/* <ImageUpload
                      fieldName="file"
                      value={formik.values.file}
                      label="Event Banner *"
                      uploadFunction={uploadSponsorImage}
                      onChange={(value) => formik.setFieldValue("file", value)}
                      error={
                        formik.touched.file && formik.errors.file
                          ? formik.errors.file
                          : null
                      }
                    /> */}
                  <ImageUpload
                    fieldName="media"
                    value={formik.values.file || null}
                    label="Event Banner *"
                    uploadFunction={uploadSponsorImage}
                    onChange={(value) =>
                      formik.setFieldValue("file", value.url)
                    }
                    error={
                      formik.touched.file && formik.errors.file
                        ? formik.errors.file
                        : null
                    }
                    multiple={false}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label>
                    Category <span className="text-danger">*</span>
                  </label>
                  <Select
                    name="category"
                    options={categoryOptions}
                    onChange={(opt) =>
                      formik.setFieldValue("category", opt?.value)
                    }
                    value={
                      categoryOptions.find(
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
                <div className="col-md-6">
                  <label>
                    End Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control"
                    value={formik.values.endDate}
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
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>locationType </label>
                    <select
                      className="form-control"
                      name="locationType"
                      value={formik.values.locationType}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="">Select locationType</option>
                      <option value="Physical">Physical </option>
                      <option value="Virtual">Virtual </option>
                      {/* <option value="Hybrid">Hybrid</option> */}
                    </select>
                  </div>
                </div>
                {formik.values.locationType === "Virtual" && (
                  <div className="col-md-6">
                    <label>Event virtualLink</label>
                    <input
                      type="text"
                      name="virtualLink"
                      className="form-control"
                      value={formik.values.virtualLink}
                      onChange={formik.handleChange}
                      placeholder="Enter post virtualLink"
                    />
                  </div>
                )}
              </div>

              {formik.values.locationType === "Physical" && (
                <div className="row" style={{ padding: "0 0 15px 0" }}>
                  {/* Pincode */}
                  <div className="col-md-6 mb-3">
                    <label>Pincode</label>
                    <input
                      className="form-control"
                      name="nativePlacePincode"
                      type="number"
                      onChange={formik.handleChange}
                      onBlur={handlePincodeBlur}
                      value={formik.values.nativePlacePincode}
                    />
                    {formik.touched.nativePlacePincode &&
                      formik.errors.nativePlacePincode && (
                        <div className="text-danger">
                          {formik.errors.nativePlacePincode}
                        </div>
                      )}
                  </div>

                  {/* Select Area */}
                  <div className="col-md-6 mb-3">
                    <label>Select Area</label>
                    <select
                      className="form-control"
                      name="nativeArea"
                      onChange={(e) => {
                        const selected = areaList.find(
                          (a) => a.Name === e.target.value
                        );
                        setSelectedArea(selected);
                        formik.setFieldValue("nativeArea", e.target.value);
                        formik.setFieldValue(
                          "nativeState",
                          selected?.State || ""
                        );
                        formik.setFieldValue(
                          "nativeDistrict",
                          selected?.District || ""
                        );
                        formik.setFieldValue(
                          "nativeBlock",
                          selected?.Block || ""
                        );
                      }}
                      value={formik.values.nativeArea || ""}
                    >
                      <option value="">Select Area</option>
                      {areaList.map((area) => (
                        <option key={area.Name} value={area.Name}>
                          {area.Name}
                        </option>
                      ))}
                    </select>
                    {formik.touched.nativeArea && formik.errors.nativeArea && (
                      <div className="text-danger">
                        {formik.errors.nativeArea}
                      </div>
                    )}
                  </div>

                  {/* State */}
                  <div className="col-md-6 mb-3">
                    <label>State</label>
                    <input
                      className="form-control"
                      name="nativeState"
                      type="text"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.nativeState}
                    />
                    {formik.touched.nativeState &&
                      formik.errors.nativeState && (
                        <div className="text-danger">
                          {formik.errors.nativeState}
                        </div>
                      )}
                  </div>

                  {/* District */}
                  <div className="col-md-6 mb-3">
                    <label>District</label>
                    <input
                      className="form-control"
                      name="nativeDistrict"
                      type="text"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.nativeDistrict}
                    />
                    {formik.touched.nativeDistrict &&
                      formik.errors.nativeDistrict && (
                        <div className="text-danger">
                          {formik.errors.nativeDistrict}
                        </div>
                      )}
                  </div>

                  {/* Taluka */}
                  <div className="col-md-6 mb-3">
                    <label>Taluka</label>
                    <input
                      className="form-control"
                      name="nativeBlock"
                      type="text"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.nativeBlock}
                    />
                    {formik.touched.nativeBlock &&
                      formik.errors.nativeBlock && (
                        <div className="text-danger">
                          {formik.errors.nativeBlock}
                        </div>
                      )}
                  </div>

                  {/*  Address */}
                  <div className="col-md-12 mb-3">
                    <label>Address</label>
                    <input
                      className="form-control"
                      name="nativePlaceAddress"
                      type="text"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.nativePlaceAddress}
                    />
                    {formik.touched.nativePlaceAddress &&
                      formik.errors.nativePlaceAddress && (
                        <div className="text-danger">
                          {formik.errors.nativePlaceAddress}
                        </div>
                      )}
                  </div>
                </div>
              )}

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">RSVP enabled</label>
                  <div>
                    <label className="me-3">
                      <input
                        type="radio"
                        name="RSVP_Enabled"
                        checked={formik.values.RSVP_Enabled === true}
                        onChange={() =>
                          formik.setFieldValue("RSVP_Enabled", true)
                        }
                      />{" "}
                      Yes
                    </label>
                    <label className="ml-3">
                      <input
                        type="radio"
                        name="RSVP_Enabled"
                        checked={formik.values.RSVP_Enabled === false}
                        onChange={() =>
                          formik.setFieldValue("RSVP_Enabled", false)
                        }
                      />{" "}
                      No
                    </label>
                  </div>
                </div>
                {formik.values.RSVP_Enabled && (
                  <div className="col-md-6">
                    <label>RSVP Date</label>
                    <input
                      type="date"
                      name="RSVP_deadline"
                      className="form-control"
                      value={formik.values.RSVP_deadline}
                      onChange={(e) => {
                        const value = e.target.value;
                        formik.setFieldValue("RSVP_deadline", value);
                      }}
                    />
                    {formik.touched.RSVP_deadline &&
                      formik.errors.RSVP_deadline && (
                        <div className="text-danger">
                          {formik.errors.RSVP_deadline}
                        </div>
                      )}
                  </div>
                )}
              </div>
              {/* <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Status </label>
                    <select
                      className="form-control"
                      name="status"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="">Select Status</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Live">Live</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div> */}

              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Waitlist enabled</label>
                  <div>
                    <label className="me-3">
                      <input
                        type="radio"
                        name="Waitlist_Enabled"
                        checked={formik.values.Waitlist_Enabled === true}
                        onChange={() =>
                          formik.setFieldValue("Waitlist_Enabled", true)
                        }
                      />{" "}
                      Yes
                    </label>
                    <label className="ml-3">
                      <input
                        type="radio"
                        name="Waitlist_Enabled"
                        checked={formik.values.Waitlist_Enabled === false}
                        onChange={() =>
                          formik.setFieldValue("Waitlist_Enabled", false)
                        }
                      />{" "}
                      No
                    </label>
                  </div>
                </div>
                {formik.values.RSVP_Enabled && (
                  <div className="col-md-6">
                    <label>RSVP Limit</label>
                    <input
                      type="number"
                      name="RSVP_limit"
                      className="form-control"
                      value={formik.values.RSVP_limit}
                      onChange={formik.handleChange}
                      placeholder="Enter event RSVP Limit"
                    />
                  </div>
                )}
              </div>
              <div className="mb-3">
                <div className="col-md-6 form-check">
                  <div className="form-group">
                    <input
                      type="checkbox"
                      name="Allow_Vlonteers"
                      checked={formik.values.Allow_Vlonteers}
                      onChange={formik.handleChange}
                      className="form-check-input"
                      id="Allow_Vlonteers"
                    />
                  </div>
                  <label className="form-check-label" htmlFor="Allow_Vlonteers">
                    Allow volunteers
                  </label>
                </div>
              </div>
              {formik.values.Allow_Vlonteers && (
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const updated = [
                          ...formik.values.volunteers,
                          {
                            userId: [],
                            role: "",
                            remaining_count: "",
                            // , status: "Pending"
                          },
                        ];
                        formik.setFieldValue("volunteers", updated);
                      }}
                    >
                      Add Volunteer
                    </button>
                  </div>
                  {formik.values.volunteers?.map((volunteer, index) => (
                    <div
                      className="col-md-12 mb-3 d-flex align-items-center gap-2"
                      key={index}
                    >
                      <div className="flex-grow-1">
                        {/* <Select
                          options={
                            Array.isArray(users)
                              ? users.map((user) => ({
                                  value: user._id,
                                  label: user.firstName,
                                }))
                              : []
                          }
                          value={
                            Array.isArray(volunteer.userId)
                              ? volunteer.userId.map((u) => ({
                                  value: u._id, 
                                  label: u.firstName, 
                                }))
                              : []
                          }
                          onChange={(selectedOptions) => {
                            const updated = [...formik.values.volunteers];
                            updated[index].userId = selectedOptions.map(
                              (opt) => ({
                                _id: opt.value,
                                firstName: opt.label,
                              })
                            );
                            formik.setFieldValue("volunteers", updated);
                          }}
                          placeholder="Select User..."
                          isMulti
                        /> */}

                        <Select
                          options={
                            Array.isArray(users)
                              ? users.map((user) => ({
                                  value: user._id,
                                  label: user.firstName,
                                }))
                              : []
                          }
                          value={
                            Array.isArray(volunteer.userId)
                              ? volunteer.userId.map((u) => ({
                                  value: u._id,
                                  label: u.firstName,
                                }))
                              : []
                          }
                          onChange={(selectedOptions) => {
                            const updatedVolunteers = formik.values.volunteers.map(
                              (vol, idx) =>
                                idx === index
                                  ? {
                                      ...vol, // copy other properties of this volunteer
                                      userId: selectedOptions.map((opt) => ({
                                        _id: opt.value,
                                        firstName: opt.label,
                                      })),
                                    }
                                  : vol
                            );

                            formik.setFieldValue(
                              "volunteers",
                              updatedVolunteers
                            );
                          }}
                          placeholder="Select User..."
                          isMulti
                        />
                      </div>

                      <div className="flex-grow-1 ml-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter role"
                          value={volunteer.role}
                          onChange={(e) => {
                            const updated = [...formik.values.volunteers];
                            updated[index].role = e.target.value;
                            formik.setFieldValue("volunteers", updated);
                          }}
                        />
                      </div>

                      <div className="flex-grow-1 ml-2 mr-2">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter remaining count"
                          value={volunteer.remaining_count}
                          onChange={(e) => {
                            const updated = [...formik.values.volunteers];
                            updated[index].remaining_count = e.target.value;
                            formik.setFieldValue("volunteers", updated);
                          }}
                        />
                      </div>
                      {/* <div className="flex-grow-1 ml-2 mr-2">
                        <input
                          type="text"
                          name="status"
                          className="form-control"
                          value={volunteer.status}
                          onChange={(e) => {
                            const updated = [...formik.values.volunteers];
                            updated[index].status = e.target.value;
                            formik.setFieldValue("volunteers", updated);
                          }}
                        />
                      </div> */}

                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => {
                          const updated = formik.values.volunteers.filter(
                            (_, i) => i !== index
                          );
                          formik.setFieldValue("volunteers", updated);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">payment Mode Enabled</label>
                  <div>
                    <label className="me-3">
                      <input
                        type="radio"
                        name="payment_mode_enabled"
                        checked={formik.values.payment_mode_enabled === true}
                        onChange={() =>
                          formik.setFieldValue("payment_mode_enabled", true)
                        }
                      />{" "}
                      Yes
                    </label>
                    <label className="ml-3">
                      <input
                        type="radio"
                        name="payment_mode_enabled"
                        checked={formik.values.payment_mode_enabled === false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          formik.setFieldValue("payment_mode_enabled", false);
                          if (checked) {
                            formik.setFieldValue("boli_items", []);
                            formik.setFieldTouched("boli_items", []);
                            formik.setFieldValue("upi_id", "");
                            formik.setFieldValue("upi_id", "");
                          }
                        }}
                      />{" "}
                      No
                    </label>
                  </div>
                </div>
                {formik.values.payment_mode_enabled && (
                  <div className="col-md-6 mb-3">
                    <label>UPI Id</label>
                    <input
                      type="text"
                      className="form-control"
                      name="upi_id"
                      value={formik.values.upi_id}
                      placeholder="Enter Upi Id"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                )}
              </div>
              {formik.values.payment_mode_enabled && (
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const updated = [
                          ...formik.values.boli_items,
                          {
                            item_name: "",
                            amount_required: "",
                            amount_received: 0,
                            sponsored_by: [],
                          },
                        ];
                        formik.setFieldValue("boli_items", updated);
                      }}
                    >
                      Add Boli Item
                    </button>
                  </div>

                  {/* Loop through each Boli Item */}
                  {formik.values.boli_items?.map((item, index) => (
                    <div
                      className="col-md-12 mb-4 p-3 border rounded shadow-sm"
                      key={index}
                    >
                      <div className="row g-2 align-items-center">
                        {/* Item Name */}
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Boli Item Name"
                            value={item.item_name}
                            // onChange={(e) => {
                            //   const updated = [...formik.values.boli_items];
                            //   updated[index].item_name = e.target.value;
                            //   formik.setFieldValue("boli_items", updated);
                            // }}
                            onChange={(e) => {
                              const updated = formik.values.boli_items.map(
                                (item, idx) =>
                                  idx === index
                                    ? { ...item, item_name: e.target.value }
                                    : item
                              );
                              formik.setFieldValue("boli_items", updated);
                            }}
                          />
                        </div>

                        {/* Amount Required */}
                        <div className="col-md-2">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Amount Required"
                            value={item.amount_required}
                            // onChange={(e) => {
                            //   const updated = [...formik.values.boli_items];
                            //   updated[index].amount_required = e.target.value;
                            //   formik.setFieldValue("boli_items", updated);
                            // }}
                            onChange={(e) => {
                              const updated = formik.values.boli_items.map(
                                (item, idx) =>
                                  idx === index
                                    ? {
                                        ...item,
                                        amount_required: e.target.value,
                                      }
                                    : item
                              );
                              formik.setFieldValue("boli_items", updated);
                            }}
                          />
                        </div>

                        <div className="col-md-2">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Amount Received"
                            value={item.amount_received}
                            onChange={(e) => {
                              const value =
                                e.target.value === "" ? 0 : e.target.value;
                              const updated = formik.values.boli_items.map(
                                (item, idx) =>
                                  idx === index
                                    ? { ...item, amount_received: value }
                                    : item
                              );
                              formik.setFieldValue("boli_items", updated);
                            }}
                            // onChange={(e) => {
                            //   const updated = formik.values.boli_items.map(
                            //     (item, idx) =>
                            //       idx === index
                            //         ? { ...item, amount_received: e.target.value }
                            //         : item
                            //   );
                            //   formik.setFieldValue("boli_items", updated);
                            // }}
                          />
                        </div>

                        <div className="col-md-2">
                          <button
                            type="button"
                            className="btn btn-danger w-100"
                            onClick={() => {
                              const updated = formik.values.boli_items.filter(
                                (_, i) => i !== index
                              );
                              formik.setFieldValue("boli_items", updated);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <hr className="my-3" />

                      <div className="sponsors">
                        {/* <label className="fw-bold">Sponsors:</label> */}

                        {item.sponsored_by.map((sponsor, sponsorIndex) => (
                          <div
                            key={sponsorIndex}
                            className="d-flex align-items-center mb-2 mr-2 gap-2"
                          >
                            <div className="flex-grow-1">
                              <Select
                                options={
                                  Array.isArray(users)
                                    ? users.map((user) => ({
                                        value: user._id,
                                        label: user.firstName,
                                      }))
                                    : []
                                }
                                value={
                                  sponsor.userId
                                    ? (() => {
                                        const userId =
                                          typeof sponsor.userId === "object"
                                            ? sponsor.userId._id
                                            : sponsor.userId;

                                        const matchedUser = users.find(
                                          (u) => u._id === userId
                                        );

                                        return matchedUser
                                          ? {
                                              value: matchedUser._id,
                                              label: matchedUser.firstName,
                                            }
                                          : null;
                                      })()
                                    : null
                                }
                                onChange={(selectedOption) => {
                                  const updated = formik.values.boli_items.map(
                                    (item, idx) =>
                                      idx === index
                                        ? {
                                            ...item,
                                            sponsored_by: item.sponsored_by.map(
                                              (s, sIdx) =>
                                                sIdx === sponsorIndex
                                                  ? {
                                                      ...s,
                                                      userId:
                                                        selectedOption?.value ||
                                                        "",
                                                    }
                                                  : s
                                            ),
                                          }
                                        : item
                                  );
                                  formik.setFieldValue("boli_items", updated);
                                }}
                                placeholder="Select User..."
                              />

                              {/* <Select
                              options={
                                Array.isArray(users)
                                  ? users.map((user) => ({
                                      value: user._id,
                                      label: user.firstName,
                                    }))
                                  : []
                              }
                              value={
                                sponsor.userId
                                  ? {
                                      value: sponsor.userId._id,
                                      label:
                                        users.find(
                                          (u) => u._id === sponsor.userId._id
                                        )?.firstName || "Unknown",
                                    }
                                  : null
                              }
                              onChange={(selectedOption) => {
                                const updated = formik.values.boli_items.map(
                                  (item, idx) =>
                                    idx === index
                                      ? {
                                          ...item,
                                          sponsored_by: item.sponsored_by.map(
                                            (s, sIdx) =>
                                              sIdx === sponsorIndex
                                                ? {
                                                    ...s,
                                                    userId:
                                                      selectedOption?.value ||
                                                      "",
                                                  }
                                                : s
                                          ),
                                        }
                                      : item
                                );
                                formik.setFieldValue("boli_items", updated);
                              }}
                              // onChange={(selectedOption) => {
                              //   const updated = [...formik.values.boli_items];
                              //   updated[index].sponsored_by[
                              //     sponsorIndex
                              //   ].userId = selectedOption?.value || "";
                              //   formik.setFieldValue("boli_items", updated);
                              // }}
                              placeholder="Select User..."
                            /> */}
                            </div>

                            <div className="flex-grow-1 ml-2">
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Sponsor Amount"
                                value={sponsor.amount}
                                onChange={(e) => {
                                  const updated = [...formik.values.boli_items];
                                  updated[index].sponsored_by[
                                    sponsorIndex
                                  ].amount = e.target.value;
                                  formik.setFieldValue("boli_items", updated);
                                }}
                              />
                            </div>

                            <button
                              type="button"
                              className="btn btn-outline-danger ml-2"
                              onClick={() => {
                                const updated = [...formik.values.boli_items];
                                updated[index].sponsored_by.splice(
                                  sponsorIndex,
                                  1
                                );
                                formik.setFieldValue("boli_items", updated);
                              }}
                            >
                              X
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-primary mt-2"
                          onClick={() => {
                            const updated = [...formik.values.boli_items];

                            const sponsors = updated[index].sponsored_by
                              ? [...updated[index].sponsored_by]
                              : [];

                            sponsors.push({
                              userId: "",
                              amount: "",
                            });

                            updated[index] = {
                              ...updated[index],
                              sponsored_by: sponsors,
                            };

                            formik.setFieldValue("boli_items", updated);
                          }}
                        >
                          Add Sponsor
                        </button>

                        {/* <button
                        type="button"
                        className="btn btn-primary mt-2"
                        onClick={() => {
                          const updated = [...formik.values.boli_items];
                          updated[index].sponsored_by.push({
                            userId: "",
                            amount: "",
                          });
                          formik.setFieldValue("boli_items", updated);
                        }}
                      >
                        Add Sponsor
                      </button> */}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="row mb-2">
                <div className="col-md-6">
                  <label className="form-label">allow photo upload</label>
                  <div>
                    <label className="me-3">
                      <input
                        type="radio"
                        name="allow_photo_upload"
                        checked={formik.values.allow_photo_upload === true}
                        onChange={() =>
                          formik.setFieldValue("allow_photo_upload", true)
                        }
                      />{" "}
                      Yes
                    </label>
                    <label className="ml-3">
                      <input
                        type="radio"
                        name="allow_photo_upload"
                        checked={formik.values.allow_photo_upload === false}
                        onChange={() =>
                          formik.setFieldValue("allow_photo_upload", false)
                        }
                      />{" "}
                      No
                    </label>
                  </div>
                </div>
                {formik.values.allow_photo_upload === true && (
                  <div className="mb-3 col-md-6">
                    <MultipleMediaUpload
                      uploadFunction={uploadSponsorImage}
                      value={formik.values.event_photo_upload}
                      fieldName="multiMedia"
                      onChange={(newFiles) => {
                        const currentFiles =
                          formik.values.event_photo_upload || [];

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

                        formik.setFieldValue("event_photo_upload", mergedFiles);
                      }}
                    />
                    {/* <MediaUpload
                      fieldName="files"
                      value={formik.values.event_photo_upload}
                      label="Event Photo Upload"
                      uploadFunction={uploadSponsorImage}
                      //  onChange={(newFiles) => {
                      //   const currentFiles =
                      //     formik.values.event_photo_upload || [];
                      //   formik.setFieldValue("event_photo_upload", [
                      //     ...currentFiles,
                      //     ...(Array.isArray(newFiles) ? newFiles : [newFiles]),
                      //   ]);
                      // }}
                      onChange={(newFiles) => {
                        const currentFiles =
                          formik.values.event_photo_upload || [];

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

                        formik.setFieldValue("event_photo_upload", mergedFiles);
                      }}
                      multiple={true}
                    /> */}
                  </div>
                )}
              </div>

              <div>
                <button type="submit" className="btn btn-success mr-2">
                  <i className="fa fa-check me-1"></i>
                  {id ? " Update" : " Create"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/event")}
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
export default NewEvent;
