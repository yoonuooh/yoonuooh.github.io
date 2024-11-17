import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";

export default function Layout() {
  const server_ip = "https://port-0-notice-backend-m3lin2251ce3a47e.sel4.cloudtype.app";
  //const server_ip = "http://192.168.219.103:5000";

  const navigate = useNavigate();
  let [data, setData] = useState<any[]>([]);

  const onLogOut = async () => {
    const ok = confirm("Are you sure?");
    if (ok) {
      await auth.signOut();
      navigate("/login");
    }
  };
  const goNotice = (id: string) => {
    navigate("/editor/" + id);
  }

  const loadAllDataFromBackend = async () => {
    try {
      const response = await fetch(`${server_ip}/api/load_all_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: "",
      });
      data = await response.json();
      setData(data);
      console.log(data);
    } catch (error) {
      console.error('Error sending data to server:', error);
    }
  };

  const deleteDataFromBackend = async (id: string) => {
    try {
      const response = await fetch(`${server_ip}/api/delete_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      data = await response.json();
      setData(data);
      console.log(data);
    } catch (error) {
      console.error('Error sending data to server:', error);
    }
    loadAllDataFromBackend();
  }

  useEffect(() => {
    loadAllDataFromBackend();
  }, [])

  return (
    <>
      <div className="top-menu">
        <h1 className="temp-title">Home</h1>
        <p>Name</p>
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
          <span>수정일시</span>
          <span>생성일시</span>
          <span>삭제</span>
        </div>
      </div>
      <div className="pages">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="page-component">
              <a onClick={() => goNotice(item._id)}>
                {item.title}
              </a>
              <span>{item.created_at}</span>
              <span>{item.modified_at}</span>
              <span onClick={() => deleteDataFromBackend(item._id)}>
                {"Delete"}
              </span>
            </div>
          ))
        ) : (
          <p>None</p>
        )}
      </div>
      <Outlet />
    </>
  );
}