import { useContext, useState } from "react";
import { Bell, ChevronRight, CircleUser, SquarePlus } from "lucide-react";
import AuthContext from "../../store/auth-context";
import { saveTheme, savedTheme, themes } from "../../theme";
import { layouts, saveLayout, useLayout } from "../../layout";
import { useIsPhone } from "../../hooks/useIsPhone";
import { useInstall } from "../../pwa/useInstall";
import { usePush } from "../../pwa/usePush";
import InstallSheet from "../Install/InstallSheet";
import Modal from "../UI/Modal/Modal";
import { Group, GroupLabel, Switch, buttonRowClasses, rowClasses } from "../UI/Grouped";

const themeLabels = { light: "Light", dark: "Dark", system: "System" };
const layoutLabels = { toolbar: "Toolbar", sidebar: "Sidebar" };

export function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

// The account sheet: who is signed in, the appearance, the desktop layout, reminders, and Sign out.
function MeSheet({ onClose }) {
  const authCtx = useContext(AuthContext);
  const [theme, setTheme] = useState(savedTheme);
  const [isInstallHelpOpen, setIsInstallHelpOpen] = useState(false);
  const { method, install } = useInstall();
  const push = usePush();
  const layout = useLayout();
  const isPhone = useIsPhone();
  const { user } = authCtx;

  function handleThemeChange(event) {
    setTheme(event.target.value);
    saveTheme(event.target.value);
  }

  function handleLayoutChange(event) {
    saveLayout(event.target.value);
  }

  // Chrome installs with its own dialog; on an iPhone the steps open on top of this sheet.
  function handleInstall() {
    if (method === "prompt") install();
    else handleInstallHelpOpen();
  }

  function handleInstallHelpOpen() {
    setIsInstallHelpOpen(true);
  }

  function handleInstallHelpClose() {
    setIsInstallHelpOpen(false);
  }

  function handleRemindersChange(event) {
    if (event.target.checked) push.enable();
    else push.disable();
  }

  return (
    <Modal sheet label="Me" onClose={onClose} onDone={onClose}>
      <div className="flex flex-col items-center gap-0.5 pt-2 pb-4">
        <span
          aria-hidden="true"
          className="mb-2 flex size-16 items-center justify-center rounded-full bg-accent text-xl font-bold text-on-accent"
        >
          {user ? initials(user.name) : <CircleUser className="size-9" />}
        </span>
        {user && (
          <>
            <p className="text-xl font-bold">{user.name}</p>
            <p className="text-subhead text-label2">{user.email}</p>
          </>
        )}
      </div>
      <GroupLabel id="appearance-label">Appearance</GroupLabel>
      <Group className="p-3">
        <Segmented
          name="theme"
          labelledBy="appearance-label"
          labels={themeLabels}
          values={themes}
          value={theme}
          onChange={handleThemeChange}
        />
      </Group>
      {/* Only desktop has the toolbar or the sidebar; phones always have the tab bar. */}
      {!isPhone && (
        <>
          <GroupLabel id="layout-label">Layout</GroupLabel>
          <Group className="p-3">
            <Segmented
              name="layout"
              labelledBy="layout-label"
              labels={layoutLabels}
              values={layouts}
              value={layout}
              onChange={handleLayoutChange}
            />
          </Group>
        </>
      )}
      {push.method && (
        <>
          <Group className="mt-5">
            {push.method === "switch" ? (
              <div className={rowClasses}>
                <BellIcon />
                <label htmlFor="reminders" className="flex-1">
                  Notifications
                </label>
                <Switch
                  id="reminders"
                  checked={push.isEnabled}
                  disabled={push.isBusy}
                  onChange={handleRemindersChange}
                />
              </div>
            ) : (
              // Safari on an iPhone only has push in the Home Screen app, so the row shows how to get there.
              <button type="button" className={`${buttonRowClasses} justify-start`} onClick={handleInstallHelpOpen}>
                <BellIcon />
                <span className="flex-1">Notifications</span>
                <ChevronRight className="size-5 text-label3" aria-hidden="true" />
              </button>
            )}
          </Group>
          <p className="mx-8 mt-1.5 text-footnote text-label2">
            Reminds you to clock out if you forget. On unless you turn it off.
          </p>
        </>
      )}
      <Group className="mt-5">
        {method && (
          <button type="button" className={`${buttonRowClasses} justify-start`} onClick={handleInstall}>
            <span className="flex size-7 items-center justify-center rounded-md bg-accent text-on-accent">
              <SquarePlus className="size-4" aria-hidden="true" />
            </span>
            <span className="flex-1">Install app</span>
            <ChevronRight className="size-5 text-label3" aria-hidden="true" />
          </button>
        )}
        <button type="button" className={`${buttonRowClasses} justify-center text-bad`} onClick={authCtx.logout}>
          Sign out
        </button>
      </Group>
      {isInstallHelpOpen && <InstallSheet onClose={handleInstallHelpClose} />}
    </Modal>
  );
}

// A row of radio buttons drawn as Apple's segmented control.
function Segmented({ name, labelledBy, labels, values, value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="grid auto-cols-fr grid-flow-col rounded-lg bg-fill p-0.5 text-footnote font-semibold"
    >
      {values.map((option) => (
        <label
          key={option}
          className="flex min-h-9 cursor-pointer items-center justify-center rounded-md has-checked:bg-cell has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-accent dark:has-checked:bg-[#636366]"
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={onChange}
            className="sr-only"
          />
          {labels[option]}
        </label>
      ))}
    </div>
  );
}

function BellIcon() {
  return (
    <span className="flex size-7 items-center justify-center rounded-md bg-bad text-white">
      <Bell className="size-4" aria-hidden="true" />
    </span>
  );
}

export default MeSheet;
