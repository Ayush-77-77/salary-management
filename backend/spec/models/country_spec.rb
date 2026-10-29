require "rails_helper"

RSpec.describe Country, type: :model do
  subject { build(:country) }

  it { is_expected.to have_many(:employees).dependent(:restrict_with_error) }

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name).case_insensitive }
    it { is_expected.to validate_presence_of(:code) }
    it { is_expected.to validate_uniqueness_of(:code).ignoring_case_sensitivity }
    it { is_expected.to validate_length_of(:code).is_equal_to(2) }
    it { is_expected.to validate_presence_of(:currency) }
    it { is_expected.to validate_length_of(:currency).is_equal_to(3) }
  end

  describe "normalization" do
    it "squishes the name and upcases code and currency" do
      country = build(:country, name: "  United   Kingdom ", code: " gb", currency: "gbp ")

      expect(country.name).to eq("United Kingdom")
      expect(country.code).to eq("GB")
      expect(country.currency).to eq("GBP")
    end
  end

  it "cannot be deleted while it has employees" do
    record = create(:country)
    create(:employee, country: record)

    expect(record.destroy).to be(false)
    expect(record.errors[:base]).to include("Cannot delete record because dependent employees exist")
  end
end
