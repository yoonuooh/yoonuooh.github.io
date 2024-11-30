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
import Viewer from "./viewer"
import Regulation from "./routes/regulation"
import Wiki from "./routes/wiki"
import Document from "./routes/document"
import ProjectDashboard from "./routes/project-dashboard"
import DesignAutomation from "./routes/design-automation"

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`;

const router = createBrowserRouter([
  {
    path: "/free-notice",
    element: (
      <ProtectRoute>
        <Layout />
      </ProtectRoute> 
    ),
  },
  {
    path: "/",
    element: (
      <ProtectRoute>
        <Home />
      </ProtectRoute>
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
    path: ":category/editor",
    element: (
      <ProtectRoute>
        <Editor />
      </ProtectRoute>
    ),
  },
  {
    path: ":category/editor/:urlId",
    element: (
      <ProtectRoute>
        <Editor />
      </ProtectRoute>
    ),
  },
  {
    path: ":category/viewer/:urlId",
    element: (
      <ProtectRoute>
        <Viewer />
      </ProtectRoute>
    ),
  },
  {
    path: "/regulation",
    element: (
      <ProtectRoute>
        <Regulation />
      </ProtectRoute>
    ),
  },
  {
    path: "/wiki",
    element: (
      <ProtectRoute>
        <Wiki />
      </ProtectRoute>
    ),
  },
  {
    path: "/document",
    element: (
      <ProtectRoute>
        <Document />
      </ProtectRoute>
    ),
  },
  {
    path: "/project-dashboard",
    element: (
      <ProtectRoute>
        <ProjectDashboard />
      </ProtectRoute>
    ),
  },
  {
    path: "/design-automation",
    element: (
      <ProtectRoute>
        <DesignAutomation />
      </ProtectRoute>
    ),
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
