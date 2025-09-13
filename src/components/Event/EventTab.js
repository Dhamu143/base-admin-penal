import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import swal from "sweetalert";
import { useFormik } from "formik";
import * as Yup from "yup";

import { appGetAllSanstha } from "../../store/sanstha";
import { appAllGetHubs } from "../../store/hubs";
import Paginate from "../pagination/paginate";
import { uploadSponsorImage } from "../../store/sponsor";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import { useParams } from "react-router-dom";
import PostPreview from "../PostPreview/PostPreview";
import {
  appCreateEvent,
  appDeleteEvent,
  appGetAllEvent,
  appGetEventDetails,
  appGetUserParticipantsEventDetails,
  appUpdateEvent,
  setEmptyEvent,
} from "../../store/event";
import axios from "axios";
import { appGetAllUser } from "../../store/user";
import MultipleMediaUpload from "../MultipleMediaUpload";
import ImageUpload from "../ImageUpload";

function Event({
  event,
  eventpage,
  setEventPage,
  hubDetails,
  sansthaDetails,
  hideSansthaField,
}) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [editEventMode, setEditEventMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editorValues, setValues] = useState(EditorState.createEmpty());
  const users = useSelector((state) => state?.usersReducer.users);
  const eventpaginate = useSelector((state) => state.eventReducer.paginate);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaList, setAreaList] = useState([]);
  const eventDetails = useSelector((state) => state.eventReducer.eventDetails);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const eventParticipantUserDetails = useSelector((state) => state.eventReducer.eventParticipantUserDetails);
  const participants = Array.isArray(eventParticipantUserDetails) ? eventParticipantUserDetails : [];

  // const handleHubChange = (option) => {
  //   formik.setFieldValue("hub", option?.value);
  //   dispatch(appGetAllSanstha({ page: 1, limit: 1000, hub: option?.value }));
  //   dispatch(appGetAllUser({ page: 1, limit: 1000, hub: option?.value }));
  // };
  // const handleSansthaChange = (option) => {
  //   formik.setFieldValue("sanstha", option?.value);
  //   dispatch(appGetAllUser({ page: 1, limit: 1000, sansthaId: option?.value }));
  // };

  useEffect(() => {
    if (hubDetails?._id) {
      dispatch(
        appGetAllSanstha({ hubId: hubDetails._id, page: 1, limit: 1000 })
      );
      dispatch(appGetAllUser({ page: 1, limit: 1000, hub: hubDetails._id }));
    } else if (sansthaDetails?._id) {
      dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
      dispatch(
        appGetAllSanstha({
          page: 1,
          limit: 1000,
          sansthaId: sansthaDetails._id,
        })
      );
      dispatch(
        appGetAllUser({ page: 1, limit: 1000, sansthaId: sansthaDetails._id })
      );
    } else {
      dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
      dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
      // dispatch(appGetAllUser({ page: 1, limit: 1000 }));
    }
    // if (editId) {
    //   dispatch(appGetEventDetails(editId));
    // }
    // return () => {
    //   dispatch(setEmptyEvent());
    // };
  }, [dispatch, hubDetails, sansthaDetails, editId]);

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

  const onEditorStateChange = (editorState) => {
    formik.setFieldValue(
      "description",
      draftToHtml(convertToRaw(editorState.getCurrentContent()))
    );
    setValues(editorState);
  };

  // const populateData = () => {
  //   if (eventDetails) {
  //     // console.log(eventDetails)
  //     const selectedEvent = Array.isArray(eventDetails)
  //       ? eventDetails.find((h) => h._id === id)
  //       : eventDetails;
  //     //  console.log("selectedEvent", selectedEvent)
  //     if (selectedEvent?.description) {
  //       const blocksFromHtml = htmlToDraft(selectedEvent?.description);
  //       const { contentBlocks, entityMap } = blocksFromHtml;
  //       const contentState = ContentState.createFromBlockArray(
  //         contentBlocks,
  //         entityMap
  //       );
  //       setValues(EditorState.createWithContent(contentState));
  //       formik.setFieldValue("description", selectedEvent.description);
  //     }
  //   }
  // };
  // useEffect(() => {
  //   populateData();
  // }, [eventDetails]);

  const validationSchema = Yup.object({
    //  hub: Yup.string().required("Community is required"),
    // sanstha: Yup.string().when("$hideSansthaField", {
    //   is: false,
    //   then: (schema) => schema.required("Sanstha is required"),
    //   otherwise: (schema) => schema.notRequired(),
    // }),
    title: Yup.string().required("Event title is required"),
    // description: Yup.string().required("Description is required"),
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
      file: Yup.string()
             .required("Please upload a file")
             .test("is-valid-url", "Invalid image", (value) => {
               return value && value !== "/img/default-placeholder.jpg";
             }),
    // file: Yup.string({
    //   url: Yup.string()
    //     .url()
    //     .required("File URL is required"),
    //   type: Yup.string().required("File type is required"),
    // }).required("Please upload a file"),
    startDate: Yup.date()
      .nullable()
      .required("Start date is required"),
    endDate: Yup.date()
      .nullable()
      .required("End date is required"),
  });

  const formik = useFormik({
    initialValues: {
      hub: hubDetails?._id || sansthaDetails?.hub || "",
      sanstha: sansthaDetails?._id || "",
      title: "",
      description: "",
      file: "",
      fileType: null,
      category: "",
      startDate: "",
      endDate: "",
      volunteers: [],
      locationType: "",
      virtualLink: "",
      nativePlacePincode: "",
      nativeArea: "",
      nativeState: "",
      nativeDistrict: "",
      nativeBlock: "",
      nativePlaceAddress: "",
      RSVP_Enabled: false,
      Waitlist_Enabled: false,
      RSVP_deadline: null,
      RSVP_limit: "",
      upi_id: "",
      Allow_Vlonteers: false,
      allow_photo_upload: false,
      payment_mode_enabled: false,
      boli_items: [],
      event_photo_upload: [],
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      // console.log(values);
      const payload = {
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
        // navigate: navigate,
      };
      // console.log(payload);

      const filtered_obj = Object.fromEntries(
        Object.entries(payload).filter(
          ([key, value]) =>
            value !== "" &&
            value !== null &&
            value !== undefined &&
            key !== "navigate"
        )
      );

      if (editEventMode && editId) {
        dispatch(appUpdateEvent({ ...filtered_obj, id: editId })).then(() => {
          if (hubDetails?._id) {
            dispatch(
              appGetAllEvent({ page: 1, limit: 10, hub: hubDetails?._id })
            );
          } else if (sansthaDetails?._id) {
            dispatch(
              appGetAllEvent({
                page: 1,
                limit: 10,
                sanstha: sansthaDetails?._id,
              })
            );
          }
        });
      } else {
        dispatch(appCreateEvent(filtered_obj)).then(() => {
          if (hubDetails?._id) {
            dispatch(
              appGetAllEvent({ page: 1, limit: 10, hub: hubDetails?._id })
            );
          } else if (sansthaDetails?._id) {
            dispatch(
              appGetAllEvent({
                page: 1,
                limit: 10,
                sanstha: sansthaDetails?._id,
              })
            );
          }
        });
      }

      formik.resetForm();
      setShowModal(false);
      setEditEventMode(false);
      setEditId(null);
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
      if (event?.data && id) {
        const selectedevent = Array.isArray(event?.data)
          ? event?.data.find((c) => c._id === id)
          : event?.data;

        if (selectedevent?.pincode) {
          const postOffices = await fetchPincodeDetails(selectedevent?.pincode);
          setAreaList(postOffices);
        }
      }
    };

    fetchAreaOnEdit();
  }, [event?.data, id]);

  const handleAddNewEvent = () => {
    setEditId(null);
    setEditEventMode(false);
    formik.resetForm();
    formik.setValues({
      hub: hubDetails?._id || sansthaDetails?.hub || "",
      sanstha: sansthaDetails?._id || "",
      title: "",
      description: "",
      file: null,
      fileType: null,
      category: "",
      startDate: null,
      endDate: null,
      volunteers: [],
      locationType: "",
      virtualLink: "",
      nativePlacePincode: "",
      nativeArea: "",
      nativeState: "",
      nativeDistrict: "",
      nativeBlock: "",
      nativePlaceAddress: "",
      RSVP_Enabled: false,
      Waitlist_Enabled: false,
      RSVP_deadline: null,
      RSVP_limit: "",
      upi_id: "",
      Allow_Vlonteers: false,
      allow_photo_upload: false,
      payment_mode_enabled: false,
      boli_items: [],
      event_photo_upload: [],
    });
    setValues(EditorState.createEmpty());
    setShowModal(true);
  };

