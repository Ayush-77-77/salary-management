module Api
  module V1
    class EmployeesController < ApplicationController
      before_action :set_employee, only: %i[show update destroy]

      def index
        search = search_params
        employees = EmployeeSearch.new(query: search.fetch(:q, {}), page: search[:page], per_page: search[:per_page]).call

        render json: EmployeeSerializer.render(employees, root: :employees, meta: pagination_meta(employees))
      end

      def show
        render json: EmployeeSerializer.render(@employee, root: :employee)
      end

      def create
        employee = Employee.create!(employee_params)

        render json: EmployeeSerializer.render(employee, root: :employee), status: :created
      end

      def update
        @employee.update!(employee_params)

        render json: EmployeeSerializer.render(@employee, root: :employee)
      end

      def destroy
        @employee.destroy!

        head :no_content
      end

      private

      def set_employee
        @employee = Employee.includes(:country, :department).find(params[:id])
      end

      def employee_params
        params.expect(employee: %i[full_name email job_title department_id country_id salary hire_date])
      end

      def search_params
        params.permit(:page, :per_page, q: %i[full_name_or_email_i_cont country_id_eq department_id_eq job_title_eq s])
      end

      def pagination_meta(collection)
        {
          page: collection.current_page,
          per_page: collection.limit_value,
          total_count: collection.total_count,
          total_pages: collection.total_pages
        }
      end
    end
  end
end
