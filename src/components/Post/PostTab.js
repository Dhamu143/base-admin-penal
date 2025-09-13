import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import swal from "sweetalert";
import { useFormik } from "formik";
import * as Yup from "yup";

import { appGetAllSanstha } from "../../store/sanstha";
import { appAllGetHubs } from "../../store/hubs";
import {
  appDeletePost,
  appGetAllPost,
  appCreatePost,
  appUpdatePost,
} from "../../store/post";
import Paginate from "../pagination/paginate";
import { uploadSponsorImage } from "../../store/sponsor";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import { useParams } from "react-router-dom";
import PostPreview from "../PostPreview/PostPreview";
import ImageUpload from "../ImageUpload";


function Post({
  post,
  postPage,
  setPostPage,
  hubDetails,
  sansthaDetails,
  hideSansthaField,
}) {
  const dispatch = useDispatch();
  const { id } = useParams(); 
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editorValues, setValues] = useState(EditorState.createEmpty());
  const { hub } = useSelector((state) => state.hubReducer);
  const { sanstha } = useSelector((state) => state.sansthaReducer);
  const postpaginate = useSelector((state) => state.postReducer.paginate);
 const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId= userData._id
   
  useEffect(() => {
    if (hubDetails?._id) {
      dispatch(
        appGetAllSanstha({ hubId: hubDetails._id, page: 1, limit: 1000 })
      );
    } else if (sansthaDetails?._id) {
      dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
      dispatch(
        appGetAllSanstha({
          page: 1,
          limit: 1000,
          sansthaId: sansthaDetails._id,
        })
      );
    } else {
      dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
      dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
    }
  }, [dispatch, hubDetails, sansthaDetails]);

  const categoryOptions = [
    { value: "Announcement", label: "Announcement" },
    { value: "Inspiration", label: "Inspiration" },
    { value: "Achievement", label: "Achievement" },
    { value: "Activity", label: "Activity" },
    { value: "Photo Update", label: "Photo Update" },
    { value: "Devotional", label: "Devotional" },
    { value: "Awareness", label: "Awareness" },
    { value: "Other", label: "Other" },
  ];
  const defaultCategories = categoryOptions.map(c => c.value); 

  const hubOptions = useMemo(() => {
    if (hubDetails?._id) {
      return [{ value: hubDetails._id, label: hubDetails.name }];
    }

    if (sansthaDetails?.hub) {
      const hubObj = Array.isArray(hub?.data)
        ? hub.data.find((h) => h._id === sansthaDetails.hub)
        : null;
   
      return hubObj
        ? [{ value: hubObj._id, label: hubObj.name }]
        : [{ value: sansthaDetails.hub, label: "Unknown Hub" }];
    }

    return Array.isArray(hub?.data)
      ? hub.data.map((place) => ({ value: place._id, label: place.name }))
      : [];
  }, [hub, hubDetails, sansthaDetails]);
  // console.log("hubOptions", hubOptions)
  const sansthaOptions = useMemo(() => {
    if (!sanstha) return [];

    if (hubDetails?._id) {
      return sanstha
        .filter((s) => s.hub?._id === hubDetails._id)
        .map((s) => ({ value: s._id, label: s.name }));
    }

    if (sansthaDetails?._id) {
      return [{ value: sansthaDetails._id, label: sansthaDetails.name }];
    }
  }, [sanstha, hubDetails, sansthaDetails]);

  const onEditorStateChange = (editorState) => {
    formik.setFieldValue(
      "description",
      draftToHtml(convertToRaw(editorState.getCurrentContent()))
    );
    setValues(editorState);
  };

  const populateData = () => {
    if (post.data) {
      console.log(post.data)
      const selectedPost = Array.isArray(post.data)
        ? post.data.find((h) => h._id === id)
        : post.data;
     console.log("selectedPost", selectedPost)
      if (selectedPost?.description) {
        const blocksFromHtml = htmlToDraft(selectedPost?.description);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        setValues(EditorState.createWithContent(contentState));
      formik.setFieldValue("description", selectedPost.description);
      }
    }
  };
  useEffect(() => {
    populateData();
  }, [post]);

