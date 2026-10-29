require "rails_helper"

RSpec.describe User, type: :model do
  subject { build(:user) }

  describe "validations" do
    it { is_expected.to have_secure_password }
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).ignoring_case_sensitivity }
    it { is_expected.to validate_length_of(:password).is_at_least(8) }

    it "rejects an invalid email" do
      expect(build(:user, email: "hr-at-acme")).not_to be_valid
    end
  end

  it "downcases and strips the email" do
    expect(build(:user, email: " HR@Acme.Test ").email).to eq("hr@acme.test")
  end

  it "stores a hash instead of the plain password" do
    user = create(:user, password: "password123")

    expect(user.password_digest).not_to include("password123")
    expect(user.authenticate("password123")).to eq(user)
  end
end
