"use client";

/** UI adapted from:
 *
 * https://headlessui.com/react/dialog
 * https://headlessui.com/react/listbox
 * https://headlessui.com/react/disclosure
 */

import { api } from "@/trpc/react";
import { PopulatedPlot } from "@/types/plotManagement/plots";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Dialog,
  DialogPanel,
  DialogTitle,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import {
  PencilIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  FolderIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/16/solid";
import Button from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
  UserCircleIcon,
  UserPlusIcon,
  UserMinusIcon,
} from "@heroicons/react/20/solid";
import Alert from "@/components/ui/alert";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ITaskBoardD, ITaskD } from "@/types/taskManagement/task";

interface PlotManagerProps {
  variant: "lending" | "tending";
  plot: PopulatedPlot;
  showRequests: boolean;
  refresh: () => void;
}

interface TabProps {
  hidden: boolean;
  plot: PopulatedPlot;
  refresh: () => void;
  taskboard: ITaskBoardD | undefined;
}

interface OptionProps {
  plot: PopulatedPlot;
  refresh: () => void;
}

interface ShowUsersProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setter: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getter: any | null;
  plot: PopulatedPlot;
  type: SelectType;
}

type SelectType = "add" | "remove" | "view";

type User = {
  id: string;
  date: Date | null;
  firstName: string | undefined;
  lastName: string | undefined;
  email: string | undefined;
  message?: string | undefined; // Undefined for non-requested users
};

