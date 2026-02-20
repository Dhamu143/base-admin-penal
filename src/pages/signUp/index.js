import moment from "moment";
import { Link } from "react-router-dom";

function SignUp() {
  const currentTime = new Date();
  return (
    <>
      <div className="wrapper">
        <div className="block-center mt-4 wd-xl">
          <div className="card card-flat">
            <div className="card-header text-center">
              <div className="card-header text-center">
                <Link to="#">
                  <img
                    className="block-center rounded"
                    src="/img/fish in flash.png"
                    alt="App Logo"
                    style={{ width: "100px", height: "45px" }}
                  />
                </Link>
              </div>
            </div>
            <div className="card-body">
              <p className="text-center py-2">SIGNUP TO GET INSTANT ACCESS.</p>
              <form className="mb-3" id="registerForm">
                <div className="form-group">
                  <label className="text-muted" htmlFor="signupInputEmail1">
                    First Name
                  </label>
                  <div className="input-group with-focus">
                    <input
                      className="form-control border-right-0"
                      id="signupInputEmail1"
                      type="text"
                      placeholder="Enter name"
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="text-muted" htmlFor="signupInputEmail1">
                    Email address
                  </label>
                  <div className="input-group with-focus">
                    <input
                      className="form-control border-right-0"
                      id="signupInputEmail1"
                      type="email"
                      placeholder="Enter email"
                      autoComplete="off"
                      required
                    />
                    <div className="input-group-append">
                      <span className="input-group-text text-muted bg-transparent border-left-0">
                        <em className="fa fa-envelope"></em>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="text-muted" htmlFor="signupInputPassword1">
                    Password
                  </label>
                  <div className="input-group with-focus">
                    <input
                      className="form-control border-right-0"
                      id="signupInputPassword1"
                      type="password"
                      placeholder="Password"
                      autoComplete="off"
                      required
                    />
                    <div className="input-group-append">
                      <span className="input-group-text text-muted bg-transparent border-left-0">
                        <em className="fa fa-lock"></em>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label
                    className="text-muted"
                    htmlFor="signupInputRePassword1"
                  >
                    Retype Password
                  </label>
                  <div className="input-group with-focus">
                    <input
                      className="form-control border-right-0"
                      id="signupInputRePassword1"
                      type="password"
                      placeholder="Retype Password"
                      autoComplete="off"
                      required
                      data-parsley-equalto="#signupInputPassword1"
                    />
                    <div className="input-group-append">
                      <span className="input-group-text text-muted bg-transparent border-left-0">
                        <em className="fa fa-lock"></em>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="checkbox c-checkbox mt-0">
                  <label>
                    <input type="checkbox" value="" required name="agreed" />
                    <span className="fa fa-check"></span> I agree with the
                    {/* <a className="ml-1" href="#">
                      terms
                    </a> */}
                  </label>
                </div>
                <button
                  className="btn btn-block btn-primary mt-3"
                  type="submit"
                >
                  Create account
                </button>
              </form>
              <p className="pt-3 text-center">Have an account?</p>
              <a className="btn btn-block btn-secondary" href="login.html">
                Signup
              </a>
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

export default SignUp;
