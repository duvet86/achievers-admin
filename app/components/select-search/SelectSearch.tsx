import { useEffect, useRef, useState } from "react";

import { Xmark } from "iconoir-react";
import classNames from "classnames";

import { useClientRect } from "~/services";

export interface Option {
  label: string;
  value: string;
  isDisabled?: boolean;
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
  className?: string;
  onChange?: (value: string) => void;
}

const EMPTY_OPTION: Option = {
  label: "",
  value: "",
};

export function SelectSearch({
  className,
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

    if (defaultValue) {
      inputRef.current!.value = defaultValue;
    }

    inputRef.current?.form?.addEventListener("reset", resetHandler);

    return () => document.removeEventListener("reset", resetHandler);
  }, [defaultValue]);

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

    if (onChange) {
      onChange(EMPTY_OPTION.value);
    }
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

  const onDisabledButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className={classNames(className ?? "w-full")}>
      <label className="fieldset-label">{label}</label>

      <div className="indicator w-full">
        {required && (
          <span className="indicator-item badge text-error text-xl">*</span>
        )}
        <div
          className="dropdown w-full"
          ref={ref}
          onClick={() => searchInputRef.current?.focus()}
        >
          <div
            className={classNames("w-full", {
              join: showClearButton,
            })}
          >
            <input
              type="text"
              className={classNames("input input-bordered w-full flex-1", {
                "join-item": showClearButton,
              })}
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
            className="dropdown-content rounded-box bg-base-100 z-1 max-h-80 flex-nowrap overflow-auto p-0 shadow-sm"
            style={{ width: rect.width }}
          >
            <li className="sticky top-0 z-10 mb-4 bg-white p-2">
              <input
                ref={searchInputRef}
                type="text"
                className="select-search-input input input-bordered w-full"
                placeholder="Start typing to search..."
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
            </li>
            {viewOptions.map((option, index) => (
              <li key={index}>
                {option.isDisabled ? (
                  <button
                    type="button"
                    onClick={onDisabledButtonClick}
                    className="text-error cursor-not-allowed p-2"
                  >
                    {option.label}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-full p-2 text-left hover:bg-gray-100"
                    onClick={onOptionClick(option)}
                  >
                    {option.label}
                  </button>
                )}
              </li>
            ))}
            {viewOptions.length === 0 && (
              <li>
                <button
                  type="button"
                  className="p-2 italic"
                  onClick={onDisabledButtonClick}
                >
                  No items
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
