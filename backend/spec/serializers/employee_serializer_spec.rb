require "rails_helper"

RSpec.describe EmployeeSerializer do
  it "renders the employee with its country and department" do
    country = create(:country, name: "India", code: "IN", currency: "INR")
    department = create(:department, name: "Engineering")
    employee = create(:employee, full_name: "Asha Rao", country:, department:, salary: "2400000.50")

    json = JSON.parse(described_class.render(employee))

    expect(json).to include("id" => employee.id, "full_name" => "Asha Rao", "salary" => "2400000.5")
    expect(json["country"]).to eq("id" => country.id, "name" => "India", "code" => "IN", "currency" => "INR")
    expect(json["department"]).to eq("id" => department.id, "name" => "Engineering")
  end
end
