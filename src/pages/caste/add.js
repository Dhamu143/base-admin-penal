import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
// import DatePicker from "react-datepicker";
import Select from "react-select";
import { appGetAllLanguage } from "../../store/language";
import { appGetAllReligion } from "../../store/religion";
import { appGetAllNativePlace } from "../../store/nativeplace";
import { appCreateCaste, appUpdateCaste } from "../../store/caste";

function NewCaste() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [gotraList, setGotraList] = useState([]);
  const languages =
    useSelector((state) => state?.languageReducer?.language) || [];
  const nativeplace =
    useSelector((state) => state?.nativeplaceReducer?.nativeplace) || [];
  const religion =
    useSelector((state) => state?.religionReducer?.religion) || [];
  const caste = useSelector((state) => state?.casteReducer?.caste) || [];

  useEffect(() => {
    // Get all data without pagination for dropdowns
    dispatch(appGetAllLanguage({ page: 1, limit: 1000 }));
    dispatch(appGetAllReligion({ page: 1, limit: 1000 }));
    dispatch(appGetAllNativePlace({ page: 1, limit: 1000 }));
  }, []);

  useEffect(() => {
    if (caste && id) {
      const selectedCaste = Array.isArray(caste)
        ? caste.find((c) => c._id === id)
        : caste;
      // console.log(selectedCaste);
      if (selectedCaste) {
        formik.setFieldValue("name", selectedCaste?.name);
        formik.setFieldValue(
          "languages_id",
          selectedCaste?.language?.map((lang) => ({
            value: lang._id,
            label: lang.name,
          })) || []
        );
        formik.setFieldValue(
          "nativeplace_id",
          selectedCaste?.nativeplace?.map((place) => ({
            value: place._id,
            label: place.name,
          })) || []
        );
        formik.setFieldValue("religion_id", selectedCaste?.religion?._id || "");
        formik.setFieldValue("significance", selectedCaste?.significance);
        formik.setFieldValue("gotra", selectedCaste?.gotra || []);
        setGotraList(selectedCaste?.gotra || []);
      }
    }
  }, [caste, id]);

  const formik = useFormik({
    initialValues: {
      name: "",
      languages_id: [],
      nativeplace_id: [],
      religion_id: "",
      // religion_id: religion.find(rel => rel.name.toLowerCase() === "hindu")?._id || "",
      significance: "",
      gotra: [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      languages_id: Yup.array().min(1, "At least one language is required"),
      nativeplace_id: Yup.array().min(
        1,
        "At least one native place is required"
      ),
      religion_id: Yup.string().required("Religion is required"),
    }),
    onSubmit: (values) => {
      const temp_obj = {
        name: values?.name,
        language: values?.languages_id.map((lang) => lang.value),
        nativeplace: values?.nativeplace_id.map((place) => place.value),
        religion: values?.religion_id,
        significance: values?.significance,
        gotra: gotraList,
        navigate: navigate,
      };
      console.log(temp_obj);
      if (id) {
        dispatch(appUpdateCaste({ ...temp_obj, id }));
      } else {
        // console.log(temp_obj, "temp_obj");
        dispatch(appCreateCaste(temp_obj));
        formik.resetForm();
        setGotraList([]);
      }
    },
  });

  const handleAddValue = () => {
    setGotraList([...gotraList, ""]);
  };

  const handleRemove = (index) => {
    setGotraList(gotraList.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, newValue) => {
    const updatedList = [...gotraList];
    updatedList[index] = newValue;
    setGotraList(updatedList);
  };

  return (
    <>
      <div className="content-wrapper">
        <div className="content-heading">
          <div>
            <span>
              <Link to="/caste">Caste</Link>
            </span>{" "}
            <span>/ {id ? "Edit Caste" : "New Caste"}</span>
          </div>
        </div>
        <div className="card card-default">
          <div className="card-body">
            <form onSubmit={formik.handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Religion *</label>
                    <Select
                      options={
                        Array.isArray(religion)
                          ? religion.map((rel) => ({
                              value: rel._id,
                              label: rel.name,
                            }))
                          : []
                      }
                      onChange={(option) => {
                        formik.setFieldValue(
                          "religion_id",
                          option?.value || ""
                        );
                      }}
                      value={
                        Array.isArray(religion)
                          ? religion.find(
                              (option) =>
                                option?._id === formik?.values?.religion_id
                            )
                          : null
                      }
                      placeholder="Select Religion.."
                      getOptionLabel={(option) => option?.name || option?.label}
                      getOptionValue={(option) => option?._id || option?.value}
                    />
                    {formik.touched.religion_id && formik.errors.religion_id ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.religion_id}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label>Languages *</label>
                    <Select
                      isMulti
                      options={
                        Array.isArray(languages)
                          ? languages.map((lang) => ({
                              value: lang._id,
                              label: lang.name,
                            }))
                          : []
                      }
                      onChange={(option) => {
                        formik.setFieldValue("languages_id", option || []);
                      }}
                      value={formik.values.languages_id}
                      placeholder="Select Language.."
                    />
                    {formik.touched.languages_id &&
                    formik.errors.languages_id ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.languages_id}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label>Native Place *</label>
                    <Select
                      isMulti
                      options={
                        Array.isArray(nativeplace.data)
                          ? nativeplace.data.map((place) => ({
                              value: place._id,
                              label: place.name,
                            }))
                          : []
                      }
                      onChange={(option) => {
                        formik.setFieldValue("nativeplace_id", option || []);
                      }}
                      value={formik.values.nativeplace_id}
                      placeholder="Select Native Place.."
                    />
                    {formik.touched.nativeplace_id &&
                    formik.errors.nativeplace_id ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.nativeplace_id}
                      </div>
                    ) : null}
                  </div>
                </div>

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
                      <div style={{ color: "red" }}>{formik.errors.name}</div>
                    ) : null}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Significance </label>
                    <textarea
                      className="form-control"
                      name="significance"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.significance}
                      rows="3"
                    />
                    {formik.touched.significance &&
                    formik.errors.significance ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.significance}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Gotra</label>
                    <button
                      type="button"
                      onClick={handleAddValue}
                      style={{
                        padding: "8px 16px",
                        border: "none",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginLeft: "4px",
                      }}
                    >
                      Add
                    </button>

                    <div style={{ marginTop: "12px" }}>
                      {gotraList.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            // display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <input
                            type="text"
                            value={item}
                            onChange={(e) =>
                              handleInputChange(index, e.target.value)
                            }
                            placeholder="Add Gotra"
                            style={{
                              flex: 1,
                              padding: "8px",
                              border: "1px solid #ccc",
                              outline: "none",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            style={{
                              padding: "6px 10px",
                              border: "none",
                              backgroundColor: "#e74c3c",
                              color: "white",
                              fontWeight: "bold",
                              cursor: "pointer",
                              borderRadius: "4px",
                              marginLeft: "5px",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
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
                  onClick={() => navigate("/caste")}
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
export default NewCaste;
