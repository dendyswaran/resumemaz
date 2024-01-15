import { useState } from 'react';
import { EmploymentHistory } from '../../../types/EmploymentHistory';
import FormGroup from '../../shared/FormGroup';
import Label from '../../shared/Label';
import InputText from '../../shared/InputText';
import InputTextarea from '../../shared/InputTextarea';

type DetailEmploymentHistoryProps = {
  onCancel: () => void;
  onSubmit?: (result: EmploymentHistory) => void;
  employmentHistory?: EmploymentHistory | null;
};

export default function DetailEmploymentHistory(
  props: DetailEmploymentHistoryProps
) {
  const { employmentHistory } = props;
  const [jobTitle, setJobTitle] = useState(employmentHistory?.jobTitle ?? '');
  const [startDate, setStartDate] = useState(
    employmentHistory?.startDate ?? ''
  );
  const [endDate, setEndDate] = useState(employmentHistory?.endDate ?? '');
  const [employer, setEmployer] = useState(employmentHistory?.employer ?? '');
  const [city, setCity] = useState(employmentHistory?.city ?? '');
  const [description, setDescription] = useState(
    employmentHistory?.description ?? ''
  );

  return (
    <div className="flex flex-col gap-4 p-5 border-gray-200 border-[1px] rounded-md">
      <div className="grid grid-cols-2 gap-5 pt-[10px]">
        <section className="flex flex-col gap-2">
          <FormGroup>
            <Label htmlFor="name">Job Title</Label>
            <InputText
              type="text"
              value={jobTitle}
              onChange={(v) => setJobTitle(v.target.value)}
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
            <Label htmlFor="name">Employer</Label>
            <InputText
              type="text"
              value={employer}
              onChange={(v) => setEmployer(v.target.value)}
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
              index: employmentHistory?.index ?? null,
              jobTitle,
              startDate,
              endDate,
              employer,
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
