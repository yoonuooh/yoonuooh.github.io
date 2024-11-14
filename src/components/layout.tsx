import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { styled } from "styled-components";
import { useEffect, useState } from "react";

const Wrapper = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr 4fr;
  height: 100px;
  padding: 50px 0px;
  width: 100%;
  max-width: 60px;
`;

const Menu = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
`;

const MenuItem = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  height: 50px;
  width: 50px;
  border-radius: 50%;
  svg {
    width: 30px;
    fill: white;
  }
  &.log-out {
    border-color: tomato;
    svg {
      fill: tomato;
    }
  }
`;

export default function Layout() {
  //export const server_ip = "http://yoonuooh.duckdns.org";
  const server_ip = "http://192.168.219.103";
  const server_port = "5000";

  const navigate = useNavigate();
  let [data, setData] = useState<any[]>([]);

  const onLogOut = async () => {
    const ok = confirm("Are you sure?");
    if (ok) {
      await auth.signOut();
      navigate("/login");
    }
  };
  const goEditor = () => {
    navigate("/editor");
  }
  const goEditorSpecific = (title: string) => {
    navigate("/editor/" + title);
  }

  const loadAllDataFromBackend = async () => {
    try {
      const response = await fetch(`${server_ip}:${server_port}/api/load_all_data`, {
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

  useEffect(() => {
    loadAllDataFromBackend();
  }, [])

  return (
    <>
      <Outlet />
      <Wrapper>
        <Menu>
          <MenuItem onClick={onLogOut} className="log-out">
            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path clipRule="evenodd" fillRule="evenodd" d="M17 4.25A2.25 2.25 0 0 0 14.75 2h-5.5A2.25 2.25 0 0 0 7 4.25v2a.75.75 0 0 0 1.5 0v-2a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-2a.75.75 0 0 0-1.5 0v2A2.25 2.25 0 0 0 9.25 18h5.5A2.25 2.25 0 0 0 17 15.75V4.25Z" />
              <path clipRule="evenodd" fillRule="evenodd" d="M1 10a.75.75 0 0 1 .75-.75h9.546l-1.048-.943a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 1 1-1.004-1.114l1.048-.943H1.75A.75.75 0 0 1 1 10Z" />
            </svg>
          </MenuItem>
          <MenuItem>
            <button onClick={goEditor}>
              Go to Editor
            </button>
          </MenuItem>
        </Menu>
        <div>
          {data.length > 0 ? (
            data.map((item, index) => (
              <div key={index}>
                <button onClick={() => goEditorSpecific(item.title)}>
                  {item.title + "\n" + item.created_at}
                </button>
              </div>
            ))
          ) : (
            <p>None</p>
          )}
        </div>
      </Wrapper>
    </>
  );
}