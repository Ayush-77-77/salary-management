require "rails_helper"

RSpec.describe JsonWebToken do
  it "decodes a token back into its payload" do
    token = described_class.encode(user_id: 42)

    expect(described_class.decode(token)).to include("user_id" => 42)
  end

  it "returns nil for an expired token" do
    token = described_class.encode({ user_id: 42 }, 1.minute.ago)

    expect(described_class.decode(token)).to be_nil
  end

  it "returns nil for a tampered token" do
    token = described_class.encode(user_id: 42)

    expect(described_class.decode("#{token}x")).to be_nil
  end

  it "returns nil for garbage input" do
    expect(described_class.decode("not-a-token")).to be_nil
  end
end
