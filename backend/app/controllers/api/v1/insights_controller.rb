module Api
  module V1
    class InsightsController < ApplicationController
      def summary
        render json: { summary: SalaryInsights.summary }
      end

      def countries
        render json: { countries: SalaryInsights.by_country }
      end

      def job_titles
        country = Country.find(params.require(:country_id))

        render json: {
          country: CountrySerializer.render_as_hash(country),
          job_titles: SalaryInsights.by_job_title(country)
        }
      end
    end
  end
end
