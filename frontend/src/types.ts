export interface Checklist {
  id: string;
  name: string;
  items: Item[];
}

export interface Item {
  id: string;
  name: string;
  isChecked: boolean;
  checklist: { id: string };
}
