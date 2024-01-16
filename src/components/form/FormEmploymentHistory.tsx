import { useAtom } from 'jotai';
import { useState } from 'react';
import { ResumeState } from '../../libs/state';
import { EmploymentHistory } from '../../types/EmploymentHistory';
import HistoryItem from '../shared/HistoryItem';
import DetailEmploymentHistory from './partials/DetailEmploymentHistory';

export default function FormEmploymentHistory() {
  const [resumeState, setResumeState] = useAtom(ResumeState);
  const [toggleDetail, setToggleDetail] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<EmploymentHistory | null>(null);

  const handleAddEmploymentHistory = (employmentHistory: EmploymentHistory) => {
    if (
      employmentHistory.index != null &&
      typeof employmentHistory.index === 'number'
    ) {
      setResumeState((prevState) => {
        const employmentHistories = [...prevState.employmentHistories];
        employmentHistories[employmentHistory.index!] = employmentHistory;
        return {
          ...prevState,
          employmentHistories,
        };
      });
    } else {
      setResumeState((prevState) => ({
        ...prevState,
        employmentHistories: [
          ...prevState.employmentHistories,
          employmentHistory,
        ],
      }));
    }
    setEditValue(null);
    setToggleDetail(false);
  };

  const handleDeleteEmploymentHistory = (index: number) => {
    if (confirm('Are you sure want to delete this item?')) {
      setResumeState((prevState) => {
        const employmentHistories = [...prevState.employmentHistories];
        employmentHistories.splice(index, 1);
        return {
          ...prevState,
          employmentHistories,
        };
      });
    }
  };

  const handleUpdateEmploymentHistory = (
    index: number,
    employmentHistory: EmploymentHistory
  ) => {
    setToggleDetail(true);
    setEditValue({
      ...employmentHistory,
      index,
    });
  };

  return (
    <div className="flex flex-col gap-2 p-5 h-full">
      <h1 className="text-gray-700 text-2xl font-bold">Employment History</h1>
      <p className="text-sm text-gray-700">
        Show your relevant experience (last 10 years). Use bullet points to note
        your achievements, if possible - use numbers/facts (Achieved X, measured
        by Y, by doing Z).
      </p>

      <div className="flex flex-col gap-5 pt-[10px]">
        {resumeState.employmentHistories.map((item, index) => (
          <HistoryItem
            key={`emp-${index}`}
            index={index}
            title={item.jobTitle}
            subTitle={item.employer}
            startDate={item.startDate}
            endDate={item.endDate}
            onDelete={handleDeleteEmploymentHistory}
            onUpdate={handleUpdateEmploymentHistory}
            data={item}
          />
        ))}
        <div className="flex flex-col gap-2">
          {toggleDetail ? (
            <DetailEmploymentHistory
              employmentHistory={editValue}
              onSubmit={handleAddEmploymentHistory}
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
              + Add Employment History
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
