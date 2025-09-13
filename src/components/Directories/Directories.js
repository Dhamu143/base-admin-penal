// // DirectoriesTabs.jsx
// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { appGetAllDirectories } from "../../store/directories/directories";

// const DirectoriesTabs = ({ hubDetails, sansthaDetails }) => {
//   const dispatch = useDispatch();
//   const [activeTab, setActiveTab] = useState("matrimonial");

//   const { directories, loading } = useSelector((state) => state.directoriesReducer);
//   console.log(directories)
//   useEffect(() => {
//     let params = { page: 1, limit: 1000,  };

//     // Add hubId or sansthaId if available
//     if (hubDetails) params.hubId = hubDetails?._id;
//     if (sansthaDetails) params.sansthaId = sansthaDetails?._id;

//     // Add tab-specific params
//     if (activeTab === "matrimonial") {
//       params.matrimonialEnabled = true;
//     } else if (activeTab === "business") {
//       params.businessDataEnabled = true;
//     } else if (activeTab === "job") {
//       params.jobDataEnabled = true;
//     }

//     dispatch(appGetAllDirectories(params));
//   }, [dispatch, activeTab, hubDetails, sansthaDetails]);

//   return (
//     <div className="container mt-4">
//       <ul className="nav nav-tabs w-100">
//         <li className="nav-item flex-fill text-center">
//           <button
//             className={`nav-link w-100 ${activeTab === "matrimonial" ? "active" : ""}`}
//             onClick={() => setActiveTab("matrimonial")}
//           >
//             Matrimonial
//           </button>
//         </li>
//         <li className="nav-item flex-fill text-center">
//           <button
//             className={`nav-link w-100 ${activeTab === "business" ? "active" : ""}`}
//             onClick={() => setActiveTab("business")}
//           >
//             Business
//           </button>
//         </li>
//         <li className="nav-item flex-fill text-center">
//           <button
//             className={`nav-link w-100 ${activeTab === "job" ? "active" : ""}`}
//             onClick={() => setActiveTab("job")}
//           >
//             Job
//           </button>
//         </li>
//       </ul>

//       {/* <div className="mt-3">
//         {loading ? (
//           <p>Loading...</p>
//         ) : (
//           directories?.data.map((item) => (
//             <div key={item._id} className="card mb-3 shadow-sm">
//               <div className="card-body">
//                 <h5 className="card-title">{item.name || item.company || item.title}</h5>
//                 <p className="card-text">
//                   {activeTab === "matrimonial" && `Age: ${item.age}, City: ${item.city}`}
//                   {activeTab === "business" && `Sector: ${item.sector}, City: ${item.city}`}
//                   {activeTab === "job" && `${item.company} – ${item.location}`}
//                 </p>
//               </div>
//             </div>
//           ))
//         )}
//       </div> */}
//     </div>
//   );
// };

// export default DirectoriesTabs;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import { appGetAllDirectories } from "../../store/directories/directories";

