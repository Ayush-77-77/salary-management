require "rails_helper"

RSpec.describe "Api::V1::Insights", type: :request do
  let(:headers) { auth_headers(create(:user)) }
  let(:india) { create(:country, name: "India", code: "IN", currency: "INR") }

  before { create(:employee, country: india, job_title: "Software Engineer", salary: 2_000_000) }

  it "requires authentication" do
    get "/api/v1/insights/summary"

    expect(response).to have_http_status(:unauthorized)
  end

  describe "GET /api/v1/insights/summary" do
    it "returns the org summary" do
      get "/api/v1/insights/summary", headers: headers

      expect(response.parsed_body["summary"]).to eq("total_employees" => 1, "total_countries" => 1, "total_departments" => 1)
    end
  end

  describe "GET /api/v1/insights/countries" do
    it "returns stats per country" do
      get "/api/v1/insights/countries", headers: headers

      expect(response.parsed_body["countries"].first).to include("name" => "India", "currency" => "INR", "headcount" => 1)
    end
  end

  describe "GET /api/v1/insights/job_titles" do
    it "returns the country and stats per job title" do
      get "/api/v1/insights/job_titles", params: { country_id: india.id }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["country"]).to include("name" => "India", "currency" => "INR")
      expect(response.parsed_body["job_titles"].first).to include("job_title" => "Software Engineer", "headcount" => 1)
    end

    it "returns 400 without a country_id" do
      get "/api/v1/insights/job_titles", headers: headers

      expect(response).to have_http_status(:bad_request)
    end

    it "returns 404 for an unknown country" do
      get "/api/v1/insights/job_titles", params: { country_id: 0 }, headers: headers

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body["errors"]).to eq([ "Country not found" ])
    end
  end
end
