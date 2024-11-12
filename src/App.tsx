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

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectRoute>
        <Layout />
      </ProtectRoute>
    ),
    children: [
      {
        path: "",
        element: <Home />,
      },
    ],
  },
  {
    path: "/create-account",
    element: <CreateAccount />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/editor",
    element: <Editor />,
  },
]);

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`;

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
      <Wrapper>
        {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
      </Wrapper>
    </>
  );
}

export default App
