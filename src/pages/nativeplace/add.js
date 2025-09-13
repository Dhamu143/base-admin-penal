import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect } from "react";
// import DatePicker from "react-datepicker";
import Select from "react-select";
import { appCreateNativePlace, appUpdateNativePlace } from "../../store/nativeplace";

function NewNativePlace() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const nativePlaceData = useSelector((state) => state?.nativeplaceReducer?.nativeplace);
  const isloder = useSelector((state) => state?.nativeplaceReducer?.isloder);


  useEffect(() => {
    if (nativePlaceData && id) {
      const selectedNativePlace = Array.isArray(nativePlaceData.data) ? nativePlaceData.data.find(r => r._id === id) : nativePlaceData.data;
      if (selectedNativePlace) {
        formik.setFieldValue("name", selectedNativePlace?.name);
      }
    }
  }, [nativePlaceData, id]);

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
    }),
    onSubmit: (values) => {
      const temp_obj = {
        name: values?.name,
        navigate: navigate,
      };
      
      if (id) {
        dispatch(appUpdateNativePlace({ ...temp_obj, id }));
      } else {
        dispatch(appCreateNativePlace(temp_obj));
      }
    },
  });

  return (
    <>
      {isloder && <div className="loading">Loading...</div>}
      <div className="content-wrapper">
        <div className="content-heading">
          <div>
            <span>
              <Link to="/native-place">Native Place</Link>
            </span>{" "}
            <span>/ {id ? "Edit Native Place" : "New Native Place"}</span>
          </div>
        </div>
        <div className="card card-default">
          <div className="card-body">
            <form onSubmit={formik.handleSubmit}>
              {/* <div className="row">
              </div> */}
              <div className="row" style={{ padding: "0 0 15px 0" }}>
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
                  onClick={() => navigate("/native-place")}
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
export default NewNativePlace;
