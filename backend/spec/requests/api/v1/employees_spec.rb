require "rails_helper"

RSpec.describe "Api::V1::Employees", type: :request do
  let(:user) { create(:user) }
  let!(:headers) { auth_headers(user) }
  let(:country) { create(:country, name: "India", code: "IN", currency: "INR") }
  let(:department) { create(:department, name: "Engineering") }

  let(:valid_attributes) do
    {
      full_name: "Asha Rao",
      email: "asha@acme.test",
      job_title: "Software Engineer",
      country_id: country.id,
      department_id: department.id,
      salary: "2400000",
      hire_date: "2021-03-01"
    }
  end

  it "requires authentication" do
    get "/api/v1/employees"

    expect(response).to have_http_status(:unauthorized)
  end

  describe "GET /api/v1/employees" do
    it "returns a page of employees with pagination meta" do
      create_list(:employee, 3, country:, department:)

      get "/api/v1/employees", params: { per_page: 2 }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["employees"].size).to eq(2)
      expect(response.parsed_body["meta"]).to eq("page" => 1, "per_page" => 2, "total_count" => 3, "total_pages" => 2)
    end

    it "passes search params through" do
      other_country = create(:country)
      create(:employee, full_name: "Asha Rao", country:)
      create(:employee, full_name: "Bob Smith", country: other_country)

      get "/api/v1/employees", params: { q: { country_id_eq: country.id } }, headers: headers

      expect(response.parsed_body["employees"].map { |employee| employee["full_name"] }).to eq([ "Asha Rao" ])
    end

    it "ignores a search param that is not a hash" do
      create(:employee, country:, department:)

      get "/api/v1/employees", params: { q: "asha" }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["meta"]["total_count"]).to eq(1)
    end

    it "runs the same number of queries regardless of page size" do
      create_list(:employee, 2)
      small_page = count_queries { get "/api/v1/employees", headers: headers }

      create_list(:employee, 8)
      large_page = count_queries { get "/api/v1/employees", headers: headers }

      expect(large_page).to eq(small_page)
    end
  end

  describe "GET /api/v1/employees/:id" do
    it "returns the employee" do
      employee = create(:employee, country:)

      get "/api/v1/employees/#{employee.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["employee"]).to include("id" => employee.id, "full_name" => employee.full_name)
      expect(response.parsed_body["employee"]["country"]).to include("name" => "India", "currency" => "INR")
    end
  end

  describe "POST /api/v1/employees" do
    it "creates an employee" do
      expect {
        post "/api/v1/employees", params: { employee: valid_attributes }, headers: headers
      }.to change(Employee, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.parsed_body["employee"]).to include("full_name" => "Asha Rao", "salary" => "2400000.0")
    end

    it "returns validation errors and creates nothing" do
      expect {
        post "/api/v1/employees", params: { employee: valid_attributes.merge(salary: "-5", country_id: 0) }, headers: headers
      }.not_to change(Employee, :count)

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["errors"]).to include("Salary must be greater than 0", "Country must exist")
    end

    it "ignores attributes that are not permitted" do
      post "/api/v1/employees", params: { employee: valid_attributes.merge(id: 999_999) }, headers: headers

      expect(Employee.last.id).not_to eq(999_999)
    end
  end

  describe "PATCH /api/v1/employees/:id" do
    let(:employee) { create(:employee, salary: 50_000) }

    it "updates the employee" do
      patch "/api/v1/employees/#{employee.id}", params: { employee: { salary: "55000" } }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(employee.reload.salary).to eq(55_000)
    end

    it "returns validation errors and keeps the old value" do
      patch "/api/v1/employees/#{employee.id}", params: { employee: { salary: "0" } }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(employee.reload.salary).to eq(50_000)
    end
  end

  describe "DELETE /api/v1/employees/:id" do
    it "deletes the employee" do
      employee = create(:employee)

      expect {
        delete "/api/v1/employees/#{employee.id}", headers: headers
      }.to change(Employee, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "returns 404 for an unknown employee" do
      delete "/api/v1/employees/0", headers: headers

      expect(response).to have_http_status(:not_found)
    end
  end
end
