// import React, { useEffect } from 'react';
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { useDispatch, useSelector } from "react-redux";
// import { appHubLogin, appHubLoginOtp } from "../../store/auth";
// import { Link, useNavigate } from "react-router-dom";
// import moment from "moment";
// import { useContext, useRef, useState } from "react";
// import { SocketContext } from "../../context/socket";
// import PageLoader from "../../components/PageLoader/PageLoader";
// function Login() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const currentTime = new Date();
//   // const socket = useContext(SocketContext);
//   const isloder = useSelector((state) => state?.auth.isloder);
//   const [otpSent, setOtpSent] = useState(false);
//   const [timer, setTimer] = useState(30);
//   const [otpValues, setOtpValues] = useState(Array(6).fill(""));
//   const inputsRef = useRef([]);
//   const sentotpdata = useSelector((state) => state?.auth?.Hub);
    // console.log(sentotpdata);
  //  console.log(otpValues )

  // useEffect(() => {
  //   socket.close();
  //   socket.disconnect();
  // }, []);

//  useEffect(() => {
//     console.log(otpValues);
// }, [otpValues]);

// useEffect(() => {
//     console.log(otpSent);
// }, [otpSent]);

// useEffect(() => {
//     console.log(sentotpdata);
// }, [sentotpdata]);

  // const formik = useFormik({
  //   initialValues: {
  //     mobile: "",
  //     otp: "",
  //   },
  //   validationSchema: Yup.object({
  //     mobile: Yup.string()
  //       .min(10, "Must be 10 characters")
  //       .max(10, "Must be exactly 10 digits")
  //       .required("Required"),
  //     otp: otpSent
  //       ? Yup.string()
  //           .required("OTP is required")
  //           .matches(/^\d{6}$/, "OTP must be exactly 6 digits")
  //       : Yup.string().notRequired(),
  //   }),
  //   onSubmit: (values) => {
      // if (otpSent) {
      //   dispatch(
      //     appHubLoginOtp({
      //       mobile: values.mobile,
      //       otp: Number(values.otp),
      //       navigate: navigate,
      //     })
      //     // .then(() => {
      //     // navigate("/dashboard")
      //     // })
      //   );
      // } else {
      //   dispatch(
      //     appHubLogin({
      //       mobile: values.mobile,
      //       navigate: navigate,
      //     })
      //   );
      //   setOtpSent(true);
      // }
//     },
//   });

//   const handlehubLoginOtp = () => {
//     dispatch(
//       appHubLoginOtp({
//         mobile: formik.values.mobile,
//         otp: Number(formik.values.otp),
//         navigate: navigate,
//       })
//     );
//   };

//   const handleSendOtp = () => {
//     if (!formik.values.mobile || formik.errors.mobile) {
//       formik.setTouched({ mobile: true });
//       return;
//     }
//     dispatch(
//       appHubLogin({
//         mobile: formik.values.mobile,
//         navigate,
//         // type: "send-otp",
//       })
//     );
//     setOtpSent(true);
//   };

//   const handleChangeotp = (e, index) => {
//     const value = e.target.value;
//     if (!/^[0-9]?$/.test(value)) return;
//     const updatedOtp = [...otpValues];
//     updatedOtp[index] = value;
//     setOtpValues(updatedOtp);
//     formik.setFieldValue("otp", updatedOtp.join(""));
//     if (value && index < 5) {
//       inputsRef.current[index + 1].focus();
//     }
//   };  

//   const handleResendOtp = () => {
//     setTimer(30);
//     setOtpValues(Array(6).fill(""));
//     inputsRef.current.forEach((input) => {
//       if (input) input.value = "";
//     });
//     handleSendOtp();
//   };

//   useEffect(() => {
//     let countdown;
//     if (otpSent && timer > 0) {
//       countdown = setInterval(() => {
//         setTimer((prev) => prev - 1);
//       }, 1000);
//     }
//     return () => clearInterval(countdown);
//   }, []);
//   // otpSent, timer
//   useEffect(() => {
//     if (!otpSent || timer <= 0) return;

//     const countdown = setInterval(() => {
//         setTimer((prev) => prev - 1);
//     }, 1000);

//     return () => clearInterval(countdown);
// }, [otpSent, timer]);


// useEffect(() => {
//   if (otpSent && sentotpdata?.otp && String(sentotpdata.otp).length === 6) {
//     const autoOtp = String(sentotpdata.otp).padStart(6, "0").split("");
//     // console.log(autoOtp)
//     setOtpValues(autoOtp);
//     formik.setFieldValue("otp", autoOtp.join(""));

//     const firstEmpty = autoOtp.findIndex((v) => !v);
//     if (firstEmpty !== -1 && inputsRef.current[firstEmpty]) {
//       inputsRef.current[firstEmpty].focus();
//     }
//   }
// }, [sentotpdata?.otp, otpSent]);
//   // sentotpdata?.otp, otpSent

//   return (
//     <>
//       {isloder && <PageLoader />}
//       <div className="wrapper">
//         <div className="block-center mt-4 wd-xl">
//           <div className="card card-flat">
//             <div className="card-header text-center">
//               <Link to="#">
//                 <img
//                   className="block-center rounded"
//                   src="/img/logo3.png"
//                   alt="App Logo"
//                   style={{ width: "100px", height: "80px" }}
//                 />
//               </Link>
//             </div>
//             <div className="card-body ">
//               <p className="text-center py-2">SIGN IN TO CONTINUE.</p>
//               {/* <p className="text-center">Hub Admin</p> */}

