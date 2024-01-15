import { ResumeState } from '../../libs/state';
import FormGroup from '../shared/FormGroup';
import InputPhoto from '../shared/InputPhoto';
import InputText from '../shared/InputText';
import Label from '../shared/Label';

import { useAtom } from 'jotai';

export default function FormBasicInformation() {
  const [_, setResumeState] = useAtom(ResumeState);

  return (
    <div className="flex flex-col gap-2 p-5 h-full">
      <h1 className="text-gray-700 text-2xl font-bold">Basic Information</h1>

      <div className="grid grid-cols-2 gap-5 pt-[10px]">
        <div className="flex flex-col gap-2">
          <FormGroup>
            <Label htmlFor="name">Job Title</Label>
            <InputText
              type="text"
              onChange={(v) =>
                setResumeState((prevState) => ({
                  ...prevState,
                  jobTitle: v.target.value,
                }))
              }
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">First Name</Label>
            <InputText
              type="email"
              onChange={(v) =>
                setResumeState((prevState) => ({
                  ...prevState,
                  firstName: v.target.value,
                }))
              }
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Last Name</Label>
            <InputText
              type="text"
              onChange={(v) =>
                setResumeState((prevState) => ({
                  ...prevState,
                  lastName: v.target.value,
                }))
              }
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="name">Country</Label>
            <InputText
              type="text"
              onChange={(v) =>
                setResumeState((prevState) => ({
                  ...prevState,
                  country: v.target.value,
                }))
              }
            />
          </FormGroup>
        </div>

        <div className="flex flex-col gap-2">
          <FormGroup>
            <InputPhoto
              onResult={(v) =>
                setResumeState((prevState) => ({
                  ...prevState,
                  profilePicture: v?.toString() ?? '',
                }))
              }
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <InputText
              type="email"
              onChange={(v) =>
                setResumeState((prevState) => ({
                  ...prevState,
                  email: v.target.value,
                }))
              }
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="name">Phone</Label>
            <InputText
              type="text"
              onChange={(v) =>
                setResumeState((prevState) => ({
                  ...prevState,
                  phone: v.target.value,
                }))
              }
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="name">City</Label>
            <InputText
              type="text"
              onChange={(v) =>
                setResumeState((prevState) => ({
                  ...prevState,
                  city: v.target.value,
                }))
              }
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
}
