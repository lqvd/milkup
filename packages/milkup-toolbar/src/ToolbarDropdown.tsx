import { isDOMNode } from "lexical";
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from "react-dom";
import './toolbar.css';
import { DropdownItems } from "./ToolbarDropdownItem";

const dropdownPadding = 4;

interface ToolbarDropdownProps {
  buttonLabel: string;
  buttonIconClassName: string;
  items: React.ReactNode[];
}

export function ToolbarDropdown({ buttonLabel, buttonIconClassName, items }: ToolbarDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  function dropdownActiveClass(active: boolean) {
    if (active) {
      return 'active dropdown-item-active';
    } else {
      return '';
    }
  }

  const toggleDropdown = () => {
    console.log("toggled");
    setShowDropdown(!showDropdown);
  };

  const handleClose = () => {
    setShowDropdown(false);
    if (buttonRef && buttonRef.current) {
      console.log(buttonRef.current);
      buttonRef.current.focus();
    }
  };

  useEffect(() => {
    const button = buttonRef.current;
    const dropdown = dropdownRef.current;

    if (showDropdown && button !== null && dropdown !== null) {
      const { top, left } = button.getBoundingClientRect();
      dropdown.style.top = `${top + button.offsetHeight + dropdownPadding}px`;
      dropdown.style.left = `${Math.min(
        left,
        window.innerWidth - dropdown.offsetWidth - 20,
      )}px`;
    }
  }, [dropdownRef, buttonRef, showDropdown]);

  useEffect(() => {
    const button = buttonRef.current;

    if (button !== null && showDropdown) {
      const handle = (event: MouseEvent) => {
        const target = event.target;
        if (!isDOMNode(target)) {
          return;
        }
        if (!button.contains(target)) {
          setShowDropdown(false);
        }
      };
      document.addEventListener("click", handle);

      return () => {
        document.removeEventListener("click", handle);
      };
    }
  }, [dropdownRef, buttonRef, showDropdown]);

  useEffect(() => {
    const handleButtonPositionUpdate = () => {
      if (showDropdown) {
        const button = buttonRef.current;
        const dropDown = dropdownRef.current;
        if (button !== null && dropDown !== null) {
          const { top } = button.getBoundingClientRect();
          const newPosition = top + button.offsetHeight + dropdownPadding;
          if (newPosition !== dropDown.getBoundingClientRect().top) {
            dropDown.style.top = `${newPosition}px`;
          }
        }
      }
    };

    document.addEventListener("scroll", handleButtonPositionUpdate);

    return () => {
      document.removeEventListener("scroll", handleButtonPositionUpdate);
    };
  }, [buttonRef, dropdownRef, showDropdown]);

  return (
    <>
      <button
        type="button"
        className="toolbar-item"
        onClick={toggleDropdown}
        aria-label={buttonLabel}
        ref={buttonRef}
      >
        {buttonIconClassName && <span className={`icon ${buttonIconClassName}`} />}   
        {buttonLabel && (
          <span className="text dropdown-button-text">{buttonLabel}</span>
        )}
        <i className="format chevron-down" />
      </button>

      {showDropdown &&
        createPortal(
          <DropdownItems dropdownRef={dropdownRef} onClose={handleClose}>
            {items}
          </DropdownItems>,
          document.body,
      )}
    </>
  );
}