"use client";
import { useEffect } from "react";
import { useModal } from "@/hooks/use-modal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus,Shield, } from "lucide-react";
import ContentLayout from "@/components/features/hire/content-layout";

interface UserData {
  id: number;
  email: string;
  role: string;
  dateAdded: string;
  status: string;
}

export default function AddUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([
    {
      id: 1,
      email: "john.smith@google.com",
      role: "Admin",
      dateAdded: "May 15, 2025",
      status: "Active",
    },
    {
      id: 2,
      email: "sarah.j@google.com",
      role: "Recruiter",
      dateAdded: "May 10, 2025",
      status: "Active",
    },
    {
      id: 3,
      email: "m.chen@google.com",
      role: "Recruiter",
      dateAdded: "May 5, 2025",
      status: "Active",
    },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<UserData>>({});
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ email: "", role: "Recruiter",});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { open, close, Modal } = useModal("add-user-modal", { // add user modal
    onClose: () => setNewUser({ email: "", role: "Recruiter" }),
  });

  const { open: openRemoveConfirm, close: closeRemoveConfirm, Modal: RemoveConfirmModal } = useModal("remove-user-confirm-modal"); // remove user confirmation mmodal

  const handleInviteUser = () => {
    if (newUser.email) {
      const user: UserData = {
        id: users.length + 1,
        email: newUser.email,
        role: newUser.role,
        dateAdded: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        status: "Active",
      };
      setUsers([...users, user]);
      setNewUser({ email: "", role: "Recruiter" });
    }
    close()
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  // const handleEditUser = (user: UserData) => {
  //   setEditingId(user.id);
  //   setEditingUser({ ...user });
  // };

  // const handleSaveEdit = () => {
  //   setUsers(
  //     users.map((user) =>
  //       user.id === editingId ? ({ ...user, ...editingUser } as UserData) : user
  //     )
  //   );
  //   setEditingId(null);
  //   setEditingUser({});
  // };

  return (
    <ContentLayout>
      <div className="h-screen w-full bg-white flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div></div>
            </div>


            <div className="bg-transparent w-full max-w-6xl mx-auto px-6">
              <div className="flex justify-end mb-6">
                {true && ( //change conditional to check api call if user is employee or not
                  <Button onClick={open}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Account
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden max-w-6xl mx-auto px-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[65rem]">
                  <div className="flex justify-end mb-6">
                  </div>
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-800">
                        Email
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-800">
                        Role
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-800">
                        Date Added
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <span className="text-gray-600">{user.email}</span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.role === "Admin"
                              ? "bg-purple-100 text-purple-700"
                              : user.role === "Recruiter"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            <Shield className="h-3 w-3" />
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{user.dateAdded}</td>

                        <td className="p-4 text-right relative">
                          {true && (
                            <button
                              className="text-gray-400 hover:text-gray-600 dropdown-container"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDropdownOpen(user.id);
                              }}
                            >
                              ...
                            </button>
                          )}

                          {dropdownOpen === user.id && (
                            <div className="absolute right-4 top-4 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setDropdownOpen(null);
                                  setSelectedUserEmail(user.email);
                                  openRemoveConfirm();
                                }}
                              >
                                Remove from company
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>


        </div>
      </div>
      
      <Modal className="w-full max-w-5xl min-w-[35rem] rounded-lg">
        <div className="-mt-17 p-5">
          <h3 className="text-lg font-semibold mb-4">Add person to Company</h3>
          <div className="space-y-0">
            <div>
              <Label htmlFor="modal-email">Email</Label>
              <Input
                id="modal-email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="random@company.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Role</Label>
              <div className="flex items-center gap-4 mt-1">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="radio"
                    name="role"
                    checked={newUser.role === "Recruiter"}
                    onChange={() => setNewUser({ ...newUser, role: "Recruiter" })}
                    className="w-4 h-4"
                  />
                  Recruiter
                </label>
                <label className="flex items-center gap-2  text-xs">
                  <input
                    type="radio"
                    name="role"
                    checked={newUser.role === "Admin"}
                    onChange={() => setNewUser({ ...newUser, role: "Admin" })}
                    className="w-4 h-4"
                  />
                  Admin
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                close();
                setNewUser({ email: "", role: "Recruiter" });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleInviteUser}>
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>

      <RemoveConfirmModal className="w-full max-w-md min-w-[35rem] rounded-lg">
        <div className="p-6">
          <div className="mb-0">
            Do you want to remove <span className="text-lg font-bold text-center">{selectedUserEmail}</span> from the company?
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                closeRemoveConfirm();
                setSelectedUserEmail(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (selectedUserEmail) {
                  const user = users.find(u => u.email === selectedUserEmail);
                  if (user) handleDeleteUser(user.id);
                }
                closeRemoveConfirm();
                setSelectedUserEmail(null);

              }}
            >
              Yes
            </Button>
          </div>
        </div>
      </RemoveConfirmModal>
    </ContentLayout>
  );
}
