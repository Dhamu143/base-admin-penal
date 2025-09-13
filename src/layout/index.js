import Header from "./header";
import Sidebar from "./sidebar";

function Layout(props) {
  return (
    <div className="wrapper">
      <Header />

      <Sidebar />
      <section className="section-container">{props.children}</section>

      {/* <Footer /> */}
    </div>
  );
}

export default Layout;
