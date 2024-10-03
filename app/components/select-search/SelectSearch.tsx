import { useEffect, useRef, useState } from "react";

import { Xmark } from "iconoir-react";
import classNames from "classnames";

import { useClientRect } from "~/services";

export interface Option {
  label: string;
  value: string;
}

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  showClearButton?: boolean;
  required?: boolean;
  disabled?: boolean;
  options: Option[];
  onChange?: (value: string) => void;
}

const EMPTY_OPTION: Option = {
  label: "",
  value: "",
};

export function SelectSearch({
  options,
  name,
  label,
  placeholder,
  defaultValue,
  showClearButton,
  required,
  disabled,
  onChange,
}: Props) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<Option | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [rect, ref] = useClientRect<HTMLDivElement>();

  useEffect(() => {
    const resetHandler = () => {
      setSelectedValue(EMPTY_OPTION);
    };

    inputRef.current?.form?.addEventListener("reset", resetHandler);

    return () => document.removeEventListener("reset", resetHandler);
  }, []);

  const onOptionClick = (option: Option) => () => {
    setSelectedValue(option);

    inputRef.current!.value = option.value;

    (document.activeElement as HTMLElement).blur();

    if (onChange) {
      onChange(option.value);
    }
  };

  const onClearSelection = () => {
    setSelectedValue(EMPTY_OPTION);
  };

  const viewOptions =
    searchTerm.trim() === ""
      ? options
      : options.filter((item) =>
          item.label.toLowerCase().includes(searchTerm.toLowerCase()),
        );

  const selectedOption =
    selectedValue ??
    (defaultValue
      ? (options.find(({ value }) => value === defaultValue) ?? EMPTY_OPTION)
      : EMPTY_OPTION);

  return (
    <div
      className="dropdown w-full"
      ref={ref}
      onClick={() => searchInputRef.current?.focus()}
    >
      {label && (
        <label htmlFor={name} className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      {required && (
        <span
          data-testid="required"
          className={classNames(
            "label-text-alt absolute right-1 text-2xl text-error",
            {
              "top-0": label === undefined,
              "top-9": label !== undefined,
              "right-16": showClearButton,
            },
          )}
        >
          *
        </span>
      )}

      <div className="join w-full">
        <input
          type="text"
          className="input join-item input-bordered flex-1"
          value={selectedOption.label}
          placeholder={label ?? placeholder}
          required={required}
          disabled={disabled}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onChange={() => {}}
        />
        {showClearButton && (
          <div
            className="btn join-item text-error"
            data-testid="clear-text"
            onClick={onClearSelection}
          >
            <Xmark className="h-6 w-6" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="hidden"
        name={name}
        data-testid="autocomplete-hidden"
      />
      <ul
        className="menu dropdown-content z-[1] max-h-80 flex-nowrap overflow-auto rounded-box bg-base-100 p-0 shadow"
        style={{ width: rect.width }}
      >
        <li className="sticky top-0 z-10 mb-4 bg-white p-2">
          <input
            ref={searchInputRef}
            type="text"
            className="select-search-input input input-bordered"
            placeholder="Start typing to search..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
        </li>
        {viewOptions.map((option, index) => (
          <li key={index}>
            <button type="button" onClick={onOptionClick(option)}>
              {option.label}
            </button>
          </li>
        ))}
        {viewOptions.length === 0 && (
          <li>
            <button
              type="button"
              className="italic"
              onClick={(e) => e.preventDefault()}
            >
              No items
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
