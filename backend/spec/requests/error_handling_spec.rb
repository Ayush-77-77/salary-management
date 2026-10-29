require "rails_helper"

RSpec.describe ErrorHandling, type: :request do
  let(:user) { create(:user) }

  it "returns 404 with a JSON error for a missing record" do
    get "/api/v1/employees/0", headers: auth_headers(user)

    expect(response).to have_http_status(:not_found)
    expect(response.parsed_body).to eq("errors" => [ "Employee not found" ])
  end

  it "returns 422 with validation messages for an invalid record" do
    post "/api/v1/employees", params: { employee: { full_name: "" } }, headers: auth_headers(user)

    expect(response).to have_http_status(:unprocessable_content)
    expect(response.parsed_body["errors"]).to include("Full name can't be blank")
  end

  it "returns 400 when the required root param is missing" do
    post "/api/v1/employees", params: {}, headers: auth_headers(user)

    expect(response).to have_http_status(:bad_request)
    expect(response.parsed_body["errors"].first).to include("employee")
  end
end
