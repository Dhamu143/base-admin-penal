import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { appGetHubById, appUpdateHub } from "../../store/hubs";
import { useEffect, useState } from "react";
import swal from "sweetalert";
import {
  appGetAllSanstha,
} from "../../store/sanstha";
import {  appGetAllUser} from "../../store/user";
import {
  appGetAllSponsor,
} from "../../store/sponsor";
import { useFormik } from "formik";
import * as Yup from "yup";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import { appGetAllFacility } from "../../store/facilities";
import Facility from "../../components/Facility/FacilityTab";
import Sanstha from "../../components/Sanstha/SansthaTab";
import Users from "../../components/Users/UsersTab";
import Sponsor from "../../components/Sponsor/SponsorTab";
import Management from "../../components/Management/ManagementTab";
import { appAllGetTeams } from "../../store/teams";
import { appGetAllPost } from "../../store/post";
import Post from "../../components/Post/PostTab";
import { appGetAllProject } from "../../store/socialproject";
import SocialProjectTab from "../../components/SocialProjects/SocialProjectTab";
import { appGetAllProjectCategory } from "../../store/projectcategory";
import { appGetAllEvent } from "../../store/event";
import Event from "../../components/Event/EventTab";
import Directories from "../../components/Directories/Directories";
import DirectoriesTabs from "../../components/Directories/Directories";

