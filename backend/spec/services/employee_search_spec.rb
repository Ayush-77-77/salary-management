require "rails_helper"

RSpec.describe EmployeeSearch do
  let(:india) { create(:country, name: "India", code: "IN", currency: "INR") }
  let(:usa) { create(:country, name: "United States", code: "US", currency: "USD") }
  let(:engineering) { create(:department, name: "Engineering") }
  let(:sales) { create(:department, name: "Sales") }

  let!(:asha) do
    create(:employee, full_name: "Asha Rao", email: "asha@acme.test", country: india, department: engineering,
                      job_title: "Software Engineer", salary: 2_400_000, hire_date: Date.new(2021, 3, 1))
  end
  let!(:bob) do
    create(:employee, full_name: "Bob Smith", email: "bob@acme.test", country: usa, department: sales,
                      job_title: "Account Executive", salary: 90_000, hire_date: Date.new(2019, 6, 1))
  end
  let!(:carla) do
    create(:employee, full_name: "Carla Diaz", email: "carla@acme.test", country: usa, department: engineering,
                      job_title: "Software Engineer", salary: 150_000, hire_date: Date.new(2023, 1, 10))
  end

  def search(query = {}, pagination = {})
    described_class.new(query:, **pagination).call
  end

  it "returns everyone sorted by name by default" do
    expect(search).to eq([ asha, bob, carla ])
  end

  describe "filters" do
    it "filters by country" do
      expect(search(country_id_eq: usa.id)).to contain_exactly(bob, carla)
    end

    it "filters by department" do
      expect(search(department_id_eq: engineering.id)).to contain_exactly(asha, carla)
    end

    it "filters by job title" do
      expect(search(job_title_eq: "Software Engineer")).to contain_exactly(asha, carla)
    end

    it "combines filters" do
      expect(search(country_id_eq: usa.id, department_id_eq: engineering.id)).to eq([ carla ])
    end
  end

  describe "search" do
    it "matches part of the name, ignoring case" do
      expect(search(full_name_or_email_i_cont: "smi")).to eq([ bob ])
    end

    it "matches the email" do
      expect(search(full_name_or_email_i_cont: "carla@")).to eq([ carla ])
    end

    it "treats SQL wildcards as plain text" do
      expect(search(full_name_or_email_i_cont: "%")).to be_empty
    end
  end

  describe "sorting" do
    it "sorts by salary descending" do
      expect(search(s: "salary desc")).to eq([ asha, carla, bob ])
    end

    it "sorts by hire date ascending" do
      expect(search(s: "hire_date asc")).to eq([ bob, asha, carla ])
    end

    it "falls back to name for a column that is not sortable" do
      expect(search(s: "email desc")).to eq([ asha, bob, carla ])
    end
  end

  describe "pagination" do
    it "returns the requested page with the total count" do
      result = search({}, page: 2, per_page: 2)

      expect(result).to eq([ carla ])
      expect(result.total_count).to eq(3)
      expect(result.total_pages).to eq(2)
    end

    it "counts only the filtered records" do
      expect(search(country_id_eq: usa.id).total_count).to eq(2)
    end

    it "caps per_page at 100" do
      expect(search({}, per_page: 1_000).limit_value).to eq(100)
    end

    it "uses defaults for invalid page values" do
      result = search({}, page: "-3", per_page: "abc")

      expect(result.current_page).to eq(1)
      expect(result.limit_value).to eq(25)
    end
  end

  it "ignores conditions on attributes that are not searchable" do
    expect(search(salary_gt: 100_000)).to eq([ asha, bob, carla ])
  end
end
