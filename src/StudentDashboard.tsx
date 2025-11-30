import React, { useEffect, useState } from "react";

interface Props {
  username: string;
}

const StudentDashboard: React.FC<Props> = ({ username }) => {
  const [data, setData] = useState<{
    classes: string[];
    homework: string[];
  } | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/student_data/${username}`)
      .then((res) => res.json())
      .then((d) => setData(d));
  }, [username]);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>Student Dashboard</h2>
      <p>Welcome, {username}!</p>
      <h3>Your Classes:</h3>
      <ul>
        {data.classes.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
      <h3>Homework:</h3>
      <ul>
        {data.homework.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>
    </div>
  );
};

export default StudentDashboard;
