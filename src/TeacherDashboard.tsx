import React, { useState } from "react";

interface Props {
  username: string;
}

const TeacherDashboard: React.FC<Props> = ({ username }) => {
  const [studentUsername, setStudentUsername] = useState("");
  const [className, setClassName] = useState("");
  const [message, setMessage] = useState("");

  const handleAddStudent = async () => {
    const res = await fetch("http://localhost:5000/add_student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacher_username: username,
        student_username: studentUsername,
        class_name: className,
      }),
    });
    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div>
      <h2>Teacher Dashboard</h2>
      <p>Welcome, {username}! You can add students to classes.</p>
      <input
        placeholder="Student Username"
        onChange={(e) => setStudentUsername(e.target.value)}
      />
      <input
        placeholder="Class Name"
        onChange={(e) => setClassName(e.target.value)}
      />
      <button onClick={handleAddStudent}>Add Student</button>
      <p>{message}</p>
    </div>
  );
};

export default TeacherDashboard;
