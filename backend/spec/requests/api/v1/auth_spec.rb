require "rails_helper"

RSpec.describe "Api::V1::Auth", type: :request do
  let!(:user) { create(:user, email: "hr@acme.test", password: "password123") }

  before { Rails.cache.clear }

  describe "POST /api/v1/auth/login" do
    it "returns a token and the user for valid credentials" do
      post "/api/v1/auth/login", params: { email: "HR@acme.test", password: "password123" }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["user"]).to eq("id" => user.id, "email" => "hr@acme.test")
      expect(JsonWebToken.decode(response.parsed_body["token"])).to include("user_id" => user.id)
    end

    it "rejects a wrong password" do
      post "/api/v1/auth/login", params: { email: "hr@acme.test", password: "wrong-password" }

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["errors"]).to eq([ "Invalid email or password" ])
    end

    it "rejects an unknown email with the same error" do
      post "/api/v1/auth/login", params: { email: "nobody@acme.test", password: "password123" }

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["errors"]).to eq([ "Invalid email or password" ])
    end

    it "blocks further attempts after 10 logins in a minute" do
      10.times { post "/api/v1/auth/login", params: { email: "hr@acme.test", password: "wrong-password" } }

      post "/api/v1/auth/login", params: { email: "hr@acme.test", password: "password123" }

      expect(response).to have_http_status(:too_many_requests)
      expect(response.parsed_body["errors"]).to eq([ "Too many login attempts. Try again later." ])
    end
  end

  describe "GET /api/v1/auth/me" do
    it "returns the current user for a valid token" do
      get "/api/v1/auth/me", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["user"]["email"]).to eq("hr@acme.test")
    end

    it "rejects a request without a token" do
      get "/api/v1/auth/me"

      expect(response).to have_http_status(:unauthorized)
    end

    it "rejects an expired token" do
      token = JsonWebToken.encode({ user_id: user.id }, 1.minute.ago)

      get "/api/v1/auth/me", headers: { "Authorization" => "Bearer #{token}" }

      expect(response).to have_http_status(:unauthorized)
    end

    it "rejects a token for a user that no longer exists" do
      headers = auth_headers(user)
      user.destroy

      get "/api/v1/auth/me", headers: headers

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
