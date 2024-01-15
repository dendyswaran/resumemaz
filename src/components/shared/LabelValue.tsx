import FormGroup from './FormGroup';
import Label from './Label';

// creates label component
type LabelProps = {
  label: string;
  value: string;
  htmlFor?: string;
};

export default function LabelValue({ label, value, htmlFor }: LabelProps) {
  return (
    <FormGroup>
      <span className="text-gray-700 text-sm font-bold">{label}</span>
      <Label>{value}</Label>
    </FormGroup>
  );
}