const DirectoriesTabs = ({hubDetails,sansthaDetails }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("matrimonial");
  const [selectedItem, setSelectedItem] = useState(null);
  console.log(selectedItem)
  const { directories } = useSelector((state) => state.directoriesReducer);
  console.log(directories);

  useEffect(() => {
    let params = {};
    if (activeTab === "matrimonial") params = { matrimonialEnabled: true };
    if (activeTab === "business") params = { businessDataEnabled: true };
    if (activeTab === "job") params = { jobDataEnabled: true };

    // dispatch(appGetAllDirectories({ page: 1, limit: 1000, params }));
  }, [activeTab, dispatch]);

  useEffect(() => {
    let params = { page: 1, limit: 1000,  };

    if (hubDetails) params.hubId = hubDetails?._id;
    if (sansthaDetails) params.sansthaId = sansthaDetails?._id;

    if (activeTab === "matrimonial") {
      params.matrimonialEnabled = true;
    } else if (activeTab === "business") {
      params.businessDataEnabled = true;
    } else if (activeTab === "job") {
      params.jobDataEnabled = true;
    }

    dispatch(appGetAllDirectories(params));
  }, [dispatch, activeTab, hubDetails, sansthaDetails]);

  const maskMobile = (mobile) => {
    if (!mobile) return "";
    if (mobile.length < 4) return mobile;
    return mobile.slice(0, 2) + "******" + mobile.slice(-2);
  };

  return (
    <div>
      <ul className="nav nav-tabs w-100">
        <li className="nav-item flex-fill text-center">
          <button
            className={`nav-link w-100 ${
              activeTab === "matrimonial" ? "active" : ""
            }`}
            onClick={() => setActiveTab("matrimonial")}
          >
            Matrimonial
          </button>
        </li>
        <li className="nav-item flex-fill text-center">
          <button
            className={`nav-link w-100 ${
              activeTab === "business" ? "active" : ""
            }`}
            onClick={() => setActiveTab("business")}
          >
            Business
          </button>
        </li>
        <li className="nav-item flex-fill text-center">
          <button
            className={`nav-link w-100 ${activeTab === "job" ? "active" : ""}`}
            onClick={() => setActiveTab("job")}
          >
            Job
          </button>
        </li>
      </ul>

      <div className="row mt-3">
        {directories?.data?.map((item) => (
          <div key={item._id} className="col-md-4 mb-3">
            <div
              className="card text-center shadow-sm cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <img
                src={item?.profilePic || item?.businessLogo || "/img/user.jpg"}
                alt={item?.firstName}
                className="card-img-top rounded-circle mx-auto mt-3"
                style={{ width: "80px", height: "80px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h6 className="card-title">
                  {item?.firstName} {item?.lastName}
                </h6>
                <p className="text-muted mb-0">{maskMobile(item?.mobile)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

 <Modal
        show={!!selectedItem}
        onHide={() => setSelectedItem(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedItem?.firstName} {selectedItem?.lastName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Common User Info */}
          <h5 className="mb-3 text-success fw-bold">User Info</h5>
          <div className="d-flex align-items-center mb-3">
            <img
              src={selectedItem?.profilePic || selectedItem?.businessLogo || "/img/user.jpg"}
              alt="Profile"
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                marginRight: 15,
              }}
            />
            <div>
              <h6 className="mb-0">
                {selectedItem?.firstName} {selectedItem?.lastName}
              </h6>
              <p className="mb-0 text-muted">
                {maskMobile(selectedItem?.mobile)}
              </p>
            </div>
          </div>

          <hr />

          {/* Tab-specific Info */}
          {activeTab === "matrimonial" && (
            <>
              <h5 className="mb-3 text-success fw-bold">Matrimonial Info</h5>
               <p>
            <strong>Education :</strong> {selectedItem?.education || "------"}
          </p>
          <p>
            <strong>Profession :</strong> {selectedItem?.profession || "------"}
          </p>
          <p>
            <strong>Date of Birth :</strong> {selectedItem?.dob || "------"}
          </p>
          <p>
            <strong>Age :</strong>{" "}
            {selectedItem?.age ? `${selectedItem?.age} Years` : "------"}
          </p>
          <p>
            <strong>Height :</strong> {selectedItem?.height || "------"}
          </p>
          <p>
            <strong>Goutra :</strong> {selectedItem?.goutra || "------"}
          </p>
          <p>
            <strong>Income Band :</strong>{" "}
            {selectedItem?.incomeBand || "------"}
          </p>
          <p>
            <strong>Native Address :</strong>{" "}
            {`${selectedItem?.nativePlaceAddress ||
              ""}, ${selectedItem?.nativeArea ||
              ""}, ${selectedItem?.nativeBlock ||
              ""}, ${selectedItem?.nativeDistrict ||
              ""}, ${selectedItem?.nativeState ||
              ""}, ${selectedItem?.nativePlacePincode || ""}`}
          </p>
            </>
          )}

          {activeTab === "business" && (
            <>
              <h5 className="mb-3 text-success fw-bold">Business Info</h5>
              <p><strong>Firm Name :</strong> {selectedItem?.businessFirmName || "------"}</p>
              <p><strong>Industry Type :</strong> {selectedItem?.businessIndustry || "------"}</p>
              <p><strong>Services :</strong> {selectedItem?.businessServices || "------"}</p>
              <p><strong>Address :</strong>    {`${selectedItem?.businessNativePlaceAddress ||
              ""}, ${selectedItem?.businessNativeArea ||
              ""}, ${selectedItem?.businessNativeBlock ||
              ""}, ${selectedItem?.businessNativeDistrict ||
              ""}, ${selectedItem?.businessNativeState ||
              ""}, ${selectedItem?.businessNativePlacePincode || ""}`}</p>
              <p><strong>Category :</strong> {selectedItem?.businessCategory || "------"}</p>
              <p><strong>Contact Number :</strong> {selectedItem?.businessContactNo || "------"}</p>
              <p><strong>Webisite/UP :</strong> {selectedItem?.businessUPIWebsite || "------"}</p>
            </>
          )}

          {activeTab === "job" && (
            <>
              <h5 className="mb-3 text-success fw-bold">Job Info</h5>
              <p><strong>Role :</strong> {selectedItem?.jobRole || "------"}</p>
              <p><strong>Education :</strong> {selectedItem?.education || "------"}</p>
              <p><strong>Skill :</strong> {selectedItem?.jobSkill || "------"}</p>
              <p><strong>Experience :</strong> {selectedItem?.jobExperience || "------"}</p>
              <p><strong>Salary Band :</strong> {selectedItem?.jobSalaryBand || "------"}</p>
              <p><strong>Preferred Location :</strong> {selectedItem?.jobPreferredLocation || "------"}</p>
            </>
          )}

          {/* Close Button */}
          <div className="text-center mt-4">
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                borderRadius: "50%",
                width: 50,
                height: 50,
                fontSize: 22,
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* <Modal
        show={!!selectedItem}
        onHide={() => setSelectedItem(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedItem?.firstName} {selectedItem?.lastName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 className="mb-3 text-success fw-bold">User Info</h5>
          <div className="d-flex align-items-center mb-3">
            <img
              src={selectedItem?.profilePic}
              alt="Profile"
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                marginRight: 15,
              }}
            />
            <div>
              <h6 className="mb-0">
                {selectedItem?.firstName} {selectedItem?.lastName}
              </h6>
              <p className="mb-0 text-muted">
                {maskMobile(selectedItem?.mobile)}
              </p>
            </div>
          </div>

          <hr />

          <h5 className="mb-3 text-success fw-bold">Matrimonial Info</h5>
          <p>
            <strong>Education :</strong> {selectedItem?.education || "------"}
          </p>
          <p>
            <strong>Profession :</strong> {selectedItem?.profession || "------"}
          </p>
          <p>
            <strong>Date of Birth :</strong> {selectedItem?.dob || "------"}
          </p>
          <p>
            <strong>Age :</strong>{" "}
            {selectedItem?.age ? `${selectedItem?.age} Years` : "------"}
          </p>
          <p>
            <strong>Height :</strong> {selectedItem?.height || "------"}
          </p>
          <p>
            <strong>Goutra :</strong> {selectedItem?.goutra || "------"}
          </p>
          <p>
            <strong>Income Band :</strong>{" "}
            {selectedItem?.incomeBand || "------"}
          </p>
          <p>
            <strong>Native Address :</strong>{" "}
            {`${selectedItem?.nativePlaceAddress ||
              ""}, ${selectedItem?.nativeArea ||
              ""}, ${selectedItem?.nativeBlock ||
              ""}, ${selectedItem?.nativeDistrict ||
              ""}, ${selectedItem?.nativeState ||
              ""}, ${selectedItem?.nativePlacePincode || ""}`}
          </p>

          <div className="text-center mt-4">
            <button
            //   variant="danger"
            //   onClick={handleClose}
              style={{
                borderRadius: "50%",
                width: 50,
                height: 50,
                fontSize: 22,
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
        </Modal.Body>
      </Modal> */}
    </div>
  );
};

export default DirectoriesTabs;
