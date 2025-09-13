import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect } from "react";
// import DatePicker from "react-datepicker";
import Select from "react-select";
import {
  appCreateNativePlace,
  appUpdateNativePlace,
} from "../../store/nativeplace";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { appCreateComplianceDate, appUpdateComplianceDate } from "../../store/compliancesDate";

function NewComplianceDate() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {isloder , compliancesDate : compliancesDate} = useSelector((state) => state?.complianceDateReducer);
  // const [documentdate, setDocumentDate] = useState(new Date());
  // const [documentDuedate, setDocumentDueDate] = useState(new Date());


  useEffect(() => {
    if (compliancesDate && id) {
      const selectedcompliancesDate = Array.isArray(compliancesDate)
        ? compliancesDate.find((l) => l._id === id)
        : compliancesDate;
      if (selectedcompliancesDate) {
        formik.setFieldValue("name", selectedcompliancesDate.name);
        formik.setFieldValue(
          "documentdate",
          selectedcompliancesDate.documentdate ? new Date(selectedcompliancesDate.documentdate) : null
        );
        formik.setFieldValue(
          "documentDuedate",
          selectedcompliancesDate.documentDuedate ? new Date(selectedcompliancesDate.documentDuedate) : null
        );
      }
    }
  }, [compliancesDate, id]);

  const formik = useFormik({
    initialValues: {
      name: "",
      documentdate: new Date(),
      documentDuedate: new Date(),
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      documentdate: Yup.date().required("Required"),
      documentDuedate: Yup.date().required("Required"),
    }),
    onSubmit: (values) => {
      const temp_obj = {
        name: values.name,
        documentdate: values.documentdate,
        documentDuedate: values.documentDuedate,
        navigate: navigate,
      };
      // console.log(values);
      // console.log(temp_obj); 
      if (id) {
        dispatch(appUpdateComplianceDate({ ...temp_obj, id }));
      } else {
        dispatch(appCreateComplianceDate(temp_obj));
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
              <Link to="/compliance">Compliance</Link>
            </span>{" "}
            <span>/ {id ? "Edit Compliance" : "New Compliance"}</span>
          </div>
        </div>
        <div className="card card-default">
          <div className="card-body">
            <form onSubmit={formik.handleSubmit}>
              {/* <div className="row">
              </div> */}
              <div className="row" style={{ padding: "0 0 15px 0" }}>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Document Date *</label>
                    <DatePicker
                      // selected={formik.values.documentdate}
                      selected={
                        formik.values.documentdate
                          ? new Date(formik.values.documentdate)
                          : null}
                      onChange={(date) =>
                        formik.setFieldValue("documentdate", date)}
                    />
                 

                    {formik.touched.documentdate &&
                    formik.errors.documentdate ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.documentdate}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Document Due Date *</label>
                    <DatePicker
                      // selected={formik.values.documentDuedate}
                      selected={
                        formik.values.documentDuedate
                          ? new Date(formik.values.documentDuedate)
                          : null}
                      onChange={(date) =>
                        formik.setFieldValue("documentDuedate", date)
                      }
                    />
                    {formik.touched.documentDuedate &&
                    formik.errors.documentDuedate ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.documentDuedate}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="row" style={{ padding: "0 0 15px 0" }}>
                <div className="col-md-4">
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
                  onClick={() => navigate("/compliance")}
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
export default NewComplianceDate;
