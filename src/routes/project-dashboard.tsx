import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/home-style.css"
import { server_ip } from "../main";

export default function ProjectDashboard() {
  let [data, setData] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const location = useLocation();
  const category = location.pathname.startsWith('/') ? location.pathname.slice(1) : location.pathname;

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
  const goNotice = (id: string) => {
    navigate("/" + category + "/editor/" + id);
  };
  const goViewer = (id: string) => {
    navigate("/" + category + "/viewer/" + id);
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
  const loadAllDataFromBackend = async (category: string) => {
    try {
      const response = await fetch(`${server_ip}/api/load_all_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });
      data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error sending data to server:', error);
    }
  };

  const deleteDataFromBackend = async (id: string, category: string) => {
    const ok = confirm("Are you sure?");
    if (ok) {
      try {
        const response = await fetch(`${server_ip}/api/delete_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, category }),
        });
        data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error sending data to server:', error);
      }
      loadAllDataFromBackend(category);
    }
  }

  useEffect(() => {
    loadAllDataFromBackend(category);
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
          <h1 className="page-title">Project Dashboard</h1>
          <span className="name">{name} 님,<br />안녕하세요.</span>
          <button onClick={() => goNotice("")} className="new-page">
            New Page
          </button>
          <button onClick={onLogOut} className="log-out">
            Log Out
          </button>
        </div>
        <div className="pages-head">
          <div className="page-component-head">
            <span>제목</span>
            <span>생성일시</span>
            <span>수정일시</span>
            <span>작성자</span>
            <span>삭제</span>
          </div>
        </div>
        <div className="pages">
          {data.length > 0 ? (
            data.map((item) => (
              <div key={item._id} className="page-component">
                <a onClick={() => goViewer(item._id)}>
                  {item.title}
                </a>
                <span>{item.created_at ? item.created_at : "-"}</span>
                <span>{item.modified_at ? item.modified_at : "-"}</span>
                <span>{item.name}</span>
                {name === item.name ? (
                  <span onClick={() => deleteDataFromBackend(item._id, category)}>
                    Delete
                  </span>
                ) : (
                  <span className="none-mark">-</span>
                )}
              </div>
            ))
          ) : (
            <p>None</p>
          )}
        </div>
      </div>
    </>
  );
}