import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuestionForm from './pages/QuestionForm';
import UserInfo from './pages/UserInfo';
import FeedbackPage from './pages/Feedback';

const App: React.FC = () => {

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<UserInfo/>} />
          <Route path="/questions/:profile" element={<QuestionForm />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;


// Score answers based on their complexity, identifying whether the candidate has provided solutions that are nuanced and suitable for a production-level environment, taking scalability, security, and resilience into account.




// NEW

// 11:21
// use of appropriate terminology instead of excessive jargons