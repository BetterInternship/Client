import { ModalComponent, ModalHandle } from "@/hooks/use-modal";
import { Button } from "../ui/button";
import { RefObject, useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";

export const MassApplyModal = ({
	ref,
	initialText,
  disabled,
	onCancel,
	onSubmit,
}: {
	ref?: RefObject<ModalHandle | null>;
	initialText?: string;
  disabled?: boolean;
	onCancel: () => void;
	onSubmit: (text: string) => void;
}) => {
	const [text, setText] = useState(initialText);

	useEffect(() => {
		setText(initialText || "");
	}, [initialText]);

	return (
		<ModalComponent ref={ref}>
			<div className="max-w-lg mx-auto p-6 space-y-4">
				<h2 className="text-xl font-semibold">Apply to selected jobs</h2>
				<p className="text-sm text-gray-600">
					One cover letter will be used for all selected jobs. We’ll skip any
					postings that require info your profile doesn’t have.
				</p>

				<Textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					className="w-full h-32"
					maxLength={1000}
					placeholder="Write a brief cover letter…"
				/>

				<div className="flex items-center justify-between">
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={() => onSubmit(text ?? '')}
						disabled={disabled}
					>
						{disabled ? "Submitting…" : "Submit applications"}
					</Button>
				</div>
			</div>
		</ModalComponent>
	);
};
