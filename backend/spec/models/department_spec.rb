require "rails_helper"

RSpec.describe Department, type: :model do
  subject { build(:department) }

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name).case_insensitive }
  end

  it "squishes extra whitespace in the name" do
    expect(build(:department, name: "  Human   Resources ").name).to eq("Human Resources")
  end
end
