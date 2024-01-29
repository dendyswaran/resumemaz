import { useState } from 'react';
import FormGroup from '../../shared/FormGroup';
import Label from '../../shared/Label';
import InputText from '../../shared/InputText';
import InputTextarea from '../../shared/InputTextarea';
import { EducationHistory } from '../../../types/EducationHistory';

type DetailEducationHistoryProps = {
  onCancel: () => void;
  onSubmit?: (result: EducationHistory) => void;
  educationHistory?: EducationHistory | null;
};

export default function DetailEducationHistory(
  props: DetailEducationHistoryProps
) {
  const { educationHistory } = props;
  const [school, setSchool] = useState(educationHistory?.school ?? '');
  const [startDate, setStartDate] = useState(
    educationHistory?.startDate ?? ''
  );
  const [endDate, setEndDate] = useState(educationHistory?.endDate ?? '');
  const [degree, setDegree] = useState(educationHistory?.degree ?? '');
  const [city, setCity] = useState(educationHistory?.city ?? '');
  const [description, setDescription] = useState(
    educationHistory?.description ?? ''
  );

  return (
    <div className="flex flex-col gap-4 p-5 border-gray-200 border-[1px] rounded-md">
      <div className="grid grid-cols-2 gap-5 pt-[10px]">
        <section className="flex flex-col gap-2">
          <FormGroup>
            <Label htmlFor="name">School</Label>
            <InputText
              type="text"
              value={school}
              onChange={(v) => setSchool(v.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="name">Start & End Date</Label>
            <div className="grid grid-cols-2 gap-2">
              <InputText
                type="text"
                name="job_title"
                placeholder="MM / YY"
                value={startDate}
                onChange={(v) => setStartDate(v.target.value)}
              />
              <InputText
                type="text"
                name="job_title"
                placeholder="MM / YY"
                value={endDate}
                onChange={(v) => setEndDate(v.target.value)}
              />
            </div>
          </FormGroup>
        </section>

        <section className="flex flex-col gap-2">
          <FormGroup>
            <Label htmlFor="name">Degree</Label>
            <InputText
              type="text"
              value={degree}
              onChange={(v) => setDegree(v.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="name">City</Label>
            <InputText
              type="text"
              value={city}
              onChange={(v) => setCity(v.target.value)}
            />
          </FormGroup>
        </section>
      </div>

      <FormGroup>
        <Label htmlFor="name">Description</Label>
        <InputTextarea
          rows={8}
          textLength={description.length}
          value={description}
          onChange={(v) => setDescription(v.target.value)}
        />
      </FormGroup>

      <div className="flex gap-2">
        <button
          className="bg-gray-200 text-gray-700 text-xs rounded-md p-2 w-fit h-fit"
          onClick={props.onCancel}
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 text-white text-xs rounded-md p-2 w-fit h-fit"
          onClick={() =>
            props.onSubmit?.({
              index: educationHistory?.index ?? null,
              school,
              startDate,
              endDate,
              degree,
              city,
              description,
            })
          }
        >
          Apply
        </button>
      </div>
    </div>
  );
}
