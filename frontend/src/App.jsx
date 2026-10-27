import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

import {
  lazy,
  Suspense
} from "react";

import Home from "./pages/Home";

// Lazy loaded components
const Projects = lazy(
  () => import("./pages/Projects")
);

const Contact = lazy(
  () => import("./pages/Contact")
);

function App() {
  return (
    <BrowserRouter>

      {/* Navigation */}
      <nav
        style={{
          padding: "20px",
          textAlign: "center",
          background: "#f5f5f5",
          marginBottom: "20px"
        }}
      >

        <Link
          to="/"
          style={{
            marginRight: "20px"
          }}
        >
          Home
        </Link>

        <Link
          to="/projects"
          style={{
            marginRight: "20px"
          }}
        >
          Projects
        </Link>

        <Link to="/contact">
          Contact
        </Link>

      </nav>

      {/* Suspense handles lazy loading */}
      <Suspense
        fallback={
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              fontSize: "20px"
            }}
          >
            Loading page...
          </div>
        }
      >

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

        </Routes>

      </Suspense>

    </BrowserRouter>
  );
}

export default App;