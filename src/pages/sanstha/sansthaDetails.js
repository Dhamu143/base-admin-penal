import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  appDeletesansthaMembership,
  appGetAllSanstha,
  appGetSansthaById,
  appPendingMembership,
  appPendingMembershipList,
  appUpdateSanstha,
  setEmptySanstha,
} from "../../store/sanstha";
import { appGetAllUser } from "../../store/user";
import { appGetAllSponsor } from "../../store/sponsor";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import { appGetAllFacility } from "../../store/facilities";
import { appAllGetCompliance } from "../../store/compliances/index";
import Facility from "../../components/Facility/FacilityTab";
import Compliance from "../../components/Compliance/ComplianceTab";
import Users from "../../components/Users/UsersTab";
import Sponsor from "../../components/Sponsor/SponsorTab";
import MembershipPaymentdetailsTab from "../../components/Membershippaymentdetails/MembershipPaymentdetailsTab";
import Management from "../../components/Management/ManagementTab";
import MembershipTab from "../../components/Membership/membershipTab";
import DonationTab from "../../components/Donation/donationTab";
import { appAllGetTeams } from "../../store/teams";
import { appGetAllPost } from "../../store/post";
import Post from "../../components/Post/PostTab";
import { appGetAllProject } from "../../store/socialproject";
import { appGetAllProjectCategory } from "../../store/projectcategory";
import SocialProjectTab from "../../components/SocialProjects/SocialProjectTab";
import { appGetAllEvent } from "../../store/event";
import Event from "../../components/Event/EventTab";
import { appGetHubById } from "../../store/hubs";
import DirectoriesTabs from "../../components/Directories/Directories";

