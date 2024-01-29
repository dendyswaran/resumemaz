import { useAtom } from 'jotai';
import { useState } from 'react';
import { ResumeState } from '../../libs/state';
import { CertificationHistory } from '../../types/CertificationHistory';
import HistoryItem from '../shared/HistoryItem';
import DetailCertificationHistory from './partials/DetailCertificationHistory';

export default function FormCertificationHistory() {
  const [resumeState, setResumeState] = useAtom(ResumeState);
  const [toggleDetail, setToggleDetail] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<CertificationHistory | null>(null);

  const handleAddCertificationHistory = (certificationHistory: CertificationHistory) => {
    if (
      certificationHistory.index != null &&
      typeof certificationHistory.index === 'number'
    ) {
      setResumeState((prevState) => {
        const certificationHistories = [...prevState.certificationHistories];
        certificationHistories[certificationHistory.index!] = certificationHistory;
        return {
          ...prevState,
          certificationHistories,
        };
      });
    } else {
      setResumeState((prevState) => ({
        ...prevState,
        certificationHistories: [
          ...prevState.certificationHistories,
          certificationHistory,
        ],
      }));
    }
    setEditValue(null);
    setToggleDetail(false);
  };

  const handleDeleteCertificationHistory = (index: number) => {
    if (confirm('Are you sure want to delete this item?')) {
      setResumeState((prevState) => {
        const certificationHistories = [...prevState.certificationHistories];
        certificationHistories.splice(index, 1);
        return {
          ...prevState,
          certificationHistories,
        };
      });
    }
  };

  const handleUpdateCertificationHistory = (
    index: number,
    certificationHistory: CertificationHistory
  ) => {
    setToggleDetail(true);
    setEditValue({
      ...certificationHistory,
      index,
    });
  };

  return (
    <div className="flex flex-col gap-2 p-5 h-full">
      <h1 className="text-gray-700 text-2xl font-bold">Certification History</h1>
      <p className="text-sm text-gray-700">
        Show your relevant experience (last 10 years). Use bullet points to note
        your achievements, if possible - use numbers/facts (Achieved X, measured
        by Y, by doing Z).
      </p>

      <div className="flex flex-col gap-5 pt-[10px]">
        {resumeState.certificationHistories.map((item, index) => (
          <HistoryItem
            key={`emp-${index}`}
            index={index}
            title={item.activity}
            startDate={item.startDate}
            endDate={item.endDate}
            onDelete={handleDeleteCertificationHistory}
            onUpdate={handleUpdateCertificationHistory}
            data={item}
          />
        ))}
        <div className="flex flex-col gap-2">
          {toggleDetail ? (
            <DetailCertificationHistory
              certificationHistory={editValue}
              onSubmit={handleAddCertificationHistory}
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
              + Add Certification History
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
