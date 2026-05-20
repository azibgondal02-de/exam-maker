import React from 'react';
import { useTestMaker } from '../hooks/useTestMaker';
import ProgressBar from '../components/ProgressBar';
import Sidebar from '../components/Sidebar';

import Step1BoardSelect from './steps/Step1_BoardSelect';
import Step2ClassSelect from './steps/Step2_ClassSelect';
import Step3SubjectSelect from './steps/Step3_SubjectSelect';
import Step4TopicSelect from './steps/Step4_TopicSelect';
import Step5ConfigReview from './steps/Step5_ConfigReview';
import Step6QuestionSelect from './steps/Step6_QuestionSelect';

const stepComponents = {
  1: Step1BoardSelect,
  2: Step2ClassSelect,
  3: Step3SubjectSelect,
  4: Step4TopicSelect,
  5: Step5ConfigReview,
  6: Step6QuestionSelect,
};

export default function TestMaker() {
  const {
    currentStep,
    selectedBoard,
    selectedClass,
    selectedSubject,
    selectedTopics,
    goToStep,
  } = useTestMaker();

  const StepComponent = stepComponents[currentStep];

  const sidebarSelections = {
    board: selectedBoard,
    class: selectedClass,
    subject: selectedSubject,
    topics: selectedTopics,
  };

  const handleEditSection = (section) => {
    const stepMap = {
      board: 1,
      class: 2,
      subject: 3,
      topics: 4,
    };
    goToStep(stepMap[section]);
  };

  return (
    <div className="test-maker-layout">
      <ProgressBar currentStep={currentStep} onStepClick={goToStep} />

      <div className="test-maker-content">
        <Sidebar selections={sidebarSelections} onEdit={handleEditSection} />

        <main className="test-maker-main">
          <StepComponent />
        </main>
      </div>

      <style jsx>{`
        .test-maker-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .test-maker-content {
          display: flex;
          flex: 1;
        }

        .test-maker-main {
          flex: 1;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .test-maker-content {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}