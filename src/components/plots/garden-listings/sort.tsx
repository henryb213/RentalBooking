import React, { useState } from "react";

interface SortProps {
  isOpen: boolean;
  toggleDropdown: () => void;
  state: {
    sortCriteria: string | undefined;
  };
}
const Sort: React.FC<SortProps> = ({ isOpen, toggleDropdown, state }) => {
  const [selectedOption, setSelectedOption] = useState(
    state.sortCriteria || "Sort By",
  );

  // @ts-expect-error need to add types
  const handleOptionClick = (option) => {
    state.sortCriteria = option;
    setSelectedOption(option);
    toggleDropdown();
  };

  return (
    <div className="relative inline-block text-left">
      {/* Button to toggle dropdown */}
      <button
        onClick={toggleDropdown}
        className="inline-flex w-full cursor-pointer justify-center rounded-md border border-gray-300 bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        {selectedOption}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ml-2 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-md bg-secondary shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-secondary-foreground focus:bg-gray-200"
              onClick={() => handleOptionClick("Recommended For You")}
            >
              Recommended for you
            </button>
            <button
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-secondary-foreground focus:bg-gray-200"
              onClick={() => handleOptionClick("Distance")}
            >
              Distance
            </button>
            <button
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-secondary-foreground focus:bg-gray-200"
              onClick={() => handleOptionClick("Newest")}
            >
              Newest
            </button>
            <button
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-secondary-foreground focus:bg-gray-200"
              onClick={() => handleOptionClick("Oldest")}
            >
              Oldest
            </button>
            <button
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-secondary-foreground focus:bg-gray-200"
              onClick={() => handleOptionClick("Size: Descending")}
            >
              Size: Descending
            </button>
            <button
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-secondary-foreground focus:bg-gray-200"
              onClick={() => handleOptionClick("Size: Ascending")}
            >
              Size: Ascending
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sort;
