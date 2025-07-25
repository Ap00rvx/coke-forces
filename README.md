# Coke Forces

## Important Links 
- [Website Link](https://coke-forces.vercel.app)
- [Walkthrough Video](https://drive.google.com/file/d/13OF8mkt4F23X8T9qDIlaHAllAdlvTYim/view?usp=sharing)

--- 
A full-stack web application for managing and visualizing Codeforces student data, built with React, Express, and MongoDB.

--- 
## 🖼️ Preview

<p align="center">
  <table>
    <tr>
      <td>
        <img src="client/public/preview/home.png" alt="Home Light" width="380"/>
      </td>
      <td>
        <img src="client/public/preview/homedark.png" alt="Home Dark" width="380"/>
      </td>
    </tr>
    <tr>
      <td>
        <img src="client/public/preview/profile.png" alt="Profile Page" width="380"/>
      </td>
      <td>
        <img src="client/public/preview/heatmap.png" alt="Heatmap" width="380"/>
      </td>
    </tr>
  </table>
</p>
---


## 🚀 Features

- **Student Table View:**  
  - List all enrolled students with Name, Email, Phone Number, Codeforces Handle, Current Rating, and Max Rating.
  - Add, edit, and delete students with modal forms and validation.
  - Download the entire dataset as CSV.
  - View more details for each student, including their Codeforces progress.
  - See when each student's data was last updated.

- **Student Profile View:**  
  - **Contest History:**  
    - Filter by last 30, 90, or 365 days.
    - Interactive rating graph.
    - List of contests with rating changes, ranks, and number of unsolved problems.
  - **Problem Solving Data:**  
    - Filter by last 7, 30, or 90 days.
    - See the most difficult problem solved (by rating).
    - Total problems solved, average rating, and average problems per day.
    - Bar chart of problems solved per rating bucket.
    - Submission heat map for visualizing activity.

- **Codeforces Data Sync:**  
  - Automatically fetch and store updated Codeforces data once a day (e.g., at 2 AM) using a cron job.
  - Avoid real-time API calls during user interaction hours.
  - Option to change the cron job's run time or frequency.
  - If a user's CF handle is updated, fetch their data in real time.
  - All profile data is stored for fast access.

- **Inactivity Detection:**  
  - After each sync, identify students who haven’t made any submissions in the last 7 days.
  - Automatically send reminder emails to inactive students.
  - Track and display how many reminder emails have been sent to each user.
  - Option to disable automatic emails for individual students.

- **UI/UX:**  
  - Mobile and tablet responsive design.
  - Light and dark mode with a toggle option.
  - Modern, clean interface using Tailwind CSS and Material UI Charts.
  - Well-documented and maintainable codebase.

---

## 📦 API Routes

### Student Management

| Method | Route                        | Description                                 |
|--------|-----------------------------|---------------------------------------------|
| POST   | `/api/student`               | Create a new student                        |
| GET    | `/api/student`               | Get all students (with pagination/filter)   |
| GET    | `/api/students/csv`          | Download all students as CSV                |
| GET    | `/api/student/:handle`       | Get detailed profile for a student handle   |
| PUT    | `/api/student/:handle`       | Update student details by handle            |
| DELETE | `/api/student/:handle`       | Delete a student by handle                  |

### Utilities

| Method | Route                                         | Description                        |
|--------|-----------------------------------------------|------------------------------------|
| POST   | `/api/student/send-reminder/:cfHandle`        | Send reminder email to a student   |
| POST   | `/api/student/sync`                           | Sync all students' Codeforces data |

---

## 🧑‍💻 Frontend Pages & Components

### `/` (Home Page)
- **Student Table:** Paginated, sortable, and filterable.
- **Add/Edit/Delete Student:** Modal forms with validation.
- **View Profile:** Button to open detailed profile page.

### `/profile/:handle` (Profile Page)
- **Student Info:** Name, email, phone, handle, organization, etc.
- **Rating Graph:** Contest rating over time (responsive, interactive).
- **Submission Heatmap:** Calendar-style heatmap of submissions.
- **Problem Rating Chart:** Bar chart of solved problems by rating.
- **Metrics:** Problems solved, submissions, hardest problem, etc.

### Components
- `Navbar`: Navigation bar with theme toggle and export button.
- `ThemeToggle`: Light/dark mode switch.
- `AddStudentModal`, `UpdateStudentModal`, `ConfirmDeleteModal`: Modal dialogs for CRUD.
- `QuestionRatingChart`, `ContestRatingGraph`, `SubmissionHeatmap`: Data visualizations.

---

## 🛠️ Technologies Used

- **Frontend:** React, TypeScript, Tailwind CSS, MUI X Charts, Chart.js
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Other:** Axios, React Router, CSV Export, Codeforces API integration

---

## ⚙️ Setup & Usage

1. **Clone the repository**
   ```sh
   git clone https://github.com/your-username/coke-forces.git
   cd coke-forces
   ```

2. **Install dependencies**
   - For client:
     ```sh
     cd client
     npm install
     ```
   - For server:
     ```sh
     cd ../server
     npm install
     ```

3. **Configure environment variables**
   - Set up your MongoDB URI and any email credentials in `.env` files.

4. **Run the app**
   - Start the backend:
     ```sh
     npm run dev
     ```
   - Start the frontend:
     ```sh
     cd ../client
     npm start
     ```

5. **Visit**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📑 Important Notes

- **Theme:** Uses `data-theme` attribute for dark/light mode. All UI adapts accordingly.
- **Validation:** All forms have client-side validation for required fields and formats.
- **Charts:** All charts are responsive and adapt to theme.
- **API Security:** Make sure to secure your API endpoints for production use.
- **Syncing:** Use the sync endpoint to update Codeforces data for all students.

---

## 📝 Example API Usage

**Add a Student**
```http
POST /api/student
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "cfHandle": "john_cf"
}
```

**Get All Students**
```http
GET /api/student?page=1&limit=10
```

**Update Student**
```http
PUT /api/student/john_cf
{
  "email": "newemail@example.com"
}
```

**Delete Student**
```http
DELETE /api/student/john_cf
```

---

## 📬 Contact

For questions, suggestions, or contributions, please open an issue or pull request