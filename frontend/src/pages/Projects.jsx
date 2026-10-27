function Projects() {
  return (
    <div className="container">
      <div className="auth-card">
        <h1>Projects</h1>

        <p>
          This page is lazy loaded using React.lazy().
        </p>

        <p>
          The Projects component is downloaded only
          when this route is visited.
        </p>
      </div>
    </div>
  );
}

export default Projects;