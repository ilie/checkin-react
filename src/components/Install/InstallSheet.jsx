import { Share } from "lucide-react";
import Modal from "../UI/Modal/Modal";
import { Group, rowClasses } from "../UI/Grouped";

function Step({ number, children }) {
  return (
    <li className={`${rowClasses} justify-start`}>
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-subhead font-bold text-on-accent"
      >
        {number}
      </span>
      <span>{children}</span>
    </li>
  );
}

// Apple's steps for adding a web app to the Home Screen; Safari has no API to start it.
function InstallSheet({ onClose }) {
  return (
    <Modal sheet label="Install Checkin" cancelLabel="Not now" onClose={onClose}>
      <p className="mx-6 mt-1 mb-4 text-subhead text-label2">
        Add Checkin to your Home Screen to clock in with one tap, like any other app.
      </p>
      <Group>
        <ol>
          <Step number={1}>
            Tap <b>···</b> then <b>Share</b>{" "}
            <Share className="inline size-4 text-accent" aria-hidden="true" />
          </Step>
          <Step number={2}>
            Choose <b>Add to Home Screen</b>
          </Step>
          <Step number={3}>
            Open <b>Checkin</b> from your Home Screen
          </Step>
        </ol>
      </Group>
    </Modal>
  );
}

export default InstallSheet;