export const PlotManager = (props: PlotManagerProps) => {
  // get the taskBoard for the plot

  const data = api.taskboards.getByPlot.useQuery({
    plotID: props.plot._id.toString(),
  }).data;

  // @ts-expect-error works
  const board = data?._doc;

  return (
    <Disclosure as="div" className="">
      {({ open }) => (
        <>
          <DisclosureButton className="group flex w-full items-center justify-between">
            <div className="flex items-center">
              <span className="text-lg font-bold text-primary group-data-[hover]:text-primary/80">
                {props.plot.name}
              </span>
              {props.showRequests &&
                !open && ( // Show the red circle only if not open
                  <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {props.plot.requests.length}
                  </span>
                )}
            </div>
            <PlusIcon className="size-7 fill-primary/60 group-data-[open]:hidden group-data-[hover]:fill-primary/50" />
            <MinusIcon
              aria-hidden="true"
              className="size-7 fill-primary/60 group-data-[hover]:fill-primary/50 [.group:not([data-open])_&]:hidden"
            />
          </DisclosureButton>
          <DisclosurePanel
            transition
            className="mt-2 origin-top text-sm/5 text-primary/50 transition duration-200 ease-out data-[closed]:-translate-y-6 data-[closed]:opacity-0"
          >
            <p className="text-base text-primary"> {props.plot.description} </p>

            <div className="border-b-solid border-radius-4 max-w mx-auto border-t-2 border-primary/60 pb-4">
              <TaskDisplay id={board?._id.toString()} />
              <ShowUsers
                plot={props.plot}
                type="view"
                setter={null}
                getter={null}
              />

              <div className="flex items-center pt-4">
                <LendingOptions
                  hidden={props.variant != "lending"}
                  plot={props.plot}
                  refresh={props.refresh}
                  taskboard={board}
                />
                <TendingOptions
                  hidden={props.variant != "tending"}
                  plot={props.plot}
                  refresh={props.refresh}
                  taskboard={board}
                />
              </div>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};

const LendingOptions = (props: TabProps) => {
  return (
    <section hidden={props.hidden}>
      <EditPlot plot={props.plot} refresh={props.refresh} />
      <AddUser plot={props.plot} refresh={props.refresh} />
      <RemoveUser plot={props.plot} refresh={props.refresh} />
      <DeletePlot plot={props.plot} refresh={props.refresh} />
      <GoToTaskboard id={props.taskboard?._id?.toString()} />
    </section>
  );
};

const TendingOptions = (props: TabProps) => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const removeSelfMutation = api.plots.removeSelf.useMutation({
    onSuccess: () => {
      props.refresh();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleRemoveSelf = async () => {
    // check if logged in
    if (!session) {
      alert("You must be logged in to remove yourself from a plot");
      return;
    }

    await removeSelfMutation.mutateAsync({
      plotId: props.plot._id.toString(),
      userId: session?.user.id.toString(),
    });
  };

  const openAlert = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <section hidden={props.hidden}>
      {/* Link to tasks */}
      <GoToTaskboard id={props.taskboard?._id?.toString()} />
      <Button
        size="lg"
        variant="secondary"
        href={"/profile/" + props.plot.owner._id.toString()}
        className="mr-2 rounded-full"
        title="View Owner Profile"
      >
        <UserCircleIcon className="size-5 fill-primary" />
      </Button>
      <Button
        size="lg"
        variant="secondary"
        onClick={(e) => openAlert(e)}
        className="mr-2 rounded-full"
        title="Remove Yourself From Plot"
      >
        <UserMinusIcon className="size-5 fill-primary" />
      </Button>
      <Alert
        open={open}
        onClose={setOpen}
        variant="destructive"
        title="Remove Yourself"
        icon={ExclamationTriangleIcon}
        onSubmit={() => handleRemoveSelf()}
        onCancel={() => console.log("Cancelled")}
        submitText="Remove"
      >
        <p className="text-sm">
          Are you sure you want to remove yourself from {props.plot.name}?
        </p>
      </Alert>
    </section>
  );
};

const AddUser = (props: OptionProps) => {
  const [isAddOpenUserSelect, setAddOpenUserSelect] = useState(false);
  const [isAddOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [selectedUserText, setSelectedUserText] = useState(
    "Please select a user",
  );

  function openUserSelect() {
    setAddOpenUserSelect(true);
  }

  function closeUserSelect() {
    setSelected(null);
    setAddOpenUserSelect(false);
  }

  function showConfirmUserAdd() {
    if (!isAddOpen && selected !== null) {
      if (selected && selected.firstName && selected.lastName) {
        setSelectedUserText(selected.firstName + " " + selected.lastName);
      }
      setAddOpen(true);
    }
  }

  const addUserMutation = api.plots.acceptRequest.useMutation({
    onSuccess: () => {
      props.refresh();
      closeUserSelect();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleUserAdd = async () => {
    await addUserMutation.mutateAsync({
      plotId: props.plot._id.toString(),

      // @ts-expect-error already checked for null
      userId: selected.id,
    });
  };

  const rejectRequestMutation = api.plots.rejectRequest.useMutation({
    onSuccess: () => {
      props.refresh();
      closeUserSelect();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleRequestReject = async (userId: string) => {
    await rejectRequestMutation.mutateAsync({
      plotId: props.plot._id.toString(),
      userId,
    });
  };

  return (
    <>
      <div className="relative inline-block">
        {/* Red circle with the number of requests */}
        {props.plot.requests?.length > 0 && (
          <span className="absolute -left-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {props.plot.requests.length}
          </span>
        )}
        <Button
          size="lg"
          variant="secondary"
          onClick={() => openUserSelect()}
          className="mr-2 rounded-full"
          title="Assign User to Plot"
        >
          <UserPlusIcon className="size-5 fill-primary" />
        </Button>
      </div>

      {/* Dialogs for adding/removing members */}
      <Dialog
        open={isAddOpenUserSelect}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={() => closeUserSelect()}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-background px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <DialogTitle as="h3" className="text-base font-semibold">
                  Add or reject requests for {props.plot.name}:
                </DialogTitle>
              </div>

              <ShowUsers
                setter={setSelected}
                getter={selected}
                type="add"
                plot={props.plot}
              />

              <div className="mt-5 gap-x-2 space-y-2 sm:mt-4 sm:flex sm:flex-row-reverse sm:space-y-0">
                <Button
                  variant="primary"
                  disabled={selected === null}
                  onClick={() => showConfirmUserAdd()}
                >
                  Add User
                </Button>
                <Button
                  variant="secondary"
                  disabled={selected === null}
                  onClick={
                    /*@ts-expect-error selected never null if can click*/
                    () => handleRequestReject(selected.id)
                  }
                >
                  Reject Request
                </Button>
                <Button variant="secondary" onClick={() => closeUserSelect()}>
                  Cancel
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Alerts */}
      <Alert
        open={isAddOpen}
        onClose={setAddOpen}
        variant="confirm"
        title="Add User"
        icon={CheckIcon}
        onSubmit={() => handleUserAdd()}
        onCancel={() => console.log("Cancelled")}
        submitText="Add user"
      >
        <p className="text-sm">
          Are you sure you want to add {selectedUserText} to {props.plot.name}?
        </p>
      </Alert>
    </>
  );
};

const TaskDisplay = (props: { id: string }) => {
  const { data } = api.tasks.getTasksByBoard.useQuery<ITaskD[]>({
    boardId: props.id,
    page: 1,
    limit: 10,
  });

  return (
    <>
      <div className="flex items-center">
        <h1 className="pb-2 pt-2 text-lg font-bold text-primary">
          {" "}
          Taskboard:{" "}
        </h1>
      </div>
      {/* Show inner taskboards */}
      <div className="flex items-center">
        {data && data?.length > 0 ? (
          <div className="flex flex-col gap-2">
            {data?.map((task) => (
              <div className="text-sm/6 text-primary" key={task.id}>
                <strong>{task.title}</strong>
                <ul className="flex gap-2" aria-hidden="true">
                  <li>
                    {task.description ? task.description : "No description"}
                  </li>
                  <li aria-hidden="true">&middot;</li>
                  <li>
                    {task.dueDate
                      ? "Due by " + new Date(task.dueDate).toDateString()
                      : "No due date"}
                  </li>
                  <li aria-hidden="true">&middot;</li>
                  <li>
                    {task.status.charAt(0).toUpperCase() +
                      task.status.slice(1).toLowerCase()}
                  </li>
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center">
            <span className="text-sm/6 text-primary">No tasks</span>
          </div>
        )}
      </div>
    </>
  );
};
const RemoveUser = (props: OptionProps) => {
  const [isRemoveOpenUserSelect, setRemoveOpenUserSelect] = useState(false);
  const [isRemoveOpen, setRemoveOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [selectedUserText, setSelectedUserText] = useState(
    "Please select a user",
  );

  function openUserSelect() {
    setRemoveOpenUserSelect(true);
  }

  function closeUserSelect() {
    setSelected(null);
    setRemoveOpenUserSelect(false);
  }

  function showConfirmUserRemove() {
    if (!isRemoveOpen && selected !== null) {
      setSelectedUserText(selected.firstName + " " + selected.lastName);
      setRemoveOpen(true);
    }
  }

  const removeUserMutation = api.plots.unassign.useMutation({
    onSuccess: () => {
      props.refresh();
      closeUserSelect();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleUserRemove = async () => {
    await removeUserMutation.mutateAsync({
      plotId: props.plot._id.toString(),

      // @ts-expect-error already checked for null
      userId: selected.id,
    });
  };

  return (
    <>
      <Button
        size="lg"
        variant="secondary"
        onClick={() => openUserSelect()}
        className="mr-2 rounded-full"
        title="Unassign User From Plot"
      >
        <UserMinusIcon className="size-5 fill-primary" />
      </Button>

      {/** Dialogs for adding/removing members */}
      <Dialog
        open={isRemoveOpenUserSelect}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={() => closeUserSelect()}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-background px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <DialogTitle as="h3" className="text-base font-semibold">
                  Unassign user from {props.plot.name}:
                </DialogTitle>
              </div>

              <ShowUsers
                setter={setSelected}
                getter={selected}
                type="remove"
                plot={props.plot}
              />

              <div className="mt-5 gap-x-2 space-y-2 sm:mt-4 sm:flex sm:flex-row-reverse sm:space-y-0">
                <Button
                  variant="primary"
                  disabled={selected === null}
                  onClick={() => showConfirmUserRemove()}
                >
                  Unassign
                </Button>
                <Button variant="secondary" onClick={() => closeUserSelect()}>
                  Cancel
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/** Alerts */}
      <Alert
        open={isRemoveOpen}
        onClose={setRemoveOpen}
        variant="destructive"
        title="Add User"
        icon={CheckIcon}
        onSubmit={() => handleUserRemove()}
        onCancel={() => console.log("Cancelled")}
        submitText="Yes"
      >
        <p className="text-sm">
          Are you sure you want to unassign {selectedUserText} from{" "}
          {props.plot.name}?
        </p>
      </Alert>
    </>
  );
};

/** Utility component for listing garden members */
const ShowUsers = (props: ShowUsersProps) => {
  const users: User[] =
    props.type === "add"
      ? props.plot.requests.map((request) => ({
        // @ts-expect-error userId is not null
        id: request.userId._id.toString(),
        date: request.sentAt,
        firstName: request.userId.firstName,
        lastName: request.userId.lastName,
        email: request.userId.email,
        message: request.message, // Add message field
      }))
      : props.plot.members.map((member) => ({
        // @ts-expect-error userId is not null
        id: member.userId?._id.toString(),
        date: member.joinedDate,
        firstName: member.userId.firstName,
        lastName: member.userId.lastName,
        email: member.userId.email,
      }));

  // Just list owner and members
  if (props.type === "view") {
    const owner = props.plot.owner;

    if (owner) {
      return (
        <div
          className={
            "" /*"border-b-solid border-radius-4 max-w mx-auto border-t-2 border-primary/60 pb-4"*/
          }
        >
          <h1 className="pb-2 pt-2 text-lg font-bold text-primary">
            {" "}
            Members:{" "}
          </h1>

          <div className="text-sm/6 text-primary">
            <strong>
              {owner.firstName} {owner.lastName}
            </strong>
            <ul className="flex gap-2" aria-hidden="true">
              <li>Owner</li>
              <li aria-hidden="true">&middot;</li>
              <li>{owner.email}</li>
            </ul>
          </div>

          {users?.map((user) => (
            <div className="text-sm/6 text-primary" key={user.id.toString()}>
              <strong>
                {user.firstName} {user.lastName}
              </strong>
              <ul className="flex gap-2" aria-hidden="true">
                <li>
                  Joined at {user.date ? user.date.toDateString() : "unknown"}
                </li>
                <li aria-hidden="true">&middot;</li>
                <li>{user.email}</li>
              </ul>
            </div>
          ))}
        </div>
      );
    }
  }

  if (users.length === 0) {
    return (
      <div className="w-100 mx-auto pt-4">
        <div className="text-center text-base">No users to show</div>
      </div>
    );
  }

  const listboxText =
    props.getter !== null
      ? props.getter.firstName + " " + props.getter.lastName
      : "Please select a user";

  return (
    <div className="w-100 mx-auto pt-4">
      <Listbox value={props.getter} onChange={props.setter}>
        <ListboxButton className="bg-background/5 relative block w-full rounded-lg py-1.5 pl-3 pr-8 text-left text-sm/6 text-primary focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary/25">
          <strong>{listboxText}</strong>
          <ChevronDownIcon
            className="group pointer-events-none absolute right-2.5 top-2.5 size-4 fill-primary/60"
            aria-hidden="true"
          />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className="z-40 w-[var(--button-width)] rounded-xl border border-primary/5 bg-background p-1 transition duration-100 ease-in [--anchor-gap:var(--spacing-1)] focus:outline-none data-[leave]:data-[closed]:opacity-0"
        >
          {users?.map((user) => (
            <ListboxOption
              key={user.id.toString()}
              value={user}
              className="group flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-secondary"
            >
              <CheckIcon className="invisible size-4 fill-primary group-data-[selected]:visible" />
              <div className="text-sm/6 text-primary">
                <strong>
                  {user.firstName} {user.lastName}
                </strong>
                <ul className="flex gap-2" aria-hidden="true">
                  <li>
                    {props.type === "add" ? "Requested" : "Joined"} at{" "}
                    {user.date ? user.date.toDateString() : "unknown"}
                  </li>
                  <li aria-hidden="true">&middot;</li>
                  <li>{user.email}</li>
                </ul>
                {props.type === "add" &&
                  user.message && ( // Display message if type is "add"
                    <p className="mt-1 text-xs text-primary/70">
                      Message: {user.message}
                    </p>
                  )}
              </div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
};

const DeletePlot = (props: OptionProps) => {
  const [open, setOpen] = useState(false);

  const deletePlotMutation = api.plots.delete.useMutation({
    onSuccess: () => {
      props.refresh();
      setOpen(false);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const openAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const handleDelete = async () => {
    // delete the plot
    await deletePlotMutation.mutateAsync({ id: props.plot._id.toString() });
  };

  return (
    <>
      <Alert
        open={open}
        onClose={setOpen}
        variant="destructive"
        title="Delete Listing"
        icon={ExclamationTriangleIcon}
        onSubmit={() => handleDelete()}
        onCancel={() => console.log("Cancelled")}
        submitText="Delete"
      >
        <p className="text-sm">
          Are you sure you want to delete {props.plot.name}?
        </p>
      </Alert>
      <Button
        size="lg"
        variant="secondary"
        onClick={(e) => openAlert(e)}
        className="mr-2 rounded-full"
        title="Delete This Plot"
      >
        <TrashIcon className="size-5 fill-primary" />
      </Button>
    </>
  );
};

const EditPlot = (props: OptionProps) => {
  const queryParams = new URLSearchParams();
  queryParams.append("editing", props.plot._id.toString());

  const router = useRouter();
  const handleEdit = () => {
    router.push("/plots/add-plot?" + queryParams.toString());
    router.refresh();
    props.refresh();
  };

  return (
    <Button
      size="lg"
      variant="secondary"
      onClick={() => handleEdit()}
      className="mr-2 rounded-full"
      title="Edit This Plot"
    >
      <PencilIcon className="size-5 fill-primary" />
    </Button>
  );
};

const GoToTaskboard = (props: { id: string | undefined }) => {
  return (
    <Button
      size="lg"
      variant="secondary"
      href={"/tasks/files"}
      className="mr-2 rounded-full"
      title="Go to Taskboards"
    >
      <FolderIcon className="size-5 fill-primary" />
    </Button>
  );
};
