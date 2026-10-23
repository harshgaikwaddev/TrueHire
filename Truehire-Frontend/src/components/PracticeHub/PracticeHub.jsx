/**
 * Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.
 *
 * PracticeHub.jsx
 * 
 * Main entry point for the Coding Practice section.
 * Controls view navigation between Question List and Question Workspace.
 */

import React, { useState } from 'react';
import QuestionList from './QuestionList';
import QuestionDetail from './QuestionDetail';

export default function PracticeHub() {
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

  return (
    <div className="w-full">
      {!selectedQuestionId ? (
        <QuestionList onSelectQuestion={(id) => setSelectedQuestionId(id)} />
      ) : (
        <QuestionDetail
          questionId={selectedQuestionId}
          onBack={() => setSelectedQuestionId(null)}
        />
      )}
    </div>
  );
}
