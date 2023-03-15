import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

let isHydrating = true;

export default function Modal() {
  const [isHydrated, setIsHydrated] = useState(!isHydrating);

  useEffect(() => {
    isHydrating = false;
    setIsHydrated(true);
  }, []);

  if (isHydrated) {
    return createPortal(
      <>
        <input
          type="checkbox"
          id="police-check-modal"
          className="modal-toggle"
        />
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="text-lg font-bold">
              Congratulations random Internet user!
            </h3>
            <p className="py-4">
              You've been selected for a chance to get one year of subscription
              to use Wikipedia for free!
            </p>
            <div className="modal-action">
              <label htmlFor="police-check-modal" className="btn">
                Yay!
              </label>
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  } else {
    return null;
  }
}
