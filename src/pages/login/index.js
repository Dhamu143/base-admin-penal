import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { appLoginUser } from "../../store/auth";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import PageLoader from "../../components/PageLoader/PageLoader";
function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentTime = new Date();
  const isloder = useSelector((state) => state?.auth.isloder);

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

