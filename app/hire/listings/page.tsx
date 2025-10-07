"use client";

import { useOwnedJobs, useProfile } from "@/hooks/use-employer-api";
import ContentLayout from "@/components/features/hire/content-layout";
import { ShowUnverifiedBanner } from "@/components/ui/banner";
import { useListingsBusinessLogic } from "@/hooks/hire/listings/use-listings-business-logic";
import {
  ListingsSearchBar,
  ListingsJobPanel,
  ListingsDetailsPanel,
  ListingsDeleteModal,
} from "@/components/features/hire/listings";

export default function MyListings() {
  // Get data from employer API hooks
  const { data: profile, loading: profileLoading } = useProfile();
  const { ownedJobs, update_job, delete_job } = useOwnedJobs();

  // Business logic hook
  const {
    selectedJob,
    searchTerm,
    saving,
    isEditing,
    jobsPage,
    jobsPageSize,
    filteredJobs,
    setSearchTerm,
    handleKeyPress,
    handleJobSelect,
    handleEditStart,
    handleSave,
    handleCancel,
    handleShare,
    clearSelectedJob,
    handlePageChange,
    openDeleteModal,
    closeDeleteModal,
    DeleteModal,
    setIsEditing,
  } = useListingsBusinessLogic(ownedJobs);

  return (
    <ContentLayout>
      <>
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Unverified Banner */}
          {!profileLoading && !profile?.is_verified && (
            <div className="p-6 pb-0">
              <ShowUnverifiedBanner />
            </div>
          )}
          {/* Content Area */}
          <div className="flex-1 p-6 flex gap-6 overflow-hidden">
            {/* Left Panel - Job List */}
            <div className="w-96 flex flex-col">
              {/* Search Bar */}
              <ListingsSearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onKeyPress={handleKeyPress}
                //onCreateJob={openCreateModal}
              />

              {/* Job Panel */}
              <ListingsJobPanel
                jobs={filteredJobs}
                selectedJobId={selectedJob?.id}
                isEditing={isEditing}
                jobsPage={jobsPage}
                jobsPageSize={jobsPageSize}
                onJobSelect={handleJobSelect}
                onPageChange={handlePageChange}
                updateJob={update_job}
                set_is_editing={setIsEditing}
              />
            </div>

            {/* Right Panel - Job Details */}
            <div className="flex-1 overflow-y-auto">
              <ListingsDetailsPanel
                selectedJob={selectedJob}
                isEditing={isEditing}
                saving={saving}
                onEdit={handleEditStart}
                onSave={handleSave}
                onCancel={handleCancel}
                onShare={handleShare}
                onDelete={openDeleteModal}
                updateJob={update_job}
                setIsEditing={setIsEditing}
              />
            </div>
          </div>
        </div>

        {/* Delete Job Modal */}
        <DeleteModal>
          <ListingsDeleteModal
            job={selectedJob}
            deleteJob={delete_job}
            clearJob={clearSelectedJob}
            close={closeDeleteModal}
          />
        </DeleteModal>
      </>
    </ContentLayout>
  );
}
