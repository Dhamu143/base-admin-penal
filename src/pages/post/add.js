import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { appGetAllSanstha } from "../../store/sanstha";
import { appAllGetHubs } from "../../store/hubs";
import ImageUpload from "../../components/ImageUpload";
import { appCreatePost, appGetAllPost, appUpdatePost } from "../../store/post";
import { uploadSponsorImage } from "../../store/sponsor";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";

function NewPost() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { post, isloder } = useSelector((state) => state.postReducer);
  const { hub } = useSelector((state) => state.hubReducer);
  const { sanstha } = useSelector((state) => state.sansthaReducer);
  // const post =  useSelector((state) => state?.postReducer.post);
  const [editorValues, setValues] = useState(EditorState.createEmpty());

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData._id;
  // console.log(userId);
  useEffect(() => {
    dispatch(appGetAllSanstha({ page: 1, limit: 1000 }));
    dispatch(appAllGetHubs({ page: 1, limit: 1000 }));
    dispatch(appGetAllPost({ page: 1, limit: 1000 }));
  }, [dispatch]);

  const onEditorStateChange = (editorState) => {
    formik.setFieldValue(
      "description",
      draftToHtml(convertToRaw(editorState.getCurrentContent()))
    );
    setValues(editorState);
  };

  const populateData = () => {
    if (post.data) {
      const selectedHub = Array.isArray(post.data)
        ? post.data.find((h) => h._id === id)
        : post.data;

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
  }, [post]);

  const selectedPost = useMemo(() => {
    if (!id || !post?.data) return null;
    return Array.isArray(post.data)
      ? post.data.find((r) => r._id === id)
      : post.data;
  }, [post, id]);
   console.log("selectedPost", selectedPost);

  const isCustomCategory =
    selectedPost?.category &&
    ![
      "Announcement",
      "Inspiration",
      "Achievement",
      "Activity",
      "Photo Update",
      "Devotional",
      "Awareness",
    ].includes(selectedPost.category);
  console.log(isCustomCategory);
  const formik = useFormik({
    initialValues: {
      title: selectedPost?.title || "",
      description: selectedPost?.description || "",
      hub: selectedPost?.hub?._id || "",
      sanstha: selectedPost?.sanstha?._id || "",
      file: selectedPost?.file || "",
      //file: typeof values.file === "object" ? values.file.url : values.file,
     // category: selectedPost?.category || "",
      category: isCustomCategory ? "Other" : selectedPost?.category || "",
      name: isCustomCategory ? selectedPost?.category : "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
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
      title: Yup.string().required("Post title is required"),
      hub: Yup.string().required("Community is required"),
      // sanstha: Yup.string().required("Sanstha is required"),
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
    }),
    onSubmit: (values) => {
      const temp_obj = {
        title: values.title,
        file: values?.file,
        description: values?.description,
        //category: values?.category,
        category: values?.category === "Other" ? values.name : values.category,
        sanstha: values?.sanstha,
        hub: values?.hub,
        userId: userId,
        navigate: navigate,
      };
      // console.log("temp_obj", temp_obj)
      const filtered_obj = Object.fromEntries(
        Object.entries(temp_obj).filter(
          ([key, value]) =>
            value !== "" &&
            value !== null &&
            value !== undefined &&
            key !== "navigate"
        )
      );
      if (id) {
        dispatch(appUpdatePost({ ...filtered_obj, id })).then(() => {
          navigate("/post");
        });
      } else {
        dispatch(appCreatePost(filtered_obj)).then(() => {
          navigate("/post");
          formik.resetForm();
        });
      }
    },
  });

  const hubOptions = useMemo(
    () =>
      Array.isArray(hub?.data)
        ? hub.data.map((place) => ({ value: place._id, label: place.name }))
        : [],
    [hub]
  );

  const sansthaOptions = useMemo(
    () =>
      Array.isArray(sanstha)
        ? sanstha.map((s) => ({ value: s._id, label: s.name }))
        : [],
    [sanstha]
  );

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

  return (
    <>
      {isloder && <div className="loading">Loading...</div>}
      <div className="content-wrapper">
        <div className="content-heading">
          <div>
            <Link to="/native-place">Post</Link> /{" "}
            {id ? "Edit Post" : "New Post"}
          </div>
        </div>

        <div className="card card-default">
          <div className="card-body">
            <form onSubmit={formik.handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label>
                    Community <span className="text-danger">*</span>
                  </label>
                  <Select
                    name="hub"
                    options={hubOptions}
                    onChange={(opt) => formik.setFieldValue("hub", opt?.value)}
                    value={
                      hubOptions.find((o) => o.value === formik.values.hub) ||
                      null
                    }
                    placeholder="Select community..."
                  />
                  {formik.touched.hub && formik.errors.hub && (
                    <div className="text-danger">{formik.errors.hub}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label>
                    Post Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    placeholder="Enter post title"
                  />
                  {formik.touched.title && formik.errors.title && (
                    <div className="text-danger">{formik.errors.title}</div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <label>Sanstha </label>
                  <Select
                    name="sanstha"
                    options={sansthaOptions}
                    onChange={(opt) =>
                      formik.setFieldValue("sanstha", opt?.value)
                    }
                    value={
                      sansthaOptions.find(
                        (o) => o.value === formik.values.sanstha
                      ) || null
                    }
                    placeholder="Select Sanstha..."
                  />
                  {/* {formik.touched.sanstha && formik.errors.sanstha && (
                    <div className="text-danger">{formik.errors.sanstha}</div>
                  )} */}
                </div>

                <div className="col-md-6">
                  <label>
                    Post Description <span className="text-danger">*</span>
                  </label>
                  <Editor
                    editorClassName="form-control"
                    editorState={editorValues}
                    onEditorStateChange={onEditorStateChange}
                    onBlur={() => formik.setFieldTouched("description", true)}
                    editorStyle={{ height: 300 }}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="text-danger">
                      {formik.errors.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3 col-md-6">
                {/* <ImageUpload
                  fieldName="introVideo"
                  value={formik.values.file}
                  label="Media Upload *"
                  allowedTypes={["video/mp4", "video/webm"]}
                  maxVideoDuration={30}
                  uploadFunction={uploadSponsorImage}
                  onChange={(value) => formik.setFieldValue("file", value)}
                  error={
                    formik.touched.file && formik.errors.file
                      ? formik.errors.file
                      : null
                  }
                /> */}
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

                {/* <MediaUpload
                  fieldName="file"
                  label="Event Banner *"
                  value={formik.values.file || ""}
                  onChange={(files) => formik.setFieldValue("file", files)}
                  uploadFunction={uploadSponsorImage}
                  error={
                    formik.touched.file && formik.errors.file
                      ? formik.errors.file
                      : null
                  }
                /> */}
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
                    <div className="text-danger">{formik.errors.category}</div>
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
                    {formik.touched.name && formik.errors.name && (
                      <div className="text-danger">{formik.errors.name}</div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <button type="submit" className="btn btn-success mr-2">
                  <i className="fa fa-check me-1"></i>
                  {id ? " Update" : " Create"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/post")}
                >
                  <i className="fa fa-times me-1"></i> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
export default NewPost;
