import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
// import DatePicker from "react-datepicker";
import Select from "react-select";
import { appGetAllSanstha } from "../../store/sanstha";
import { appAllGetHubs } from "../../store/hubs";
import {
  appCreateSponsor,
  appUpdateSponsor,
  uploadSponsorImage,
} from "../../store/sponsor";
import ImageUpload from "../../components/ImageUpload";
import { appGetAllUser } from "../../store/user";
import { Formik, Form } from "formik";

function NewSponsor() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDurationEnabled, setIsDurationEnabled] = useState(true);
  const Hub = useSelector((state) => state?.hubReducer?.hub);
  const Sanstha = useSelector((state) => state?.sansthaReducer?.sanstha);
  const sponsor = useSelector((state) => state?.sponsorReducer.sponsor);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  );
  const users = useSelector((state) => state?.usersReducer.users);
  useEffect(() => {
    // Get all data without pagination for dropdowns
    dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
    // dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
  }, []);

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
    if (sponsor && id) {
      const selectedsponsor = Array.isArray(sponsor)
        ? sponsor.find((c) => c._id === id)
        : sponsor;
      if (selectedsponsor && selectedsponsor.hub && selectedsponsor.hub._id) {
        dispatch(
          appGetAllUser({ page: 1, limit: 1000, hub: selectedsponsor.hub._id })
        );
      }
    }
  }, [sponsor, id, dispatch]);

  // useEffect(() => {
  //   if (
  //     sponsor &&
  //     id &&
  //     Array.isArray(users) &&
  //     sponsor.user &&
  //     sponsor.user._id
  //   ) {
  //     formik.setFieldValue("user", sponsor.user._id);
  //   }
  // }, [users, sponsor, id]);

  useEffect(() => {
    if (sponsor && id) {
      const selectedsponsor = Array.isArray(sponsor)
        ? sponsor.find((c) => c._id === id)
        : sponsor;
      console.log(selectedsponsor, "selectedsponsor");
      // console.log(selectedsponsor?.user?._id);
      if (selectedsponsor) {
        formik.setFieldValue("name", selectedsponsor?.name);
        formik.setFieldValue("hub", selectedsponsor?.hub?._id || "");
        formik.setFieldValue("sanstha", selectedsponsor?.sanstha?._id || "");
        formik.setFieldValue("description", selectedsponsor?.description);
        formik.setFieldValue("image", selectedsponsor?.image);
        formik.setFieldValue("user", selectedsponsor?.user?._id || "");
        formik.setFieldValue("user", selectedsponsor?.user?._id || "");
        formik.setFieldValue("sponsorDate", selectedsponsor?.sponsorDate || "");
        formik.setFieldValue("sponsorfee", selectedsponsor?.sponsorfee || "");
        formik.setFieldValue("note", selectedsponsor?.note || "");  
        // setImagePreview(selectedsponsor?.image);
        if (selectedsponsor?.startDate) {
          const date = new Date(selectedsponsor.startDate);
          setStartDate(date);
          formik.setFieldValue("startDate", date.toISOString().split("T")[0]);
        }
        if (selectedsponsor?.endDate) {
          const date = new Date(selectedsponsor.endDate);
          setEndDate(date);
          formik.setFieldValue("endDate", date.toISOString().split("T")[0]);
        }
        // if (selectedsponsor?.startDate) {
        //   setStartDate(new Date(selectedsponsor.startDate));
        // }
        // if (selectedsponsor?.endDate) {
        //   setEndDate(new Date(selectedsponsor.endDate));
        // }
      }
    }
  }, [sponsor]);

  const formik = useFormik({
    initialValues: {
      name: "",
      image: "",
      hub: "",
      description: "",
      sanstha: "",
      user: "",
      startDate: "",
      endDate: "",
      sponsorDate: "",
      sponsorfee: "",
      note: ""
    },
    validationSchema: Yup.object({
      // name: Yup.string().required("Name is Required"),
      // hub: Yup.string().required("Hub is Required"),
      // description: Yup.string().required("Description is required"),
      // sanstha: Yup.string().required("sanstha is Required"),
      image: Yup.string()
        .required("Image is required")
        .test("is-valid-url", "Invalid image", (value) => {
          return value && value !== "/img/default-placeholder.jpg";
        }),
       startDate: Yup.string().required("Start Date is Required"),
       endDate : Yup.string().required("End Date is Required"),
    }),
    onSubmit: (values) => {
      let sponsorName = values.name;
      if (values.user) {
        const selectedUser = Array.isArray(users)
          ? users.find((u) => u._id === values.user)
          : null;
        if (selectedUser) {
          sponsorName = selectedUser.firstName;
        }
      }
      console.log(values);
      const temp_obj = {
        name: sponsorName,
        image: values?.image,
        hub: values?.hub,
        description: values?.description,
        sanstha: values?.sanstha,
        user: values?.user,
        startDate: values?.startDate,
        endDate: values?.endDate,
        sponsorDate: values?.sponsorDate,
        sponsorfee: values?.sponsorfee,
        note: values?.note,
        navigate: navigate,
      };
      console.log(temp_obj);

      // Remove empty fields
      const filtered_obj = Object.fromEntries(
        Object.entries(temp_obj).filter(
          ([key, value]) =>
            value !== "" && value !== null && value !== undefined && key !== "navigate"
        )
      );
      filtered_obj.navigate = navigate;
      
      // dispatch(appCreateSponsor(filtered_obj));
      if (id) {
        dispatch(appUpdateSponsor({ ...filtered_obj, id }))
          // .unwrap()
          .then(() => {
            navigate("/sponsor");
          });
      } else {
        dispatch(appCreateSponsor(filtered_obj))
          // .unwrap()
          .then(() => {
            formik.resetForm();
            navigate("/sponsor");
          });
      }
    },
  });

  return (
    <>
      <div className="content-wrapper">
        <div className="content-heading">
          <div>
            <span>Sponsor</span>{" "}
            <span>/ {id ? "Edit Sponsor" : "New Sponsor"}</span>
          </div>
        </div>
        <div className="form-group d-flex align-items-center">
          <label className="mr-3 mb-0" htmlFor="durationSwitch">
            Sponsor Belongs to Platform
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
        {/* <div
          className="carousel-item active"
          style={{
            backgroundImage: `url(${formik.values.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "400px",
            marginBottom: "20px",
          }}
        /> */}
        <div className="card card-default">
          <div className="card-body">
            <form onSubmit={formik.handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Sponsored on Community level </label>
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
                      className="basic-multi-select"
                      classNamePrefix="select Community..."
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
                  {/* <Formik initialValues={{ image: "" }}>
                    <Form> */}
                  <ImageUpload
                    uploadFunction={uploadSponsorImage}
                    fieldName="image"
                    value={formik.values.image}
                    onChange={(value) => formik.setFieldValue("image", value.url)}
                    error={
                      formik.touched.image && formik.errors.image
                        ? formik.errors.image
                        : null
                    }
                  />
                  {/* </Form>
                  </Formik> */}
                </div>
              </div>
              <div className="row" style={{ padding: "0 0 15px 0" }}>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Sponsored on Sanstha level</label>
                    <Select
                      options={
                        Array.isArray(Sanstha)
                          ? Sanstha.map((place) => ({
                              value: place._id,
                              label: place.name,
                            }))
                          : []
                      }
                      // onChange={(option) => {
                      //   formik.setFieldValue("sanstha", option?.value);
                      // }}
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
                    {/* {formik.touched.sanstha && formik.errors.sanstha ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.sanstha}
                      </div>
                    ) : null} */}
                  </div>
                </div>
                {isDurationEnabled ? (
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
                          formik.setFieldValue("user", option?.value);

                          const selectedUser = Array.isArray(users)
                            ? users.find((u) => u._id === option?.value)
                            : null;
                          if (selectedUser) {
                            formik.setFieldValue(
                              "name",
                              selectedUser.firstName
                            );
                          }
                        }}
                        value={
                          Array.isArray(users)
                            ? users
                                .filter(
                                  (user) => user._id === formik.values.user
                                )
                                .map((user) => ({
                                  value: user._id,
                                  label: user.firstName,
                                }))[0] || null
                            : null
                        }
                        placeholder="Select User..."
                      />

                      {/* {formik.touched.user && formik.errors.user ? (
                        <div style={{ color: "red" }}>
                         {formik.errors.user}
                         </div>
                     : null} */}
                    </div>
                  </div>
                ) : (
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Name </label>
                      <input
                        className="form-control"
                        name="name"
                        type="text"
                        onChange={formik.handleChange}
                        // onBlur={formik.handleBlur}
                        value={formik.values.name}
                      />
                      {/* {isDurationEnabled && formik.touched.name && formik.errors.name ? (
                        <div style={{ color: "red" }}>{formik.errors.name}</div>
                      ) : null} */}
                    </div>
                  </div>
                )}
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Description </label>
                    <textarea
                      className="form-control"
                      name="description"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.description}
                      rows="3"
                    />
                    {formik.touched.description && formik.errors.description ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.description}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>


              <div className="row">
              <div className="col-md-6">
                      <div className="form-group">
                        <label>Date of offline payment received </label>

                        <input
                          type="date"
                          className="form-control"
                          value={formik.values.sponsorDate || ""}
                          onChange={(e) => {
                            const rawValue = e.target.value;
                            if (!rawValue) {
                              formik.setFieldValue("sponsorDate", "");
                              // setStartDate(null);
                              return;
                            }

                            const dateObj = new Date(rawValue);
                            if (isNaN(dateObj.getTime())) return;

                            formik.setFieldValue("sponsorDate", rawValue);
                          }}
                        />
                        {formik.touched.sponsorDate &&
                        formik.errors.sponsorDate ? (
                          <div style={{ color: "red" }}>
                            {formik.errors.sponsorDate}
                          </div>
                        ) : null}
                      </div>
                    </div>
                <div className="col-md-6">
                      <div className="form-group">
                        <label>Sponsor Fee </label>
                        <input
                          type="number"
                          className="form-control"  
                          name="sponsorfee"
                          value={formik.values.sponsorfee}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {/* {Formik.touched.sponsorfee &&
                        Formik.errors.sponsorfee ? (
                          <div className="text-danger">
                            {Formik.errors.sponsorfee}
                          </div>
                        ) : null} */}
                      </div>
                    </div>

                    <div className="col-md-6">
                  <div className="form-group">
                    <label>Notes </label>
                    <textarea
                      className="form-control"
                      name="note"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                       value={formik.values.note}
                      rows="3"
                    />
                    {/* {formik.touched.note && formik.errors.note ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.note}
                      </div>
                    ) : null} */}
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
                      //   formik.values.startDate
                      //     ? formik.values.startDate
                      //     : startDate ? startDate.toISOString().split("T")[0] : ""
                      // }
                      value={formik.values.startDate || ""}
                      onChange={(e) => {
                        if (!e.target.value) {
                          formik.setFieldValue("startDate", "");
                          formik.setFieldValue("endDate", "");
                          setStartDate(null);
                          setEndDate(null);
                          return;
                        }
                        const dateValue = new Date(e.target.value);
                        if (isNaN(dateValue.getTime())) {
                          return; 
                        }
                        setStartDate(dateValue);
                        let dateOnly = dateValue.toISOString().split("T")[0];
                        formik.setFieldValue("startDate", dateOnly);
                      
                        const nextYear = new Date(dateValue);
                        nextYear.setFullYear(nextYear.getFullYear() + 1);
                        setEndDate(nextYear);
                        formik.setFieldValue("endDate", nextYear.toISOString().split("T")[0]);
                      }}
                      // onChange={(e) => {
                      //   // Handle empty value when date is cleared
                      //   if (!e.target.value) {
                      //     formik.setFieldValue("startDate", "");
                      //     formik.setFieldValue("endDate", "");
                      //     return;
                      //   }
                        
                      //   // Validate the date before processing
                      //   const dateValue = new Date(e.target.value);
                      //   if (isNaN(dateValue.getTime())) {
                      //     return; 
                      //   }
                        
                      //   setStartDate(dateValue);
                      //   let isoDateString = dateValue.toISOString();
                      //   let dateOnly = isoDateString.split("T")[0];
                      //   formik.setFieldValue("startDate", dateOnly);
                        
                      //   const nextYear = new Date(dateValue);
                      //   nextYear.setFullYear(nextYear.getFullYear() + 1);
                      //   setEndDate(nextYear);
                      //   formik.setFieldValue(
                      //     "endDate",
                      //     nextYear.toISOString().split("T")[0]
                      //   );
                      // }}
                    />
                     {formik.touched.startDate && formik.errors.startDate ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.startDate}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>End Date </label>
                    <input
                      type="date" 
                      className="form-control"
                      // value={
                      //   formik.values.endDate
                      //     ? formik.values.endDate
                      //     : endDate ? endDate.toISOString().split("T")[0] : ""
                      // }
                      value={formik.values.endDate || ""}
                      readOnly
                    />
                     {formik.touched.endDate && formik.errors.endDate ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.endDate}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
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
                  onClick={() => navigate("/sponsor")}
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
    </>
  );
}
export default NewSponsor;
