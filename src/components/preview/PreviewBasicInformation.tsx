import { useAtom } from 'jotai';
import LabelValue from '../shared/LabelValue';
import { ResumeState } from '../../libs/state';
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/16/solid';
import LabelSkillValue from '../shared/LabelSkillValue';

export default function PreviewBasicInformation() {
  const [resumeState, _] = useAtom(ResumeState);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-start items-center bg-gray-300 m-7 px-2">
        <img
          src={resumeState.profilePicture}
          alt="logo"
          className="w-32 h-32 bg-center  object-cover"
        />
        <div className="flex flex-col justify-start items-start p-5">
          <h1 className="text-lg font-bold text-gray-700">
            {resumeState.firstName}
          </h1>
          <p className="text-sm text-gray-600">{resumeState.jobTitle}</p>

          <p className="text-sm text-gray-600 mt-5">
            {resumeState.city}, {resumeState.country}
          </p>
          <div className="flex gap-4">
            <div className="flex gap-2 items-center">
              <PhoneIcon className="text-gray-700 h-3 w-3" />
              <span className="text-sm text-gray-600">{resumeState.phone}</span>
            </div>
            <div className="flex gap-2 items-center">
              <EnvelopeIcon className="text-gray-700 h-3 w-3" />
              <span className="text-sm text-gray-600">{resumeState.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-5 p-7">
        <div className="w-1/5 flex flex-col gap-4">
          <LabelValue label="Date of Birth" value="05 October 1990" />
          <LabelValue label="Nationality" value="Indonesia" />
          <LabelValue label="Skills" />
          {resumeState.skills?.map((item, index) => {
            return (
              <LabelSkillValue
                key={`prev-skill-${index}`}
                skill={item}
              />
            );
          })}
        </div>

        <section className="w-4/5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl text-gray-700 font-bold">Profile</h1>
            <p className="text-gray-700 text-sm html" dangerouslySetInnerHTML={{
              __html: resumeState.profileDescription
            }} />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-xl text-gray-700 font-bold">
              Employment History
            </h1>
            <div className="flex flex-col gap-4">
              {resumeState.employmentHistories.map((item, index) => (
                <div key={`prev-emp-${index}`} className="flex flex-col">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-gray-700 text-sm font-bold">
                      {item.jobTitle},
                    </span>
                    <span className="text-gray-700 text-sm font-bold">
                      {item.employer},
                    </span>
                    <span className="text-gray-700 text-sm font-bold">
                      {item.city}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-gray-700 text-sm">
                      {item.startDate} - {item.endDate}
                    </span>
                  </div>
                  <div className="text-gray-700 text-sm mt-2 html" dangerouslySetInnerHTML={{
                    __html: item.description
                  }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
