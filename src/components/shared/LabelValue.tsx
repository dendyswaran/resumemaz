import FormGroup from './FormGroup';
import Label from './Label';

// creates label component
interface LabelProps extends React.HTMLProps<HTMLLabelElement> {
  label: string;
  value?: string;
  htmlFor?: string;
}

export default function LabelValue(props: LabelProps) {
  return (
    <FormGroup>
      <span className={`text-gray-700 text-sm font-bold ${props.className}`}>{props.label}</span>
      {props.value && (
        <Label>{props.value}</Label>
      )}
    </FormGroup>
  );
}
