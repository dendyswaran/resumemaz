import { PencilIcon, TrashIcon } from '@heroicons/react/16/solid';

interface HistoryItemProps<T> {
  index: number;
  title: string;
  subTitle?: string | null;
  startDate: string;
  endDate: string;
  onDelete: (index: number) => void;
  onUpdate: (index: number, item: T) => void;
  data: T;
}

export default function HistoryItem<T>(props: HistoryItemProps<T>) {
  return (
    <div className="flex items-center justify-between py-2 px-4 bg-gray-100 rounded-md">
      <div className="flex flex-col gap-1">
        <div className="flex gap-1">
          <span className="text-sm text-gray-700 font-bold">{props.title}</span>
          {props.subTitle && (
            <span className="text-sm text-gray-700 font-bold">
              {props.subTitle}
            </span>
          )}
        </div>

        <span className="text-xs text-gray-700">
          {props.startDate} - {props.endDate}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          className="text-blue-500 text-sm font-bold"
          onClick={() => props.onUpdate(props.index, props.data)}
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          className="text-red-500 text-sm font-bold"
          onClick={() => props.onDelete(props.index)}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