//               <form className="mb-3" onSubmit={formik.handleSubmit}>
//                 {otpSent ? (
//                   <>
//                     <div
//                       id="otp"
//                       className="d-flex form-otp text-center pb-3 gap-2"
//                     >
//                       {[...Array(6)].map((_, index) => (
//                         <input
//                           key={index}
//                           ref={(el) => (inputsRef.current[index] = el)}
//                           className="text-center form-control gap-2"
//                           type="text"
//                           maxLength="1"
//                           value={otpValues[index]}
//                           onChange={(e) => handleChangeotp(e, index)}
//                           //  onKeyDown={(e) => handleKeyDown(e, index)}
//                           style={{
//                             width: "40px",
//                             height: "40px",
//                             fontSize: "20px",
//                             marginLeft: "8px", 
//                             padding: "5px",
//                           }}
//                         />
//                       ))}
//                     </div>
//                     {formik.touched.otp && formik.errors.otp && (
//                       <div style={{ color: "red" }}>{formik.errors.otp}</div>
//                     )}
//                     <button type="submit" onClick={handlehubLoginOtp} className="btn btn-primary btn-block">
//                       Verify OTP & Login
//                     </button>
//                     {timer > 0 ? (
//                       <p className="text-center mt-2">
//                         Resend OTP in {timer} seconds
//                       </p>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={handleResendOtp}
//                         className="btn btn-link btn-block"
//                       >
//                         Resend OTP
//                       </button>
//                     )}
//                   </>
//                 ) : (
//                   <div className="form-group">
//                     <div className="input-group with-focus">
//                       <input
//                         name="mobile"
//                         placeholder="+91 Enter Mobile Number"
//                         onChange={formik.handleChange}
//                         onBlur={formik.handleBlur}
//                         value={formik.values.mobile}
//                         className="form-control"
//                       />
//                       <div className="input-group-append">
//                         <span className="input-group-text text-mute bg-transparent border-left-0">
//                           <em className="fa fa-phone"></em>
//                         </span>
//                       </div>
//                     </div>
//                     {formik.touched.mobile && formik.errors.mobile && (
//                       <div style={{ color: "red" }}>{formik.errors.mobile}</div>
//                     )}
//                   </div>
//                 )}
//                 {!otpSent && (
//                   <button
//                     type="button"
//                     onClick={handleSendOtp}
//                     className="btn btn-primary btn-block"
//                   >
//                     Send OTP
//                   </button>
//                 )}
//               </form>
//             </div>
//           </div>
//           <div className="p-3 text-center">
//             <span className="mr-2">&copy;</span>
//             <span className="mr-2">{moment(currentTime).format("YYYY")}</span>
//             <span className="mr-2">-</span>
//             <span>
//               <a target={"_blank"}>apnamandal.com</a>
//             </span>
//             <br />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default Login;


import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { appLoginUser } from "../../store/auth";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { useContext,useEffect } from "react";
import { SocketContext } from "../../context/socket";
import PageLoader from "../../components/PageLoader/PageLoader";
function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentTime = new Date();
  const socket = useContext(SocketContext);
  const isloder = useSelector((state) => state?.auth.isloder);

  useEffect(() => {
    socket.close();
    socket.disconnect();
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(3, "Must be 3 characters or more")
        .required("Required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Required"),
    }),
    onSubmit: (values) => {
      dispatch(
        appLoginUser({
          email: values.email,
          password: values.password,
          navigate: navigate,
          // role: "admin",
        })
      );
    },
  });

  return (
    <>
    {isloder && <PageLoader />}

    <div className="wrapper">
      <div className="block-center mt-4 wd-xl">
        <div className="card card-flat">
          <div className="card-header text-center">
            <Link to="#">
              <img
                className="block-center rounded"
                src="/img/logo3.png"
            alt="App Logo"
                style={{ width: "100px", height: "80px" }}
              />
            </Link>
          </div>
          <div className="card-body ">
            <p className="text-center py-2">SIGN IN TO CONTINUE.</p>
            <form
              className="mb-3"
              id="loginForm"
              onSubmit={formik.handleSubmit}
            >
              <div className="form-group">
                <div className="input-group with-focus">
                  <input
                    className="form-control border-right-0"
                    id="exampleInputEmail1"
                    name="email"
                    type="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    placeholder="Enter email"
                  />
                  <div className="input-group-append">
                    <span className="input-group-text text-muted bg-transparent border-left-0">
                      <em className="fa fa-envelope"></em>
                    </span>
                  </div>
                </div>
                <div>
                  {formik.touched.email && formik.errors.email ? (
                    <div style={{ color: "red" }}>{formik.errors.email}</div>
                  ) : null}
                </div>
              </div>

              <div className="form-group">
                <div className="input-group with-focus">
                  <input
                    className="form-control border-right-0"
                    id="exampleInputPassword1"
                    name="password"
                    type="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    placeholder="Password"
                  />
                  <div className="input-group-append">
                    <span className="input-group-text text-muted bg-transparent border-left-0">
                      <em className="fa fa-lock"></em>
                    </span>
                  </div>
                </div>
                <div>
                  {formik.touched.password && formik.errors.password ? (
                    <div style={{ color: "red" }}>{formik.errors.password}</div>
                  ) : null}
                </div>
              </div>
              <div className="clearfix">
                <div className="checkbox c-checkbox float-left mt-0">
                 
                </div>
               
              </div>
              <button className="btn btn-block btn-primary mt-3" type="submit">
                Login
              </button>
            </form>
           
          </div>
        </div>
        <div className="p-3 text-center">
          <span className="mr-2">&copy;</span>
          <span className="mr-2">{moment(currentTime).format("YYYY")}</span>
          <span className="mr-2">-</span>
          <span>
            <a target={"_blank"}>
              apnamandal.com
            </a>
          </span>
          <br />
        </div>
      </div>
    </div>
    </>
  );
}

export default Login;

