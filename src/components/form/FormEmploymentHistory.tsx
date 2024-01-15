import { useState } from 'react';
import DetailEmploymentHistory from './partials/DetailEmploymentHistory';
import { EmploymentHistory } from '../../types/EmploymentHistory';

export default function FormEmploymentHistory() {
  const [employmentHistory, setEmploymentHistory] = useState<
    EmploymentHistory[]
  >([]);
  const [toggleDetail, setToggleDetail] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-2 p-5 h-full">
      <h1 className="text-gray-700 text-2xl font-bold">Employment History</h1>
      <p className="text-sm text-gray-700">
        Show your relevant experience (last 10 years). Use bullet points to note
        your achievements, if possible - use numbers/facts (Achieved X, measured
        by Y, by doing Z).
      </p>

      <div className="flex flex-col gap-5 pt-[10px]">
        <div className="flex flex-col gap-2">
          {toggleDetail ? (
            <DetailEmploymentHistory onCancel={() => setToggleDetail(false)} />
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
