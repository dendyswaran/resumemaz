import { useState } from 'react';
import DetailEmploymentHistory from './partials/DetailEmploymentHistory';
import { EmploymentHistory } from '../../types/EmploymentHistory';
import { useAtom } from 'jotai';
import { ResumeState } from '../../libs/state';
import { PencilIcon, TrashIcon } from '@heroicons/react/16/solid';

export default function FormEmploymentHistory() {
  const [resumeState, setResumeState] = useAtom(ResumeState);
  const [toggleDetail, setToggleDetail] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<EmploymentHistory | null>(null);

  const handleAddEmploymentHistory = (employmentHistory: EmploymentHistory) => {
    if (
      employmentHistory.index != null &&
      typeof employmentHistory.index === 'number'
    ) {
      alert(employmentHistory.index);
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
          <div
            key={`emp-${index}`}
            className="flex items-center justify-between py-2 px-4 bg-gray-100 rounded-md"
          >
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <span className="text-sm text-gray-700 font-bold">
                  {item.jobTitle}
                </span>
                <span className="text-sm text-gray-700 font-bold">
                  at {item.employer}
                </span>
              </div>

              <span className="text-xs text-gray-700">
                {item.startDate} - {item.endDate}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                className="text-blue-500 text-sm font-bold"
                onClick={() => handleUpdateEmploymentHistory(index, item)}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                className="text-red-500 text-sm font-bold"
                onClick={() => handleDeleteEmploymentHistory(index)}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
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