useEffect(() => {
  if (editEventMode && eventDetails && eventDetails._id === editId) {
    populateFormData();
  }
}, [eventDetails, editEventMode, editId]);

const populateFormData = () => {
  if (!eventDetails) {
    formik.resetForm();
    setValues(EditorState.createEmpty());
    return;
  }

  if (eventDetails.description) {
    const blocksFromHtml = htmlToDraft(eventDetails.description);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    setValues(EditorState.createWithContent(contentState));
  } else {
    setValues(EditorState.createEmpty());
  }

  formik.setValues({
    hub: eventDetails.hub?._id || hubDetails?._id || sansthaDetails?.hub || "",
    sanstha: eventDetails.sanstha?._id || sansthaDetails?._id || "",
    title: eventDetails.title || "",
    description: eventDetails.description || "",
    file: eventDetails.file || "",
    fileType: null,
    category: eventDetails.category || "",
       startDate: eventDetails?.startDate
        ? new Date(
            new Date(eventDetails.startDate).setDate(
              new Date(eventDetails.startDate).getDate() + 1
            )
          )
            .toISOString()
            .slice(0, 10)
        : "",
    endDate: eventDetails.endDate
      ? new Date(eventDetails.endDate).toISOString().slice(0, 10)
      : "",
    volunteers: eventDetails.volunteers || [],
    locationType: eventDetails.locationType || "",
    virtualLink: eventDetails.virtualLink || "",
    nativePlacePincode: eventDetails.nativePlacePincode || "",
    nativeArea: eventDetails.nativeArea || "",
    nativeState: eventDetails.nativeState || "",
    nativeDistrict: eventDetails.nativeDistrict || "",
    nativeBlock: eventDetails.nativeBlock || "",
    nativePlaceAddress: eventDetails.nativePlaceAddress || "",
    RSVP_Enabled: eventDetails.RSVP_Enabled || false,
    Waitlist_Enabled: eventDetails.Waitlist_Enabled || false,
    RSVP_deadline: eventDetails.RSVP_deadline
      ? new Date(eventDetails.RSVP_deadline).toISOString().slice(0, 10)
      : "",
    RSVP_limit: eventDetails.RSVP_limit || "",
    upi_id: eventDetails.upi_id || "",
    Allow_Vlonteers: eventDetails.Allow_Vlonteers || false,
    allow_photo_upload: eventDetails.allow_photo_upload || false,
    payment_mode_enabled: eventDetails.payment_mode_enabled || false,
    boli_items: eventDetails.boli_items || [],
    event_photo_upload: eventDetails.event_photo_upload || [],
  });
};

