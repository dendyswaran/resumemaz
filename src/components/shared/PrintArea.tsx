import { PrinterIcon } from '@heroicons/react/16/solid';
import { useRef } from 'react';
import ReactToPrint from 'react-to-print';

type PrintPDFProps = {
  children: React.ReactNode;
};

const PrintArea: React.FC<PrintPDFProps> = ({ children }) => {
  const componentRef = useRef<any>();

  return (
    <div>
      <ReactToPrint
        trigger={() => (
          <button className="bg-blue-500 text-white flex gap-2 p-2 rounded-md items-center text-sm mb-4 hover:shadow-md delay-75">
            <PrinterIcon className="text-xs text-white w-4 h-4" /> Print as PDF
          </button>
        )}
        content={() => componentRef.current}
      />
      <div ref={componentRef}>{children}</div>
    </div>
  );
};

export default PrintArea;
