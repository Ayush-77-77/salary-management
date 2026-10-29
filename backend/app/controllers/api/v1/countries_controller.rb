module Api
  module V1
    class CountriesController < ApplicationController
      def index
        render json: CountrySerializer.render(Country.order(:name), root: :countries)
      end
    end
  end
end
