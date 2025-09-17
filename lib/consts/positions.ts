export type SubOption = { name: string; value: string };
export type PositionCategory = { name: string; value: string; children?: SubOption[] };

export const POSITION_TREE: PositionCategory[] = [
  {
    name: "Computer Science",
    value: "1e3b7585-293b-430a-a5cb-c773e0639bb0",
    children: [
      { name: "Data Science/AI", value: "dc3780b4-b9c0-4294-a035-faa4e2086611" },
      { name: "Cybersecurity", value: "ca8ae32d-55a8-4ded-9cfe-1582d72cbaf1" },
      { name: "Full Stack", value: "381239bf-7c82-4f87-a1b8-39d952f8876b" },
      { name: "Backend", value: "e5a73819-ee90-43fb-b71b-7ba12f0a4dbf" },
      { name: "Frontend", value: "8b323584-9340-41e8-928e-f9345f1ad59e" },
      { name: "QA", value: "91b180be-3d23-4f0a-bd64-c82cef9d3ae5" },
    ],
  },
  {
    name: "Business",
    value: "0fb4328b-4163-458b-8ac7-8ab3861e1ad6",
    children: [
      { name: "Accounting/Finance", value: "6506ab1d-f1a6-4c6f-a917-474a96e6d2bb" },
      { name: "HR/Administrative", value: "976d7433-8297-4f8d-950d-3392682dadbb" },
      { name: "Marketing/Sales", value: "1f6ab152-9754-4082-9fc2-4b276f5a9ef9" },
      { name: "Business Development", value: "25bce220-1927-48c0-8e81-6be4af64d9b9" },
      { name: "Operations", value: "61727f3b-dc36-458c-a487-5c44b5cd83a5" },
    ],
  },
  { name: "Engineering", value: "ab93abaf-c117-4482-9594-8bfecec44f69" },
  {
    name: "Others",
    value: "0debeda8-f257-49a6-881f-11a6b8eb560b",
    children: [
      { name: "Legal", value: "79161041-5009-4e66-84d2-a88357301427" },
      { name: "Research", value: "31a39059-1050-4f22-8875-5b903b7db3bf" },
      { name: "Graphic Design", value: "f50b009d-5ed7-4ef1-851a-3fcf5d6572aa" },
    ],
  },
];
