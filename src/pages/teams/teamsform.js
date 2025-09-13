import moment from "moment";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { appAllGetTeams, appUpdateTeamspermission } from "../../store/teams";
import { useDispatch, useSelector } from "react-redux";

function TeamsForm() {
  const currentTime = new Date();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const teamsList = useSelector((state) => state.teamsReducer.teams);
console.log(teamsList)

  useEffect(() => {
    if (userId) {
      console.log("User ID:", userId);
      dispatch(appAllGetTeams({ userId: userId }))
    }
  }, [userId]);

  useEffect(() => {
    if (teamsList) {
      const teamData = teamsList; 
      console.log(teamData)
      formik.setValues({
        firstName: teamData.firstName || "",
        lastName: teamData.lastName || "",
        email: teamData.email || "",
        mobile: teamData.mobile || "",
        password: "",
        confirmPassword: ""
      });

      // Set permissions
      const initialPermissions = {};
      teamData.permissions?.forEach(perm => {
        initialPermissions[perm._id] = true;
      });
      setPermissions(initialPermissions);
    }
  }, [teamsList]);

  const [permissions, setPermissions] = useState({
    view: false,
    edit: false,
    delete: false,
    create: false
  });

  // const handlePermissionChange = (permission) => {
  //   const newPermissions = {
  //     ...permissions,
  //     [permission]: !permissions[permission]
  //   };
  //   setPermissions(newPermissions);
  //   if (Object.values(newPermissions).some(value => value)) {
  //     setPermissionError("");
  //   }
  // };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: ""
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string().email("Invalid email address").required("Email is required"),
      mobile: Yup.string().required("Mobile number is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm password is required")
    }),
    onSubmit: async(values) => {
      // Check if at least one permission is selected
      if (!Object.values(permissions).some(value => value)) {
        setPermissionError("Please select at least one permission");
        return;
      }

      // Get selected permissions
      // const selectedPermissions = Object.entries(permissions)
      //   .filter(([_, isSelected]) => isSelected)
      //   .map(([key]) => key);
      
      const formData = {
        ...values,
        teamId: userId,
        // permissions: selectedPermissions
      };
      try {
        const result = await dispatch(appUpdateTeamspermission(formData)).unwrap();
        formik.resetForm();
        setTimeout(() => {
          setShowSuccessPopup(true);
        }, 2000);
      } catch (error) {
        console.error('Error updating team permissions:', error);
      }
    }
  });

  return (
    <>
      {showSuccessPopup && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Success!</h5>
                <button type="button" className="close" onClick={() => setShowSuccessPopup(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p className="text-center">Team member has been successfully granted access!</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/");
                  }}
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="wrapper">
        <div className="block-center mt-4 wd-xl">
          <div className="card card-flat">
            <div className="card-header text-center">
              <div className="card-header text-center">
                <Link to="#">
                  <img
                    className="block-center rounded"
                    src="/img/logo2.png"
                    alt="App Logo"
                    style={{ width: "100px", height: "45px" }}
                  />
                </Link>
              </div>
            </div>
            <div className="card-body">
              <p className="text-center py-2">TEAM MEMBER REGISTRATION</p>
              <form className="mb-3" onSubmit={formik.handleSubmit}>
                <div className="form-group">
                  <label className="text-muted" htmlFor="firstName">
                    First Name
                  </label>
                  <div className="input-group with-focus">
                    <input
                      className="form-control border-right-0"
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Enter first name"
                      autoComplete="off"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.firstName}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text text-muted bg-transparent border-left-0">
                        <em className="fa fa-user"></em>
                      </span>
                    </div>
                  </div>
                  {formik.touched.firstName && formik.errors.firstName && (
                    <div className="text-danger">{formik.errors.firstName}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="text-muted" htmlFor="lastName">
                    Last Name
                  </label>
                  <div className="input-group with-focus">
                    <input
                      className="form-control border-right-0"
                      id="lastName" 
                      name="lastName"
                      type="text"
                      placeholder="Enter last name"
                      autoComplete="off"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.lastName}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text text-muted bg-transparent border-left-0">
                        <em className="fa fa-user"></em>
                      </span>
                    </div>
                  </div>
                  {formik.touched.lastName && formik.errors.lastName && (
                    <div className="text-danger">{formik.errors.lastName}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="text-muted" htmlFor="email">
                    Email address
                  </label>
                  <div className="input-group with-focus">
                    <input
                      className="form-control border-right-0"
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email"
                      autoComplete="off"
                      onChange={formik.handleChange}
                      onBlur={(e) => {
                        formik.handleBlur(e);
                        setShowEmailPopup(false);
                      }}
                      onFocus={() => setShowEmailPopup(true)}
                      value={formik.values.email}
                      disabled
                    />
                    <div className="input-group-append">
                      <span className="input-group-text text-muted bg-transparent border-left-0">
                        <em className="fa fa-envelope"></em>
                      </span>
                    </div>
                  </div>
                  {showEmailPopup && (
                    <div className="alert alert-info mt-2">
                      Please enter a valid email address (e.g., user@example.com)
                    </div>
                  )}
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-danger">{formik.errors.email}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="text-muted" htmlFor="mobile">
                    Mobile Number
                  </label>
                  <div className="input-group with-focus">
                    <input
                      className="form-control border-right-0"
                      id="mobile"
                      name="mobile"
                      type="tel"
                      placeholder="Enter mobile number"
                      autoComplete="off"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.mobile}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text text-muted bg-transparent border-left-0">
                        <em className="fa fa-phone"></em>
                      </span>
                    </div>
                  </div>
                  {formik.touched.mobile && formik.errors.mobile && (
                    <div className="text-danger">{formik.errors.mobile}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="text-muted">
                    Password
                  </label>
                  <div className="input-group with-focus">
                    <input
                      className="form-control border-right-0"
                      name="password"
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text text-muted bg-transparent border-left-0">
                        <em className="fa fa-lock"></em>
                      </span>
                    </div>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <div className="text-danger">{formik.errors.password}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="text-muted">
                    Retype Password
                  </label>
                  <div className="input-group with-focus">
                    <input
                      className="form-control border-right-0"
                      name="confirmPassword"
                      type="password"
                      placeholder="Retype Password"
                      autoComplete="new-password"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.confirmPassword}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text text-muted bg-transparent border-left-0">
                        <em className="fa fa-lock"></em>
                      </span>
                    </div>
                  </div>
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <div className="text-danger">{formik.errors.confirmPassword}</div>
                  )}
                </div>

                <button
                  className="btn btn-block btn-primary mt-3"
                  type="submit"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
          <div className="p-3 text-center">
            <span className="mr-2" style={{ marginLeft: "0.5rem !important" }}>
              &copy;
            </span>
            <span>{moment(currentTime).format("YYYY")}</span>
            <span className="mr-2">-</span>
            <span>apnamandal.com</span>
            <br />
          </div>
        </div>
      </div>
    </>
  );
}

export default TeamsForm;

