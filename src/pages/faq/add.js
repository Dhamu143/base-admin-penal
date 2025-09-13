import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect } from "react";
// import DatePicker from "react-datepicker";
import Select from "react-select";
import { appCreateFaq, appUpdateFaq } from "../../store/faq";

function NewFaq() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const faq = useSelector((state) => state?.faqReducer?.faq);

  useEffect(() => {
    if (faq && id) {
      const selectedFaq = Array.isArray(faq)
        ? faq.find((l) => l._id === id)
        : faq;
        console.log(selectedFaq)
      if (selectedFaq) {
        formik.setFieldValue("question", selectedFaq.question);
        formik.setFieldValue("answer", selectedFaq.answer);
        formik.setFieldValue("isActive", selectedFaq.isActive);
        formik.setFieldValue("sort", selectedFaq.sort);
      }
    }
  }, [faq, id]);

  const formik = useFormik({
    initialValues: {
      question: "",
      answer: "",
      isActive: false,
      sort: 0,
    },
    validationSchema: Yup.object({
      question: Yup.string().required("Required"),
      answer: Yup.string().required("Required"),
      sort: Yup.number().required("Required"),
      isActive: Yup.boolean(),
    }),
    onSubmit: (values) => {
      const temp_obj = {
        question: values?.question,
        answer: values?.answer,
        isActive: values?.isActive,
        sort: values?.sort,
        navigate: navigate,
      };
      if (id) {
        dispatch(appUpdateFaq({ ...temp_obj, id }));
      } else {
        dispatch(appCreateFaq(temp_obj));
      }
    },
  });

  return (
    <>
      <div className="content-wrapper">
        <div className="content-heading">
          <div>
            <span>
              <Link to="/faq">FAQ</Link>
            </span>{" "}
            <span>/ {id ? "Edit FAQ" : "New FAQ"}</span>
          </div>
        </div>
        <div className="card card-default">
          <div className="card-body">
            <form onSubmit={formik.handleSubmit}>
              <div className="row" style={{ padding: "0 0 15px 0" }}>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Question *</label>
                    <input
                      className="form-control"
                      name="question"
                      type="text"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.question}
                    />
                    {formik.touched.question && formik.errors.question ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.question}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Answer *</label>
                    <textarea
                      className="form-control"
                      name="answer"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.answer}
                      rows="1"
                    />
                    {formik.touched.answer && formik.errors.answer ? (
                      <div style={{ color: "red" }}>{formik.errors.answer}</div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="row" style={{ padding: "0 0 15px 0" }}>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Sort Order *</label>
                    <input
                      type="number"
                      name="sort"
                      className="form-control"
                      placeholder="Enter sort order"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.sort}
                    />
                    {formik.touched.sort && formik.errors.sort ? (
                      <div style={{ color: "red" }}>{formik.errors.sort}</div>
                    ) : null}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    {/* <label>Active *</label> */}
                    <div className="d-flex align-items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        className="form-check-input mt-4 ml-3"
                        checked={formik.values.isActive}
                        onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                        onBlur={formik.handleBlur}
                      />
                      <span className="mt-4 ml-5">{formik.values.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    {formik.touched.isActive && formik.errors.isActive ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.isActive}
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
                  onClick={() => navigate("/faq")}
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
export default NewFaq;
