require "rails_helper"

RSpec.describe Seeds::EmployeeSeeder do
  def seed(count: 200, seed: 42)
    described_class.new(count:, seed:).call
  end

  def snapshot
    Employee.order(:email).pluck(:full_name, :email, :job_title, :salary, :hire_date)
  end

  it "creates the countries, departments and the requested number of employees" do
    seed

    expect(Country.pluck(:code)).to contain_exactly("US", "IN", "GB", "DE", "CA", "BR", "SG", "AU")
    expect(Department.count).to eq(8)
    expect(Employee.count).to eq(200)
  end

  it "only creates employees that pass model validations" do
    seed

    expect(Employee.includes(:country, :department).reject(&:valid?)).to be_empty
  end

  it "produces the same data for the same seed" do
    seed
    first_run = snapshot
    Employee.delete_all

    seed

    expect(snapshot).to eq(first_run)
  end

  it "produces different data for a different seed" do
    seed(seed: 1)
    first_run = snapshot
    Employee.delete_all

    seed(seed: 2)

    expect(snapshot).not_to eq(first_run)
  end

  it "does not duplicate anything when run again" do
    seed
    seed

    expect(Country.count).to eq(8)
    expect(Department.count).to eq(8)
    expect(Employee.count).to eq(200)
  end

  it "pays in local currency scale, so the same role earns more INR than USD" do
    seed(count: 500)

    india_average = Employee.joins(:country).where(countries: { code: "IN" }).average(:salary)
    us_average = Employee.joins(:country).where(countries: { code: "US" }).average(:salary)

    expect(india_average).to be > us_average * 10
  end
end
