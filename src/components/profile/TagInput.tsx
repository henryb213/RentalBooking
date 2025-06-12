import { XMarkIcon } from "@heroicons/react/20/solid";

export default function TagInput({
  label,
  tags,
  onKeyDown,
  removeTag,
}: {
  label: string;
  tags: string[];
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  removeTag: (tag: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm/6 font-medium text-gray-900">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 rounded-md border p-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center space-x-1 rounded-md bg-secondary px-2 py-1 text-secondary-foreground sm:text-sm/6"
          >
            {tag}
            <button
              className="ml-2 font-bold text-primary hover:text-red-400"
              onClick={() => removeTag(tag)}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </span>
        ))}
        <input
          type="text"
          className="flex-1 rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-secondary-foreground focus:ring-2 focus:ring-inset focus:ring-input sm:text-sm/6"
          placeholder={`Add ${label.toLowerCase()}...`}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
}
