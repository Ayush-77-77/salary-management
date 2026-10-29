module Api
  module V1
    class JobTitlesController < ApplicationController
      def index
        render json: { job_titles: Employee.distinct.order(:job_title).pluck(:job_title) }
      end
    end
  end
end
