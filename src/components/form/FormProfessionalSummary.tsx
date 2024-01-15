

import { useState } from 'react';
import FormGroup from '../shared/FormGroup';
import InputTextarea from '../shared/InputTextarea';
import { useAtom } from 'jotai';
import { ResumeState } from '../../libs/state';

export default function FormProfessionalSummary() {
  const [_, setResumeState] = useAtom(ResumeState);
  const [value, setValue] = useState<string>('');
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textValue = event.target.value;
    if (textValue.length > 700) {
      return;
    } else {
      setValue(textValue);
      setResumeState((prevState) => ({
        ...prevState,
        profileDescription: textValue,
      }));
    }
  }

  return (
    <div className="flex flex-col gap-2 p-5 h-full">
      <h1 className="text-gray-700 text-2xl font-bold">Professional Summary</h1>
      <p className="text-sm text-gray-700">
        Write 2-4 short & energetic sentences to interest the reader! Mention
        your role, experience & most importantly - your biggest achievements,
        best qualities and skills.
      </p>

      <div className="flex flex-col gap-5 pt-[10px]">
        <div className="flex flex-col gap-2">
          <FormGroup>
            <InputTextarea
              rows={10}
              onChange={handleChange}
              textLength={value.length}
              value={value.length > 300 ? value.substring(0, 300) : value}
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
}
