import { useAtom } from 'jotai';
import { useState } from 'react';
import { ResumeState } from '../../libs/state';
import HistoryItem from '../shared/HistoryItem';
import { EducationHistory } from '../../types/EducationHistory';
import DetailEducationHistory from './partials/DetailEducationHistory';

export default function FormEducationHistory() {
  const [resumeState, setResumeState] = useAtom(ResumeState);
  const [toggleDetail, setToggleDetail] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<EducationHistory | null>(null);

  const handleAddEducationHistory = (educationHistory: EducationHistory) => {
    if (
      educationHistory.index != null &&
      typeof educationHistory.index === 'number'
    ) {
      setResumeState((prevState) => {
        const educationHistories = [...prevState.educationHistories];
        educationHistories[educationHistory.index!] = educationHistory;
        return {
          ...prevState,
          educationHistories,
        };
      });
    } else {
      setResumeState((prevState) => ({
        ...prevState,
        educationHistories: [
          ...prevState.educationHistories,
          educationHistory,
        ],
      }));
    }
    setEditValue(null);
    setToggleDetail(false);
  };

  const handleDeleteEducationHistory = (index: number) => {
    if (confirm('Are you sure want to delete this item?')) {
      setResumeState((prevState) => {
        const educationHistories = [...prevState.educationHistories];
        educationHistories.splice(index, 1);
        return {
          ...prevState,
          educationHistories,
        };
      });
    }
  };

  const handleUpdateEducationHistory = (
    index: number,
    educationHistory: EducationHistory
  ) => {
    setToggleDetail(true);
    setEditValue({
      ...educationHistory,
      index,
    });
  };

  return (
    <div className="flex flex-col gap-2 p-5 h-full">
      <h1 className="text-gray-700 text-2xl font-bold">Education History</h1>
      <p className="text-sm text-gray-700">
        Show your relevant experience (last 10 years). Use bullet points to note
        your achievements, if possible - use numbers/facts (Achieved X, measured
        by Y, by doing Z).
      </p>

      <div className="flex flex-col gap-5 pt-[10px]">
        {resumeState.educationHistories.map((item, index) => (
          <HistoryItem
            key={`emp-${index}`}
            index={index}
            title={item.school}
            subTitle={item.degree}
            startDate={item.startDate}
            endDate={item.endDate}
            onDelete={handleDeleteEducationHistory}
            onUpdate={handleUpdateEducationHistory}
            data={item}
          />
        ))}
        <div className="flex flex-col gap-2">
          {toggleDetail ? (
            <DetailEducationHistory
              educationHistory={editValue}
              onSubmit={handleAddEducationHistory}
              onCancel={() => {
                setToggleDetail(false);
                setEditValue(null);
              }}
            />
          ) : (
            <button
              className="bg-transparent text-blue-500 rounded-md p-2 w-fit text-sm font-bold"
              onClick={() => setToggleDetail(true)}
            >
              + Add Education History
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
