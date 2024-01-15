import { ChangeEventHandler, TextareaHTMLAttributes } from 'react';

interface InputTextProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  textLength: number;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
}

export default function InputTextarea(props: InputTextProps) {
  return (
    <div className="flex flex-col">
      <textarea
        {...props}
        className="text-gray-700 border border-transparent rounded-md p-2 bg-gray-200 focus:outline-none"
      >
        {props.children}
      </textarea>
      <div className="flex justify-between py-3">
        <span className="text-xs text-gray-500 text-left">
          Recruiter tip: write 50-200 characters to increase interview chances
        </span>
        <span className="text-xs text-gray-500 text-right">
          {props.textLength || 0}/300
        </span>
      </div>
    </div>
  );
}
