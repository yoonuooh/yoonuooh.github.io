import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/home-style.css"

export default function Home() {
  const [name, setName] = useState("");
  const [isSidebarVisible, setSidebarVisible] = useState(true);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const onLogOut = async () => {
    const ok = confirm("Are you sure?");
    if (ok) {
      await auth.signOut();
      navigate("/login");
    }
  };

  const goHome = () => {
    navigate("/");
  };
  const goRegulation = () => {
    navigate("/regulation");
  };
  const goFreeNotice = () => {
    navigate("/free-notice");
  };
  const goWiki = () => {
    navigate("/wiki");
  };
  const goDocument = () => {
    navigate("/document");
  };
  const goProjectDashboard = () => {
    navigate("/project-dashboard");
  };
  const goDesignAutomation = () => {
    navigate("/design-automation");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.displayName) {
        setName(user.displayName);
      } else {
        setName("No user.");
      }
    });

    return () => unsubscribe();
  }, [])
  return (
    <>
      {isSidebarVisible ? (
        <div className="side-bar">
          <button onClick={goHome}>
            Home
          </button>
          <button onClick={goRegulation}>
            회사 규정
          </button>
          <button onClick={goFreeNotice}>
            자유게시판
          </button>
          <button onClick={goWiki}>
            KMS (Wiki)
          </button>
          <button onClick={goDocument}>
            Document
          </button>
          <button onClick={goProjectDashboard}>
            Project Dashboard
          </button>
          <button onClick={goDesignAutomation}>
            Design Automation
          </button>
        </div>
      ) : (
        ""
      )}
      <div className="main-content">
        <div className="top-menu">
          <button onClick={toggleSidebar} className="hamburger">
            <svg data-slot="icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" />
            </svg>
          </button>
          <h1 className="page-title">Home</h1>
          <span className="name">{name} 님,<br />안녕하세요.</span>
          <button onClick={onLogOut} className="log-out">
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}