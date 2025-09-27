import { useAuthContext } from "@/lib/ctx-auth";
import { useSavedJobs } from "@/lib/api/student.api";
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react";
import { Job } from "@/lib/db/db.types";
import { cn } from "@/lib/utils";

export const SaveJobButton = ({ job }: { job: Job }) => {
	const auth = useAuthContext();
	const savedJobs = useSavedJobs();

	const handleSave = async () => {
		if (!auth.isAuthenticated()) {
			window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
			return;
		}
		await savedJobs.toggle(job.id ?? "");
	};
	
	return (
		<Button
			variant="outline"
			onClick={() => handleSave()}
			size={"md"}
			className="text-md"
			scheme={
				savedJobs.isJobSaved(job.id ?? "")
					? "destructive"
					: "default"
			}
		>
			<Heart
				className={cn(
					"w-4 h-4",
					savedJobs.isJobSaved(job.id ?? "")
						? "fill-current"
						: ""
				)}
			/>
			{savedJobs.isJobSaved(job.id ?? "")
				? savedJobs.isToggling
					? "Unsaving..."
					: "Saved"
				: savedJobs.isToggling
				? "Saving..."
				: "Save"}
		</Button>
	)
}
