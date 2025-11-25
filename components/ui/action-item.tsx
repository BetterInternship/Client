import { LucideIcon } from "lucide-react";

/**
 * An ActionItem is a button that performs some action.
 * An example is a button that deletes an applicant from a list.
 * @param id Identifier for internal use.
 * @param label Text label that describes the button.
 * @param icon (optional) An icon accompanying the text label that describes the button.
 * @param onClick A function that performs some action upon clicking the button.
 * @param active (optional) Track if the item is active.
 * @param disabled (optional) Conditionally disable the button.
 * @param destructive (optional) Descriptor of an action like "delete" that should be highlighted to emphasize its destructive nature.
 * @param highlighted (optional) Emphasize a button if it corresponds to a current state, such as an active filter.
 * @param highlightColor (optional) Specify a color for the highlighted button.
 */
export type ActionItem = {
  id: string;
  label?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  highlighted?: boolean;
  highlightColor?: string;
};
