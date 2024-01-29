import { useAtom } from 'jotai';
import FormBasicInformation from './components/form/FormBasicInformation';
import FormCertificationHistory from './components/form/FormCertificationHistory';
import FormEducationHistory from './components/form/FormEducationtHistory';
import FormEmploymentHistory from './components/form/FormEmploymentHistory';
import FormFeaturedProject from './components/form/FormFeaturedProject';
import FormProfessionalSummary from './components/form/FormProfessionalSummary';
import FormSkills from './components/form/FormSkills';
import PreviewBasicInformation from './components/preview/PreviewBasicInformation';
import PrintArea from './components/shared/PrintArea';
import { ResumeState } from './libs/state';
import { useEffect } from 'react';
import FormSocialLinks from './components/form/FormSocialLink';

export default function App() {

  const [_, setResumeState] = useAtom(ResumeState);

  // first time load
  // check if there is data in local storage
  useEffect(() => {
    if (localStorage.getItem('resumemaz')) {
      const data = JSON.parse(localStorage.getItem('resumemaz')!);
      console.log(data);

      setResumeState(data)
    }
  }, [])

  return (
    <div className="relative flex w-full min-h-screen gap-2">
      <div className="flex flex-col w-1/2 h-full bg-white p-5">
        <div className="flex gap-2 rounded-md bg-blue-200 m-5 p-5">
          <img
            src="https://resume.io/assets/media/Unicorn147be677e621b94dc192.png"
            alt="logo"
            className="w-20"
          />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-700">
              Ensure your resume fits the job opening
            </h1>
            <p className="text-sm text-gray-600">
              Build your job-winning resume in minutes.
            </p>
          </div>
        </div>
        <FormBasicInformation />
        <FormProfessionalSummary />
        <FormEmploymentHistory />
        <FormFeaturedProject />
        <FormSkills />
        <FormEducationHistory />
        <FormCertificationHistory />
        <FormSocialLinks />
      </div>

      <div className="fixed right-0 w-1/2 h-full bg-gray-200 p-10 overflow-y-scroll">
        <PrintArea>
          <PreviewBasicInformation />
        </PrintArea>
      </div>
    </div>
  );
}
