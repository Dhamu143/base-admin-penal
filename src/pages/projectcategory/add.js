import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect } from "react";
import { appCreateProjectCategory, appGetAllProjectCategory, appUpdateProjectCategory } from "../../store/projectcategory";


function NewProjectcategory() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const projectcategory = useSelector((state) => state?.projectcategoryReducer?.projectcategory);

  useEffect(() => {
    if (projectcategory && id) {
      const selectedprojectcategory = Array.isArray(projectcategory?.data) ? projectcategory?.data.find(l => l._id === id) : projectcategory?.data;
      console.log(selectedprojectcategory, id)
      if (selectedprojectcategory) {
        formik.setFieldValue("name", selectedprojectcategory.name);
      }
    }
  }, [projectcategory, id]);

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
        dispatch(appUpdateProjectCategory({ ...temp_obj, id }))
            .then(()=> {
               navigate("/project-category")
         dispatch(appGetAllProjectCategory({page:1, limit:10}))
        })
      } else {
        dispatch(appCreateProjectCategory(temp_obj))
        .then(()=> {
          navigate("/project-category")
        })
      }
    },
  });

  return (
    <>
      <div className="content-wrapper">
        <div className="content-heading">
          <div>
            <span>
              <Link to="/project-category">Language</Link>
            </span>{" "}
            <span>/ {id ? "Edit Project Category" : "New Project Category"}</span>
          </div>
        </div>
        <div className="card card-default">
          <div className="card-body">
            <form onSubmit={formik.handleSubmit}>
              <div className="row">
              </div>
              <div className="row" style={{ padding: "0 0 15px 0" }}>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Project Category Name *</label>
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
                  onClick={() => navigate("/Project-category")}
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
export default NewProjectcategory;