import { useEffect, useState } from "react";
import Paginate from "../pagination/paginate";
import { useNavigate, useParams } from "react-router-dom";
import { appGetHubById } from "../../store/hubs";
import { appGetAllUser, appUploadUser } from "../../store/user";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import swal from "sweetalert";

function Users({ hubDetails , sansthaDetails, users, userpage, setUserPage}) {
  //  console.log("sansthaDetails", sansthaDetails)
  // const params = useParams();
  // const { id } = useParams();
  // console.log(id, "id");
  const dispatch= useDispatch();
  const navigate= useNavigate();
  // const [userpage, setUserPage] = useState(params.userpage || 1);
  // const users = useSelector((state) => state?.usersReducer.users);
  const userspaginate = useSelector((state) => state.usersReducer.paginate);
  const userLabel = sansthaDetails && sansthaDetails._id ? "Member" : "User";

  //   useEffect(() => {
  //   if (hubDetails && hubDetails._id) {
  //      dispatch(appGetAllUser({ page: userpage, limit: 10, hub: hubDetails._id }));
  //   } else if (sansthaDetails && sansthaDetails._id) {
  //     dispatch(appGetAllUser({ page: userpage, limit: 10, sansthaId: sansthaDetails._id }));
  //   }
  // }, [dispatch, userpage, hubDetails, sansthaDetails]);

  const handleDownloadExcel = () => {
    // Create a sample data structure for the Excel file
    const sampleData = [
      {
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
      },
    ];

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "users_template.xlsx");
  };

  const handleExcelImport = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    console.log(file);
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log("Excel Data:", data);
        const requiredFields = ["firstName", "lastName", "email", "mobile"];
        const isValidData = data.every((row) =>
          requiredFields.every((field) => row[field] !== undefined)
        );

        if (!isValidData) {
          console.log(
            "Invalid Data Structure. Required fields:",
            requiredFields
          );
          swal(
            "Error",
            "Excel file must contain firstName,lastName, email, and mobile columns",
            "error"
          );
          return;
        }

        // dispatch(
        //   appUploadUser({
        //     hub: id,
        //     file,
        //   })
        // )
        // .then(() => {
        //     if (hubDetails && hubDetails._id) {
        //       dispatch(appGetAllUser({ page: 1, limit: 10, hub: hubDetails._id }));
        //       dispatch(appGetHubById(hubDetails._id));
        //     } else if (sansthaDetails && sansthaDetails._id) {
        //       dispatch(appGetAllUser({ page: 1, limit: 10, sansthaId: sansthaDetails._id }));
        //     }
        //   })
        //   .catch((error) => {
        //     console.error("Upload failed:", error);
        //     swal("Error", "Failed to upload users data", "error");
        //   });
        if (hubDetails && hubDetails._id) {
          dispatch(
            appUploadUser({
              hub: hubDetails._id,
              file,
            })
          )
            .then(() => {
              dispatch(appGetAllUser({ page: 1, limit: 10, hub: hubDetails._id }));
              dispatch(appGetHubById(hubDetails._id));
            })
            .catch((error) => {
              console.error("Upload failed:", error);
              swal("Error", "Failed to upload users data", "error");
            });
        } else if (sansthaDetails && sansthaDetails._id) {
          dispatch(
            appUploadUser({
              hub: sansthaDetails?.hub,
              sansthaId: sansthaDetails._id,
              file,
            })
          )
            .then(() => {
              dispatch(appGetAllUser({ page: 1, limit: 10, sansthaId: sansthaDetails._id }));
            })
            .catch((error) => {
              console.error("Upload failed:", error);
              swal("Error", "Failed to upload users data", "error");
            });
        }        
      } catch (error) {
        console.error("Error processing Excel file:", error);
        swal("Error", "Failed to process Excel file", "error");
      }
    };

    reader.onerror = () => {
      console.error("Error reading file");
      swal("Error", "Failed to read Excel file", "error");
    };

    if (file) {
      console.log("Selected file:", file.name);
      reader.readAsBinaryString(file);
    }
  };
  return (
    <div>
      <div className="mb-3 mr-2 d-flex justify-content-between align-items-center">
        {/* <h4 className="ml-2 text-black">
        Total Users: {(hubDetails?.users?.length || sansthaDetails?.users?.length || 0)}
        </h4> */}
        <h4 className="ml-2 text-black">
            Total {userLabel}s: {(hubDetails?.users?.length || sansthaDetails?.users?.length || 0)}
      </h4>
        <div className="dt-buttons btn-group">
          <button
            className="btn btn-default buttons-excel buttons-html5 btn-info mr-2"
            onClick={handleDownloadExcel}
            style={{ minWidth: "150px", height: "38px" }}
          >
            <span>Download {userLabel} Template</span>
          </button>
          <label
            className="btn btn-default buttons-excel buttons-html5 btn-info"
            style={{
              minWidth: "150px",
              height: "38px",
              display: "inline-block",
            }}
          >
            <span>Upload {userLabel}</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              onChange={handleExcelImport}
            />
          </label>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="">
            <tr>
              <th>Sr. No.</th>
              <th>{userLabel}</th>
              {/* <th>LastName</th> */}
              <th>Mobile</th>
              <th>Native Address</th>
              <th>Present Address</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={index}
                  onClick={(e) => {
                    if (
                      !e.target.closest(".dropdown-menu") &&
                      !e.target.closest(".btn-link")
                    ) {
                      navigate(`/user/details/${user?._id}`);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                    <td>{index + 1 + (userpage - 1) * 10}</td>
                  <td>
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        // src="/img/images.png"
                        alt="user"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      <img
                        src="/img/user.jpg"
                        alt="user"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                    <br />
                    {user.firstName} {user.lastName}
                  </td>
                  {/* <td>{user.lastName}</td> */}
                  <td>{user.mobile}</td>
                  <td>
                    {user?.nativePlaceAddress && user?.nativeArea && (
                          <>
                          {user?.nativePlaceAddress},{" "}
                          {user?.nativeArea}
                          </>
                    )}
                      
                        <br />
                        {user?.nativeBlock && user?.nativeDistrict && user?.nativeState && user?.nativePlacePincode && (
                          <>
                          <span>  {user?.nativeBlock},{" "}
                            {user?.nativeDistrict}{" "},
                            {user?.nativeState} {user?.nativePlacePincode}</span>
                            </>
                        )}
                            <br/>
                      </td>
                      <td>
                      {user?.presentAddress && user?.presentnativeArea && (
                          <>
                          {user?.presentAddress},{" "}
                          {user?.presentnativeArea}
                          </>
                    )}
                        <br />
                        {user?.presentBlock && user?.presentDistrict && user?.presentState && user?.presentPincode && (
                          <>
                          <span>{user?.presentBlock},{" "}
                            {user?.presentDistrict}{" "},
                            {user?.presentState} {user?.presentPincode}</span>
                            </>
                        )}
                      </td>
                  <td>
                    {new Date(user?.joinedHubDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/user/details/${user?._id}`);
                      }}
                      className="btn btn-sm btn-primary mr-2"
                      title="Details"
                    >
                      <em className="fa fa-eye fa-fw"></em>
                    </button>
                    {/* <button
                                className="btn btn-sm btn-primary mr-2"
                                title="Edit"
                              >
                                <i className="far fa-edit"></i>
                              </button> */}
                    {/* <button
                                className="btn btn-sm btn-danger"
                                title="Delete"
                                // onClick={() => handleDeleteUser(user?._id)}
                              >
                                <i className="far fa-trash-alt"></i>
                              </button> */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No {userLabel}s data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {userspaginate && (
        <Paginate
          paginate={userspaginate}
          page={userpage}
          setPage={setUserPage}
        />
      )}
    </div>
  );
}
export default Users;
