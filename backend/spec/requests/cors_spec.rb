require "rails_helper"

RSpec.describe "CORS", type: :request do
  it "allows the configured frontend origin" do
    options "/api/v1/auth/login", headers: {
      "Origin" => "http://localhost:5173",
      "Access-Control-Request-Method" => "POST"
    }

    expect(response.headers["Access-Control-Allow-Origin"]).to eq("http://localhost:5173")
  end

  it "does not allow other origins" do
    options "/api/v1/auth/login", headers: {
      "Origin" => "https://evil.example",
      "Access-Control-Request-Method" => "POST"
    }

    expect(response.headers["Access-Control-Allow-Origin"]).to be_nil
  end
end
