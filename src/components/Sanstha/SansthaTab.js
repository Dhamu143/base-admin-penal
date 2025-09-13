import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import Paginate from "../pagination/paginate";
import { appCreateSanstha, appDeleteSanstha, appGetAllSanstha, appUpdateSanstha, uploadSansthaImage } from "../../store/sanstha";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import Select from "react-select";
import ImageUpload from "../ImageUpload";
import swal from "sweetalert";


function Sanstha({sansthaList, hubDetails, sanstha,sansthaPage, setSansthaPage}) {
  console.log("sansthaPage", sansthaPage)

    const dispatch = useDispatch();
    // const navigate = useNavigate();
    // const params = useParams();
    const { id } = useParams();
    const sansthapaginate = useSelector((state) => state.sansthaReducer.paginate);
    // console.log(sansthapaginate)
    // const sanstha = useSelector((state) => state.sansthaReducer.sanstha);
  // const [page, setPage] = useState(params.page || 1);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editSansthaId, setEditSansthaId] = useState(null);
    const isdeleted = useSelector((state) => state?.sansthaReducer?.isdeleted);
    const [editorValues, setValues] = useState(EditorState.createEmpty());

    // useEffect(() => {
    //     dispatch(appGetAllSanstha({ page: page, limit: 10, hub: id }));
    //   }, [dispatch,page, id]);

  // Formik validation schema for sanstha
  const sansthaValidationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
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
    hub: Yup.string().required("Hub is required"),
    // image: Yup.string().required("Required"),
    image: Yup.string().required("Image is required"),
    // .test("is-valid-url", "Invalid image", (value) => {
    //   return value && value !== "/img/default-placeholder.jpg";
    // }),
  });

  // Formik form initialization for sanstha
  const sansthaFormik = useFormik({
    initialValues: {
      name: "",
      description: "",
      hub: id,
      image: "",
    },
    validationSchema: sansthaValidationSchema,
    onSubmit: async (values) => {
      const temp_obj = {
        name: values?.name,
        image: values?.image,
        hub: typeof values?.hub === "object" ? values?.hub._id : values?.hub,
        description: values?.description,
        navigate: () => {
          dispatch(appGetAllSanstha({ page: 1, limit: 10, hub: id }));

        },
      };

      if (editMode && editSansthaId) {
        dispatch(appUpdateSanstha({ ...temp_obj, id: editSansthaId }));
      } else {
        dispatch(appCreateSanstha(temp_obj));
      }
      setShowModal(false);
      setEditMode(false);
      setEditSansthaId(null);
      sansthaFormik.resetForm();
    },
  });

  // const handleEditSanstha = (sanstha) => {
  //   console.log(sanstha, "sanstha");
  //   setEditMode(true);
  //   setEditSansthaId(sanstha._id);
  //   sansthaFormik.setValues({
  //     name: sanstha.name,
  //     description: sanstha.description,
  //     hub: typeof sanstha.hub === "string" ? sanstha.hub : sanstha.hub._id,
  //     image: sanstha.image,
  //   });
  //   setShowModal(true);
  // };

  const handleEditSanstha = (sanstha) => {
    setEditMode(true);
    setEditSansthaId(sanstha._id);
    sansthaFormik.setValues({
      name: sanstha.name,
      description: sanstha.description,
      hub: typeof sanstha.hub === "string" ? sanstha.hub : sanstha.hub._id,
      image: sanstha.image,
    });
    // Set the editor state from the HTML description
    if (sanstha.description) {
      const blocksFromHtml = htmlToDraft(sanstha.description);
      if (blocksFromHtml) {
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        setValues(EditorState.createWithContent(contentState));
      }
    } else {
      setValues(EditorState.createEmpty());
    }
    setShowModal(true);
  };

  const onEditorStateChange = (editorState) => {
    sansthaFormik.setFieldValue(
      "description",
      draftToHtml(convertToRaw(editorState.getCurrentContent()))
    );
    setValues(editorState);
  };

  const populateData = () => {
    if (sansthaList) {
      // console.log(sansthaList, "sansthaList");
      // console.log(editSansthaId);
      const selectedsanstha = Array.isArray(sansthaList)
        ? sansthaList.find((c) => c._id === editSansthaId)
        : sansthaList;
      // console.log(selectedsanstha, "selectedsanstha");
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
  }, [sansthaList]);

  useEffect(() => {
    if (isdeleted) {
      dispatch(appGetAllSanstha({ page: 1, limit: 10, hub: id }));
    }
  }, [isdeleted, dispatch, id]);

  const handleDeleteSanstha = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this sanstha?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeleteSanstha(id));
        // Refresh sanstha list after delete
        dispatch(appGetAllSanstha({ page: 1, limit: 10, hub: id }));
      }
    });
  };

  const handleAddNewSanstha = () => {
    setEditMode(false);
    setEditSansthaId(null);
    sansthaFormik.resetForm();
    sansthaFormik.setValues({
      name: "",
      description: "",
      hub: id,
      image: "",
    });
    setValues(EditorState.createEmpty());
    setShowModal(true);
  };

  return (
    <div>
      <div className="mb-3 mr-2 d-flex justify-content-between align-items-center">
        <h4 className="ml-2">Total Sanstha: {sansthaList?.length || 0}</h4>
        <button className="btn btn-primary" onClick={handleAddNewSanstha}>
          <i className="far fa-plus"></i> Add New Sanstha
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="">
            <tr>
              <th>Sr. No.</th>
              <th>Sanstha</th>
              {/* <th>Caste</th> */}
              {/* <th>Language</th> */}
              {/* <th>Native Place</th> */}
              {/* <th>Religion</th> */}
              <th>Total Members</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sanstha?.length > 0 ? (
              sanstha.map((sanstha, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {sanstha?.image ? (
                      <img
                        src={sanstha.image}
                        alt="sanstha"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      <img
                        src="/img/default-placeholder.jpg"
                        alt="sanstha"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                    <br />
                    {sanstha?.name}
                  </td>
                  {/* <td>{sanstha?.caste?.name}</td> */}
                  {/* <td>
                              {" "}
                              {sanstha?.language?.map((lang, i) => (
                                <span key={i}>
                                  {lang.name}
                                  {i < sanstha.language.length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </td> */}
                  {/* <td style={{
                          maxWidth: "150px",
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {sanstha?.nativeplace?.map((place, i) => (
                          <span key={i}>
                            {place.name}
                            {i < sanstha.nativeplace.length - 1 ? ", " : ""}
                          </span>
                        ))}</td> */}
                  {/* <td>{sanstha?.religion?.name}</td> */}
                  <td>{sanstha?.users.length}</td>
                  <td>
                    {new Date(sanstha?.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary mr-2"
                      title="Edit"
                      onClick={() => handleEditSanstha(sanstha)}
                    >
                      <i className="far fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      title="Delete"
                      onClick={() => handleDeleteSanstha(sanstha?._id)}
                    >
                      <i className="far fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No sanstha data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sansthapaginate && (
        <Paginate paginate={sansthapaginate} page={sansthaPage} setPage={setSansthaPage} />
      )}

      {/* Sanstha Creation Modal */}
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
                  {editMode ? "Edit Sanstha" : "Create New Sanstha"}
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => {
                    setShowModal(false);
                    setEditMode(false);
                    setEditSansthaId(null);
                    sansthaFormik.resetForm();
                  }}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
              >
                <form onSubmit={sansthaFormik.handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Community *</label>
                        <Select
                          name="_id"
                          options={[
                            {
                              value: id,
                              label: hubDetails?.name,
                            },
                          ]}
                          onChange={(option) => {
                            sansthaFormik.setFieldValue("hub", option?.value);
                          }}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          value={[
                            {
                              value: id,
                              label: hubDetails?.name,
                            },
                          ]}
                          placeholder="Select.."
                          isDisabled={true}
                        />
                        {sansthaFormik.touched.hub &&
                        sansthaFormik.errors.hub ? (
                          <div style={{ color: "red" }}>
                            {sansthaFormik.errors.hub}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <ImageUpload
                        uploadFunction={uploadSansthaImage}
                        fieldName="image"
                        value={sansthaFormik.values.image}
                        onChange={(value) =>
                          sansthaFormik.setFieldValue("image", value.url)
                        }
                        error={
                          sansthaFormik.touched.image &&
                          sansthaFormik.errors.image
                            ? sansthaFormik.errors.image
                            : null
                        }
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          className="form-control"
                          name="name"
                          type="text"
                          onChange={sansthaFormik.handleChange}
                          onBlur={sansthaFormik.handleBlur}
                          value={sansthaFormik.values.name}
                        />
                        {sansthaFormik.touched.name &&
                        sansthaFormik.errors.name ? (
                          <div style={{ color: "red" }}>
                            {sansthaFormik.errors.name}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-group">
                        <label>Description *</label>
                        <Editor
                          editorClassName="form-control"
                          editorState={editorValues}
                          onEditorStateChange={onEditorStateChange}
                          editorStyle={{ height: 300 }}
                        />
                        {/* <textarea
                          className="form-control"
                          name="description"
                          onChange={sansthaFormik.handleChange}
                          onBlur={sansthaFormik.handleBlur}
                          value={sansthaFormik.values.description}
                          rows="3"
                        /> */}
                        {sansthaFormik.touched.description &&
                        sansthaFormik.errors.description ? (
                          <div style={{ color: "red" }}>
                            {sansthaFormik.errors.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-labeled btn-success"
                      type="submit"
                      onClick={sansthaFormik.handleSubmit}
                    >
                      <span className="btn-label">
                        <i className="fa fa-check"></i>
                      </span>
                      {editMode ? "Update" : "Create"}
                    </button>
                    <button
                      className="btn btn-labeled btn-secondary ml-2"
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditMode(false);
                        setEditSansthaId(null);
                        sansthaFormik.resetForm();
                      }}
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
        </div>
      )}
    </div>
  );
}
export default Sanstha;
