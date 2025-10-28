import { LucideIcon } from "lucide-react";

/**
 * An ActionItem is a button that performs some action.
 * An example is a button that deletes an applicant from a list.
 * @param id Identifier for internal use.
 * @param label Text label that describes the button.
 * @param icon (optional) An icon accompanying the text label that describes the button.
 * @param onClick A function that performs some action upon clicking the button.
 * @param disabled (optional) Conditionally disable the button.
 * @param destructive (optional) Descriptor of an action like "delete" that should be highlighted to emphasize its destructive nature.
 */
export type ActionItem = {
    id: string;
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    disabled?: boolean;
    destructive?: boolean;
};