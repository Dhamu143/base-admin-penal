import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
// import { toast } from "react-hot-toast";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";

import {
  appAllGetHubs,
  appCreateHub,
  appUpdateHub,
  uploadHubImage,
} from "../../store/hubs";
import { appGetAllCaste } from "../../store/caste";
import ImageUpload from "../../components/ImageUpload";

function NewHub() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const property = useSelector((state) => state?.property?.propertyId);
  const Hubs = useSelector((state) => state?.hubReducer?.hub);
  const caste = useSelector((state) => state?.casteReducer?.caste);
  const [editorValues, setValues] = useState(EditorState.createEmpty());

  useEffect(() => {
    dispatch(appGetAllCaste({ page: 1, limit: 1000 }));
    dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
  }, []);

  useEffect(() => {
    if (id) {
      // Get hub data by ID
      const selectedHub = Array.isArray(Hubs.data) ? Hubs.data.find((h) => h._id === id) : Hubs.data;
      if (selectedHub) {
        // Populate form fields with existing hub data
        formik.setValues({
          name: selectedHub.name || "",
          image: selectedHub.image || "",
          caste_id: selectedHub.caste?._id || "",
          description: selectedHub.description || "",
        });
      }
    }
  }, [id, Hubs]);

  const onEditorStateChange = (editorState) => {
    formik.setFieldValue(
      "description",
      draftToHtml(convertToRaw(editorState.getCurrentContent()))
    );
    setValues(editorState);
  };

  const populateData = () => {
    if (Hubs.data) {
      console.log(Hubs,"Hubs")
      const selectedHub = Array.isArray(Hubs.data) ? Hubs.data.find((h) => h._id === id) : Hubs.data;

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
  }, [Hubs]);

  const formik = useFormik({
    initialValues: {
      name: "",
      image: "",
      caste_id: "",
      description: ""
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      image: Yup.string().required("Required"),
      caste_id: Yup.string().required("Required"),
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
    }),
    onSubmit: (values) => {
      console.log(values);
      const temp_obj = {
        name: values?.name,
        image: values?.image,
        caste: values?.caste_id,
        description: values?.description,
        navigate: navigate,
      };
      console.log(temp_obj);
      console.log(id)
      if (id) {
        console.log('hii')
        dispatch(appUpdateHub({ ...temp_obj, id }))
        .then(() => {
          navigate('/community-setup')
        })
      } else {
        dispatch(appCreateHub(temp_obj));
        formik.resetForm();
      }
    },
  });

  return (
    <>
      <div className="content-wrapper">
        <div className="content-heading">
          <div>
            <span>
              <Link to="/community-setup">Community</Link>
            </span>{" "}
            <span>/ {id ? "Edit Community" : "New Community"}</span>
            {/* <span>/ {property ? property?.name : "New Community"}</span> */}
          </div>
        </div>
        <div className="card card-default">
          <div className="card-body">
            <form onSubmit={formik.handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Caste *</label>
                    <Select
                      name="_id"
                      options={caste || []}
                      onChange={(option) => {
                        formik.setFieldValue("caste_id", option?._id);
                        // dispatch(
                        //   appGetSubCategorie("?categorie_id=" + option?._id)
                        // );
                      }}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      value={
                        caste?.length > 0 &&
                        caste?.find(
                          (option) => option?._id === formik?.values?.caste_id
                        )
                      }
                      placeholder="Select.."
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option._id}
                    />
                    {formik.touched.caste_id && formik.errors.caste_id ? (
                      <div style={{ color: "red" }}>
                        {formik.errors.caste_id}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="col-md-6">
                  <ImageUpload
                    uploadFunction={uploadHubImage}
                    fieldName="image"
                    value={formik.values.image}
                    onChange={(value) => formik.setFieldValue("image", value.url)}
                    error={
                      formik.touched.image && formik.errors.image
                        ? formik.errors.image
                        : null
                    }
                  />
                </div>

              </div>
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
                <div className="col-md-7">
                <div className="form-group">
                  <label>Description *</label>
                  <Editor
                    editorClassName="form-control"
                    editorState={editorValues}
                    onEditorStateChange={onEditorStateChange}
                    editorStyle={{ height: 300 }}
                  />
                  {formik.touched.description && formik.errors.description ? (
                    <div style={{ color: 'red' }}>{formik.errors.description}</div>
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
                  onClick={() => navigate("/community-setup")}
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
export default NewHub;
