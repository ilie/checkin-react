import { useState } from "react";
import { ChevronRight } from "lucide-react";
import Modal from "../UI/Modal/Modal";
import { Group } from "../UI/Grouped";
import Tag from "../UI/Tag";
import Detail from "./Detail";
import { useAllUsers } from "../../hooks/users";

// Read-only: editing users needs the desktop layout.
function UserSheet({ user, onClose }) {
  return (
    <Modal sheet label={user.name} onClose={onClose} onDone={onClose}>
      <Group className="mt-2">
        <dl>
          <Detail label="Email">{user.email}</Detail>
          <Detail label="NIF">{user.nif}</Detail>
          <Detail label="Contract">{user.hours_on_contract}h a week</Detail>
          <Detail label="Admin">{user.is_admin ? "Yes" : "No"}</Detail>
        </dl>
      </Group>
    </Modal>
  );
}

function UserRow({ user, onSelect }) {
  function handleClick() {
    onSelect(user.id);
  }

  return (
    <li className="ml-4 border-b border-sep/60 last:border-0">
      <button
        type="button"
        className="flex min-h-14 w-full cursor-pointer items-center gap-3 py-2 pr-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        onClick={handleClick}
      >
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">
            {user.name}
            {user.is_admin && <Tag>Admin</Tag>}
          </span>
          <span className="block truncate text-subhead text-label2">{user.email}</span>
        </span>
        <span>{user.hours_on_contract}h</span>
        <ChevronRight className="size-5 shrink-0 text-label3" aria-hidden="true" />
      </button>
    </li>
  );
}

// The phone's users: every one, by name, in edge-to-edge rows. A school's staff fits in one request.
function UserList() {
  const [selectedId, setSelectedId] = useState(null);
  const users = useAllUsers(true);
  const selected = users.data?.find((user) => user.id === selectedId);

  function handleClose() {
    setSelectedId(null);
  }

  if (users.isPending) return <p className="px-4 py-3 text-label2">Loading…</p>;

  return (
    <>
      <ul aria-label="Users" className="bg-cell">
        {users.data?.map((user) => (
          <UserRow key={user.id} user={user} onSelect={setSelectedId} />
        ))}
      </ul>
      {selected && <UserSheet user={selected} onClose={handleClose} />}
    </>
  );
}

export default UserList;
