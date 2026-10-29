require "rails_helper"

RSpec.describe Employee, type: :model do
  subject { build(:employee) }

  describe "associations" do
    it { is_expected.to belong_to(:country) }
    it { is_expected.to belong_to(:department) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:full_name) }
    it { is_expected.to validate_presence_of(:job_title) }
    it { is_expected.to validate_presence_of(:hire_date) }
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).ignoring_case_sensitivity }
    it { is_expected.to validate_numericality_of(:salary).is_greater_than(0) }

    it "rejects an invalid email" do
      expect(build(:employee, email: "not-an-email")).not_to be_valid
    end

    it "rejects a hire date in the future" do
      employee = build(:employee, hire_date: Date.current + 1)

      expect(employee).not_to be_valid
      expect(employee.errors[:hire_date]).to include("can't be in the future")
    end

    it "accepts a hire date of today" do
      expect(build(:employee, hire_date: Date.current)).to be_valid
    end
  end

  describe "normalization" do
    it "downcases the email and squishes name and job title" do
      employee = build(:employee, email: " Jane.Doe@ACME.test ", full_name: " Jane   Doe ", job_title: " Data  Analyst")

      expect(employee.email).to eq("jane.doe@acme.test")
      expect(employee.full_name).to eq("Jane Doe")
      expect(employee.job_title).to eq("Data Analyst")
    end
  end

  describe "#currency" do
    it "comes from the employee's country" do
      india = build(:country, name: "India", code: "IN", currency: "INR")

      expect(build(:employee, country: india).currency).to eq("INR")
    end
  end

  it "keeps the exact salary value without float rounding" do
    employee = create(:employee, salary: "123456.78")

    expect(employee.reload.salary).to eq(BigDecimal("123456.78"))
  end
end
