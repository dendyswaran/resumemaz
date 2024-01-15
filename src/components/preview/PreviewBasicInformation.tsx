import LabelValue from '../shared/LabelValue';

export default function PreviewBasicInformation() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-start items-center bg-gray-200 m-7">
        <img
          src="https://resume.io/assets/media/Unicorn147be677e621b94dc192.png"
          alt="logo"
          className="h-full"
        />
        <div className="flex flex-col justify-start items-start p-5">
          <h1 className="text-lg font-bold text-gray-700">Dendy Swarandanu</h1>
          <p className="text-sm text-gray-600">Senior Technology Consultant</p>

          <p className="text-sm text-gray-600 mt-5">Jakarta, Indonesia</p>
          <p className="text-sm text-gray-600">
            +62 817131366 - dendyswaran@gmail.com
          </p>
        </div>
      </div>

      <div className="flex gap-5 p-7">
        <div className="w-1/5 flex flex-col gap-4">
          <LabelValue label="Date of Birth" value="05 October 1990" />
          <LabelValue label="Nationality" value="Indonesia" />
        </div>

        <section className="w-4/5 flex flex-col gap-4">
          <div className='flex flex-col gap-2'>
            <h1 className='text-xl text-gray-700 font-bold'>Profile</h1>
            <p className="text-gray-700 text-sm">
              I am a senior technology consultant with 10 years of experience
              working with various clients in the financial industry. I have
              experience in leading a team of 20 people and managing multiple
              projects at once.
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <h1 className='text-xl text-gray-700 font-bold'>Employment History</h1>
            <p className="text-gray-700 text-sm">
              I am a senior technology consultant with 10 years of experience
              working with various clients in the financial industry. I have
              experience in leading a team of 20 people and managing multiple
              projects at once.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
