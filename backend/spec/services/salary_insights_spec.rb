require "rails_helper"

RSpec.describe SalaryInsights do
  let(:india) { create(:country, name: "India", code: "IN", currency: "INR") }
  let(:usa) { create(:country, name: "United States", code: "US", currency: "USD") }
  let(:engineering) { create(:department, name: "Engineering") }
  let(:sales) { create(:department, name: "Sales") }

  before do
    create(:employee, country: india, department: engineering, job_title: "Software Engineer", salary: 2_000_000)
    create(:employee, country: india, department: engineering, job_title: "Software Engineer", salary: 3_000_000)
    create(:employee, country: india, department: sales, job_title: "Account Executive", salary: 1_000_000)
    create(:employee, country: usa, department: engineering, job_title: "Software Engineer", salary: 100_000)
    create(:employee, country: usa, department: engineering, job_title: "Software Engineer", salary: 150_001)
  end

  describe ".summary" do
    it "counts employees and the countries and departments they belong to" do
      create(:department, name: "Unused")

      expect(described_class.summary).to eq(total_employees: 5, total_countries: 2, total_departments: 2)
    end
  end

  describe ".by_country" do
    it "returns headcount and salary stats per country in local currency, sorted by name" do
      expect(described_class.by_country).to eq([
        { country_id: india.id, name: "India", code: "IN", currency: "INR",
          headcount: 3, min_salary: 1_000_000, max_salary: 3_000_000, average_salary: 2_000_000 },
        { country_id: usa.id, name: "United States", code: "US", currency: "USD",
          headcount: 2, min_salary: 100_000, max_salary: 150_001, average_salary: BigDecimal("125000.50") }
      ])
    end

    it "returns an empty list when there are no employees" do
      Employee.delete_all

      expect(described_class.by_country).to eq([])
    end
  end

  describe ".by_job_title" do
    it "returns stats per job title within the country, highest average first" do
      expect(described_class.by_job_title(india)).to eq([
        { job_title: "Software Engineer", headcount: 2, min_salary: 2_000_000, max_salary: 3_000_000, average_salary: 2_500_000 },
        { job_title: "Account Executive", headcount: 1, min_salary: 1_000_000, max_salary: 1_000_000, average_salary: 1_000_000 }
      ])
    end

    it "never mixes in salaries from other countries" do
      engineers = described_class.by_job_title(usa)

      expect(engineers).to contain_exactly(include(job_title: "Software Engineer", headcount: 2, max_salary: 150_001))
    end
  end
end
