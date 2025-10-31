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

    // check that the route builder was used correctly
    expect(APIRouteBuilder).toHaveBeenCalledWith("jobs");

    // check that APIClient.get was called with the mocked URL
    expect(APIClient.get).toHaveBeenCalledWith("/mocked/jobs/saved");

    // verify the returned data
    expect(result).toEqual(mockSavedJobs);
  });
});