const handleEditEvent = async (eventId) => {
  setEditId(eventId);
  setEditEventMode(true);
  setShowModal(true);
  
  try {
    await dispatch(appGetEventDetails(eventId));
  } catch (error) {
    console.error("Error fetching event details:", error);
  }
};

  // const handleEditEvent = (eventId) => {
  //   console.log(eventId);
  //   setEditId(eventId);
  //   setEditEventMode(true);
  //   setShowModal(true);
  //   dispatch(appGetEventDetails(eventId));
  //   console.log(eventDetails);
  //   formik.setValues({
  //     hub: hubDetails?._id || sansthaDetails?.hub || "",
  //     sanstha: sansthaDetails?.sanstha?._id || "",
  //     title: eventDetails?.title,
  //     description: eventDetails.description,
  //     file: eventDetails.file,
  //     fileType: null,
  //     category: eventDetails?.category,
  //     startDate: eventDetails?.startDate
  //       ? new Date(eventDetails.startDate).toISOString().slice(0, 10)
  //       : null,
  //     endDate: eventDetails?.endDate
  //       ? new Date(eventDetails.endDate).toISOString().slice(0, 10)
  //       : null,
  //     volunteers: eventDetails?.volunteers,
  //     locationType: eventDetails?.locationType,
  //     virtualLink: eventDetails?.virtualLink,
  //     nativePlacePincode: eventDetails?.nativePlacePincode,
  //     nativeArea: eventDetails?.nativeArea,
  //     nativeState: eventDetails?.nativeState,
  //     nativeDistrict: eventDetails?.nativeDistrict,
  //     nativeBlock: eventDetails?.nativeBlock,
  //     nativePlaceAddress: eventDetails?.nativePlaceAddress,
  //     RSVP_Enabled: eventDetails?.RSVP_Enabled,
  //     Waitlist_Enabled: eventDetails?.Waitlist_Enabled,
  //     RSVP_deadline: eventDetails?.RSVP_deadline,
  //     RSVP_limit: eventDetails?.RSVP_limit,
  //     upi_id: eventDetails?.upi_id,
  //     Allow_Vlonteers: eventDetails?.Allow_Vlonteers,
  //     allow_photo_upload: eventDetails?.allow_photo_upload,
  //     payment_mode_enabled: eventDetails?.payment_mode_enabled,
  //     boli_items: eventDetails?.boli_items,
  //     event_photo_upload: eventDetails?.event_photo_upload,
  //   });

  //    if (eventDetails?.description) {
  //   const blocksFromHtml = htmlToDraft(eventDetails.description);
  //   const { contentBlocks, entityMap } = blocksFromHtml;
  //   const contentState = ContentState.createFromBlockArray(
  //     contentBlocks,
  //     entityMap
  //   );
  //   setValues(EditorState.createWithContent(contentState));
  // } else {
  //   setValues(EditorState.createEmpty());
  // }
  //   // const blocksFromHtml = htmlToDraft(eventDetails?.description);
  //   // const { contentBlocks, entityMap } = blocksFromHtml;
  //   // const contentState = ContentState.createFromBlockArray(
  //   //   contentBlocks,
  //   //   entityMap
  //   // );
  //   // setValues(EditorState.createWithContent(contentState));
  // };

  const handleDeleteEvent = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this Event?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteEvent(id)).then(() => {
          if (hubDetails?._id) {
            dispatch(
              appGetAllEvent({ page: 1, limit: 10, hub: hubDetails?._id })
            );
          } else if (sansthaDetails?._id) {
            dispatch(
              appGetAllEvent({
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

  const handleShowEventDetails = (eventId) => {
    // console.log(eventId);
    dispatch(appGetEventDetails(eventId));
    dispatch(
      appGetUserParticipantsEventDetails({
        event: eventId,
        // status: "Accepted",
      })
    );
    // setSelectedEventDetails(eventDetails);
    setShowEventDetailsModal(true);
  };

  const handleCloseEventDetails = () => {
    setShowEventDetailsModal(false);
    dispatch(setEmptyEvent());
  };

const handleCloseEventEdit = () => {
  setShowModal(false);
  setEditEventMode(false);
  setEditId(null);

  formik.resetForm();
  setValues(EditorState.createEmpty());

  dispatch(setEmptyEvent());
};


  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h4></h4>
        <button className="btn btn-primary" onClick={handleAddNewEvent}>
          Add Event
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Image</th>
              <th>Event</th>
              {/* <th>Description</th> */}
              <th>Category</th>
              <th>Community</th>
              <th>Sanstha</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              {/* <th>Posted By </th> */}
            </tr>
          </thead>
          <tbody>
            {(event.data || []).map((value) => (
              <tr key={value._id}>
                {/* <td>
                  <img
                    src={value.file}
                    alt="event"
                    style={{ width: 50, height: 50, borderRadius: "50%" }}
                  />
                </td> */}
                <PostPreview value={value} />
                <td
                  className="text-capitalize"
                  style={{
                    maxWidth: "150px",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {value.title}
                </td>
                {/* <td>{value.description}</td> */}
                <td>{value.category}</td>
                <td
                  style={{
                    maxWidth: "150px",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    textTransform: "capitalize",
                  }}
                >
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
                      {value.sanstha.image && (
                        <img
                          src={value.sanstha.image}
                          alt="sanstha"
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <br />
                      {value.sanstha.name || "—"}
                    </>
                  ) : (
                    ""
                  )}
                </td>
                <td>
                  {new Date(value.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td>
                  {new Date(value.endDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
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

                <td>
                  <button
                    className="btn btn-sm btn-info mr-2"
                    onClick={() => handleEditEvent(value?._id)}
                  >
                    <em className="fa fa-edit fa-fw"></em>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleShowEventDetails(value?._id);
                    }}
                    className="btn btn-sm btn-primary mr-2"
                    title="Details"
                  >
                    <em className="fa fa-eye fa-fw"></em>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteEvent(value._id)}
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
        paginate={eventpaginate}
        page={eventpage}
        setPage={setEventPage}
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
              <div className="modal-header">
                <h5 className="modal-title">
                  {editEventMode ? "Edit Event" : "Create New Event"}
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={handleCloseEventEdit}
                  // onClick={() => {
                  //   setShowModal(false);
                  //   setEditEventMode(false);
                  //   setEditId(null);
                  //   formik.resetForm();
                  // }}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
              >
                <form onSubmit={formik.handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>
                        Community <span className="text-danger">*</span>
                      </label>
                      <Select
                        name="_id"
                        options={[
                          {
                            value: hubDetails?._id,
                            label: hubDetails?.name,
                          },
                        ]}
                        onChange={(option) => {
                          formik.setFieldValue("hub", option?.value);
                        }}
                        // onChange={handleHubChange}
                        value={{
                          value: hubDetails?._id,
                          label: hubDetails?.name || "No Hub Name",
                        }}
                        // value={
                        //   Array.isArray(Hub?.data)
                        //     ? Hub?.data
                        //         .filter(
                        //           (option) => option._id === formik?.values?.hub
                        //         )
                        //         .map((option) => ({
                        //           value: option._id,
                        //           label: option.name,
                        //         }))[0]
                        //     : null
                        // }
                        placeholder="Select Community.."
                        isDisabled={true}
                      />
                      {formik.touched.hub && formik.errors.hub ? (
                        <div style={{ color: "red" }}>{formik.errors.hub}</div>
                      ) : null}
                    </div>
                    {!hideSansthaField && (
                      <div className="col-md-6">
                        <label>Sanstha</label>
                        <Select
                          options={[
                            {
                              value: sansthaDetails?._id,
                              label: sansthaDetails?.name,
                            },
                          ]}
                          // onChange={handleSansthaChange}
                          onChange={(option) => {
                            formik.setFieldValue("sanstha", option?.value);
                          }}
                          value={[
                            {
                              value: sansthaDetails?._id,
                              label: sansthaDetails?.name,
                            },
                          ]}
                          placeholder="Select Sanstha.."
                        />
                        {/* {formik.touched.sanstha && formik.errors.sanstha && (
                          <div className="text-danger">
                            {formik.errors.sanstha}
                          </div>
                        )} */}
                      </div>
                    )}
                  </div>

                  <div className="row">
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

                    <div className="col-md-6">
                      <label>
                        Event Description <span className="text-danger">*</span>
                      </label>
                      <Editor
                        editorClassName="form-control"
                        editorState={editorValues}
                        onEditorStateChange={onEditorStateChange}
                        onBlur={() =>
                          formik.setFieldTouched("description", true)
                        }
                        editorStyle={{ height: 300 }}
                      />
                      {formik.touched.description &&
                        formik.errors.description && (
                          <div className="text-danger">
                            {formik.errors.description}
                          </div>
                        )}
                    </div>
                    <div className="mb-3 col-md-6">
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
                        <div className="text-danger">
                          {formik.errors.category}
                        </div>
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
                        <div className="text-danger">
                          {formik.errors.startDate}
                        </div>
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
                        <div className="text-danger">
                          {formik.errors.endDate}
                        </div>
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
                        {formik.touched.nativeArea &&
                          formik.errors.nativeArea && (
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
                    </div>)}
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
                      <label
                        className="form-check-label"
                        htmlFor="Allow_Vlonteers"
                      >
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
                                          userId: selectedOptions.map(
                                            (opt) => ({
                                              _id: opt.value,
                                              firstName: opt.label,
                                            })
                                          ),
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
                            checked={
                              formik.values.payment_mode_enabled === true
                            }
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
                            checked={
                              formik.values.payment_mode_enabled === false
                            }
                            onChange={(e) => {
                              const checked = e.target.checked;
                              formik.setFieldValue(
                                "payment_mode_enabled",
                                false
                              );
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
                              <label>Boli Item</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter Boli Item Name"
                                value={item.item_name}
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
                              <label>Amount Required</label>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Amount Required"
                                value={item.amount_required}
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
                              <label>Amount Received</label>
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
                                      formik.setFieldValue(
                                        "boli_items",
                                        updated
                                      );
                                    }}
                                    placeholder="Select User..."
                                  />
                                </div>

                                <div className="flex-grow-1 ml-2">
                                  <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Sponsor Amount"
                                    value={sponsor.amount}
                                    onChange={(e) => {
                                      const updated = [
                                        ...formik.values.boli_items,
                                      ];
                                      updated[index].sponsored_by[
                                        sponsorIndex
                                      ].amount = e.target.value;
                                      formik.setFieldValue(
                                        "boli_items",
                                        updated
                                      );
                                    }}
                                  />
                                </div>

                                <button
                                  type="button"
                                  className="btn btn-outline-danger ml-2"
                                  onClick={() => {
                                    const updated = [
                                      ...formik.values.boli_items,
                                    ];
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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="row">
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
                                index ===
                                self.findIndex((f) => f.url === file.url)
                            );

                            formik.setFieldValue(
                              "event_photo_upload",
                              mergedFiles
                            );
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* <div>
                    <button type="submit" className="btn btn-success mr-2">
                      <i className="fa fa-check me-1"></i>
                      {editEventMode ? " Update" : " Create"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowModal(false);
                        setEditEventMode(false);
                        setEditId(null);
                        formik.resetForm();
                      }}
                    >
                      <i className="fa fa-times me-1"></i> Cancel
                    </button>
                  </div> */}
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-success">
                      <span>
                        <i className="fa fa-check"></i>{" "}
                      </span>
                      {editEventMode ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseEventEdit}
                      // onClick={() => {
                      //   setShowModal(false);
                      //   setEditEventMode(false);
                      //   setEditId(null);
                      //   formik.resetForm();
                      // }}
                    >
                      <i className="fa fa-times"></i> Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEventDetailsModal && eventDetails && (
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
                <h5>Event Details</h5>
                <button
                  type="button"
                  className="close"
                  onClick={handleCloseEventDetails}
                >
                  x
                </button>
              </div>

              <div
                className="modal-body"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                <div className=" mb-3">
                  {eventDetails.file ? (
                    eventDetails.file.endsWith(".mp4") ? (
                      <video
                        controls
                        style={{
                          width: "70%",
                          maxHeight: "200px",
                          borderRadius: "10px",
                        }}
                        src={eventDetails.file}
                      />
                    ) : (
                      <img
                        src={eventDetails.file}
                        alt="Event"
                        style={{
                          width: "50%",
                          maxHeight: "100px",
                          borderRadius: "10px",
                          objectFit: "contain",
                        }}
                      />
                    )
                  ) : (
                    <p className="text-muted">No event file uploaded</p>
                  )}
                  <h5 className="modal-title">
                    <strong>Event:</strong> {eventDetails.title}
                  </h5>
                  <strong>Description:</strong>
                  <div
                    className=" p-2 mt-1"
                    dangerouslySetInnerHTML={{
                      __html: eventDetails.description,
                    }}
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Community:</strong>
                    {eventDetails.hub ? (
                      <div className="d-flex align-items-center mt-1">
                        <img
                          src={eventDetails?.hub?.image}
                          alt="Hub"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            marginRight: "10px",
                          }}
                        />
                        <span>{eventDetails?.hub?.name}</span>
                      </div>
                    ) : (
                      <p className="text-muted">N/A</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    {eventDetails.sanstha && (
                      <>
                        <strong>Sanstha:</strong>
                        <div className="d-flex align-items-center mt-1">
                          <img
                            src={eventDetails.sanstha.image}
                            alt="Sanstha"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              marginRight: "10px",
                            }}
                          />
                          <span>{eventDetails.sanstha.name}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <p>
                      <strong>Category:</strong> {eventDetails.category}
                    </p>
                    {/* <p><strong>Status:</strong> {eventDetails.status}</p> */}
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {new Date(eventDetails.startDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <p>
                      <strong>End Date:</strong>{" "}
                      {new Date(eventDetails.endDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <strong>Location:</strong>
                  {eventDetails.locationType === "Physical" ? (
                    <div className="mt-1">
                      <div>
                        {eventDetails.nativePlaceAddress},{" "}
                        {eventDetails.nativeArea}
                      </div>
                      <div>
                        {eventDetails.nativeBlock},{" "}
                        {eventDetails.nativeDistrict},{" "}
                        {eventDetails.nativeState}{" "}
                        {eventDetails.nativePlacePincode}
                      </div>
                    </div>
                  ) : (
                    <a
                      href={eventDetails.virtualLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary"
                    >
                      {eventDetails.virtualLink}
                    </a>
                  )}
                </div>

                {eventDetails.payment_mode_enabled && (
                  <div className="mb-3">
                    <strong>UPI ID:</strong> {eventDetails.upi_id}
                  </div>
                )}

                <div className="row mb-3">
                  <div className="col-md-6">
                    <p>
                      <strong>RSVP Enabled:</strong>{" "}
                      {eventDetails.RSVP_Enabled ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>RSVP Limit:</strong> {eventDetails.RSVP_limit}
                    </p>
                    <p>
                      <strong>RSVP Deadline:</strong>{" "}
                      {eventDetails.RSVP_deadline
                        ? new Date(
                            eventDetails.RSVP_deadline
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    {eventDetails.Allow_Vlonteers && (
                      <p>
                        <strong>Volunteers Allowed:</strong>{" "}
                        {eventDetails.Allow_Vlonteers ? "Yes" : "No"}
                      </p>
                    )}
                    <p>
                      <strong>Waitlist Enabled:</strong>{" "}
                      {eventDetails.Waitlist_Enabled ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {eventDetails.volunteers?.length > 0 && (
                  <div className="mb-3">
                    <strong>Volunteers:</strong>
                    <ul className="mt-1">
                      {eventDetails.volunteers.map((vol, volIndex) => (
                        <li key={vol._id || volIndex} className="mb-3">
                          <p className="font-semibold">
                            Role: {vol.role} | Remaining Count:{" "}
                            {vol.remaining_count}
                          </p>

                          {/* Display each user in this volunteer group */}
                          <div className="row mt-2">
                            {vol.userId.map((user) => (
                              <div
                                key={user._id}
                                className="flex items-center gap-3 p-2 bg-gray-100 rounded-lg"
                              >
                                <img
                                  src={user.profilePic || "/img/user.jpg"}
                                  alt={user.firstName}
                                  className="rounded-full object-cover"
                                  height={70}
                                  width={70}
                                />
                                <div>
                                  <p className="font-medium">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {user.mobile}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(eventDetails?.event_photo_upload) &&
                  eventDetails.event_photo_upload.length > 0 && (
                    <div className="mb-3">
                      <strong>Event Upload Photos:</strong>
                      <div className="mt-3 border-b pb-2">
                        <div className="row mt-2">
                          {eventDetails.event_photo_upload.map(
                            (photo, index) => (
                              <div key={index} className="flex flex-row gap-2">
                                {photo.type === "video/mp4" ? (
                                  <video
                                    controls
                                    style={{
                                      width: "100px",
                                      maxHeight: "100px",
                                      borderRadius: "10px",
                                      marginLeft: "5px",
                                    }}
                                    src={photo.url}
                                  />
                                ) : (
                                  <img
                                    src={photo.url}
                                    alt="event upload"
                                    style={{
                                      width: "100px",
                                      maxHeight: "100px",
                                      borderRadius: "10px",
                                      objectFit: "cover",
                                      marginLeft: "5px",
                                    }}
                                  />
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                {eventDetails?.boli_items?.length > 0 && (
                  <div className="mb-3">
                    <strong className="block mb-2">Boli Items:</strong>
                    <div className="row flex flex-col gap-6">
                      {eventDetails.boli_items.map((item, index) => (
                        <div
                          key={index}
                          className="p-3  rounded-lg  bg-white space-y-2"
                        >
                          <p>
                            <strong>Item Name:</strong> {item.item_name}
                          </p>
                          <p>
                            <strong>Amount Required:</strong> ₹
                            {item.amount_required}
                          </p>
                          <p>
                            <strong>Amount Received:</strong> ₹
                            {item.amount_received}
                          </p>

                          {Array.isArray(item.sponsored_by) &&
                          item.sponsored_by.length > 0 ? (
                            <div className="grid grid-cols-5 gap-4 mt-2">
                              {item.sponsored_by.map((sponsor, sIndex) => (
                                <div
                                  key={sIndex}
                                  className="flex flex-col items-center bg-gray-50 p-2 rounded"
                                >
                                  <img
                                    src={
                                      sponsor.userId?.profilePic ||
                                      "/img/user.jpg"
                                    }
                                    alt={sponsor.userId?.firstName || "Sponsor"}
                                    className=" object-cover"
                                    width={50}
                                    height={50}
                                  />
                                  <span className="text-sm text-center mt-1">
                                    {sponsor.userId?.firstName}{" "}
                                    {sponsor.userId?.lastName}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No sponsors yet.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  {participants.length > 0 && (
                    <>
                      <h6 className="font-bold mb-3 text-green-600">Joinee</h6>
                      <div className="row mt-2">
                        {participants
                          .filter((p) => p.status === "Accepted")
                          .map((participant) => (
                            <div
                              key={participant.userId._id}
                              className="flex items-center gap-3 p-2 bg-gray-100 rounded-lg"
                            >
                              <img
                                src={
                                  participant?.userId?.profilePic ||
                                  "/img/user.jpg"
                                }
                                alt={participant?.userId?.firstName}
                                className="rounded-full object-cover"
                                height={70}
                                width={70}
                              />
                              <div>
                                <p className="font-medium">
                                  {participant.userId.firstName}{" "}
                                  {participant.userId.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {participant.userId.mobile}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Rejected Section */}
                      {participants.some((p) => p.status === "Rejected") && (
                        <>
                          <h6 className="font-bold mb-3 text-red-600 mt-6">
                            Rejected Participants
                          </h6>
                          <div className="row mt-2 ml-3">
                            {participants
                              .filter((p) => p.status === "Rejected")
                              .map((participant) => (
                                <div
                                  key={participant.userId._id}
                                  className="flex items-center gap-3 p-2 bg-gray-100 rounded-lg"
                                >
                                  <img
                                    src={
                                      participant.userId.profilePic ||
                                      "/img/user.jpg"
                                    }
                                    alt={participant.userId.firstName}
                                    className="rounded-full object-cover"
                                    height={70}
                                    width={70}
                                  />
                                  <div>
                                    <p className="font-semibold">
                                      {participant.userId.firstName}{" "}
                                      {participant.userId.lastName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {participant.userId.mobile}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* <div className="text-muted mt-3">
            <small>Created: {new Date(eventDetails.createdAt).toLocaleString()}</small>
            <br />
            <small>Updated: {new Date(eventDetails.updatedAt).toLocaleString()}</small>
          </div> */}
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={handleCloseEventDetails}
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

export default Event;
