// creates label component
type LabelProps = {
  children: string;
  htmlFor?: string;
};

export default function Label({ children, htmlFor }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="text-gray-700 text-sm">
      {children}
    </label>
  );
}
