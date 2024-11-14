import { createBrowserRouter, RouterProvider } from "react-router-dom"
import CreateAccount from "./routes/create-account"
import Login from "./routes/login"
import Home from "./routes/home"
import { useEffect, useState } from "react"
import LoadingScreen from "./components/loading-screen"
import { auth } from "./firebase"
import styled from "styled-components"
import Layout from "./components/layout"
import ProtectRoute from "./components/protected-route"
import Editor from "./editor"

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`;

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectRoute>
        <Wrapper>
          <Layout />
        </Wrapper>
      </ProtectRoute> 
    ),
  },
  {
    path: "",
    element: (
        <Home />
    ),
  },
  {
    path: "/create-account",
    element: (
      <Wrapper>
        <CreateAccount />
      </Wrapper>
    ),
  },
  {
    path: "/login",
    element: (
      <Wrapper>
        <Login />
      </Wrapper>
    ),
  },
  {
    path: "/editor",
    element: <Editor />,
  },
]);

function App() {
  const [isLoading, setLoading] = useState(true);
  const init = async () => {
    await auth.authStateReady();
    setLoading(false);
  };
  useEffect(() => {
    init();
  }, []);

  return (
    <>
      {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
    </>
  );
}

export default App
