import { PrinterIcon } from '@heroicons/react/16/solid';
import { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { ResumeState } from '../../libs/state';
import { useAtom } from 'jotai';

type PrintPDFProps = {
  children: React.ReactNode;
};

const PrintArea: React.FC<PrintPDFProps> = ({ children }) => {
  const componentRef = useRef<any>();
  const [resumeState, _] = useAtom(ResumeState);

  const handleSaveToLocalStorage = () => {
    localStorage.setItem('resumemaz', JSON.stringify(resumeState))
  }

  return (
    <div>
      <ReactToPrint
        trigger={() => (
          <button className="bg-blue-500 text-white flex gap-2 p-2 rounded-md items-center text-sm mb-4 hover:shadow-md delay-75">
            <PrinterIcon className="text-xs text-white w-4 h-4" /> Save & print as PDF
          </button>
        )}
        onBeforePrint={handleSaveToLocalStorage}
        content={() => componentRef.current}
      />
      <div ref={componentRef}>{children}</div>
    </div>
  );
};

export default PrintArea;