function HubDetails() {
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  const params = useParams();
  const { id } = useParams();
  const hubDetails = useSelector((state) => state.hubReducer.hubDetails);
  const sansthaList = useSelector((state) => state.sansthaReducer.sansthaList);
  // console.log(sansthaList, "sansthaList")
  const sanstha = useSelector((state) => state.sansthaReducer.sanstha);
  const sponsorList = useSelector((state) => state?.sponsorReducer.sponsorList);
  const sponsor = useSelector((state) => state.sponsorReducer.sponsor);
  // console.log(sponsorList, "sponsorList");
  const users = useSelector((state) => state?.usersReducer.users);
  // console.log(users)
  const FacilityList = useSelector((state) => state.facilityReducer.facility);
  const teamsList = useSelector((state) => state.teamsReducer.teams);
  const post = useSelector((state) => state.postReducer.post);
  const socialproject = useSelector((state)=> state.socialprojectReducer.socialproject)
  const projectcategory = useSelector((state) => state?.projectcategoryReducer?.projectcategory);
    const event = useSelector((state) => state?.eventReducer.event);

  // const [page, setPage] = useState(params.page || 1);
  const [userpage, setUserPage] = useState(params.userpage || 1);
  const [eventpage, setEventPage] = useState(params.eventpage || 1);
  const [projectPage, setProjectPage] = useState(params.projectPage || 1);
  const [sponsorpage, setSponsorPage] = useState(params.sponsorpage || 1);
  const [sansthaPage, setSansthaPage] = useState(params.sansthapage || 1);
  const [postPage , setPostPage] = useState(params.postPage || 1);
  const [editorValues, setValues] = useState(EditorState.createEmpty());
  const [showEditDescriptionModal, setShowEditDescriptionModal] = useState(false);
  const [editDescription, setEditDescription] = useState(
    hubDetails?.description || ""
  );
  // const [isDurationEnabled, setIsDurationEnabled] = useState(true);
  // const [startDate, setStartDate] = useState(new Date());
  // const [endDate, setEndDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));

  useEffect(() => {
    setEditDescription(hubDetails?.description || "");
  }, [hubDetails]);

  const handleSaveDescription = () => {
    const htmlDescription = draftToHtml(
      convertToRaw(editorValues.getCurrentContent())
    );
    dispatch(
      appUpdateHub({
        id: hubDetails._id,
        name: hubDetails?.name,
        image: hubDetails?.image,
        caste: hubDetails?.caste?._id,
        description: htmlDescription,
      })
    ).then(() => {
      setShowEditDescriptionModal(false);
      dispatch(appGetHubById(hubDetails._id));
    });
  };

  const handleOpenEditDescriptionModal = () => {
    let editorState = EditorState.createEmpty();
    if (hubDetails?.description) {
      const blocksFromHtml = htmlToDraft(hubDetails.description);
      if (blocksFromHtml) {
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        editorState = EditorState.createWithContent(contentState);
      }
    }
    setValues(editorState);
    setShowEditDescriptionModal(true);
  };
  // useEffect(() => {
  //   dispatch(appGetHubById(id));
  //   dispatch(appGetAllFacility({ hub: id }));
  //   dispatch(appGetAllSanstha({ page: 1, limit: 1000, hub: id, isDropdown: true }));
  //   dispatch(
  //     appGetAllSponsor({
  //       page: sponsorpage,
  //       limit: 1000,
  //       hub: id,
  //       admin: true,
  //       isDropdown: true,
  //     })
  //   );
  //   dispatch(appGetAllUser({ page: userpage, limit: 10, hub: id }));
  // }, [dispatch, page, userpage, sponsorpage, id]);

  // State to track loaded tabs
  const [loadedTabs, setLoadedTabs] = useState({
    aboutus: false,
    management: false,
    sponsors: false,
    sanstha: false,
    users: false,
    events: false,
    donation: false,
    facilities: false,
    directories: false,
    socialprojects: false,
    newspost: false,
  });

  const [activeTab, setActiveTab] = useState("aboutus");

  useEffect(() => {
    if (activeTab === "socialprojects") {
      dispatch(appGetAllProject({ page: projectPage, limit: 10, hub: id }));
      dispatch(appGetAllProjectCategory({ page: 1, limit: 1000 }));
    }
  }, [projectPage, activeTab]);

    useEffect(() => {
    if (activeTab === "events") {
      dispatch(appGetAllEvent({ page: eventpage, limit: 10, hub: id }));
    }
  }, [eventpage, activeTab]);
  useEffect(() => {
    if (activeTab === "users") {
      dispatch(appGetAllUser({ page: userpage, limit: 10, hub: id }));
    }
  }, [userpage, activeTab]);
   useEffect(() => {
    if (activeTab === "newspost") {
     dispatch(appGetAllPost({ page: postPage, limit: 10 , hub: id}));
    }
  }, [postPage, activeTab]);
  useEffect(() => {
    if (activeTab === "sponsors") {
      dispatch(
        appGetAllSponsor({
          page: sponsorpage,
          limit: 10,
          hub: id,
          admin: true,
        })
      );
          dispatch(
      appGetAllSponsor({
        page: sponsorpage,
        limit: 1000,
        hub: id,
        admin: true,
        isDropdown: true,
      })
    )
    }
  }, [sponsorpage, activeTab]);
  useEffect(() => {
    if (activeTab === "sanstha") {
      dispatch(appGetAllSanstha({ page: sansthaPage, limit: 10, hub: id }));
      dispatch(
        appGetAllSanstha({ page: 1, limit: 1000, hub: id, isDropdown: true })
      );
    }
  }, [sansthaPage, activeTab]);

  // Tab change handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    if (loadedTabs[tabId]) return;

    // Load data based on the active tab
    switch (tabId) {
      case "aboutus":
        if (!loadedTabs.aboutus) {
          console.log("hi1");
          dispatch(appGetHubById(id));
          setLoadedTabs((prev) => ({ ...prev, aboutus: true }));
        }
        break;

      case "management":
        if (tabId === "management" && !loadedTabs.management) {
          console.log("hi3");
          dispatch(appAllGetTeams({ hub: id,  userType: "hub" }));
          setLoadedTabs((prev) => ({ ...prev, management: true }));
        }
        break;

      case "sponsors":
        if (tabId === "sponsors" && !loadedTabs.sponsors) {
          console.log("hi4");
          setLoadedTabs((prev) => ({ ...prev, sponsors: true }));
        }
        break;
      case "sanstha":
        if (tabId === "sanstha" && !loadedTabs.sanstha) {
          console.log("hi4");
          setLoadedTabs((prev) => ({ ...prev, sanstha: true }));
        }
        break;

      case "users":
        if (tabId === "users" && !loadedTabs.users) {
          console.log("hi5");
          setLoadedTabs((prev) => ({ ...prev, users: true }));
        }
        break;

      case "facilities":
        if (!loadedTabs.facilities) {
          console.log("hi7");
          dispatch(appGetAllFacility({ hub: id }));
          setLoadedTabs((prev) => ({ ...prev, facilities: true }));
        }
        break;

     case "newspost":
        if (tabId === "newspost" && !loadedTabs.newspost) {
           
          setLoadedTabs((prev) => ({ ...prev, newspost: true }));
        }
        break;
           case "socialprojects":
        if (!loadedTabs.socialprojects) {
          setLoadedTabs((prev) => ({ ...prev, socialprojects: true }));
        }
        break;
        case "events":
        if (tabId === "events" && !loadedTabs.events) {
          setLoadedTabs((prev) => ({ ...prev, events: true }));
        }
        break;
          case "directories":
        if (tabId === "directories" && !loadedTabs.directories) {
          setLoadedTabs((prev) => ({ ...prev, directories: true }));
        }
        break;
    }
  };

  // Initial load
  useEffect(() => {
    setLoadedTabs((prev) => ({ ...prev, aboutus: true }));
    dispatch(appGetHubById(id));
  }, [dispatch, id]);

  const sansthaFormik = useFormik({
    initialValues: {
      description: "",
    },
    validationSchema: Yup.object({
      //description: Yup.string().required("Description is required"),
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
    onSubmit: (values) => {},
  });

  const onEditorStateChange = (editorState) => {
    sansthaFormik.setFieldValue(
      "description",
      draftToHtml(convertToRaw(editorState.getCurrentContent()))
    );
    setValues(editorState);
  };

  return (
    <div>
      <div
        className="carousel"
        id="carouselExampleCaptions"
        data-ride="carousel"
      >
        <ol className="carousel-indicators">
          {sponsor && sponsor.length > 0 ? (
            sponsor.map((_, index) => (
              <li
                key={index}
                className={index === 0 ? "active" : ""}
                data-target="#carouselExampleCaptions"
                data-slide-to={index}
              ></li>
            ))
          ) : (
            <li
              className="active"
              data-target="#carouselExampleCaptions"
              data-slide-to="0"
            ></li>
          )}
        </ol>
        <div className="carousel-inner">
          {sponsor && sponsor.length > 0 ? (
            sponsor.map((sponsorItem, index) => (
              <div
                key={index}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
                style={{
                  backgroundImage: `url(${sponsorItem?.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  height: "60vh",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <div
                  style={{ color: "black" }}
                  className="carousel-caption d-none d-md-block"
                >
                  <img
                    className="img-thumbnail rounded-circle thumb128 mb-3"
                    // src="/img/default-placeholder.jpg"
                    src={hubDetails?.image}
                    alt="Image"
                  />
                  <h3 className="m-0">{hubDetails?.name} - Community</h3>
                  <div className="mr-3 mt-2">
                    Community Created Date :{" "}
                    {new Date(hubDetails?.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </div>
                  <p>Caste-{hubDetails?.caste?.name}</p>
                  <p style={{ textTransform: "capitalize" }}>
                    Mother Tounge( Language)-{" "}
                    {hubDetails?.caste?.language?.map((lang, i) => (
                      <span key={i}>
                        {lang.name}
                        {i < hubDetails.caste.language.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                  <p style={{ textTransform: "capitalize" }}>
                    Native Place(state)-{" "}
                    {hubDetails?.caste?.nativeplace?.map((place, i) => (
                      <span key={i}>
                        {place.name}
                        {i < hubDetails.caste.nativeplace.length - 1
                          ? ", "
                          : ""}
                      </span>
                    ))}
                  </p>
                  <p style={{ textTransform: "capitalize" }}>
                    Religion- {hubDetails?.caste?.religion?.name}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div
              className="carousel-item active"
              style={{
                backgroundImage: `url("/img/download.jpeg")`,
                // backgroundImage: `url(${hubDetails?.image || "/img/download.jpeg"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                height: "60vh",
                backgroundColor: "#f8f9fa",
              }}
            >
              <div
                style={{ color: "black" }}
                className="carousel-caption d-none d-md-block"
              >
                <img
                  className="img-thumbnail rounded-circle thumb128"
                  src={hubDetails?.image}
                  alt="Image"
                />
                <h3 className="m-0">{hubDetails?.name} - Community</h3>
                <p className="mr-3 mt-2">
                  Community Created Date :{" "}
                  {new Date(hubDetails?.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p>Caste- {hubDetails?.caste?.name}</p>
                <p style={{ textTransform: "capitalize" }}>
                  Mother Tounge( Language)-{" "}
                  {hubDetails?.caste?.language?.map((lang, i) => (
                    <span key={i}>
                      {lang.name}
                      {i < hubDetails.caste.language.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
                <p style={{ textTransform: "capitalize" }}>
                  Native Place(state)-{" "}
                  {hubDetails?.caste?.nativeplace?.map((place, i) => (
                    <span key={i}>
                      {place.name}
                      {i < hubDetails.caste.nativeplace.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
                <p style={{ textTransform: "capitalize" }}>
                  Religion- {hubDetails?.caste?.religion?.name}
                </p>
                {/* <p>{hubDetails?.caste?.significance}</p> */}
              </div>
            </div>
          )}
        </div>
        <a
          className="carousel-control-prev"
          href="#carouselExampleCaptions"
          role="button"
          data-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="sr-only">Previous</span>
        </a>
        <a
          className="carousel-control-next"
          href="#carouselExampleCaptions"
          role="button"
          data-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="sr-only">Next</span>
        </a>
      </div>
      <div className="text-cen mb-4">
        <div className="row card card-transparent" role="tabpanel">
          <ul
            className="nav nav-tabs nav-fill"
            role="tablist"
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              whiteSpace: "nowrap",
              flexWrap: "nowrap",
              maxWidth: "100%",
              WebkitOverflowScrolling: "touch",
              display: "flex",
              // gap: "0.5rem",
            }}
          >
            <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 ${
                  activeTab === "aboutus" ? "active" : ""
                } bg-gray text-white`}
                href="#aboutus"
                aria-controls="aboutus"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "aboutus"}
                onClick={() => handleTabChange("aboutus")}
              >
                <em className="far fa-file-alt fa-fw"></em> About us
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 ${
                  activeTab === "management" ? "active" : ""
                } bg-gray text-white`}
                href="#management"
                aria-controls="management"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "management"}
                onClick={() => handleTabChange("management")}
              >
                <em className="fas fa-user-cog fa-fw"></em> Management
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 ${
                  activeTab === "sponsors" ? "active" : ""
                } bg-gray text-white`}
                href="#sponsors"
                aria-controls="sponsors"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "sponsors"}
                onClick={() => handleTabChange("sponsors")}
              >
                <em className="fas fa-users-cog fa-fw"></em> Sponsors
                {/* :{" "}{sponsorList?.length || 0}  */}
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 ${
                  activeTab === "sanstha" ? "active" : ""
                } bg-gray text-white`}
                href="#sanstha"
                aria-controls="sanstha"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "sanstha"}
                onClick={() => handleTabChange("sanstha")}
              >
                <em className="fas fa-users-cog fa-fw"></em> Sanstha 
                {/* :{" "}{sansthaList?.length || 0} */}
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 ${
                  activeTab === "users" ? "active" : ""
                } bg-gray text-white`}
                href="#users"
                aria-controls="users"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "users"}
                onClick={() => handleTabChange("users")}
              >
                <em className="far fa-user fa-fw"></em> User :{" "}
                {hubDetails?.users?.length || 0}
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 ${
                  activeTab === "events" ? "active" : ""
                } bg-gray text-white`}
                href="#events"
                aria-controls="events"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "events"}
                onClick={() => handleTabChange("events")}
              >
                <em className="far fa-calendar-alt fa-fw"></em> Events
              </a>
            </li>
            {/* <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 ${
                  activeTab === "donation" ? "active" : ""
                } bg-gray text-white`}
                href="#donation"
                aria-controls="donation"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "donation"}
                onClick={() => handleTabChange("donation")}
              >
                <em className="fas fa-hand-holding-heart fa-fw"></em>{" "}
                Fundraising (Donation)
              </a>
            </li> */}
            <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 ${
                  activeTab === "facilities" ? "active" : ""
                } bg-gray text-white`}
                href="#facilities"
                aria-controls="facilities"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "facilities"}
                onClick={() => handleTabChange("facilities")}
              >
                <em className="fas fa-concierge-bell fa-fw"></em> Facilities
                {/* :{" "}{FacilityList?.length || 0} */}
              </a>
            </li>
            {/* <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className="nav-link bb0 bg-gray text-white"
                href="#compliances"
                aria-controls="compliances"
                role="tab"
                data-toggle="tab"
                aria-selected="false"
              >
                <em className="fas fa-balance-scale fa-fw"></em> Compliances
              </a>
            </li> */}
            <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 ${
                  activeTab === "directories" ? "active" : ""
                } bg-gray text-white`}
                href="#directories"
                aria-controls="directories"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "directories"}
                onClick={() => handleTabChange("directories")}
              >
                <em className="fas fa-address-book fa-fw"></em> Directories
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 ${
                  activeTab === "socialprojects" ? "active" : ""
                } bg-gray text-white`}
                href="#socialprojects"
                aria-controls="socialprojects"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "socialprojects"}
                onClick={() => handleTabChange("socialprojects")}
              >
                <em className="fas fa-hands-helping fa-fw"></em> Social Projects
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 ${
                  activeTab === "newspost" ? "active" : ""
                } bg-gray text-white`}
                href="#newspost"
                aria-controls="newspost"
                role="tab"
                aria-selected={activeTab === "newspost"}
                onClick={() => handleTabChange("newspost")}
              >
                <em className="far fa-newspaper fa-fw"></em>  Post
              </a>
            </li>
          </ul>
          <div className=" p-3">
            <div
              className="tab-content"
              style={{ borderWidth: "0 0 0 0", padding: "0" }}
            >
              {/* About Us Tab */}
              <div
                style={{ textAlign: "center" }}
                className={`tab-pane fade ${
                  activeTab === "aboutus" ? "show active" : ""
                }`}
                id="aboutus"
                role="tabpanel"
              >
                <div className="card card-body">
                  <div className="align-items-center">
                    <div
                      style={{ flex: 1, fontSize: "18px" }}
                      dangerouslySetInnerHTML={{
                        __html:
                          hubDetails?.description ||
                          "<i>No description available</i>",
                      }}
                    />
                    <button
                      className="btn btn-primary ml-3"
                      onClick={handleOpenEditDescriptionModal}
                    >
                      <i className="fa fa-edit"></i> Edit Description
                    </button>
                  </div>
                </div>
              </div>

              {/* management team Tab */}
              <div
                className={`tab-pane fade ${
                  activeTab === "management" ? "show active" : ""
                }`}
                id="management"
                role="tabpanel"
              >
                {activeTab === "management" && (
                  <Management
                    // sansthaDetails={sansthaDetails}
                    teamsList={teamsList}
                    hubDetails={hubDetails}
                  />
                )}
              </div>

              {/* Sponsors Tab */}
              <div
                className={`tab-pane fade ${
                  activeTab === "sponsors" ? "show active" : ""
                }`}
                id="sponsors"
                role="tabpanel"
              >
                {activeTab === "sponsors" && (
                  <Sponsor
                    hubDetails={hubDetails}
                    sponsor={sponsor}
                    sponsorList={sponsorList}
                    users={users}
                    hideSansthaField={true}
                    isHubPage={true}
                    sponsorpage={sponsorpage}
                    setSponsorPage={setSponsorPage}
                  />
                )}
              </div>

              {/* Users Tab */}
              <div
                className={`tab-pane fade ${
                  activeTab === "users" ? "show active" : ""
                }`}
                id="users"
                role="tabpanel"
              >
                {activeTab === "users" && (
                  <Users
                    hubDetails={hubDetails}
                    users={users}
                    setUserPage={setUserPage}
                    userpage={userpage}
                  />
                )}
              </div>

              {/* Sanstha Tab */}
              <div
                className={`tab-pane fade ${
                  activeTab === "sanstha" ? "show active" : ""
                }`}
                id="sanstha"
                role="tabpanel"
              >
                {activeTab === "sanstha" && (
                  <Sanstha
                    sansthaList={sansthaList}
                    hubDetails={hubDetails}
                    sanstha={sanstha}
                    sansthaPage={sansthaPage}
                    setSansthaPage={setSansthaPage}
                  />
                )}
              </div>

              {/* Events Tab */}
              <div
                className={`tab-pane fade ${
                  activeTab === "events" ? "show active" : ""
                }`}
                id="events"
                role="tabpanel"
              >
               {activeTab === "events" && (
                  <Event
                    hubDetails={hubDetails}
                    event={event}
                    setEventPage={setEventPage}
                    eventpage={eventpage}
                    hideSansthaField={true}
                  />
                )}
              </div>

              {/* Donation Tab */}
              {/* <div
                className={`tab-pane fade ${
                  activeTab === "donation" ? "show active" : ""
                }`}
                id="donation"
                role="tabpanel"
              >
                <div className="card card-body text-center">
                  <h3>Coming Soon</h3>
                </div>
              </div> */}

              {/* News Post Tab */}
              <div
                className={`tab-pane fade ${
                  activeTab === "newspost" ? "show active" : ""
                }`}
                id="newspost"
                role="tabpanel"
              >
                   {activeTab === "newspost" && (
                  <Post
                    post={post}
                    postPage={postPage}
                    setPostPage={setPostPage}
                    hubDetails={hubDetails}
                    hideSansthaField={true}
                  />
                )}
              </div>

              {/*  Social Projects Tab */}
              <div
                className={`tab-pane fade ${
                  activeTab === "socialprojects" ? "show active" : ""
                }`}
                id="socialprojects"
                role="tabpanel"
              >
                  {activeTab === "socialprojects" && (
                  <SocialProjectTab
                    hubDetails={hubDetails}
                    socialproject={socialproject}
                    projectcategory={projectcategory}
                    projectPage={projectPage}
                    setProjectPage={setProjectPage}
                    hideSansthaField={true}
                  />
                )}
              </div>

              {/*  Directories  Tab */}
              <div
                className={`tab-pane fade ${
                  activeTab === "directories" ? "show active" : ""
                }`}
                id="directories"
                role="tabpanel"
              >
              <DirectoriesTabs  hubDetails={hubDetails} />
              </div>

              {/*  Facilities Tab */}
              <div
                className={`tab-pane fade ${
                  activeTab === "facilities" ? "show active" : ""
                }`}
                id="facilities"
                role="tabpanel"
              >
                <Facility FacilityList={FacilityList} editable={false} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditDescriptionModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            marginTop: "35px",
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Description</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowEditDescriptionModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <Editor
                  editorClassName="form-control"
                  editorState={editorValues}
                  onEditorStateChange={onEditorStateChange}
                  editorStyle={{ height: 300 }}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEditDescriptionModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveDescription}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default HubDetails;
