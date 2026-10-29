module Api
  module V1
    class DepartmentsController < ApplicationController
      def index
        render json: DepartmentSerializer.render(Department.order(:name), root: :departments)
      end
    end
  end
end
