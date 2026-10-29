FactoryBot.define do
  factory :country do
    sequence(:name) { |n| "Country #{n}" }
    sequence(:code, "AA")
    currency { "USD" }
  end
end
