interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function InputText(props: InputTextProps) {
  return (
    <input
      {...props}
      className={`text-gray-700 border border-transparent rounded-md p-2 bg-gray-200 focus:outline-none ${props.className}`}
    />
  );
}
