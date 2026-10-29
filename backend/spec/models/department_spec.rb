require "rails_helper"

RSpec.describe Department, type: :model do
  subject { build(:department) }

  it { is_expected.to have_many(:employees).dependent(:restrict_with_error) }

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name).case_insensitive }
  end

  it "squishes extra whitespace in the name" do
    expect(build(:department, name: "  Human   Resources ").name).to eq("Human Resources")
  end

  it "cannot be deleted while it has employees" do
    record = create(:department)
    create(:employee, department: record)

    expect(record.destroy).to be(false)
    expect(record.errors[:base]).to include("Cannot delete record because dependent employees exist")
  end
end
