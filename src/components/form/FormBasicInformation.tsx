import FormGroup from '../shared/FormGroup';
import InputPhoto from '../shared/InputPhoto';
import InputText from '../shared/InputText';
import Label from '../shared/Label';

export default function FormBasicInformation() {
  return (
    <div className="flex flex-col gap-2 p-5 h-full">
      <h1 className="text-gray-700 text-2xl font-bold">Basic Information</h1>

      <div className="grid grid-cols-2 gap-5 pt-[10px]">
        <div className="flex flex-col gap-2">
          <FormGroup>
            <Label htmlFor="name">Job Title</Label>
            <InputText type="text" name="job_title" />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">First Name</Label>
            <InputText type="email" name="email" />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Last Name</Label>
            <InputText type="email" name="email" />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="name">Country</Label>
            <InputText type="text" name="job_title" />
          </FormGroup>
        </div>

        <div className="flex flex-col gap-2">
          <FormGroup>
            <InputPhoto />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <InputText type="email" name="email" />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="name">Phone</Label>
            <InputText type="text" name="job_title" />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="name">City</Label>
            <InputText type="text" name="job_title" />
          </FormGroup>
        </div>
      </div>
    </div>
  );
}
