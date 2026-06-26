import React, { lazy, Suspense } from 'react';
import { useTestMaker } from '../hooks/useTestMaker';

// ── Lazy load steps — they will now split into separate chunks ──
const Step1BoardSelect    = lazy(() => import('./steps/Step1_BoardSelect'));
const Step2ClassSelect    = lazy(() => import('./steps/Step2_ClassSelect'));
const Step3SubjectSelect  = lazy(() => import('./steps/Step3_SubjectSelect'));
const Step4TopicSelect    = lazy(() => import('./steps/Step4_TopicSelect'));
const Step5ConfigReview   = lazy(() => import('./steps/Step5_ConfigReview'));
const Step6QuestionSelect = lazy(() => import('./steps/Step6_QuestionSelect'));

const stepComponents = {
  1: Step1BoardSelect,
  2: Step2ClassSelect,
  3: Step3SubjectSelect,
  4: Step4TopicSelect,
  5: Step5ConfigReview,
  6: Step6QuestionSelect,
};

function StepLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh',
    }}>
      <div style={{
        width: '36px', height: '36px',
        border: '3px solid #e2e8f0', borderTop: '3px solid #2196f3',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function TestMaker() {
  const { currentStep } = useTestMaker();
  const StepComponent = stepComponents[currentStep];

  return (
    <div className="test-maker-layout">
      <div className="test-maker-content">
        <main className="test-maker-main">
          <Suspense fallback={<StepLoader />}>
            <StepComponent />
          </Suspense>
        </main>
      </div>

      <style>{`
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