const validationSchema = Yup.object({
  // hub: Yup.string().required("Community is required"),
  // sanstha: Yup.string().when("$hideSansthaField", {
  //      is: false,
  //      then: (schema) => schema.required("Sanstha is required"),
  //      otherwise: (schema) => schema.notRequired(),
  //    }),
  title: Yup.string().required("Post title is required"),
   //description: Yup.string().required("Description is required"),
    // description: Yup.string()
    //       .transform((value) => value.replace(/<[^>]+>/g, "").trim()) 
    //       .test("is-not-empty", "Description is Required", (value) => value !== "")
    //       .required("Description is Required"),
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
  category: Yup.string().required("Category is required"),
   name: Yup.string().when("category", {
          is: "Other",
          then: Yup.string().required("Please specify category"),
        }),
   file: Yup.string()
        .required("Please upload a file")
        .test("is-valid-url", "Invalid image", (value) => {
          return value && value !== "/img/default-placeholder.jpg";
        }),
  });
 
  const formik = useFormik({
    initialValues: {
      hub: hubDetails?._id || sansthaDetails?.hub || "",
      sanstha:sansthaDetails?._id || "",
      title: "",
      description: "",
      category: "",
      file: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const payload = {
        title: values.title,
        file: values.file,
        description: values.description,
       // category: values?.category,
        category: values?.category === "Other" ? values.name : values.category,
        sanstha: values.sanstha,
        hub: hubDetails?._id || sansthaDetails?.hub ,
        userId: userId,
      };
       console.log(payload);

           const filtered_obj = Object.fromEntries(
        Object.entries(payload).filter(
          ([key, value]) =>
            value !== "" &&
            value !== null &&
            value !== undefined &&
            key !== "navigate"
        )
      );

      if (editId) {
        console.log("editId", editId)
        console.log("filtered_obj", filtered_obj)
        dispatch(appUpdatePost({ ...filtered_obj, id: editId })).then(() => {
          if (hubDetails?._id) {
            dispatch(
              appGetAllPost({ page: 1, limit: 10, hub: hubDetails?._id })
            );
          } else if (sansthaDetails?._id) {
            dispatch(
              appGetAllPost({
                page: 1,
                limit: 10,
                sanstha: sansthaDetails?._id,
              })
            );
          }
        });
      } else {
        dispatch(appCreatePost(filtered_obj)).then(() => {
          if (hubDetails?._id) {
            dispatch(
              appGetAllPost({ page: 1, limit: 10, hub: hubDetails?._id })
            );
          } else if (sansthaDetails?._id) {
            dispatch(
              appGetAllPost({
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
      setEditId(null);
    },
  });

  const handleAddNewPost = () => {
    setEditId(null);
    formik.resetForm();
    formik.setValues({
      hub: hubDetails?._id || sansthaDetails?.hub?._id || "",
      sanstha: sansthaDetails?._id || "",
      title: "",
      description: "",
      category: "",
      file: "",
    });
    setValues(EditorState.createEmpty());
    setShowModal(true);
  };

  const handleEditPost = (post) => {
    // console.log(post)
    setEditId(post._id);
    setShowModal(true);
      const isCustomCategory = post.category && !defaultCategories.includes(post.category);
    formik.setValues({
      hub: post.hub?._id || "",
      sanstha: post.sanstha?._id || "",
      title: post.title,
      description: post.description,
      // category: post.category,
       category: isCustomCategory ? "Other" : post.category || "",
       name: isCustomCategory ? post.category : "", 
      file: post.file,
    });
    
     if (post?.description) {
    const blocksFromHtml = htmlToDraft(post.description);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(
      contentBlocks,
      entityMap
    );
    setValues(EditorState.createWithContent(contentState));
  } else {
    setValues(EditorState.createEmpty());
  }
    //  const blocksFromHtml = htmlToDraft(post?.description);
    //     const { contentBlocks, entityMap } = blocksFromHtml;
    //     const contentState = ContentState.createFromBlockArray(
    //       contentBlocks,
    //       entityMap
    //     );
    //     setValues(EditorState.createWithContent(contentState));
  };

  const handleDeletePost = (id) => {
    swal({
      title: "Are you sure?",
      text: "You want to delete this post?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        dispatch(appDeletePost(id)).then(() => {
          if (hubDetails?._id) {
            dispatch(
              appGetAllPost({ page: 1, limit: 10, hub: hubDetails?._id })
            );
          } else if (sansthaDetails?._id) {
            dispatch(
              appGetAllPost({
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

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h4></h4>
        <button className="btn btn-primary" onClick={handleAddNewPost}>
          Add Post
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Image</th>
              <th>Post</th>
              {/* <th>Description</th> */}
              <th>Category</th>
              <th>Community</th>
              <th>Sanstha</th>
             <th>Created Date</th>
              <th>Posted By </th>
            </tr>
          </thead>
          <tbody>
            {(post.data || []).map((value) => (
              <tr key={value._id}>
                {/* <td>
                  <img
                    src={value.file}
                    alt="post"
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
                          {new Date(value.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="text-center align-middle">
                          {value?.user && (
                            <>
                              <img
                                src={value.user.profilePic || "/img/user.jpg"}
                                alt="user"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                              <br />
                              {`${value.user.firstName} ${value.user.lastName}`}{" "}
                              <br />{" "}
                            </>
                          )}
                          {value?.approval_required ? (
                            <small>User</small>
                          ) : (
                            <small> Admin</small>
                          )}
                        </td>
                <td>
                  <button
                    className="btn btn-sm btn-info mr-2"
                    onClick={() => handleEditPost(value)}
                  >
                    <em className="fa fa-edit fa-fw"></em>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeletePost(value._id)}
                  >
                    <em className="fa fa-trash fa-fw"></em>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Paginate paginate={postpaginate} page={postPage} setPage={setPostPage} />

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
              <form onSubmit={formik.handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editId ? "Edit Post" : "Add Post"}
                  </h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => setShowModal(false)}
                  >
                    <span>&times;</span>
                  </button>
                </div>

                <div
                  className="modal-body"
                  style={{ maxHeight: "70vh", overflowY: "auto" }}
                >
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>Community *</label>
                      <Select
                        name="hub"
                        options={hubOptions}
                        value={hubOptions}
                        // value={
                        //     hubOptions.find(
                        //       (o) => o.value === formik.values.hub
                        //     ) || null
                        //   }
                        onChange={(opt) =>
                          formik.setFieldValue("hub", opt?.value)
                        }
                        placeholder="Select community..."
                        isDisabled
                      />
                      {/* {formik.touched.hub && formik.errors.hub && (
                        <div className="text-danger">{formik.errors.hub}</div>
                      )} */}
                    </div>

                    {!hideSansthaField && (
                      <div className="col-md-6">
                        <label>Sanstha *</label>
                        <Select
                          name="sanstha"
                          options={sansthaOptions}
                          value={
                            sansthaOptions.find(
                              (o) => o.value === formik.values.sanstha
                            ) || null
                          }
                          onChange={(opt) =>
                            formik.setFieldValue("sanstha", opt?.value)
                          }
                          placeholder="Select sanstha..."
                        />
                        {formik.touched.sanstha && formik.errors.sanstha && (
                          <div className="text-danger">
                            {formik.errors.sanstha}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>Post Title *</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                      />
                      {formik.touched.title && formik.errors.title && (
                        <div className="text-danger">{formik.errors.title}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label>Description *</label>
                      <Editor
                        editorClassName="form-control"
                        editorState={editorValues}
                        onEditorStateChange={onEditorStateChange}
                        onBlur={() => formik.setFieldTouched("description", true)}
                        editorStyle={{ height: 300 }}
                      />
                      {formik.touched.description &&
                        formik.errors.description && (
                          <div className="text-danger">
                            {formik.errors.description}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                    <ImageUpload
                  fieldName="media"
                  value={formik.values.file}
                  label="Media Upload (Image/Video)"
                  uploadFunction={uploadSponsorImage}
                  onChange={(value) => formik.setFieldValue("file", value.url)}
                  error={
                    formik.touched.file && formik.errors.file
                      ? formik.errors.file
                      : null
                  }
                  multiple={false}
                />
                    </div>
                     </div>
                     <div className="row">
                    <div className="col-md-6">
                      <label>Category *</label>
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

                    {formik.values.category === "Other" && (
                      <div className="col-md-6">
                        <label>Specify Category</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                        />
                        {formik.touched.name &&
                          formik.errors.name && (
                            <div className="text-danger"> 
                              {formik.errors.name}
                            </div>
                          )}
                      </div>
                    )}
                 </div>
                </div>

                <div className="modal-footer">
                  <button type="submit" className="btn btn-success">
                     <span><i className="fa fa-check"></i> {" "}</span> 
                      {editId ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    <i className="fa fa-times"></i> Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Post;
