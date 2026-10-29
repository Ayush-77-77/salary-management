require "rails_helper"

RSpec.describe "Api::V1 lookups", type: :request do
  let(:headers) { auth_headers(create(:user)) }

  it "lists countries alphabetically with their currency" do
    create(:country, name: "United States", code: "US", currency: "USD")
    india = create(:country, name: "India", code: "IN", currency: "INR")

    get "/api/v1/countries", headers: headers

    expect(response.parsed_body["countries"].first).to eq(
      "id" => india.id, "name" => "India", "code" => "IN", "currency" => "INR"
    )
  end

  it "lists departments alphabetically" do
    create(:department, name: "Sales")
    create(:department, name: "Engineering")

    get "/api/v1/departments", headers: headers

    expect(response.parsed_body["departments"].map { |department| department["name"] }).to eq(%w[Engineering Sales])
  end

  it "lists distinct job titles alphabetically" do
    create(:employee, job_title: "Software Engineer")
    create(:employee, job_title: "Software Engineer")
    create(:employee, job_title: "Account Executive")

    get "/api/v1/job_titles", headers: headers

    expect(response.parsed_body["job_titles"]).to eq([ "Account Executive", "Software Engineer" ])
  end

  it "requires authentication" do
    get "/api/v1/countries"

    expect(response).to have_http_status(:unauthorized)
  end
end
