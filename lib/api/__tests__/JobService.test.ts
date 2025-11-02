import { JobService } from "@/lib/api/services";
import { APIClient, APIRouteBuilder } from "@/lib/api/api-client";

jest.mock("@/lib/api/api-client", () => ({
  APIClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  APIRouteBuilder: jest.fn(() => ({
    r: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue("/mocked/jobs/saved"),
  })),
}));

describe("JobService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve saved jobs successfully", async () => {
    const mockSavedJobs = {
      jobs: [
        { id: "1", title: "Software Engineer" },
        { id: "2", title: "Designer" },
      ],
    };

    (APIClient.get as jest.Mock).mockResolvedValue(mockSavedJobs);

    const result = await JobService.getSavedJobs();

    expect(APIRouteBuilder).toHaveBeenCalledWith("jobs");                                                   // check that the route builder was used correctly
    expect(APIClient.get).toHaveBeenCalledWith("/mocked/jobs/saved");                                       // check that APIClient.get was called with the mocked URL
    expect(result).toEqual(mockSavedJobs);                                                                  // verify the returned data
  });

  it("should create a new job successfully", async () => {
    const mockJobData = { title: "Backend Engineer", description: "Build APIs" };
    const mockCreateResponse = { success: true };

    // customize route builder mock for create
    (APIRouteBuilder as jest.Mock).mockReturnValueOnce({
      r: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue("/mocked/jobs/create"),
    });

    (APIClient.post as jest.Mock).mockResolvedValueOnce(mockCreateResponse);

    const result = await JobService.createJob(mockJobData);

    expect(APIRouteBuilder).toHaveBeenCalledWith("jobs");
    expect(APIClient.post).toHaveBeenCalledWith("/mocked/jobs/create", mockJobData);
    expect(result).toEqual(mockCreateResponse);
  });

  it("should update a job successfully", async () => {
    const mockJobId = "123";
    const mockUpdateData = { title: "Updated Title" };
    const mockUpdateResponse  = { success: true };

    (APIRouteBuilder as jest.Mock).mockReturnValueOnce({
      r: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue(`/mocked/jobs/${mockJobId}/update`),
    });

    (APIClient.put as jest.Mock).mockResolvedValueOnce(mockUpdateResponse );

    const result = await JobService.updateJob(mockJobId, mockUpdateData);

    expect(APIRouteBuilder).toHaveBeenCalledWith("jobs");
    expect(APIClient.put).toHaveBeenCalledWith(`/mocked/jobs/${mockJobId}/update`, mockUpdateData);
    expect(result).toEqual(mockUpdateResponse );
  });
});
