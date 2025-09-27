import { useGlobalModal } from "@/components/providers/ModalProvider";
import { useApplications } from "@/lib/api/student.api";
import { Job, PublicUser } from "@/lib/db/db.types";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuthContext } from "@/lib/ctx-auth";
import { useQueryClient } from "@tanstack/react-query";
import { IncompleteProfileContent } from "@/components/modals/IncompleteProfileModal";
import { isProfileBaseComplete, isProfileResume, isProfileVerified } from "@/lib/profile";

// ! todo: rmove openAppModal and use openGlobalModal instead
export const ApplyToJobButton = ({ profile, job, openAppModal }: { profile: PublicUser | null, job: Job, openAppModal: () => void }) => {
	const auth = useAuthContext();
	const applications = useApplications();
	const queryClient = useQueryClient();
	const { open: openGlobalModal, close: closeGlobalModal } = useGlobalModal();

	/**
	 * Opens the modal for completing incomplete profile
	 * 
	 * @returns 
	 */
	const openIncompleteProfileModal = () => openGlobalModal(
		"incomplete-profile",
		<IncompleteProfileContent
			handleClose={() => closeGlobalModal("incomplete-profile")}
		/>,
		{
			allowBackdropClick: false,
			onClose: () => {
				queryClient.invalidateQueries({ queryKey: ["my-profile"] });
			},
		}
	);

	/**
	 * Handles apply checks
	 * 
	 * @returns 
	 */
	const handleApply = () => {
		if (!profile || !auth.isAuthenticated()) {
			window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
			return;
		}

		if (
			!isProfileResume(profile) ||
			!isProfileBaseComplete(profile) ||
			!isProfileVerified(profile)
		) {
			return openIncompleteProfileModal();
		}

		const applied = applications.appliedJob(job.id ?? "");
		if (applied) {
			alert("You have already applied to this job!");
			return;
		}

		openAppModal();
	}

	return (
		<Button
			disabled={applications.appliedJob(job.id ?? "")}
			scheme={
				applications.appliedJob(job.id ?? "")
					? "supportive"
					: "primary"
			}
			size={"md"}
			onClick={() =>
				!applications.appliedJob(job.id ?? "") &&
				handleApply()
			}
		>
			{applications.appliedJob(job.id ?? "") && (
				<CheckCircle className="w-4 h-4" />
			)}
			{applications.appliedJob(job.id ?? "")
				? "Applied"
				: "Apply Now"}
		</Button>
	)
}
