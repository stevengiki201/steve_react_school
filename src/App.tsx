import React, { useState } from "react";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";

interface User {
  username: string;
  role: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>School App</h1>
      {!user ? (
        <>
          <RegisterForm />
          <LoginForm setUser={setUser} />
        </>
      ) : user.role === "teacher" ? (
        <TeacherDashboard username={user.username} />
      ) : (
        <StudentDashboard username={user.username} />
      )}
    </div>
  );
};

export default App;
