class CountrySerializer < Blueprinter::Base
  identifier :id
  fields :name, :code, :currency
end
