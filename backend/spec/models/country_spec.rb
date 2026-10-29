require "rails_helper"

RSpec.describe Country, type: :model do
  subject { build(:country) }

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
end
