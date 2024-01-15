import React from 'react';
import InputText from './InputText';
import Label from './Label';

interface InputPhotoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onResult?: (result: string | ArrayBuffer | null) => void;
}

export default function InputPhoto({ onResult }: InputPhotoProps) {
  const [file, setFile] = React.useState<string | ArrayBuffer | null>(null);

  // function to handle the change of the input file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // get the file
    const file = e.target.files?.[0];
    // create a new FileReader
    const reader = new FileReader();
    // read the file
    if (file) {
      reader.readAsDataURL(file);
    }
    // when it's done reading
    reader.onloadend = () => {
      // set the file
      setFile(reader.result);
      onResult?.(reader.result);
    };
  };

  return (
    <>
      {/* if there's a file, show it */}
      {file ? (
        <div className="flex gap-4">
          <img
            src={file.toString()}
            alt="preview"
            className="w-20 h-20 rounded-lg object-cover"
          />
          <button
            className="bg-gray-200 text-gray-700 text-xs rounded-md p-2 w-fit h-fit"
            onClick={() => setFile(null)}
          >
            Remove Photo
          </button>
        </div>
      ) : (
        <>
          {/* input file */}
          <Label htmlFor="photo">Photo</Label>
          <InputText type="file" name="photo" onChange={handleFileChange} />
        </>
      )}
    </>
  );
}