function SansthaDetails() {
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  const params = useParams();
  const { id } = useParams();
  const isdeleted = useSelector((state) => state?.sansthaReducer?.isdeleted);
  // const sponsorpaginate = useSelector((state) => state.sponsorReducer.paginate);
  // const paginate = useSelector((state) => state.sansthaReducer.paginate);
  const sansthaDetails = useSelector(
    (state) => state.sansthaReducer.sansthaDetails
  );
  // console.log(sansthaDetails, "sansthaDetails");

  const users = useSelector((state) => state?.usersReducer.users);
  // const userspaginate = useSelector((state) => state.usersReducer.paginate);
  // const sansthaList = useSelector((state) => state.sansthaReducer.sansthaList);
  // console.log(sansthaList, "sansthaList")
  const sponsorList = useSelector((state) => state?.sponsorReducer.sponsorList);
  const sponsor = useSelector((state) => state?.sponsorReducer.sponsor);
  const event = useSelector((state) => state?.eventReducer.event);
  // console.log(sponsor);
  const compliancesList = useSelector(
    (state) => state?.complianceReducer.compliancesList
  );
  const pendingMembershipList = useSelector(
    (state) => state.sansthaReducer.pendingMembershipList
  );

  const [page, setPage] = useState(params.page || 1);
  const [userpage, setUserPage] = useState(params.userpage || 1);
  const [sponsorpage, setSponsorPage] = useState(params.sponsorpage || 1);
  const [eventpage, setEventPage] = useState(params.eventpage || 1);
  const [projectPage, setProjectPage] = useState(params.projectPage || 1);
  const hubDetails = useSelector((state) => state.hubReducer.hubDetails);
  //console.log(hubDetails);
  const post = useSelector((state) => state.postReducer.post);
  const [postPage, setPostPage] = useState(params.postPage || 1);
  const FacilityList = useSelector((state) => state.facilityReducer.facility);
  const teamsList = useSelector((state) => state.teamsReducer.teams);
  const [editorValues, setValues] = useState(EditorState.createEmpty());
  const socialproject = useSelector(
    (state) => state.socialprojectReducer.socialproject
  );
  const projectcategory = useSelector(
    (state) => state?.projectcategoryReducer?.projectcategory
  );
  // const [facilityEditorState, setFacilityEditorState] = useState(
  //   EditorState.createEmpty()
  // );
  const [showEditDescriptionModal, setShowEditDescriptionModal] = useState(
    false
  );
  const [editDescription, setEditDescription] = useState(
    sansthaDetails?.description || ""
  );

  useEffect(() => {
    setEditDescription(sansthaDetails?.description || "");
  }, [sansthaDetails]);

  // useEffect(() => {
  //   dispatch(appGetAllFacility({ sanstha: id }));
  //   dispatch(appAllGetCompliance());
  //   dispatch(
  //     appGetAllSponsor({ page: 1, limit: 1000, sanstha: id, isDropdown: true })
  //   );
  //   dispatch(appGetAllUser({ page: page, limit: 10, sansthaId: id }));
  //   dispatch(appGetSansthaById(id));
  //      return () => {
  //     dispatch(setEmptySanstha())
  //   }
  // }, [dispatch, page, id]);

  // useEffect(() => {
  //   if (sansthaDetails && sansthaDetails.hub) {
  //     dispatch(appGetHubById(sansthaDetails.hub));
  //   }
  // }, [dispatch, sansthaDetails]);

  useEffect(() => {
    if (isdeleted) {
      dispatch(appGetAllSanstha(page));
    }
  }, [isdeleted, dispatch, page]);

  const onEditorStateChange = (editorState) => {
    setEditDescription(
      draftToHtml(convertToRaw(editorState.getCurrentContent()))
    );
    setValues(editorState);
  };
  const handleSaveDescription = () => {
    const htmlDescription = draftToHtml(
      convertToRaw(editorValues.getCurrentContent())
    );
    dispatch(
      appUpdateSanstha({
        id: sansthaDetails._id,
        name: sansthaDetails?.name,
        image: sansthaDetails?.image,
        hub: sansthaDetails?.hub,
        description: htmlDescription,
      })
    ).then(() => {
      setShowEditDescriptionModal(false);
      dispatch(appGetSansthaById(sansthaDetails._id));
    });
  };

  const handleOpenEditDescriptionModal = () => {
    let editorState = EditorState.createEmpty();
    if (sansthaDetails?.description) {
      const blocksFromHtml = htmlToDraft(sansthaDetails.description);
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

  // State to track loaded tabs
  const [loadedTabs, setLoadedTabs] = useState({
    aboutus: false,
    membershippaymentdetails: false,
    management: false,
    sponsors: false,
    users: false,
    membership: false,
    events: false,
    donation: false,
    facilities: false,
    compliances: false,
    directories: false,
    socialprojects: false,
    newspost: false,
  });

  const [activeTab, setActiveTab] = useState("aboutus");
  useEffect(() => {
    if (activeTab === "socialprojects") {
      dispatch(appGetAllProject({ page: projectPage, limit: 10, sanstha: id }));
      dispatch(appGetAllProjectCategory({ page: 1, limit: 1000 }));
    }
  }, [projectPage, activeTab]);

  useEffect(() => {
    if (activeTab === "events") {
      dispatch(appGetAllEvent({ page: eventpage, limit: 10, sanstha: id }));
    }
  }, [eventpage, activeTab]);

  useEffect(() => {
    if (activeTab === "users") {
      dispatch(
        appGetAllUser({
          page: userpage,
          limit: 10,
          sansthaId: id,
        })
      );
    }
  }, [userpage, activeTab]);
  useEffect(() => {
    if (activeTab === "sponsors") {
      dispatch(
        appGetAllSponsor({
          page: sponsorpage,
          limit: 10,
          sanstha: id,
        })
      );
      dispatch(
        appGetAllSponsor({
          page: 1,
          limit: 1000,
          sanstha: id,
          isDropdown: true,
        })
      );
      dispatch(appGetAllUser({ page: 1, limit: 1000, sansthaId: id }));
    }
  }, [sponsorpage, activeTab]);
  // ... other state and selectors remain the same ...

  // Tab change handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    if (loadedTabs[tabId]) return;

    // Load data based on the active tab
    switch (tabId) {
      case "aboutus":
        if (!loadedTabs.aboutus) {
          console.log("hi1");
          dispatch(appGetSansthaById(id));
          setLoadedTabs((prev) => ({ ...prev, aboutus: true }));
          return () => {
            dispatch(setEmptySanstha());
          };
        }
        break;

      case "membershippaymentdetails":
        if (!loadedTabs.membershippaymentdetails) {
          console.log("hi2");
          dispatch(appGetSansthaById(id));
          setLoadedTabs((prev) => ({
            ...prev,
            membershippaymentdetails: true,
          }));
        }
        break;

      case "management":
        if (tabId === "management" && !loadedTabs.management) {
          console.log("hi3");
          dispatch(appAllGetTeams({ sanstha: id, userType: "sanstha" }));
          setLoadedTabs((prev) => ({ ...prev, management: true }));
        }
        break;

      case "sponsors":
        if (tabId === "sponsors" && !loadedTabs.sponsors) {
          console.log("hi4");

          setLoadedTabs((prev) => ({ ...prev, sponsors: true }));
        }
        break;

      case "users":
        if (tabId === "users" && !loadedTabs.users) {
          console.log("hi5");
          setLoadedTabs((prev) => ({ ...prev, users: true }));
        }
        break;

      case "membership":
        if (tabId === "membership" && !loadedTabs.membership) {
          console.log("hi6");
          // Load data needed for this tab
          dispatch(appPendingMembershipList(id));
          setLoadedTabs((prev) => ({ ...prev, membership: true }));
        }
        break;

      case "facilities":
        if (!loadedTabs.facilities) {
          console.log("hi7");
          dispatch(appGetAllFacility({ sanstha: id }));
          setLoadedTabs((prev) => ({ ...prev, facilities: true }));
        }
        break;

      case "compliances":
        if (!loadedTabs.compliances) {
          console.log("hi8");
          dispatch(appAllGetCompliance());
          setLoadedTabs((prev) => ({ ...prev, compliances: true }));
        }
        break;
      case "donation":
        if (!loadedTabs.donation) {
          console.log("hi9");
          setLoadedTabs((prev) => ({ ...prev, donation: true }));
        }
        break;
      case "newspost":
        if (!loadedTabs.newspost) {
          dispatch(appGetAllPost({ page: 1, limit: 10, sanstha: id }));
          setLoadedTabs((prev) => ({ ...prev, newspost: true }));
        }
        break;
      case "socialprojects":
        if (!loadedTabs.socialprojects) {
          setLoadedTabs((prev) => ({ ...prev, socialprojects: true }));
        }
        break;

      case "events":
        if (tabId === "events" && !loadedTabs.newspost) {
          setLoadedTabs((prev) => ({ ...prev, newspost: true }));
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
    // Load basic data needed for all tabs

    if (sansthaDetails && sansthaDetails.hub) {
      dispatch(appGetHubById(sansthaDetails.hub));
    }

    // Mark aboutus as loaded since we're loading it initially
    setLoadedTabs((prev) => ({ ...prev, aboutus: true }));
    dispatch(appGetSansthaById(id));
    return () => {
      dispatch(setEmptySanstha());
    };
  }, [dispatch, id]);

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
                    src={sansthaDetails?.image}
                    alt="Image"
                  />
                  <h3 className="m-0">{sansthaDetails?.name}</h3>
                  <div className="mr-3 mt-2">
                    Sanstha Created Date :{" "}
                    {new Date(sansthaDetails?.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </div>
                  <p>{sansthaDetails?.caste?.significance}</p>
                </div>
              </div>
            ))
          ) : (
            <div
              className="carousel-item active"
              style={{
                backgroundImage: `url("/img/download.jpeg")`,
                backgroundSize: "cover",
                // backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                // height: "300px",
                height: "60vh",
                width: "100%",
                backgroundColor: "#f8f9fa",
              }}
            >
              <div
                style={{ color: "black" }}
                className="carousel-caption d-none d-md-block"
              >
                <img
                  className="img-thumbnail rounded-circle thumb128 mb-3"
                  src={sansthaDetails?.image}
                  alt="Image"
                />
                <h3 className="m-0">{sansthaDetails?.name}</h3>
                <div className="mr-3 mt-2">
                  Sanstha Created Date :{" "}
                  {new Date(sansthaDetails?.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </div>
                <p>{sansthaDetails?.caste?.significance}</p>
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
      <div className="mb-4">
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
                  activeTab === "membershippaymentdetails" ? "active" : ""
                } bg-gray text-white`}
                href="#membershippaymentdetails"
                aria-controls="membershippaymentdetails"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "membershippaymentdetails"}
                onClick={() => handleTabChange("membershippaymentdetails")}
              >
                <em className="far fa-file-alt fa-fw"></em> Membership type &
                Payment Details (UPI ID)
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
                  activeTab === "users" ? "active" : ""
                } bg-gray text-white`}
                href="#users"
                aria-controls="users"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "users"}
                onClick={() => handleTabChange("users")}
              >
                <em className="far fa-user fa-fw"></em> Members :{" "}
                {sansthaDetails?.users?.length || 0}
              </a>
            </li>

            {/* <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 ${
                  activeTab === "membership" ? "active" : ""
                } bg-gray text-white`}
                href="#membership"
                aria-controls="membership"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "membership"}
                onClick={() => handleTabChange("membership")}
              >
                <em className="fas fa-users fa-fw"></em> Members Waiting for
                Approval
              </a>
            </li> */}

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
            <li className="nav-item" role="presentation">
              <a
                style={{ padding: "12px 50px" }}
                className={`nav-link bb0 ${
                  activeTab === "compliances" ? "active" : ""
                } bg-gray text-white`}
                href="#compliances"
                aria-controls="compliances"
                role="tab"
                data-toggle="tab"
                aria-selected={activeTab === "compliances"}
                onClick={() => handleTabChange("compliances")}
              >
                <em className="fas fa-balance-scale fa-fw"></em> Compliances
                {/* :{" "} {compliancesList?.length || 0} */}
              </a>
            </li>
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
                <em className="far fa-newspaper fa-fw"></em> Post
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
                          sansthaDetails?.description ||
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

              {/* Membership & payment Details Tab */}
              <div
                className={`tab-pane fade ${
                  activeTab === "membershippaymentdetails" ? "show active" : ""
                }`}
                id="membershippaymentdetails"
                role="tabpanel"
              >
                {activeTab === "membershippaymentdetails" && (
                  <MembershipPaymentdetailsTab
                    hubDetails={hubDetails}
                    sansthaDetails={sansthaDetails}
                  />
                )}
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
                    sansthaDetails={sansthaDetails}
                    teamsList={teamsList}

                    // hubDetails={hubDetails}
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
                    sansthaDetails={sansthaDetails}
                    users={users}
                    hideSansthaField={false}
                    isHubPage={false}
                    sponsor={sponsor}
                    sponsorList={sponsorList}
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
                    sansthaDetails={sansthaDetails}
                    users={users}
                    userpage={userpage}
                    setUserPage={setUserPage}
                  />
                )}
              </div>

              {/* Membership Tab */}
              <div
                className={`tab-pane fade ${
                  activeTab === "membership" ? "show active" : ""
                }`}
                id="membership"
                role="tabpanel"
              >
                {activeTab === "membership" && (
                  <MembershipTab
                    sansthaDetails={sansthaDetails}
                    pendingMembershipList={pendingMembershipList}
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
                    sansthaDetails={sansthaDetails}
                    event={event}
                    setEventPage={setEventPage}
                    eventpage={eventpage}
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
                    sansthaDetails={sansthaDetails}
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
                    sansthaDetails={sansthaDetails}
                    socialproject={socialproject}
                    projectcategory={projectcategory}
                    projectPage={projectPage}
                    setProjectPage={setProjectPage}
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
                <DirectoriesTabs hubDetails={hubDetails}  sansthaDetails={sansthaDetails}/>
              </div>

              {/*  Compliances   Tab */}
              <div
                className={`tab-pane fade ${
                  activeTab === "compliances" ? "show active" : ""
                }`}
                id="compliances"
                role="tabpanel"
              >
                <Compliance
                  compliancesList={compliancesList}
                  sansthaDetails={sansthaDetails}
                />
              </div>

              {/*  Facilities Tab */}
              <div
                className={`tab-pane fade ${
                  activeTab === "facilities" ? "show active" : ""
                }`}
                id="facilities"
                role="tabpanel"
              >
                <Facility
                  sansthaDetails={sansthaDetails}
                  FacilityList={FacilityList}
                  editable={true}
                />
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
export default SansthaDetails;
